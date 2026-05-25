<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::get('/legacy/teacher/dashboard/{id}', function (\$id) {
    \$titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
        ->where('Titulaire.idPers', \$id)
        ->where('Titulaire.actif', 1)
        ->select('Classe.idClasse', 'Classe.libelle as classe', 'Salle.libelle as salle')
        ->first();

    if (!\$titulaire) {
        return response()->json(['error' => 'Not assigned to a class'], 404);
    }

    \$edt = DB::table('EmploiDuTemps')
        ->join('Cours', 'EmploiDuTemps.idCours', '=', 'Cours.idCours')
        ->where('EmploiDuTemps.idClasse', \$titulaire->idClasse)
        ->select('EmploiDuTemps.jour', 'EmploiDuTemps.heure', 'Cours.libelle as subject')
        ->get();

    return response()->json([
        'classe' => \$titulaire->classe,
        'salle' => \$titulaire->salle,
        'schedule' => \$edt
    ]);
});
