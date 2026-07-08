<?php

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// 1. Fetch existing Trimestres
$trimestresList = DB::table('Trimestre')->get();

if ($trimestresList->isEmpty()) {
    echo "No trimestres found in the DB. Please create them first or adjust script.\n";
    exit;
}

// 2. Fetch existing Sessions and fix their idTrimestre if needed
$sessionsList = DB::table('Session')->get();
$trimestreIds = $trimestresList->pluck('idTrimes')->toArray();

if ($sessionsList->isEmpty()) {
    echo "No sessions found.\n";
    exit;
}

// Ensure sessions point to valid trimestres
foreach ($sessionsList as $index => $session) {
    if (!in_array($session->idTrimestre, $trimestreIds)) {
        // Assign a valid trimestre
        $validTrimestreId = $trimestreIds[$index % count($trimestreIds)];
        DB::table('Session')->where('idSession', $session->idSession)->update(['idTrimestre' => $validTrimestreId]);
        $session->idTrimestre = $validTrimestreId;
    }
}

// Ensure an Epreuve exists (default ID 1)
$idEpreuve = 1;
if (!DB::table('Epreuve')->exists()) {
    $idEpreuve = DB::table('Epreuve')->insertGetId([
        'libelle' => 'Contrôle Continu',
        'isDelete' => 0
    ]);
} else {
    $idEpreuve = DB::table('Epreuve')->first()->idEpreuve;
}

// 3. Ensure a Teacher exists for idPers
$idTeacher = 1; // Default teacher idPers
if (!DB::table('Personne')->where('idPers', 1)->exists()) {
    DB::table('Personne')->insert([
        'idPers' => 1,
        'nom' => 'Prof',
        'prenom' => 'Test',
        'sexe' => 1,
        'telephone' => '123456789'
    ]);
}

// 4. Fetch students and courses, and insert grades
$students = DB::table('Frequente')->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')->select('Frequente.matricule', 'Salle.idClasse')->get();

foreach ($students as $student) {
    $courses = DB::table('Cours')->where('idClasse', $student->idClasse)->get();
    
    // Si la classe n'a pas de cours, on saute
    if ($courses->isEmpty()) continue;
    
    // Add random grades for each session and course
    foreach ($sessionsList as $session) {
        foreach ($courses as $course) {
            // Randomly insert a grade with 80% chance
            if (rand(1, 100) <= 80) {
                // Check if grade already exists
                $exists = DB::table('Evaluation')
                    ->where('matricule', $student->matricule)
                    ->where('idCours', $course->idCours)
                    ->where('idSession', $session->idSession)
                    ->exists();
                
                if (!$exists) {
                    $note = rand(8, 20); // between 8 and 20
                    $appreciation = $note >= 16 ? 'Excellent' : ($note >= 14 ? 'Très Bien' : ($note >= 12 ? 'Bien' : ($note >= 10 ? 'Passable' : 'Insuffisant')));
                    DB::table('Evaluation')->insert([
                        'note' => $note,
                        'appreciation' => $appreciation,
                        'matricule' => $student->matricule,
                        'idEpreuve' => $idEpreuve,
                        'idCours' => $course->idCours,
                        'idSession' => $session->idSession,
                        'idPers' => $idTeacher, // Note: idPers 1 might be random teacher
                        'created_at' => Carbon::now()->subDays(rand(1, 60))
                    ]);
                }
            }
        }
    }
    
    // 5. Add random discipline/sanctions
    // Check if sanctions table exists, if so add some
    if (Schema::hasTable('sanctions')) {
        for ($i = 0; $i < rand(0, 3); $i++) {
            $motifs = ['Bavardage', 'Devoir non fait', 'Bagarre', 'Absence non justifiée', 'Retard'];
            $motif = $motifs[array_rand($motifs)];
            $points = rand(1, 5);
            DB::table('sanctions')->insert([
                'student_id' => $student->matricule,
                'motif' => $motif,
                'points' => $points,
                'date' => Carbon::now()->subDays(rand(1, 60)),
                'created_at' => Carbon::now()
            ]);
        }
    }
}

echo "Seeding completed successfully!\n";
