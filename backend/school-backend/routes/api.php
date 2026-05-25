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
use App\Http\Controllers\Parents\ParentPortalController;
use App\Http\Controllers\Secretary\ParentController as SecretaryParentController;
use App\Http\Controllers\Secretary\PaymentController as SecretaryPaymentController;
use App\Http\Controllers\Secretary\StudentController as SecretaryStudentController;
use App\Http\Controllers\Teacher\AssessmentController;
use App\Http\Controllers\Teacher\GradeController;
use App\Http\Controllers\Teacher\ReportCardController as TeacherReportCardController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

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

