<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyTitulaireController extends Controller
{
    /** Liste des affectations titulaires */
    public function index()
    {
        $data = DB::table('Titulaire')
            ->leftJoin('Personne', 'Titulaire.idPers', '=', 'Personne.idPers')
            ->leftJoin('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
            ->leftJoin('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->where('Titulaire.actif', 1)
            ->select(
                'Titulaire.idTitulaire',
                'Titulaire.idPers',
                'Titulaire.idSalle',
                'Titulaire.actif',
                'Personne.nom as enseignantNom',
                'Personne.prenom as enseignantPrenom',
                'Salle.libelle as salleLibelle',
                'Classe.libelle as classeLibelle'
            )
            ->get();

        return response()->json(['count' => $data->count(), 'data' => $data]);
    }

    /** Affecter un enseignant à une salle */
    public function store(Request $request)
    {
        $data = $request->validate([
            'idPers'  => ['required', 'integer'],
            'idSalle' => ['required', 'integer'],
        ]);

        // Vérifier que l'enseignant existe (typePersonne = 2 pour enseignant)
        $personne = DB::table('Personne')->where('idPers', $data['idPers'])->first();
        if (!$personne) {
            return response()->json(['message' => 'Enseignant introuvable.'], 422);
        }

        // Supprimer les anciennes affectations :
        // 1. Un enseignant ne peut pas être titulaire de plusieurs salles
        DB::table('Titulaire')
            ->where('idPers', $data['idPers'])
            ->delete();

        // 2. Une salle ne peut avoir qu'un seul titulaire actif
        DB::table('Titulaire')
            ->where('idSalle', $data['idSalle'])
            ->delete();

        DB::table('Titulaire')->insert([
            'idPers'  => $data['idPers'],
            'idSalle' => $data['idSalle'],
            'actif'   => 1,
            'idAdmin' => 1,
        ]);

        $row = DB::table('Titulaire')
            ->leftJoin('Personne', 'Titulaire.idPers', '=', 'Personne.idPers')
            ->leftJoin('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
            ->where('Titulaire.idPers', $data['idPers'])
            ->where('Titulaire.idSalle', $data['idSalle'])
            ->where('Titulaire.actif', 1)
            ->select('Titulaire.*', 'Personne.nom', 'Personne.prenom', 'Salle.libelle as salleLibelle')
            ->first();

        return response()->json(['message' => 'Titulaire affecté', 'data' => $row], 201);
    }

    /** Désactiver une affectation */
    public function destroy(int $id)
    {
        DB::table('Titulaire')->where('idTitulaire', $id)->update(['actif' => 0]);
        return response()->json(['message' => 'Affectation supprimée']);
    }

    /** Liste des enseignants depuis la table Enseignant (avec détails Personne) */
    public function enseignants()
    {
        $data = DB::table('Enseignant')
            ->join('Personne', 'Enseignant.idPers', '=', 'Personne.idPers')
            ->where('Enseignant.Actif', 1)
            ->where('Enseignant.isDelete', 0)
            ->select(
                'Enseignant.idEnseignant',
                'Enseignant.idPers',
                'Personne.nom',
                'Personne.prenom',
                'Personne.mobile',
                'Personne.email'
            )
            ->orderBy('Personne.nom')
            ->get();

        return response()->json(['data' => $data]);
    }

}
