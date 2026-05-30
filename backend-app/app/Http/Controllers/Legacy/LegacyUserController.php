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
        $parentsRows = DB::table('Personne')
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
                'Personne.created_at',
                'Eleve.nom as eleveNom',
                'Eleve.prenom as elevePrenom',
                'Eleve.actif as eleveActif'
            )->get();

        $parentsDict = [];
        foreach ($parentsRows as $row) {
            $id = $row->id;
            if (!isset($parentsDict[$id])) {
                $parentsDict[$id] = (array) $row;
                $parentsDict[$id]['eleves'] = [];
                $parentsDict[$id]['actif'] = 0; // Défaut : inactif
            }
            if ($row->eleveNom) {
                $parentsDict[$id]['eleves'][] = trim($row->eleveNom . ' ' . $row->elevePrenom);
                // Si au moins un enfant est actif, le parent est actif
                if (isset($row->eleveActif) && $row->eleveActif == 1) {
                    $parentsDict[$id]['actif'] = 1;
                }
            }
        }

        $parents = [];
        foreach ($parentsDict as $p) {
            $p['eleveNom'] = !empty($p['eleves']) ? implode(', ', $p['eleves']) : '';
            $p['elevePrenom'] = ''; // Vider le prénom de l'élève car on a tout combiné dans eleveNom
            unset($p['eleves']);
            $parents[] = $p;
        }

        return response()->json([
            'admins'      => $admins,
            'enseignants' => $enseignants,
            'parents'     => $parents,
            'total'       => $admins->count() + $enseignants->count() + count($parents),
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
            'nom'        => ['required', 'string', 'max:100'],
            'prenom'     => ['required', 'string', 'max:100'],
            'mobile'     => ['nullable', 'string', 'max:15'],
            'email'      => ['nullable', 'email', 'max:255'],
            'username'   => ['required', 'string', 'max:100'],
            'password'   => ['required', 'string', 'min:4'],
            'matricules' => ['nullable', 'array'],          // tableau de matricules
            'matricules.*' => ['integer'],
            'matricule'  => ['nullable', 'integer'],        // compat rétrocompatible
            'idPers'     => ['nullable', 'integer'],
        ]);

        if (DB::table('Personne')->where('username', $data['username'])->exists()) {
            return response()->json(['message' => 'Ce nom d\'utilisateur est déjà pris.'], 422);
        }

        // Normaliser : accepter matricules[] ou matricule (unique)
        $matricules = $data['matricules'] ?? (isset($data['matricule']) ? [$data['matricule']] : []);
        $matricules  = array_filter(array_unique(array_map('intval', $matricules)));

        if (!empty($matricules)) {
            // Empêcher la création d'un 2ème compte parent pour le même élève
            $alreadyHasAccount = DB::table('Parents')
                ->join('Personne', 'Parents.idPers', '=', 'Personne.idPers')
                ->whereIn('Parents.matricule', $matricules)
                ->where('Personne.username', '!=', '')
                ->where('Personne.username', 'not like', 'P%')
                ->select('Parents.matricule')
                ->first();
                
            if ($alreadyHasAccount) {
                return response()->json([
                    'message' => 'L\'élève (matricule ' . $alreadyHasAccount->matricule . ') a déjà un compte parent actif. Impossible de créer un 2ème compte.'
                ], 422);
            }
        }

        $hashedPassword = bcrypt($data['password']);

        // Helper: insérer toutes les liaisons dans Parents
        $linkChildren = function (int $idPersFinal) use ($matricules) {
            foreach ($matricules as $mat) {
                $exists = DB::table('Parents')
                    ->where('idPers', $idPersFinal)
                    ->where('matricule', $mat)
                    ->exists();
                if (!$exists) {
                    $nextId = (DB::table('Parents')->max('idParent') ?? 0) + 1;
                    DB::table('Parents')->insert([
                        'idParent'  => $nextId,
                        'idPers'    => $idPersFinal,
                        'matricule' => $mat,
                        'idAdmin'   => 1,
                        'isDelete'  => 0,
                    ]);
                }
            }
        };

        // Cas 1 : idPers fourni explicitement
        if (!empty($data['idPers'])) {
            $existing = DB::table('Personne')->where('idPers', $data['idPers'])->first();
            if ($existing) {
                DB::table('Personne')->where('idPers', $data['idPers'])->update([
                    'username' => $data['username'],
                    'password' => $hashedPassword,
                    'mobile'   => $data['mobile'] ?? $existing->mobile,
                    'email'    => $data['email'] ?? $existing->email,
                ]);
                $linkChildren((int) $data['idPers']);
                return response()->json([
                    'message' => 'Compte parent créé. Identifiants : ' . $data['username'] . ' / ' . $data['password'],
                    'data'    => DB::table('Personne')->where('idPers', $data['idPers'])->first(),
                ], 201);
            }
        }

        // Cas 2 : Personne existant avec ce nom (créé lors de l'inscription d'un élève)
        $nomUp = strtoupper($data['nom']);
        $existingByName = DB::table('Personne')
            ->where('typePersonne', 3)
            ->where('nom', $nomUp)
            ->where('username', '')
            ->first();

        if ($existingByName) {
            DB::table('Personne')->where('idPers', $existingByName->idPers)->update([
                'username' => $data['username'],
                'password' => $hashedPassword,
                'mobile'   => $data['mobile'] ?? $existingByName->mobile,
                'email'    => $data['email'] ?? $existingByName->email,
            ]);
            $linkChildren((int) $existingByName->idPers);
            return response()->json([
                'message' => 'Compte parent créé. Identifiants : ' . $data['username'] . ' / ' . $data['password'],
                'data'    => DB::table('Personne')->where('idPers', $existingByName->idPers)->first(),
            ], 201);
        }

        // Cas 3 : Nouveau Personne
        $nextIdPers = (DB::table('Personne')->max('idPers') ?? 0) + 1;
        DB::table('Personne')->insert([
            'idPers'        => $nextIdPers,
            'nom'           => $nomUp,
            'prenom'        => $data['prenom'],
            'dateNaissance' => '1985-01-01',
            'lieuNaissance' => 'INDEFINI',
            'mobile'        => $data['mobile'] ?? '0',
            'phone'         => '0',
            'email'         => $data['email'] ?? null,
            'typePersonne'  => 3,
            'username'      => $data['username'],
            'password'      => $hashedPassword,
            'idAdmin'       => 1,
        ]);
        $linkChildren($nextIdPers);

        return response()->json([
            'message' => 'Compte parent créé. Identifiants : ' . $data['username'] . ' / ' . $data['password'],
            'data'    => DB::table('Personne')->where('idPers', $nextIdPers)->first(),
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
        } elseif ($source === 'parent') {
            return response()->json(['message' => 'Le statut d\'un parent est automatique et dépend du statut de ses enfants.'], 403);
        } else {
            $current = DB::table('Personne')->where('idPers', $id)->value('isDelete');
            DB::table('Personne')->where('idPers', $id)->update(['isDelete' => $current ? 0 : 1]);
        }
        return response()->json(['message' => 'Statut mis à jour']);
    }
}
