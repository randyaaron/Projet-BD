<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LegacyTeacherController extends Controller
{
    public function index(Request $request)
    {
        $limit = min((int) $request->input('limit', 100), 200);

        $rows = DB::table('Enseignant')
            ->join('Personne', 'Enseignant.idPers', '=', 'Personne.idPers')
            ->where('Enseignant.Actif', 1)
            ->where('Enseignant.isDelete', 0)
            ->select(
                'Enseignant.idEnseignant',
                'Enseignant.idPers',
                'Enseignant.idCours',
                'Enseignant.Actif',
                'Personne.nom',
                'Personne.prenom',
                'Personne.mobile',
                'Personne.email',
                'Personne.typePersonne'
            )
            ->limit($limit)
            ->get();

        return response()->json([
            'count' => $rows->count(),
            'data'  => $rows,
        ]);
    }


    public function store(Request $request)
    {
        $columns = Schema::getColumnListing('Enseignant');
        if (empty($columns)) {
            return response()->json(['message' => 'Table Enseignant introuvable ou sans colonnes'], 422);
        }

        $payload = $request->all();
        $insert = [];
        foreach ($columns as $column) {
            if (array_key_exists($column, $payload)) {
                $insert[$column] = $payload[$column];
            }
        }

        // Crée en attente d’autorisation fondateur
        if (in_array('actif', $columns, true) && !array_key_exists('actif', $insert)) {
            $insert['actif'] = 0;
        }
        if (in_array('statut', $columns, true) && !array_key_exists('statut', $insert)) {
            $insert['statut'] = 'PENDING_FOUNDER_APPROVAL';
        }
        if (in_array('created_at', $columns, true) && !array_key_exists('created_at', $insert)) {
            $insert['created_at'] = now();
        }

        if (empty($insert)) {
            return response()->json([
                'message' => 'Aucune colonne valide fournie',
                'allowed_columns' => $columns,
            ], 422);
        }

        $id = DB::table('Enseignant')->insertGetId($insert);
        $pk = $this->guessPrimaryKey($columns, 'Enseignant');
        $row = $pk ? DB::table('Enseignant')->where($pk, $id)->first() : null;

        return response()->json([
            'message' => 'Enseignant cree (en attente approbation fondateur)',
            'data' => $row,
        ], 201);
    }

    public function approveByFounder(Request $request, int $id)
    {
        $columns = Schema::getColumnListing('Enseignant');
        $pk = $this->guessPrimaryKey($columns, 'Enseignant');
        if (!$pk) {
            return response()->json(['message' => 'Cle primaire Enseignant introuvable'], 422);
        }

        $row = DB::table('Enseignant')->where($pk, $id)->first();
        if (!$row) {
            return response()->json(['message' => 'Enseignant introuvable'], 404);
        }

        $updates = [];
        if (in_array('actif', $columns, true)) {
            $updates['actif'] = 1;
        }
        if (in_array('statut', $columns, true)) {
            $updates['statut'] = 'APPROVED';
        }
        if (in_array('updated_at', $columns, true)) {
            $updates['updated_at'] = now();
        }

        if (empty($updates)) {
            return response()->json(['message' => 'Aucune colonne d’approbation detectee (actif/statut)'], 422);
        }

        DB::table('Enseignant')->where($pk, $id)->update($updates);
        $updated = DB::table('Enseignant')->where($pk, $id)->first();

        return response()->json([
            'message' => 'Enseignant approuve par fondateur',
            'data' => $updated,
        ]);
    }

    private function guessPrimaryKey(array $columns, string $table): ?string
    {
        foreach (['idEnseignant', 'IDEnseignant', 'id', 'ID'] as $pk) {
            if (in_array($pk, $columns, true)) {
                return $pk;
            }
        }

        $indexes = DB::select("SHOW KEYS FROM `{$table}` WHERE Key_name = 'PRIMARY'");
        if (!empty($indexes) && isset($indexes[0]->Column_name)) {
            return $indexes[0]->Column_name;
        }

        return null;
    }
}

