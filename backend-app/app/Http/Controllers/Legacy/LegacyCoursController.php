<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyCoursController extends Controller
{
    /** Liste des cours d'une classe (ou toutes si pas de filtre) */
    public function index(Request $request)
    {
        $query = DB::table('Cours')
            ->leftJoin('Classe', 'Cours.idClasse', '=', 'Classe.idClasse')
            ->where('Cours.isDelete', 0)
            ->where('Cours.actif', 1)
            ->select('Cours.*', 'Classe.libelle as classeLibelle');

        if ($request->filled('idClasse')) {
            $query->where('Cours.idClasse', (int) $request->input('idClasse'));
        }

        $data = $query->orderBy('Cours.idClasse')->orderBy('Cours.libelle')->get();

        return response()->json(['count' => $data->count(), 'data' => $data]);
    }

    /** Créer un cours dans une classe */
    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle'     => ['required', 'string', 'max:255'],
            'coefficient' => ['nullable', 'numeric', 'min:0'],
            'note'        => ['nullable', 'numeric'],
            'idClasse'    => ['required', 'integer'],
            'description' => ['nullable', 'string'],
        ]);

        $nextId = (DB::table('Cours')->max('idCours') ?? 0) + 1;

        DB::table('Cours')->insert([
            'idCours'     => $nextId,
            'libelle'     => $data['libelle'],
            'note'        => $data['note'] ?? 20,
            'coefficient' => $data['coefficient'] ?? 1,
            'description' => $data['description'] ?? '',
            'idClasse'    => $data['idClasse'],
            'actif'       => 1,
            'idAdmin'     => 1,
            'isDelete'    => 0,
        ]);

        $row = DB::table('Cours')->where('idCours', $nextId)->first();
        return response()->json(['message' => 'Cours créé', 'data' => $row], 201);
    }

    /** Emploi du temps d'une classe avec nom de l'enseignant titulaire */
    public function edt(Request $request)
    {
        $idClasse = (int) $request->input('idClasse', 0);

        $query = DB::table('EmploiDuTemps')
            ->leftJoin('Cours', 'EmploiDuTemps.idCours', '=', 'Cours.idCours')
            ->leftJoin('Classe', 'EmploiDuTemps.idClasse', '=', 'Classe.idClasse')
            // Titulaire: subquery groupée par idClasse pour éviter doublons
            ->leftJoin(DB::raw('(
                SELECT MIN(T.idPers) as idPers, S.idClasse
                FROM Titulaire T
                JOIN Salle S ON T.idSalle = S.idSalle
                WHERE T.actif = 1
                GROUP BY S.idClasse
            ) AS TitClass'), 'TitClass.idClasse', '=', 'EmploiDuTemps.idClasse')
            ->leftJoin('Personne', 'TitClass.idPers', '=', 'Personne.idPers')
            ->select(
                'EmploiDuTemps.idTemps',
                'EmploiDuTemps.jour',
                'EmploiDuTemps.heure',
                'EmploiDuTemps.idClasse',
                'EmploiDuTemps.idCours',
                'Cours.libelle as coursLibelle',
                'Cours.coefficient',
                'Classe.libelle as classeLibelle',
                'Personne.nom as enseignantNom',
                'Personne.prenom as enseignantPrenom'
            );

        if ($idClasse > 0) {
            $query->where('EmploiDuTemps.idClasse', $idClasse);
        }

        $data = $query->orderBy('EmploiDuTemps.jour')->orderBy('EmploiDuTemps.heure')->get();
        return response()->json(['count' => $data->count(), 'data' => $data]);
    }



    /** Ajouter un créneau dans l'emploi du temps */
    public function storeEdt(Request $request)
    {
        $data = $request->validate([
            'jour'     => ['required', 'string', 'max:30'],
            'heure'    => ['required', 'string', 'max:6'],
            'idClasse' => ['required', 'integer'],
            'idCours'  => ['required', 'integer'],
        ]);

        // Supprimer le créneau existant (si on réécrit ce slot)
        DB::table('EmploiDuTemps')
            ->where('jour', $data['jour'])
            ->where('heure', $data['heure'])
            ->where('idClasse', $data['idClasse'])
            ->delete();

        DB::table('EmploiDuTemps')->insert([
            'jour'     => $data['jour'],
            'heure'    => $data['heure'],
            'idClasse' => $data['idClasse'],
            'idCours'  => $data['idCours'],
            'idAdmin'  => 1,
        ]);

        return response()->json(['message' => 'Créneau enregistré'], 201);
    }

    /** Supprimer un créneau de l'emploi du temps */
    public function deleteEdt(int $id)
    {
        DB::table('EmploiDuTemps')->where('idTemps', $id)->delete();
        return response()->json(['message' => 'Créneau supprimé']);
    }
}
