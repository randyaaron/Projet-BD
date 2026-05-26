<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyStudentController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('Eleve')
            ->leftJoin('Frequente', 'Eleve.matricule', '=', 'Frequente.matricule')
            ->leftJoin('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->leftJoin('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->where('Eleve.isDelete', 0)
            ->select('Eleve.*', 'Classe.libelle as classe', 'Classe.idClasse', 'Salle.idSalle');

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($b) use ($q) {
                $b->where('Eleve.nom', 'like', "%{$q}%")
                  ->orWhere('Eleve.prenom', 'like', "%{$q}%")
                  ->orWhere('Eleve.matricule', 'like', "%{$q}%");
            });
        }

        $limit = min((int) $request->input('limit', 100), 300);
        $rows = $query->orderBy('Eleve.created_at', 'desc')->limit($limit)->get();

        return response()->json([
            'count' => $rows->count(),
            'data'  => $rows,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'matricule'      => ['required', 'integer'],
            'nom'            => ['required', 'string', 'max:60'],
            'prenom'         => ['required', 'string', 'max:60'],
            'dateNaissance'  => ['required', 'date'],
            'lieuNaissance'  => ['required', 'string', 'max:30'],
            'sexe'           => ['required', 'integer'],
            'idVilleNaissance' => ['nullable', 'integer'],
            'parentNom'      => ['nullable', 'string', 'max:255'],
        ]);

        // Vérifier que le matricule n'existe pas déjà
        if (DB::table('Eleve')->where('matricule', $data['matricule'])->exists()) {
            return response()->json(['message' => 'Ce matricule existe déjà.'], 422);
        }

        DB::table('Eleve')->insert([
            'matricule'        => $data['matricule'],
            'nom'              => strtoupper($data['nom']),
            'prenom'           => $data['prenom'],
            'dateNaissance'    => $data['dateNaissance'],
            'lieuNaissance'    => $data['lieuNaissance'],
            'sexe'             => $data['sexe'],
            'langue'           => 'Français',
            'photoURL'         => 'INDEFINI',
            'actif'            => 1,
            'idVilleNaissance' => $data['idVilleNaissance'] ?? 1,
            'idAdmin'          => 1,
            'created_at'       => now(),
            'isDelete'         => 0,
        ]);

        if (!empty($data['parentNom'])) {
            $idPers = DB::table('Personne')->insertGetId([
                'nom' => strtoupper($data['parentNom']),
                'prenom' => '',
                'dateNaissance' => '1970-01-01',
                'typePersonne' => 3,
                'username' => 'P' . $data['matricule'],
                'password' => bcrypt('123456'),
                'idAdmin' => 1,
            ]);
            DB::table('Parents')->insert([
                'idPers' => $idPers,
                'matricule' => $data['matricule'],
                'idAdmin' => 1,
            ]);
        }

        $row = DB::table('Eleve')->where('matricule', $data['matricule'])->first();

        return response()->json([
            'message' => 'Élève enregistré avec succès',
            'data'    => $row,
        ], 201);
    }

    public function validateEnrollment(Request $request, int $id)
    {
        $row = DB::table('Eleve')->where('matricule', $id)->first();
        if (!$row) {
            return response()->json(['message' => 'Élève introuvable'], 404);
        }

        DB::table('Eleve')->where('matricule', $id)->update(['actif' => 1]);
        $updated = DB::table('Eleve')->where('matricule', $id)->first();

        return response()->json([
            'message' => 'Inscription validée',
            'data'    => $updated,
        ]);
    }

    public function toggleActif(int $matricule)
    {
        $current = DB::table('Eleve')->where('matricule', $matricule)->value('actif');
        $newStatus = $current ? 0 : 1;

        DB::table('Eleve')->where('matricule', $matricule)->update(['actif' => $newStatus]);
        if ($newStatus == 0) {
            DB::table('Frequente')->where('matricule', $matricule)->delete();
        }
        
        return response()->json([
            'message' => 'Statut de l\'élève mis à jour avec succès',
            'actif' => $newStatus
        ]);
    }

    public function assignClass(Request $request, int $matricule)
    {
        $idSalle = $request->input('idSalle');

        $student = DB::table('Eleve')->where('matricule', $matricule)->first();
        if (!$student) return response()->json(['message' => 'Élève introuvable'], 404);
        if (!$student->actif) return response()->json(['message' => 'Impossible d\'affecter un élève inactif'], 403);

        if (!$idSalle) {
            DB::table('Frequente')->where('matricule', $matricule)->delete();
            return response()->json(['message' => 'Affectation retirée']);
        }

        $salle = DB::table('Salle')->where('idSalle', $idSalle)->first();
        if (!$salle) return response()->json(['message' => 'Salle introuvable'], 404);
        if (!$salle->actif) return response()->json(['message' => 'Impossible d\'affecter à une salle inactive'], 403);

        $exists = DB::table('Frequente')->where('matricule', $matricule)->first();
        if ($exists) {
            DB::table('Frequente')->where('matricule', $matricule)->update(['idSalle' => $idSalle]);
        } else {
            DB::table('Frequente')->insert([
                'matricule' => $matricule,
                'idSalle' => $idSalle,
                'idAcademi' => 1,
                'idAdmin' => 1,
            ]);
        }

        return response()->json(['message' => 'Classe affectée avec succès']);
    }
}
