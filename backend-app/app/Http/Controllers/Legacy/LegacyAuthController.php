<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LegacyAuthController extends Controller
{
    public function loginAdmin(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (filter_var(env('LEGACY_BYPASS_AUTH', false), FILTER_VALIDATE_BOOLEAN)) {
            $demoType = strtoupper(trim((string) env('LEGACY_DEMO_TYPEADMIN', 'SUPER_ADMIN')));
            return response()->json([
                'message' => 'Connexion OK',
                'token'   => 'demo-token-999',
                'admin'   => [
                    'id' => 999, 'nom' => 'Demo Admin',
                    'username' => $data['username'],
                    'typeAdmin' => $demoType, 'typeAdminLabel' => $demoType, 'actif' => 1,
                ],
            ]);
        }

        $admin = DB::table('Admin')->where('username', $data['username'])->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin introuvable'], 404);
        }

        $plainMatch = isset($admin->password) && $admin->password === $data['password'];
        $isHash     = isset($admin->password) && str_starts_with((string) $admin->password, '$2');
        $hashMatch  = $isHash && Hash::check($data['password'], (string) $admin->password);

        if (!$plainMatch && !$hashMatch) {
            return response()->json(['message' => 'Identifiants invalides'], 422);
        }

        return response()->json([
            'message' => 'Connexion OK',
            'token'   => Str::random(40),
            'admin'   => [
                'id'             => $admin->ID ?? null,
                'nom'            => $admin->nom ?? null,
                'username'       => $admin->username ?? null,
                'typeAdmin'      => $admin->typeAdmin ?? null,
                'typeAdminLabel' => $this->typeLabel($admin->typeAdmin ?? null),
                'actif'          => $admin->actif ?? null,
            ],
        ]);
    }

    /** Connexion enseignant — authentifié via la table Personne (typePersonne = 2) */
    public function loginTeacher(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $personne = DB::table('Personne')
            ->where('typePersonne', 2)
            ->where('isDelete', 0)
            ->where('username', $data['username'])
            ->first();

        if (!$personne) {
            return response()->json(['message' => 'Compte enseignant introuvable.'], 404);
        }

        $plainMatch = (string) $personne->password === $data['password'];
        $isHash     = str_starts_with((string) $personne->password, '$2');
        $hashMatch  = $isHash && Hash::check($data['password'], (string) $personne->password);

        if (!$plainMatch && !$hashMatch) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 422);
        }

        // Vérifier que l'enseignant est actif dans la table Enseignant
        $enseignant = DB::table('Enseignant')->where('idPers', $personne->idPers)->first();
        if (!$enseignant || !$enseignant->Actif) {
            return response()->json(['message' => 'Ce compte enseignant est désactivé. Contactez l\'administration.'], 403);
        }

        // Trouver la salle/classe de cet enseignant (titulaire)
        $salle = DB::table('Titulaire')
            ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
            ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->where('Titulaire.idPers', $personne->idPers)
            ->where('Titulaire.actif', 1)
            ->select('Salle.libelle as salle', 'Classe.libelle as classe', 'Classe.idClasse')
            ->first();

        return response()->json([
            'message' => 'Connexion enseignant OK',
            'token'   => Str::random(40),
            'teacher' => [
                'id'       => $personne->idPers,
                'nom'      => $personne->nom,
                'prenom'   => $personne->prenom,
                'username' => $personne->username,
                'email'    => $personne->email,
                'mobile'   => $personne->mobile,
                'classe'   => $salle?->classe ?? null,
                'idClasse' => $salle?->idClasse ?? null,
                'salle'    => $salle?->salle ?? null,
            ],
        ]);
    }

    /** Connexion parent — authentifié via la table Personne (typePersonne = 3) */
    public function loginParent(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $personne = DB::table('Personne')
            ->where('typePersonne', 3)
            ->where('isDelete', 0)
            ->where('username', $data['username'])
            ->whereNotNull('username')
            ->where('username', '!=', '')
            ->first();

        if (!$personne) {
            return response()->json(['message' => 'Compte parent introuvable.'], 404);
        }

        $plainMatch = (string) $personne->password === $data['password'];
        $isHash     = str_starts_with((string) $personne->password, '$2');
        $hashMatch  = $isHash && Hash::check($data['password'], (string) $personne->password);

        if (!$plainMatch && !$hashMatch) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 422);
        }

        // Vérifier que le parent a au moins un élève actif
        $hasActiveChild = DB::table('Parents')
            ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
            ->where('Parents.idPers', $personne->idPers)
            ->where('Eleve.actif', 1)
            ->where('Eleve.isDelete', 0)
            ->exists();

        if (!$hasActiveChild) {
            return response()->json(['message' => 'Ce compte est bloqué car aucun de vos enfants n\'est actif dans le système.'], 403);
        }

        return response()->json([
            'message' => 'Connexion parent OK',
            'token'   => Str::random(40),
            'parent'  => [
                'id'       => $personne->idPers,
                'nom'      => $personne->nom,
                'prenom'   => $personne->prenom,
                'username' => $personne->username,
                'email'    => $personne->email,
                'mobile'   => $personne->mobile,
            ],
        ]);
    }



    private function typeLabel(mixed $type): ?string
    {
        $raw = strtoupper(trim((string) $type));
        if (in_array($raw, ['SUPER_ADMIN', 'DIRECTEUR', 'FONDATEUR', 'SECRETAIRE', 'ADMIN'], true)) {
            return $raw;
        }

        return match ((string) $type) {
            '0' => 'SUPER_ADMIN',
            '1' => 'DIRECTEUR',
            '2' => 'FONDATEUR',
            '3' => 'SECRETAIRE',
            '4' => 'ADMIN',
            '5' => 'ROOT',
            default => null,
        };
    }
}

