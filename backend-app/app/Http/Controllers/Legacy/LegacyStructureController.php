<?php

namespace App\Http\Controllers\Legacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LegacyStructureController extends Controller
{
    public function classes()
    {
        $data = DB::table('Classe')
            ->leftJoin('Cycle', 'Classe.idCycle', '=', 'Cycle.idCycle')
            ->select(
                'Classe.idClasse',
                'Classe.libelle',
                'Classe.idCycle',
                DB::raw('COALESCE(Cycle.libelle, "N/A") as cycleLibelle')
            )
            ->where('Classe.isDelete', 0)
            ->get();

        return response()->json([
            'count' => $data->count(),
            'data'  => $data,
        ]);
    }

    public function rooms()
    {
        $data = DB::table('Salle')
            ->leftJoin('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->select(
                'Salle.idSalle',
                'Salle.libelle',
                'Salle.position',
                'Salle.surface',
                'Salle.actif',
                'Salle.idClasse',
                DB::raw('COALESCE(Classe.libelle, "Non assignée") as classeLibelle')
            )
            ->get();

        return response()->json([
            'count' => $data->count(),
            'data'  => $data,
        ]);
    }

    public function terms()
    {
        return response()->json([
            'count' => DB::table('Trimestre')->count(),
            'data'  => DB::table('Trimestre')->limit(200)->get(),
        ]);
    }

    public function schoolYears()
    {
        return response()->json([
            'count' => DB::table('AnneeAcademique')->count(),
            'data'  => DB::table('AnneeAcademique')->limit(200)->get(),
        ]);
    }

    public function subjects()
    {
        return response()->json([
            'count' => DB::table('Discipline')->count(),
            'data'  => DB::table('Discipline')->limit(200)->get(),
        ]);
    }

    public function cycles()
    {
        return response()->json([
            'data' => DB::table('Cycle')->get(),
        ]);
    }

    public function createClass(Request $request)
    {
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:100'],
            'idCycle' => ['nullable', 'integer'],
        ]);

        $libelle = strtoupper(trim($data['libelle']));

        // Vérifier les doublons (libelle unique parmi les classes actives)
        $exists = DB::table('Classe')
            ->where('isDelete', 0)
            ->whereRaw('UPPER(TRIM(libelle)) = ?', [$libelle])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => "Une classe nommée « {$libelle} » existe déjà. Utilisez un nom de section différent (ex: SIL-A, SIL-B…).",
            ], 422);
        }

        $nextId = (DB::table('Classe')->max('idClasse') ?? 0) + 1;

        DB::table('Classe')->insert([
            'idClasse' => $nextId,
            'libelle'  => $libelle,
            'idCycle'  => $data['idCycle'] ?? 1,
            'idAdmin'  => 1,
            'isDelete' => 0,
        ]);

        $row = DB::table('Classe')->where('idClasse', $nextId)->first();
        return response()->json(['message' => 'Classe créée', 'data' => $row], 201);
    }


    public function createRoom(Request $request)
    {
        $data = $request->validate([
            'libelle'  => ['required', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'idClasse' => ['nullable', 'integer'],
        ]);

        $nextId = (DB::table('Salle')->max('idSalle') ?? 0) + 1;

        DB::table('Salle')->insert([
            'idSalle'  => $nextId,
            'libelle'  => $data['libelle'],
            'position' => $data['position'] ?? 'NON DEFINI',
            'surface'  => '',
            'idClasse' => $data['idClasse'] ?? 1,
            'actif'    => 1,
            'idAdmin'  => 1,
        ]);

        $row = DB::table('Salle')->where('idSalle', $nextId)->first();
        return response()->json(['message' => 'Salle créée', 'data' => $row], 201);
    }

    public function createTerm(Request $request)
    {
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:255'],
            'periode' => ['nullable', 'string', 'max:255'],
            'idAca'   => ['nullable', 'integer'],
        ]);

        $insert = array_filter($data, fn ($v) => $v !== null);
        $id  = DB::table('Trimestre')->insertGetId($insert);
        $row = DB::table('Trimestre')->where($this->pk('Trimestre'), $id)->first();
        return response()->json(['message' => 'Trimestre créé', 'data' => $row], 201);
    }

    public function createSchoolYear(Request $request)
    {
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:200'],
            'periode' => ['nullable', 'string', 'max:255'],
        ]);

        $insert = array_filter($data, fn ($v) => $v !== null);
        $insert['idAdmin'] = 1;
        $id  = DB::table('AnneeAcademique')->insertGetId($insert);
        $row = DB::table('AnneeAcademique')->where($this->pk('AnneeAcademique'), $id)->first();
        return response()->json(['message' => 'Année créée', 'data' => $row], 201);
    }

    public function createSubject(Request $request)
    {
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:255'],
            'points'  => ['nullable', 'integer'],
        ]);
        $id  = DB::table('Discipline')->insertGetId($data);
        $row = DB::table('Discipline')->where($this->pk('Discipline'), $id)->first();
        return response()->json(['message' => 'Matière créée', 'data' => $row], 201);
    }

    private function pk(string $table): string
    {
        $keys = DB::select("SHOW KEYS FROM `{$table}` WHERE Key_name = 'PRIMARY'");
        return $keys[0]->Column_name ?? 'id';
    }
}
