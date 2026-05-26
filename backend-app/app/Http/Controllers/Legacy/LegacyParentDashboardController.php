<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyParentDashboardController extends Controller
{
    public function getDashboard(Request $request, $idPers)
    {
        // Get children linked to this parent
        $childrenRows = DB::table('Parents')
            ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
            ->leftJoin('Frequente', 'Eleve.matricule', '=', 'Frequente.matricule')
            ->leftJoin('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->leftJoin('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->where('Parents.idPers', $idPers)
            ->where('Eleve.isDelete', 0)
            ->select('Eleve.matricule as id', 'Eleve.nom', 'Eleve.prenom', 'Classe.libelle as classe')
            ->get();

        $children = [];
        foreach ($childrenRows as $child) {
            $children[] = [
                'id' => (string) $child->id,
                'name' => $child->nom . ' ' . $child->prenom,
                'class' => $child->classe ?? 'Non assigné',
                'average' => 14.5, // Mock pour l'instant (legacy notes complex to query right now)
                'rank' => 1,
                'totalStudents' => 30,
                'status' => 'good',
            ];
        }

        // Mock payments for now, unless Paiement table exists and has data
        $payments = [
            ['id' => '1', 'label' => 'Frais de scolarité - 2ème trimestre', 'amount' => 75000, 'dueDate' => '15 Jan 2026', 'status' => 'pending'],
            ['id' => '2', 'label' => 'Cantine - Janvier', 'amount' => 25000, 'dueDate' => '05 Jan 2026', 'status' => 'overdue'],
        ];

        // Mock messages
        $messages = [
            ['id' => '1', 'sender' => ['name' => 'Direction', 'role' => 'Administration'], 'subject' => 'Sortie scolaire', 'preview' => 'Nous organisons...', 'date' => 'Aujourd\'hui', 'unread' => true]
        ];

        $events = [
            ['id' => '1', 'title' => 'Composition - Mathématiques', 'date' => '18 Jan 2026', 'time' => '08:00', 'type' => 'exam'],
            ['id' => '2', 'title' => 'Réunion parents-professeurs', 'date' => '18 Jan 2026', 'time' => '14:00', 'location' => 'Salle polyvalente', 'type' => 'meeting']
        ];

        return response()->json([
            'children' => $children,
            'payments' => $payments,
            'messages' => $messages,
            'events'   => $events,
            'parent'   => DB::table('Personne')->where('idPers', $idPers)->first()
        ]);
    }
}
