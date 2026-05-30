<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\ReportCardApprovalController;
use App\Http\Controllers\Admin\EnrollmentValidationController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\TeacherAssignmentController;
use App\Http\Controllers\Admin\TeacherApprovalController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\SchoolClassController;
use App\Http\Controllers\Admin\SchoolYearController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\TermController;
use App\Http\Controllers\Legacy\LegacyAuthController;
use App\Http\Controllers\Legacy\LegacyDisciplineController;
use App\Http\Controllers\Legacy\LegacyPaymentController;
use App\Http\Controllers\Legacy\LegacyStudentController;
use App\Http\Controllers\Legacy\LegacyStructureController;
use App\Http\Controllers\Legacy\LegacyTeacherController;
use App\Http\Controllers\Legacy\LegacyDashboardController;
use App\Http\Controllers\Legacy\LegacyCoursController;
use App\Http\Controllers\Legacy\LegacyTitulaireController;
use App\Http\Controllers\Legacy\LegacyMessageController;
use App\Http\Controllers\Legacy\LegacyUserController;
use App\Http\Controllers\Parents\ParentPortalController;
use App\Http\Controllers\Secretary\ParentController as SecretaryParentController;
use App\Http\Controllers\Secretary\PaymentController as SecretaryPaymentController;
use App\Http\Controllers\Secretary\StudentController as SecretaryStudentController;
use App\Http\Controllers\Teacher\AssessmentController;
use App\Http\Controllers\Teacher\GradeController;
use App\Http\Controllers\Teacher\ReportCardController as TeacherReportCardController;
use App\Http\Controllers\Teacher\ClassController as TeacherClassController;
use App\Http\Controllers\Teacher\AttendanceController as TeacherAttendanceController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

// Routes legacy compatibles avec la base MySQL du professeur
Route::prefix('legacy')->group(function () {
    Route::post('/auth/login-admin', [LegacyAuthController::class, 'loginAdmin']);
    Route::post('/auth/login-teacher', [LegacyAuthController::class, 'loginTeacher']);
    Route::post('/auth/login-parent', [LegacyAuthController::class, 'loginParent']);


    // Lecture globale: super admin, admin, directeur, secretaire, fondateur
    Route::middleware('legacy.typeadmin:SUPER_ADMIN,ADMIN,DIRECTEUR,SECRETAIRE,FONDATEUR')->group(function () {
        Route::get('/eleves', [LegacyStudentController::class, 'index']);
        Route::get('/paiements', [LegacyPaymentController::class, 'index']);
        Route::get('/modes', [LegacyPaymentController::class, 'modes']);
        Route::get('/dashboard-stats', [LegacyDashboardController::class, 'index']);
        Route::get('/enseignants', [LegacyTeacherController::class, 'index']);
        Route::get('/classes', [LegacyStructureController::class, 'classes']);
        Route::get('/salles', [LegacyStructureController::class, 'rooms']);
        Route::get('/trimestres', [LegacyStructureController::class, 'terms']);
        Route::get('/annees', [LegacyStructureController::class, 'schoolYears']);
        Route::get('/matieres', [LegacyStructureController::class, 'subjects']);
        Route::get('/cycles', [LegacyStructureController::class, 'cycles']);
        Route::get('/cours', [LegacyCoursController::class, 'index']);
        Route::get('/edt', [LegacyCoursController::class, 'edt']);
        Route::get('/titulaires', [LegacyTitulaireController::class, 'index']);
        Route::get('/titulaires/enseignants', [LegacyTitulaireController::class, 'enseignants']);
        Route::get('/discipline', [LegacyDisciplineController::class, 'index']);
        Route::get('/messages', [LegacyMessageController::class, 'index']);
        Route::get('/utilisateurs', [LegacyUserController::class, 'index']);
    });

    // Inscriptions et paiements: admin/directeur/secretaire/super admin
    Route::middleware('legacy.typeadmin:SUPER_ADMIN,ADMIN,DIRECTEUR,SECRETAIRE')->group(function () {
        Route::post('/eleves', [LegacyStudentController::class, 'store']);
        Route::post('/paiements', [LegacyPaymentController::class, 'store']);
        Route::post('/discipline', [LegacyDisciplineController::class, 'store']);
        Route::post('/eleves/{id}/validate', [LegacyStudentController::class, 'validateEnrollment']);
        Route::post('/eleves', [LegacyStudentController::class, 'store']);
        Route::patch('/eleves/{matricule}/toggle', [LegacyStudentController::class, 'toggleActif']);
        Route::post('/eleves/{matricule}/assign-class', [LegacyStudentController::class, 'assignClass']);
        Route::post('/enseignants', [LegacyTeacherController::class, 'store']);
        Route::post('/classes', [LegacyStructureController::class, 'createClass']);
        Route::post('/salles', [LegacyStructureController::class, 'createRoom']);
        Route::patch('/salles/{id}/toggle', function ($id) {
            $current = DB::table('Salle')->where('idSalle', $id)->value('actif');
            $newStatus = $current ? 0 : 1;
            if ($newStatus == 1) {
                // Reactivation: always reset to Non assignée first
                DB::table('Salle')->where('idSalle', $id)->update(['actif' => 1, 'idClasse' => 999]);
            } else {
                // Deactivation: just mark inactive, keep class reference
                DB::table('Salle')->where('idSalle', $id)->update(['actif' => 0]);
            }
            return response()->json(['message' => 'Statut mis à jour']);
        });
        Route::patch('/salles/{id}/assign-class', function (Illuminate\Http\Request $request, $id) {
            $idClasse = $request->input('idClasse');
            $salle = DB::table('Salle')->where('idSalle', $id)->first();
            if (!$salle) return response()->json(['message' => 'Salle introuvable'], 404);
            if (!$salle->actif) return response()->json(['message' => 'Impossible d\'assigner une classe \u00e0 une salle inactive'], 403);
            if ($idClasse && $idClasse != 999) {
                // Libérer la classe de toute autre salle qui la possède
                $oldSalle = DB::table('Salle')->where('idClasse', $idClasse)->where('idSalle', '!=', $id)->first();
                if ($oldSalle) {
                    DB::table('Frequente')->where('idSalle', $oldSalle->idSalle)->update(['idSalle' => $id]);
                    DB::table('Titulaire')->where('idSalle', $oldSalle->idSalle)->update(['idSalle' => $id]);
                    DB::table('Salle')->where('idSalle', $oldSalle->idSalle)->update(['idClasse' => 999]);
                }
            }
            DB::table('Salle')->where('idSalle', $id)->update(['idClasse' => $idClasse ?: 999]);
            return response()->json(['message' => 'Classe assign\u00e9e']);
        });
        Route::post('/trimestres', [LegacyStructureController::class, 'createTerm']);
        Route::post('/annees', [LegacyStructureController::class, 'createSchoolYear']);
        Route::post('/cours', [LegacyCoursController::class, 'store']);
        Route::post('/edt', [LegacyCoursController::class, 'storeEdt']);
        Route::delete('/edt/{id}', [LegacyCoursController::class, 'deleteEdt']);
        Route::post('/titulaires', [LegacyTitulaireController::class, 'store']);
        Route::delete('/titulaires/{id}', [LegacyTitulaireController::class, 'destroy']);
        Route::post('/matieres', [LegacyStructureController::class, 'createSubject']);
        Route::post('/messages', [LegacyMessageController::class, 'store']);
        Route::post('/utilisateurs/enseignant', [LegacyUserController::class, 'createEnseignant']);
        Route::post('/utilisateurs/parent', [LegacyUserController::class, 'createParent']);
        Route::patch('/utilisateurs/{id}/toggle', [LegacyUserController::class, 'toggleActif']);
        // Rechercher les élèves liés à un parent par son nom (pour auto-remplissage du modal)
        Route::get('/eleves/by-parent-name', function (Illuminate\Http\Request $request) {
            $nom = strtoupper(trim($request->input('nom', '')));
            if (strlen($nom) < 2) {
                return response()->json(['eleves' => [], 'parent' => null]);
            }
            
            $parentIds = DB::table('Personne')
                ->where('typePersonne', 3)
                ->where('nom', 'like', "%{$nom}%")
                ->pluck('idPers')->toArray();

            if (empty($parentIds)) {
                return response()->json(['eleves' => [], 'parent' => null]);
            }

            // Récupérer les élèves liés à ces parents ET dont le parent n'a pas encore de VRAI compte
            // (username vide OU auto-généré commençant par 'P')
            $eleves = DB::table('Parents')
                ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
                ->join('Personne', 'Parents.idPers', '=', 'Personne.idPers')
                ->whereIn('Parents.idPers', $parentIds)
                ->where('Eleve.isDelete', 0)
                ->where(function($q) {
                    $q->where('Personne.username', '')
                      ->orWhere('Personne.username', 'like', 'P%');
                })
                ->select('Eleve.matricule', 'Eleve.nom', 'Eleve.prenom', 'Personne.idPers', 'Personne.nom as parent_nom', 'Personne.prenom as parent_prenom')
                ->get();

            // Prendre le parent du premier élève trouvé pour pré-remplir le formulaire
            $firstParentId = count($eleves) > 0 ? $eleves[0]->idPers : null;
            $parentData = null;
            if ($firstParentId) {
                $parentData = ['idPers' => $firstParentId, 'nom' => $eleves[0]->parent_nom, 'prenom' => $eleves[0]->parent_prenom];
            }

            return response()->json([
                'eleves'  => $eleves,
                'parent'  => $parentData,
            ]);
        });
    });

    // Approbation enseignant: fondateur (ou super admin)
    Route::middleware('legacy.typeadmin:SUPER_ADMIN,FONDATEUR')->group(function () {
        Route::post('/enseignants/{id}/approve', [LegacyTeacherController::class, 'approveByFounder']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role:SECRETAIRE,DIRECTEUR,FONDATEUR')->prefix('secretary')->group(function () {
        Route::get('/students', [SecretaryStudentController::class, 'index']);
        Route::post('/students', [SecretaryStudentController::class, 'store']);
        Route::get('/students/{student}', [SecretaryStudentController::class, 'show']);
        Route::patch('/students/{student}', [SecretaryStudentController::class, 'update']);

        Route::get('/parents', [SecretaryParentController::class, 'index']);
        Route::post('/parents', [SecretaryParentController::class, 'store']);
        Route::post('/parents/{parent}/link-student', [SecretaryParentController::class, 'linkStudent']);

        Route::get('/payments', [SecretaryPaymentController::class, 'index']);
        Route::post('/payments', [SecretaryPaymentController::class, 'store']);
        Route::post('/payments/{payment}/receipt', [SecretaryPaymentController::class, 'generateReceipt']);
    });

    Route::middleware('role:ENSEIGNANT')->prefix('teacher')->group(function () {
        Route::get('/assessments', [AssessmentController::class, 'index']);
        Route::post('/assessments', [AssessmentController::class, 'store']);

        Route::post('/grades', [GradeController::class, 'store']);

        Route::post('/report-cards/{student}/submit', [TeacherReportCardController::class, 'submit']);

        Route::get('/classes', [TeacherClassController::class, 'index']);
        Route::get('/classes/{class}/students', [TeacherClassController::class, 'students']);
        Route::get('/attendance', [TeacherAttendanceController::class, 'index']);

        Route::get('/messages/parents', [App\Http\Controllers\Teacher\MessageController::class, 'parents']);
        Route::post('/messages', [App\Http\Controllers\Teacher\MessageController::class, 'store']);
    });

    // ADMIN = gestion inscriptions + création comptes + structure
    Route::middleware('role:ADMIN,DIRECTEUR,FONDATEUR')->prefix('admin')->group(function () {
        Route::get('/report-cards/{reportCard}', [ReportCardApprovalController::class, 'show']);
        Route::post('/report-cards/{reportCard}/approve', [ReportCardApprovalController::class, 'approve']);
        Route::post('/report-cards/{reportCard}/publish', [ReportCardApprovalController::class, 'publish']);

        // Structure école
        Route::get('/subjects', [SubjectController::class, 'index']);
        Route::post('/subjects', [SubjectController::class, 'store']);
        Route::put('/subjects/{subject}', [SubjectController::class, 'update']);
        Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

        Route::get('/school-years', [SchoolYearController::class, 'index']);
        Route::post('/school-years', [SchoolYearController::class, 'store']);
        Route::put('/school-years/{schoolYear}', [SchoolYearController::class, 'update']);
        Route::post('/school-years/{schoolYear}/activate', [SchoolYearController::class, 'activateYear']);
        Route::delete('/school-years/{schoolYear}', [SchoolYearController::class, 'destroy']);

        Route::get('/terms', [TermController::class, 'index']);
        Route::post('/terms', [TermController::class, 'store']);
        Route::put('/terms/{term}', [TermController::class, 'update']);
        Route::delete('/terms/{term}', [TermController::class, 'destroy']);

        Route::get('/rooms', [RoomController::class, 'index']);
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

        Route::get('/classes', [SchoolClassController::class, 'index']);
        Route::post('/classes', [SchoolClassController::class, 'store']);
        Route::put('/classes/{schoolClass}', [SchoolClassController::class, 'update']);
        Route::delete('/classes/{schoolClass}', [SchoolClassController::class, 'destroy']);

        Route::get('/teachers', [TeacherController::class, 'index']);
        Route::post('/teachers', [TeacherController::class, 'store']);

        // Inscriptions: validation après paiement
        Route::post('/students/{student}/validate-enrollment', [EnrollmentValidationController::class, 'validateEnrollment']);

        Route::get('/teacher-assignments', [TeacherAssignmentController::class, 'index']);
        Route::post('/teacher-assignments', [TeacherAssignmentController::class, 'store']);
        Route::delete('/teacher-assignments/{assignment}', [TeacherAssignmentController::class, 'destroy']);

        Route::get('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'index']);
        Route::post('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'store']);
    });

    // Fondateur: autorise l’activation des enseignants créés par l’admin
    Route::middleware('role:FONDATEUR')->prefix('founder')->group(function () {
        Route::post('/teachers/{teacher}/approve', [TeacherApprovalController::class, 'approve']);
    });

    Route::middleware('role:PARENT')->prefix('parent')->group(function () {
        Route::get('/children', [ParentPortalController::class, 'children']);
        Route::get('/children/{studentId}/report-cards', [ParentPortalController::class, 'publishedReportCards']);
        Route::get('/children/{studentId}/payments', [ParentPortalController::class, 'payments']);
    });
});

Route::get('/legacy/teacher/dashboard/{id}', function ($id) {
    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
        ->where('Titulaire.idPers', $id)
        ->where('Titulaire.actif', 1)
        ->select('Classe.idClasse', 'Classe.libelle as classe', 'Salle.libelle as salle')
        ->first();

    if (!$titulaire) {
        return response()->json(['error' => 'Not assigned to a class'], 404);
    }

    $edt = DB::table('EmploiDuTemps')
        ->join('Cours', 'EmploiDuTemps.idCours', '=', 'Cours.idCours')
        ->where('EmploiDuTemps.idClasse', $titulaire->idClasse)
        ->select('EmploiDuTemps.jour', 'EmploiDuTemps.heure', 'Cours.libelle as subject', 'Cours.idCours')
        ->get();

    return response()->json([
        'classe' => $titulaire->classe,
        'salle' => $titulaire->salle,
        'schedule' => $edt
    ]);
});

Route::get('/legacy/teacher/dashboard/full/{id}', function ($id) {
    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
        ->where('Titulaire.idPers', $id)
        ->where('Titulaire.actif', 1)
        ->select('Classe.idClasse', 'Classe.libelle as classe', 'Salle.libelle as salle')
        ->first();

    $teacherClass = $titulaire ? $titulaire->classe : 'Aucune classe assignée';
    $idClasse = $titulaire ? $titulaire->idClasse : null;

    $personne = DB::table('Personne')->where('idPers', $id)->first();
    $teacherName = $personne ? $personne->prenom . ' ' . $personne->nom : 'Enseignant';

    $totalEleves = 0;
    $totalAbsences = 0;
    $totalDevoirs = 0;
    $upcomingAssessments = [];
    $edt = [];

    if ($idClasse) {
        $edt = DB::table('EmploiDuTemps')
            ->join('Cours', 'EmploiDuTemps.idCours', '=', 'Cours.idCours')
            ->where('EmploiDuTemps.idClasse', $idClasse)
            ->select('EmploiDuTemps.jour', 'EmploiDuTemps.heure', 'Cours.libelle as subject', 'Cours.idCours')
            ->orderBy('EmploiDuTemps.jour')->orderBy('EmploiDuTemps.heure')
            ->get();
        $totalEleves = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->join('Eleve', 'Frequente.matricule', '=', 'Eleve.matricule')
            ->where('Salle.idClasse', $idClasse)
            ->where('Eleve.isDelete', 0)
            ->count();

        // Use today's date (server timezone)
        $today = \Carbon\Carbon::now()->toDateString();

        $totalAbsences = DB::table('attendances')
            ->where('school_class_id', $idClasse)
            ->where('status', 'ABSENT')
            ->whereDate('date', $today)
            ->count();

        // assessments table may not exist yet — handle gracefully
        try {
            $totalDevoirs = DB::table('assessments')
                ->where('school_class_id', $idClasse)
                ->count();

            $upcomingAssessments = DB::table('assessments')
                ->where('school_class_id', $idClasse)
                ->orderBy('date', 'desc')
                ->limit(5)
                ->get();
        } catch (\Exception $e) {
            $totalDevoirs = 0;
            $upcomingAssessments = [];
        }
    }

    return response()->json([
        'teacherName' => $teacherName,
        'classe' => $teacherClass,
        'salle' => $titulaire ? $titulaire->salle : '',
        'stats' => [
            'eleves' => $totalEleves,
            'absences' => $totalAbsences,
            'devoirs' => $totalDevoirs
        ],
        'upcomingAssessments' => $upcomingAssessments,
        'schedule' => $edt
    ]);
});

Route::get('/legacy/teacher/grades/context/{id}', function ($id) {
    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->where('Titulaire.idPers', $id)
        ->where('Titulaire.actif', 1)
        ->select('Salle.idClasse')
        ->first();

    if (!$titulaire) {
        return response()->json(['error' => 'Aucune classe assignée'], 404);
    }

    $idClasse = $titulaire->idClasse;

    $students = DB::table('Frequente')
        ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->join('Eleve', 'Frequente.matricule', '=', 'Eleve.matricule')
        ->where('Salle.idClasse', $idClasse)
        ->where('Eleve.isDelete', 0)
        ->select('Eleve.matricule', 'Eleve.nom', 'Eleve.prenom', 'Eleve.actif')
        ->orderBy('Eleve.nom')
        ->get();

    $subjects = DB::table('Cours')
        ->where('idClasse', $idClasse)
        ->where('isDelete', 0)
        ->select('idCours', 'libelle')
        ->orderBy('libelle')
        ->get();

    $grades = DB::table('Evaluation')
        ->join('Frequente', 'Evaluation.matricule', '=', 'Frequente.matricule')
        ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->where('Salle.idClasse', $idClasse)
        ->select('Evaluation.idEval', 'Evaluation.matricule', 'Evaluation.idCours', 'Evaluation.note')
        ->get();

    return response()->json([
        'students' => $students,
        'subjects' => $subjects,
        'grades' => $grades
    ]);
});

Route::post('/legacy/teacher/grades/student/{matricule}', function (Illuminate\Http\Request $request, $matricule) {
    $idPers = $request->input('uid'); // Teacher ID
    $grades = $request->input('grades'); // [{idCours: X, note: Y}]

    $session = DB::table('Session')->select('idSession')->first();
    $defaultSession = $session ? $session->idSession : 1;

    $epreuve = DB::table('Epreuve')->select('idEpreuve')->first();
    $defaultEpreuve = $epreuve ? $epreuve->idEpreuve : 1;

    foreach ($grades as $gradeData) {
        $idCours = $gradeData['idCours'];
        $note = $gradeData['note'];

        $existing = DB::table('Evaluation')
            ->where('matricule', $matricule)
            ->where('idCours', $idCours)
            ->first();

        if ($existing) {
            DB::table('Evaluation')->where('idEval', $existing->idEval)->update([
                'note' => $note
            ]);
        } else {
            DB::table('Evaluation')->insert([
                'note' => $note,
                'matricule' => $matricule,
                'idEpreuve' => $defaultEpreuve,
                'idCours' => $idCours,
                'idSession' => $defaultSession,
                'idPers' => $idPers,
                'appreciation' => 'Bien',
                'created_at' => now()
            ]);
        }
    }

    return response()->json(['success' => true]);
});

Route::get('/legacy/teacher/attendance/context/{id}', function ($id) {
    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->where('Titulaire.idPers', $id)
        ->where('Titulaire.actif', 1)
        ->select('Salle.idClasse')
        ->first();

    if (!$titulaire) {
        return response()->json(['error' => 'Aucune classe assignée'], 404);
    }

    $idClasse = $titulaire->idClasse;

    $students = DB::table('Frequente')
        ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->join('Eleve', 'Frequente.matricule', '=', 'Eleve.matricule')
        ->where('Salle.idClasse', $idClasse)
        ->where('Eleve.isDelete', 0)
        ->select('Eleve.matricule', 'Eleve.nom', 'Eleve.prenom', 'Eleve.sexe')
        ->orderBy('Eleve.nom')
        ->get();

    $attendances = DB::table('attendances')
        ->where('school_class_id', $idClasse)
        ->select('id', 'student_id', 'date', 'status')
        ->get();

    return response()->json([
        'students' => $students,
        'attendances' => $attendances
    ]);
});

Route::post('/legacy/teacher/attendance/student/{matricule}', function (Illuminate\Http\Request $request, $matricule) {
    $status = $request->input('status'); // PRESENT, ABSENT, LATE
    $date = $request->input('date'); // YYYY-MM-DD
    $idPers = $request->input('uid');

    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->where('Titulaire.idPers', $idPers)
        ->where('Titulaire.actif', 1)
        ->select('Salle.idClasse')
        ->first();

    if (!$titulaire) {
        return response()->json(['error' => 'Accès refusé'], 403);
    }

    $existing = DB::table('attendances')
        ->where('student_id', $matricule)
        ->where('date', $date)
        ->first();

    if ($existing) {
        DB::table('attendances')->where('id', $existing->id)->update([
            'status' => $status,
            'updated_at' => now()
        ]);
    } else {
        DB::table('attendances')->insert([
            'school_class_id' => $titulaire->idClasse,
            'student_id' => $matricule,
            'date' => $date,
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    return response()->json(['success' => true]);
});
Route::get('/legacy/parent/{idPers}/dashboard',  [App\Http\Controllers\Legacy\LegacyParentDashboardController::class, 'getDashboard']);
Route::get('/legacy/parent/{idPers}/notes',      [App\Http\Controllers\Legacy\LegacyParentDashboardController::class, 'getNotes']);
Route::get('/legacy/parent/{idPers}/paiements',  [App\Http\Controllers\Legacy\LegacyParentDashboardController::class, 'getPaiements']);
Route::get('/legacy/parent/{idPers}/bulletins',  [App\Http\Controllers\Legacy\LegacyParentDashboardController::class, 'getBulletins']);

Route::get('/legacy/teacher/assessments/context/{id}', function ($id) {
    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->where('Titulaire.idPers', $id)
        ->where('Titulaire.actif', 1)
        ->select('Salle.idClasse')
        ->first();

    if (!$titulaire) {
        return response()->json(['error' => 'Aucune classe assignée'], 404);
    }

    $idClasse = $titulaire->idClasse;

    $subjects = DB::table('Cours')
        ->where('idClasse', $idClasse)
        ->where('isDelete', 0)
        ->select('idCours as id', 'libelle')
        ->orderBy('libelle')
        ->get();

        $assessments = DB::table('assessments')
        ->where('school_class_id', $idClasse)
        ->select('id', 'title', 'type', 'date', 'total_points', 'subject_id', 'status')
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'subjects' => $subjects,
        'assessments' => $assessments
    ]);
});

Route::post('/legacy/teacher/assessments/{id}', function (Illuminate\Http\Request $request, $id) {
    $titulaire = DB::table('Titulaire')
        ->join('Salle', 'Titulaire.idSalle', '=', 'Salle.idSalle')
        ->where('Titulaire.idPers', $id)
        ->where('Titulaire.actif', 1)
        ->select('Salle.idClasse')
        ->first();

    if (!$titulaire) {
        return response()->json(['error' => 'Accès refusé'], 403);
    }

    $idClasse = $titulaire->idClasse;

    $type = $request->input('type');
    $status = ($type === 'Devoir') ? 'en cours' : 'planifiée';

    $assessmentId = DB::table('assessments')->insertGetId([
        'school_class_id' => $idClasse,
        'teacher_id' => $id,
        'subject_id' => $request->input('subject_id'),
        'term_id' => 1, // default
        'title' => $request->input('title'),
        'type' => $type, // Devoir, Contrôle, Examen
        'date' => $request->input('date'),
        'total_points' => $request->input('total_points'),
        'status' => $status,
        'created_at' => now(),
        'updated_at' => now()
    ]);

    return response()->json(['success' => true, 'id' => $assessmentId, 'status' => $status]);
});

Route::patch('/legacy/teacher/assessments/{id}/status', function (Illuminate\Http\Request $request, $id) {
    DB::table('assessments')->where('id', $id)->update([
        'status' => $request->input('status'),
        'updated_at' => now()
    ]);
    return response()->json(['success' => true]);
});

Route::get('/legacy/teacher/assessments/{id}/grades', function ($id) {
    $assessment = DB::table('assessments')->where('id', $id)->first();
    if (!$assessment) {
        return response()->json(['error' => 'Épreuve introuvable'], 404);
    }

    $students = DB::table('Frequente')
        ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->join('Eleve', 'Frequente.matricule', '=', 'Eleve.matricule')
        ->where('Salle.idClasse', $assessment->school_class_id)
        ->where('Eleve.isDelete', 0)
        ->select('Eleve.matricule', 'Eleve.nom', 'Eleve.prenom', 'Eleve.actif')
        ->orderBy('Eleve.nom')
        ->get();

    $grades = DB::table('grades')
        ->where('assessment_id', $id)
        ->select('student_id', 'score')
        ->get();

    return response()->json([
        'assessment' => $assessment,
        'students' => $students,
        'grades' => $grades
    ]);
});

Route::post('/legacy/teacher/assessments/{id}/grades', function (Illuminate\Http\Request $request, $id) {
    $uid = $request->input('uid');
    $gradesInput = $request->input('grades'); // [{student_id, score}]

    foreach ($gradesInput as $g) {
        $existing = DB::table('grades')
            ->where('assessment_id', $id)
            ->where('student_id', $g['student_id'])
            ->first();

        if ($existing) {
            DB::table('grades')->where('id', $existing->id)->update([
                'score' => $g['score'],
                'updated_at' => now()
            ]);
        } else {
            DB::table('grades')->insert([
                'assessment_id' => $id,
                'student_id' => $g['student_id'],
                'score' => $g['score'],
                'created_by_user_id' => $uid,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    return response()->json(['success' => true]);
});


// =============================================================
// ADMIN — Moyennes réelles (depuis table Evaluation)
// =============================================================
Route::get('/legacy/admin/moyennes', function () {
    $eleves = DB::table('Eleve')
        ->where('isDelete', 0)
        ->select('matricule', 'nom', 'prenom', 'sexe')
        ->orderBy('nom')
        ->get();

    $result = [];
    foreach ($eleves as $eleve) {
        $evaluations = DB::table('Evaluation')
            ->join('Cours', 'Evaluation.idCours', '=', 'Cours.idCours')
            ->where('Evaluation.matricule', $eleve->matricule)
            ->select('Evaluation.note', 'Cours.libelle as matiere')
            ->get();

        $notes = [];
        $total = 0;
        $count = 0;
        foreach ($evaluations as $eval) {
            $notes[] = ['matiere' => $eval->matiere, 'note' => $eval->note];
            if ($eval->note !== null) { $total += $eval->note; $count++; }
        }
        $moyenne = $count > 0 ? round($total / $count, 2) : null;

        $absences = DB::table('attendances')
            ->where('student_id', $eleve->matricule)
            ->where('status', 'ABSENT')
            ->count();

        $result[] = [
            'matricule'        => $eleve->matricule,
            'nom'              => $eleve->nom,
            'prenom'           => $eleve->prenom,
            'sexe'             => $eleve->sexe,
            'notes'            => $notes,
            'moyenne_generale' => $moyenne,
            'absences'         => $absences,
            'statut'           => ($moyenne !== null && $moyenne < 10) ? 'Alerte' : 'Bon',
        ];
    }

    $allNotes = DB::table('Evaluation')->whereNotNull('note')->avg('note');
    $enDifficulte = count(array_filter($result, fn($e) => $e['statut'] === 'Alerte'));
    $avecMoyenne  = array_filter($result, fn($e) => $e['moyenne_generale'] !== null && $e['moyenne_generale'] >= 10);
    $tauxReussite = count($result) > 0 ? round(count($avecMoyenne) / count($result) * 100, 1) : null;

    return response()->json([
        'eleves'        => $result,
        'moyenne_ecole' => $allNotes ? round($allNotes, 2) : null,
        'total_eleves'  => count($result),
        'en_difficulte' => $enDifficulte,
        'taux_reussite' => $tauxReussite,
    ]);
});

// =============================================================
// ADMIN — Présences Globales
// =============================================================
Route::get('/legacy/admin/attendance', function () {
    $today = \Carbon\Carbon::now()->toDateString();
    $classes = DB::table('Classe')->get();
    
    $result = [];
    foreach ($classes as $classe) {
        $total = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->join('Eleve', 'Frequente.matricule', '=', 'Eleve.matricule')
            ->where('Salle.idClasse', $classe->idClasse)
            ->where('Eleve.isDelete', 0)
            ->where('Eleve.actif', 1)
            ->count();
            
        if ($total == 0) continue;

        $absents = DB::table('attendances')
            ->where('school_class_id', $classe->idClasse)
            ->where('status', 'ABSENT')
            ->whereDate('date', $today)
            ->count();

        $result[] = [
            'classe' => $classe->libelle,
            'total' => $total,
            'absents' => $absents,
            'presents' => max(0, $total - $absents),
        ];
    }

    return response()->json($result);
});

// =============================================================
// ADMIN — Discipline
// =============================================================
Route::get('/legacy/admin/discipline', function () {
    // Return all students with their discipline points and their sanctions
    $eleves = DB::table('Eleve')
        ->where('isDelete', 0)
        ->select('matricule', 'nom', 'prenom')
        ->get();

    $result = [];
    foreach ($eleves as $e) {
        // Absences
        $absences = DB::table('attendances')
            ->where('student_id', $e->matricule)
            ->where('status', 'ABSENT')
            ->count();

        // Sanctions
        $sanctionsData = DB::table('sanctions')
            ->where('student_id', $e->matricule)
            ->get();

        $malusSanctions = 0;
        foreach ($sanctionsData as $s) {
            $malusSanctions += $s->points;
        }

        $points = 100 - $absences - $malusSanctions;
        $classe = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->where('Frequente.matricule', $e->matricule)
            ->value('Classe.libelle') ?? 'Non assigné';

        $result[] = [
            'matricule' => $e->matricule,
            'nom' => $e->nom . ' ' . $e->prenom,
            'classe' => $classe,
            'points' => $points,
            'absences' => $absences,
            'malus_sanctions' => $malusSanctions,
            'sanctions' => $sanctionsData
        ];
    }

    return response()->json($result);
});

Route::post('/legacy/admin/discipline/sanctions', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'matricule' => 'required|integer',
        'points' => 'required|integer',
        'motif' => 'required|string',
    ]);

    DB::table('sanctions')->insert([
        'student_id' => $request->matricule,
        'points' => $request->points,
        'motif' => $request->motif,
        'date' => \Carbon\Carbon::now()->toDateString(),
        'created_at' => \Carbon\Carbon::now(),
        'updated_at' => \Carbon\Carbon::now()
    ]);

    return response()->json(['message' => 'Sanction ajoutée avec succès']);
});

Route::delete('/legacy/admin/discipline/sanctions/{id}', function ($id) {
    DB::table('sanctions')->where('id', $id)->delete();
    return response()->json(['message' => 'Sanction supprimée']);
});

// =============================================================
// ADMIN — Épreuves (Lectures seules)
// =============================================================
Route::get('/legacy/admin/assessments', function () {
    $assessments = DB::table('assessments')
        ->join('Classe', 'assessments.school_class_id', '=', 'Classe.idClasse')
        ->join('Cours', 'assessments.subject_id', '=', 'Cours.idCours')
        ->join('Personne', 'assessments.teacher_id', '=', 'Personne.idPers')
        ->select(
            'assessments.id',
            'assessments.title as titre',
            'Cours.libelle as matiere',
            'Classe.libelle as classe',
            'assessments.type',
            'assessments.date',
            'assessments.total_points as max',
            'assessments.status as statut',
            'Personne.nom as enseignant_nom',
            'Personne.prenom as enseignant_prenom'
        )
        ->orderBy('assessments.date', 'desc')
        ->get()
        ->map(function ($a) {
            $a->enseignant = trim($a->enseignant_prenom . ' ' . $a->enseignant_nom);
            
            // Deduce a simple "cycle" logic based on class name if needed
            $cycle = 'Inconnu';
            if (strpos(strtoupper($a->classe), 'CP') !== false) $cycle = 'CP';
            elseif (strpos(strtoupper($a->classe), 'CE1') !== false) $cycle = 'CE1';
            elseif (strpos(strtoupper($a->classe), 'CE2') !== false) $cycle = 'CE2';
            elseif (strpos(strtoupper($a->classe), 'CM1') !== false) $cycle = 'CM1';
            elseif (strpos(strtoupper($a->classe), 'CM2') !== false) $cycle = 'CM2';
            $a->cycle = $cycle;

            $a->heure = '08h00';
            $a->duree = '2h';
            $a->max = intval($a->max);

            return $a;
        });

    return response()->json($assessments);
});

// =============================================================
// ADMIN — Bulletin complet d'un élève (notes + absences)
// =============================================================
Route::get('/legacy/admin/bulletin/{matricule}', function ($matricule) {
    $eleve = DB::table('Eleve')->where('matricule', $matricule)->where('isDelete', 0)->first();
    if (!$eleve) return response()->json(['error' => 'Élève introuvable'], 404);

    $salle = DB::table('Frequente')
        ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
        ->where('Frequente.matricule', $matricule)
        ->select('Classe.libelle as classe', 'Salle.libelle as salle')
        ->first();

    $evaluations = DB::table('Evaluation')
        ->join('Cours', 'Evaluation.idCours', '=', 'Cours.idCours')
        ->where('Evaluation.matricule', $matricule)
        ->select('Cours.libelle as matiere', 'Evaluation.note')
        ->orderBy('Cours.libelle')
        ->get();

    $matieres = [];
    foreach ($evaluations as $eval) {
        $key = $eval->matiere;
        if (!isset($matieres[$key])) $matieres[$key] = ['matiere' => $key, 'notes' => [], 'moyenne' => null];
        if ($eval->note !== null) $matieres[$key]['notes'][] = $eval->note;
    }
    foreach ($matieres as &$m) {
        if (count($m['notes']) > 0) $m['moyenne'] = round(array_sum($m['notes']) / count($m['notes']), 2);
    }

    $absences = DB::table('attendances')
        ->where('student_id', $matricule)
        ->where('status', 'ABSENT')
        ->orderBy('date', 'desc')
        ->select('date', 'status')
        ->get();

    $moyennes = array_filter(array_column(array_values($matieres), 'moyenne'), fn($v) => $v !== null);
    $moyenneGenerale = count($moyennes) > 0 ? round(array_sum($moyennes) / count($moyennes), 2) : null;

    $mention = $moyenneGenerale === null ? '—'
        : ($moyenneGenerale >= 16 ? 'Très Bien'
        : ($moyenneGenerale >= 14 ? 'Bien'
        : ($moyenneGenerale >= 12 ? 'Assez Bien'
        : ($moyenneGenerale >= 10 ? 'Passable' : 'Insuffisant'))));

    return response()->json([
        'eleve'            => $eleve,
        'classe'           => $salle?->classe ?? '—',
        'salle'            => $salle?->salle ?? '—',
        'matieres'         => array_values($matieres),
        'absences'         => $absences,
        'total_absences'   => $absences->count(),
        'moyenne_generale' => $moyenneGenerale,
        'mention'          => $mention,
    ]);
});
