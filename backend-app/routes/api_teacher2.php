<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::get('/legacy/teacher/dashboard/full/{id}', function (\$id) {
    \$titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
        ->where('Titulaire.idPers', \$id)
        ->where('Titulaire.actif', 1)
        ->select('Classe.idClasse', 'Classe.libelle as classe', 'Salle.libelle as salle')
        ->first();

    \$teacherClass = \$titulaire ? \$titulaire->classe : 'Aucune classe assignée';
    \$idClasse = \$titulaire ? \$titulaire->idClasse : null;

    \$personne = DB::table('Personne')->where('idPers', \$id)->first();
    \$teacherName = \$personne ? \$personne->prenom . ' ' . \$personne->nom : 'Enseignant';

    \$edt = [];
    \$totalEleves = 0;
    
    if (\$idClasse) {
        \$edt = DB::table('EmploiDuTemps')
            ->join('Cours', 'EmploiDuTemps.idCours', '=', 'Cours.idCours')
            ->where('EmploiDuTemps.idClasse', \$idClasse)
            ->select('EmploiDuTemps.jour', 'EmploiDuTemps.heure', 'Cours.libelle as subject', 'Cours.idCours')
            ->orderBy('EmploiDuTemps.jour')->orderBy('EmploiDuTemps.heure')
            ->get();
            
        \$totalEleves = DB::table('Eleve')
            ->where('idClasse', \$idClasse)
            ->where('isDelete', 0)
            ->count();
    }

    return response()->json([
        'teacherName' => \$teacherName,
        'classe' => \$teacherClass,
        'salle' => \$titulaire ? \$titulaire->salle : '',
        'stats' => [
            'eleves' => \$totalEleves,
            'notes' => 0, // A implémenter avec l'évaluation
            'absences' => 0,
            'devoirs' => 0
        ],
        'schedule' => \$edt
    ]);
});
