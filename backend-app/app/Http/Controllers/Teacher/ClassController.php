<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\TeacherClassAssignment;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // If the teacher only sees their classes
        // Actually, the frontend component lists many classes, maybe all classes.
        // Let's return all classes with their effectif, room and teacher name.
        
        $classes = SchoolClass::with(['room', 'students'])->get()->map(function ($schoolClass) {
            $assignment = TeacherClassAssignment::with('teacher.user')
                ->where('school_class_id', $schoolClass->id)
                ->first();
                
            $teacherName = $assignment && $assignment->teacher && $assignment->teacher->user 
                ? $assignment->teacher->user->name 
                : 'Non assigné';

            // Extract level from name if possible (e.g., CP-A -> CP)
            $niveau = explode('-', $schoolClass->name)[0];

            return [
                'id' => $schoolClass->id,
                'nom' => $schoolClass->name,
                'niveau' => $niveau,
                'enseignant' => $teacherName,
                'effectif' => $schoolClass->students->count(),
                'salle' => $schoolClass->room ? $schoolClass->room->name : 'Non définie',
            ];
        });

        return response()->json($classes);
    }

    public function students(Request $request, $classId)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile missing'], 422);
        }

        // Optional: Ensure teacher is assigned to this class
        $assigned = TeacherClassAssignment::query()
            ->where('teacher_id', $teacher->id)
            ->where('school_class_id', $classId)
            ->exists();

        if (!$assigned) {
            return response()->json(['message' => 'You are not assigned to this class'], 403);
        }

        $students = \App\Models\Student::with('person')->where('school_class_id', $classId)->get()->map(function($student) {
            return [
                'id' => $student->id,
                'name' => $student->person ? $student->person->first_name . ' ' . $student->person->last_name : 'Unknown',
            ];
        });

        return response()->json(['students' => $students]);
    }
}
