<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyDisciplineController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('Rapport')
            ->leftJoin('Eleve', 'Rapport.matricule', '=', 'Eleve.matricule')
            ->select(
                'Rapport.idRap as id',
                'Rapport.event_date as date',
                DB::raw('CONCAT(Eleve.nom, " ", Eleve.prenom) as eleve'),
                'Rapport.libelle as type',
                'Rapport.commentaire as description',
                'Rapport.points'
            );

        if ($request->filled('matricule')) {
            $query->where('Rapport.matricule', (int) $request->input('matricule'));
        }

        $rows = $query->orderByDesc('Rapport.idRap')->limit(100)->get();

        // Transformation pour coller au front
        $data = $rows->map(function ($row) {
            $gravite = 'Mineur';
            if ($row->points > 5) $gravite = 'Moyen';
            if ($row->points > 10) $gravite = 'Majeur';

            return [
                'id' => $row->id,
                'date' => $row->date,
                'eleve' => $row->eleve ?? 'Inconnu',
                'classe' => 'Non assigné', // Simplification, nécessiterait jointure avec Inscription->Classe
                'type' => $row->type,
                'gravite' => $gravite,
                'description' => $row->description,
                'statut' => 'Résolu' // Simplification
            ];
        });

        return response()->json([
            'count' => $data->count(),
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'matricule' => ['required', 'integer'],
            'type' => ['required', 'string', 'max:100'],
            'gravite' => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $points = 2; // Mineur
        if ($data['gravite'] === 'Moyen') $points = 8;
        if ($data['gravite'] === 'Majeur') $points = 15;

        $id = DB::table('Rapport')->insertGetId([
            'matricule' => $data['matricule'],
            'libelle' => $data['type'],
            'points' => $points,
            'commentaire' => $data['description'] ?? '',
            'event_date' => now()->toDateString(),
            'idAca' => 1, // Devrait être dynamique
            'idPers' => 1, // ID de l'admin
            'created_at' => now(),
            'isDelete' => 0
        ], 'idRap');

        return response()->json([
            'message' => 'Incident enregistré',
            'id' => $id,
        ], 201);
    }
}
