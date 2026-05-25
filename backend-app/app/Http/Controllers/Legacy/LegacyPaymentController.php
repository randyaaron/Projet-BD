<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LegacyPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('Paiement')
            ->leftJoin('Eleve', 'Paiement.matricule', '=', 'Eleve.matricule')
            ->leftJoin('AnneeAcademique', 'Paiement.idAca', '=', 'AnneeAcademique.idAnnee')
            ->leftJoin('Mode', 'Paiement.idMode', '=', 'Mode.idMode')
            ->select(
                'Paiement.idPaie',
                'Paiement.matricule',
                'Paiement.montant',
                'Paiement.datePaie',
                'Paiement.comentaire',
                'Paiement.operation_ID',
                'Paiement.idMode',
                'Eleve.nom',
                'Eleve.prenom',
                'AnneeAcademique.libelle as annee',
                'Mode.libelle as modeLibelle'
            );

        if ($request->filled('matricule')) {
            $query->where('Paiement.matricule', (int) $request->input('matricule'));
        }

        $rows = $query->orderByDesc('Paiement.idPaie')->limit(200)->get();

        // Calcul total
        $total = DB::table('Paiement')->sum('montant');

        return response()->json([
            'count'  => $rows->count(),
            'total'  => $total,
            'data'   => $rows,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'matricule'    => ['required', 'integer'],
            'montant'      => ['required', 'numeric', 'min:0'],
            'idAca'        => ['nullable', 'integer'],
            'idMode'       => ['nullable', 'integer'],
            'comentaire'   => ['nullable', 'string', 'max:255'],
            'operation_ID' => ['nullable', 'string', 'max:30'],
            'datePaie'     => ['nullable', 'date'],
        ]);

        // Vérifier que l'élève existe
        $eleve = DB::table('Eleve')->where('matricule', $data['matricule'])->first();
        if (!$eleve) {
            return response()->json(['message' => 'Matricule introuvable dans la table Eleve.'], 422);
        }

        // Année académique active ou celle passée
        $idAca = $data['idAca'] ?? DB::table('AnneeAcademique')->orderByDesc('idAnnee')->value('idAnnee') ?? 1;

        // Prochain idPaie (pas d'auto_increment)
        $nextId = (DB::table('Paiement')->max('idPaie') ?? 0) + 1;

        DB::table('Paiement')->insert([
            'idPaie'          => $nextId,
            'matricule'       => $data['matricule'],
            'idAca'           => $idAca,
            'montant'         => $data['montant'],
            'url'             => 'INDEFINI',
            'comentaire'      => $data['comentaire'] ?? 'INDEFINI',
            'idMode'          => $data['idMode'] ?? 1,
            'operation_ID'    => $data['operation_ID'] ?? 'INDEFINI',
            'idPers'          => 0,
            'datePaie'        => $data['datePaie'] ?? now()->toDateString(),
            'dateEnregistrer' => now(),
        ]);

        $payment = DB::table('Paiement')
            ->leftJoin('Eleve', 'Paiement.matricule', '=', 'Eleve.matricule')
            ->leftJoin('Mode', 'Paiement.idMode', '=', 'Mode.idMode')
            ->where('Paiement.idPaie', $nextId)
            ->select('Paiement.*', 'Eleve.nom', 'Eleve.prenom', 'Mode.libelle as modeLibelle')
            ->first();

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'data'    => $payment,
        ], 201);
    }

    public function modes()
    {
        return response()->json([
            'data' => DB::table('Mode')->where('actif', 1)->get(),
        ]);
    }
}
