<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyMessageController extends Controller
{
    public function index()
    {
        $data = DB::table('Messages')
            ->leftJoin('Personne', 'Messages.idExp_Pers', '=', 'Personne.idPers')
            ->leftJoin('Parents', 'Messages.idParent', '=', 'Parents.idParent')
            ->leftJoin('Personne as PP', 'Parents.idPers', '=', 'PP.idPers')
            ->select(
                'Messages.*',
                'Personne.nom as expNom',
                'Personne.prenom as expPrenom',
                'PP.nom as parentNom',
                'PP.prenom as parentPrenom'
            )
            ->orderByDesc('Messages.created_at')
            ->limit(100)
            ->get();

        return response()->json(['count' => $data->count(), 'data' => $data]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'objet'       => ['required', 'string', 'max:255'],
            'information' => ['required', 'string'],
            'idParent'    => ['nullable', 'integer'],
            'type_message'=> ['nullable', 'integer'],
            'AnneeAcade'  => ['nullable', 'string', 'max:15'],
        ]);

        $idExp = (int) $request->header('X-Admin-Id', 1);
        $annee = DB::table('AnneeAcademique')->orderByDesc('idAnnee')->value('libelle') ?? date('Y');

        // Trouver un idParent valide si non fourni
        $idParent = $data['idParent'] ?? DB::table('Parents')->value('idParent') ?? 1;

        DB::table('Messages')->insert([
            'idExp_Pers'   => $idExp,
            'idParent'     => $idParent,
            'objet'        => $data['objet'],
            'information'  => $data['information'],
            'type_message' => $data['type_message'] ?? 0,
            'AnneeAcade'   => $data['AnneeAcade'] ?? $annee,
            'valider'      => 0,
        ]);

        return response()->json(['message' => 'Message envoyé'], 201);
    }
}
