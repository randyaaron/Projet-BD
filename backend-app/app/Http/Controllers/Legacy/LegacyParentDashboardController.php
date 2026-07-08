<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyParentDashboardController extends Controller
{
    /** Retourner les enfants liés à ce parent */
    private function getChildren(int $idPers): array
    {
        $rows = DB::table('Parents')
            ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
            ->leftJoin('Frequente', 'Eleve.matricule', '=', 'Frequente.matricule')
            ->leftJoin('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->leftJoin('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->where('Parents.idPers', $idPers)
            ->where('Eleve.isDelete', 0)
            ->where('Eleve.actif', 1)
            ->select('Eleve.matricule', 'Eleve.nom', 'Eleve.prenom', 'Classe.libelle as classe', 'Classe.idClasse')
            ->get();

        $children = [];
        foreach ($rows as $child) {
            // Calculer la moyenne de l'élève
            $avg = DB::table('Evaluation')
                ->where('matricule', $child->matricule)
                ->avg('note');

            // Récupérer le nom du titulaire
            $teacher = null;
            if (isset($child->idClasse)) {
                $titulaire = DB::table('Titulaire')
                    ->join('Personne', 'Titulaire.idPers', '=', 'Personne.idPers')
                    ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
                    ->where('Salle.idClasse', $child->idClasse)
                    ->where('Titulaire.actif', 1)
                    ->select('Personne.nom', 'Personne.prenom')
                    ->first();
                if ($titulaire) {
                    $teacher = trim($titulaire->nom . ' ' . $titulaire->prenom);
                }
            }

            $children[] = [
                'id'       => (string) $child->matricule,
                'name'     => $child->nom . ' ' . $child->prenom,
                'nom'      => $child->nom,
                'prenom'   => $child->prenom,
                'class'    => $child->classe ?? 'Non assigné',
                'idClasse' => $child->idClasse ?? null,
                'teacher'  => $teacher ?: 'Non assigné',
                'average'  => $avg ? round($avg, 2) : 0,
                'status'   => ($avg >= 15) ? 'excellent' : (($avg >= 10) ? 'good' : 'needs-attention'),
            ];
        }
        return $children;
    }

    /** Tableau de bord principal */
    public function getDashboard(Request $request, $idPers)
    {
        $children = $this->getChildren((int) $idPers);

        // Messages réels — liés à ce parent via idParent
        $parentRow = DB::table('Parents')->where('idPers', $idPers)->first();
        $idParent  = $parentRow?->idParent ?? 0;

        $messagesRows = DB::table('Messages')
            ->where('idParent', $idParent)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        $messages = $messagesRows->map(fn($m) => [
            'id'      => (string) $m->idMessages,
            'sender'  => ['name' => 'Administration', 'role' => 'Administration'],
            'subject' => $m->objet,
            'preview' => mb_substr($m->information, 0, 100),
            'date'    => $m->created_at ? date('d M Y', strtotime($m->created_at)) : '—',
            'unread'  => !$m->valider,
        ])->toArray();

        return response()->json([
            'children' => $children,
            'payments' => [], // paiements via /paiements endpoint
            'messages' => $messages,
            'events'   => [],
            'parent'   => DB::table('Personne')->where('idPers', $idPers)->first(),
        ]);
    }

    /** Notes par matière pour chaque enfant */
    public function getNotes(Request $request, $idPers)
    {
        $children = $this->getChildren((int) $idPers);
        $result = [];

        foreach ($children as $child) {
            $matricule = $child['id'];

            // Récupérer les évaluations groupées par cours
            $query = DB::table('Evaluation')
                ->join('Cours', 'Evaluation.idCours', '=', 'Cours.idCours')
                ->join('Session', 'Evaluation.idSession', '=', 'Session.idSession')
                ->leftJoin('Personne', 'Evaluation.idPers', '=', 'Personne.idPers')
                ->where('Evaluation.matricule', $matricule)
                ->select(
                    'Cours.libelle as subject',
                    'Cours.coefficient',
                    'Evaluation.note',
                    'Evaluation.appreciation',
                    'Personne.nom as teacherNom',
                    'Evaluation.created_at'
                );

            if ($request->has('term_id') && $request->input('term_id') !== '') {
                $query->where('Session.idTrimestre', $request->input('term_id'));
            }

            $evals = $query
                ->orderBy('Cours.libelle')
                ->orderBy('Evaluation.created_at', 'desc')
                ->get();

            // Grouper par matière
            $bySubject = [];
            foreach ($evals as $ev) {
                $s = $ev->subject;
                if (!isset($bySubject[$s])) {
                    $bySubject[$s] = [
                        'subject'       => $s,
                        'coefficient'   => $ev->coefficient ?? 1,
                        'notes'         => [],
                        'average'       => 0,
                    ];
                }
                $bySubject[$s]['notes'][] = [
                    'value'  => round($ev->note, 2),
                    'max'    => 20,
                    'date'   => $ev->created_at ? date('d M Y', strtotime($ev->created_at)) : '—',
                    'label'  => $ev->appreciation ?? 'Évaluation',
                    'teacher'=> $ev->teacherNom ?? '—',
                ];
            }

            foreach ($bySubject as $s => $sub) {
                $notes = array_column($sub['notes'], 'value');
                $bySubject[$s]['average'] = count($notes) ? round(array_sum($notes) / count($notes), 2) : 0;
            }

            $result[] = [
                'child'    => $child,
                'subjects' => array_values($bySubject),
            ];
        }

        return response()->json(['data' => $result]);
    }

    /** Paiements pour les enfants de ce parent */
    public function getPaiements(Request $request, $idPers)
    {
        $children = $this->getChildren((int) $idPers);
        $paiements = [];

        foreach ($children as $child) {
            $rows = DB::table('Paiement')
                ->leftJoin('Mode', 'Paiement.idMode', '=', 'Mode.idMode')
                ->leftJoin('AnneeAcademique', 'Paiement.idAca', '=', 'AnneeAcademique.idAnnee')
                ->where('Paiement.matricule', $child['id'])
                ->select(
                    'Paiement.idPaie',
                    'Paiement.montant',
                    'Paiement.datePaie',
                    'Paiement.comentaire',
                    'Mode.libelle as modePaiement',
                    'AnneeAcademique.libelle as annee'
                )
                ->orderBy('Paiement.datePaie', 'desc')
                ->get();

            foreach ($rows as $p) {
                $paiements[] = [
                    'id'     => (string) $p->idPaie,
                    'child'  => $child['name'],
                    'label'  => $p->comentaire && $p->comentaire !== 'INDEFINI' ? $p->comentaire : ('Paiement — ' . ($p->annee ?? '')),
                    'amount' => (int) $p->montant,
                    'date'   => ($p->datePaie && $p->datePaie !== '0000-00-00') ? date('d M Y', strtotime($p->datePaie)) : '—',
                    'mode'   => $p->modePaiement ?? '—',
                    'status' => 'paid',
                ];
            }
        }

        // Scolarité attendue
        $scolarites = DB::table('Scolarite')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'paiements'  => $paiements,
            'scolarites' => $scolarites,
            'children'   => $children,
        ]);
    }

    /** Bulletins (résumé par élève) */
    public function getBulletins(Request $request, $idPers)
    {
        $children = $this->getChildren((int) $idPers);
        $bulletins = [];

        foreach ($children as $child) {
            // Récupérer les trimestres disponibles
            $trimestres = DB::table('Trimestre')->get();
            foreach ($trimestres as $t) {
                $notes = DB::table('Evaluation')
                    ->join('Session', 'Evaluation.idSession', '=', 'Session.idSession')
                    ->where('Evaluation.matricule', $child['id'])
                    ->where('Session.idTrimestre', $t->idTrimes)
                    ->pluck('note');

                if ($notes->isEmpty()) continue;

                $avg = round($notes->average(), 2);
                $bulletins[] = [
                    'id'           => $child['id'] . '_' . ($t->idTrimes ?? uniqid()),
                    'child'        => $child,
                    'trimestre'    => $t->libelle ?? 'Trimestre',
                    'annee'        => date('Y') . '-' . (date('Y') + 1),
                    'average'      => $avg,
                    'status'       => 'available',
                    'date'         => date('Y-m-d'),
                    'totalMatières'=> DB::table('Evaluation')->where('matricule', $child['id'])->distinct('idCours')->count('idCours'),
                ];
            }
            
            // Calcul du Bulletin Annuel (moyenne de toutes les notes)
            $allNotes = DB::table('Evaluation')
                ->where('matricule', $child['id'])
                ->pluck('note');

            if (!$allNotes->isEmpty()) {
                $avgAnnuel = round($allNotes->average(), 2);
                $bulletins[] = [
                    'id'           => $child['id'] . '_annuel',
                    'child'        => $child,
                    'trimestre'    => 'Bulletin Annuel',
                    'annee'        => date('Y') . '-' . (date('Y') + 1),
                    'average'      => $avgAnnuel,
                    'status'       => 'available',
                    'date'         => date('Y-m-d'),
                    'totalMatières'=> DB::table('Evaluation')->where('matricule', $child['id'])->distinct('idCours')->count('idCours'),
                ];
            }
        }

        return response()->json(['bulletins' => $bulletins]);
    }

    /** Discipline (Sanctions et Absences) */
    public function getDiscipline(Request $request, $idPers)
    {
        $children = $this->getChildren((int) $idPers);
        $result = [];

        foreach ($children as $child) {
            $sanctions = DB::table('sanctions')
                ->where('student_id', $child['id'])
                ->orderBy('date', 'desc')
                ->get();

            $formattedSanctions = [];
            foreach ($sanctions as $s) {
                $formattedSanctions[] = [
                    'id' => $s->id,
                    'motif' => $s->motif,
                    'points' => $s->points,
                    'date' => date('d M Y', strtotime($s->date)),
                    'created_at' => $s->created_at
                ];
            }

            $result[] = [
                'child' => $child,
                'sanctions' => $formattedSanctions
            ];
        }

        return response()->json(['data' => $result]);
    }
}
