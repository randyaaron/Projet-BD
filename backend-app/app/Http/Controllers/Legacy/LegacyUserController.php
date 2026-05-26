<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyUserController extends Controller
{
    /** Liste de tous les utilisateurs du système (Admin + Personne actives) */
    public function index()
    {
        // Admins (table Admin)
        $admins = DB::table('Admin')
            ->where('isDelete', 0)
            ->select(
                DB::raw("'admin' as source"),
                'ID as id',
                'nom',
                DB::raw("'' as prenom"),
                'username',
                'mobile',
                DB::raw("'' as email"),
                'typeAdmin as role',
                'actif',
                'created_at'
            )->get();

        // Enseignants (Personne typePersonne=2)
        $enseignants = DB::table('Personne')
            ->join('Enseignant', 'Personne.idPers', '=', 'Enseignant.idPers')
            ->where('Personne.typePersonne', 2)
            ->where('Personne.isDelete', 0)
            ->select(
                DB::raw("'enseignant' as source"),
                'Personne.idPers as id',
                'Personne.nom',
                'Personne.prenom',
                'Personne.username',
                'Personne.mobile',
                'Personne.email',
                DB::raw("'enseignant' as role"),
                'Enseignant.Actif as actif',
                'Personne.created_at'
            )->get();

        // Parents (Personne typePersonne=3)
        $parents = DB::table('Personne')
            ->leftJoin('Parents', 'Personne.idPers', '=', 'Parents.idPers')
            ->leftJoin('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
            ->where('Personne.typePersonne', 3)
            ->where('Personne.isDelete', 0)
            ->select(
                DB::raw("'parent' as source"),
                'Personne.idPers as id',
                'Personne.nom',
                'Personne.prenom',
                'Personne.username',
                'Personne.mobile',
                'Personne.email',
                DB::raw("'parent' as role"),
                DB::raw("1 as actif"),
                'Personne.created_at',
                'Eleve.nom as eleveNom',
                'Eleve.prenom as elevePrenom',
                'Eleve.matricule'
            )->get();

        return response()->json([
            'admins'      => $admins,
            'enseignants' => $enseignants,
            'parents'     => $parents,
            'total'       => $admins->count() + $enseignants->count() + $parents->count(),
        ]);
    }

    /** Créer un compte enseignant */
    public function createEnseignant(Request $request)
    {
        $data = $request->validate([
            'nom'      => ['required', 'string', 'max:100'],
            'prenom'   => ['required', 'string', 'max:100'],
            'mobile'   => ['nullable', 'string', 'max:15'],
            'email'    => ['nullable', 'email', 'max:255'],
            'username' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:4'],
            'idCours'  => ['nullable', 'integer'],
        ]);

        // Vérifier que le username n'existe pas déjà
        if (DB::table('Personne')->where('username', $data['username'])->exists()) {
            return response()->json(['message' => 'Ce nom d\'utilisateur est déjà pris.'], 422);
        }

        $nextIdPers = (DB::table('Personne')->max('idPers') ?? 0) + 1;

        DB::table('Personne')->insert([
            'idPers'        => $nextIdPers,
            'nom'           => strtoupper($data['nom']),
            'prenom'        => $data['prenom'],
            'dateNaissance' => '1985-01-01',
            'lieuNaissance' => 'INDEFINI',
            'mobile'        => $data['mobile'] ?? '0',
            'phone'         => '0',
            'email'         => $data['email'] ?? null,
            'typePersonne'  => 2,
            'username'      => $data['username'],
            'password'      => $data['password'], // stocké en clair comme les autres
            'idAdmin'       => 1,
        ]);

        // Prendre le premier cours disponible si non fourni
        $idCours = $data['idCours'] ?? DB::table('Cours')->where('isDelete', 0)->value('idCours') ?? 1;

        DB::table('Enseignant')->insert([
            'idPers'  => $nextIdPers,
            'idCours' => $idCours,
            'Actif'   => 1,
            'idAdmin' => 1,
            'isDelete'=> 0,
        ]);

        $personne = DB::table('Personne')->where('idPers', $nextIdPers)->first();
        return response()->json([
            'message' => 'Compte enseignant créé. Identifiants : ' . $data['username'] . ' / ' . $data['password'],
            'data'    => $personne,
        ], 201);
    }

    /** Créer un compte parent */
    public function createParent(Request $request)
    {
        $data = $request->validate([
            'nom'       => ['required', 'string', 'max:100'],
            'prenom'    => ['required', 'string', 'max:100'],
            'mobile'    => ['nullable', 'string', 'max:15'],
            'email'     => ['nullable', 'email', 'max:255'],
            'username'  => ['required', 'string', 'max:100'],
            'password'  => ['required', 'string', 'min:4'],
            'matricule' => ['nullable', 'integer'],
        ]);

        if (DB::table('Personne')->where('username', $data['username'])->exists()) {
            return response()->json(['message' => 'Ce nom d\'utilisateur est déjà pris.'], 422);
        }

        $nextIdPers = (DB::table('Personne')->max('idPers') ?? 0) + 1;

        DB::table('Personne')->insert([
            'idPers'        => $nextIdPers,
            'nom'           => strtoupper($data['nom']),
            'prenom'        => $data['prenom'],
            'dateNaissance' => '1985-01-01',
            'lieuNaissance' => 'INDEFINI',
            'mobile'        => $data['mobile'] ?? '0',
            'phone'         => '0',
            'email'         => $data['email'] ?? null,
            'typePersonne'  => 3,
            'username'      => $data['username'],
            'password'      => $data['password'],
            'idAdmin'       => 1,
        ]);

        $matricule = $data['matricule'] ?? DB::table('Eleve')->value('matricule') ?? 1;

        DB::table('Parents')->insert([
            'idPers'   => $nextIdPers,
            'matricule'=> $matricule,
            'idAdmin'  => 1,
            'isDelete' => 0,
        ]);

        $personne = DB::table('Personne')->where('idPers', $nextIdPers)->first();
        return response()->json([
            'message' => 'Compte parent créé. Identifiants : ' . $data['username'] . ' / ' . $data['password'],
            'data'    => $personne,
        ], 201);
    }

    /** Suspendre / réactiver un utilisateur */
    public function toggleActif(int $id, Request $request)
    {
        $source = $request->input('source', 'enseignant');
        if ($source === 'admin') {
            $current = DB::table('Admin')->where('ID', $id)->value('actif');
            DB::table('Admin')->where('ID', $id)->update(['actif' => $current ? 0 : 1]);
        } elseif ($source === 'enseignant') {
            $current = DB::table('Enseignant')->where('idPers', $id)->value('Actif');
            $newStatus = $current ? 0 : 1;
            DB::table('Enseignant')->where('idPers', $id)->update(['Actif' => $newStatus]);
            if ($newStatus == 0) {
                DB::table('Titulaire')->where('idPers', $id)->delete();
            }
        } else {
            $current = DB::table('Personne')->where('idPers', $id)->value('isDelete');
            DB::table('Personne')->where('idPers', $id)->update(['isDelete' => $current ? 0 : 1]);
        }
        return response()->json(['message' => 'Statut mis à jour']);
    }
}
