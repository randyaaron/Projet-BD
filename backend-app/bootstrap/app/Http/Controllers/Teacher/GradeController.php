<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreGradesRequest;
use App\Models\Assessment;
use App\Models\Grade;
use App\Models\Student;
use App\Models\TeacherClassAssignment;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    public function store(StoreGradesRequest $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile missing'], 422);
        }

        /** @var Assessment $assessment */
        $assessment = Assessment::query()->findOrFail((int) $request->input('assessment_id'));

        if ($assessment->teacher_id !== $teacher->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Ensure teacher is assigned to the class
        $assigned = TeacherClassAssignment::query()
            ->where('teacher_id', $teacher->id)
            ->where('school_class_id', $assessment->school_class_id)
            ->exists();
        if (!$assigned) {
            return response()->json(['message' => 'You are not assigned to this class'], 403);
        }

        $gradesPayload = $request->input('grades', []);

        $result = DB::transaction(function () use ($gradesPayload, $assessment, $request) {
            $saved = [];

            foreach ($gradesPayload as $g) {
                $studentId = (int) $g['student_id'];

                // Student must belong to the class of the assessment
                $studentOk = Student::query()
                    ->where('id', $studentId)
                    ->where('school_class_id', $assessment->school_class_id)
                    ->exists();
                if (!$studentOk) {
                    abort(422, "Student {$studentId} not in class");
                }

                $grade = Grade::query()->updateOrCreate(
                    ['assessment_id' => $assessment->id, 'student_id' => $studentId],
                    [
                        'score' => $g['score'],
                        'comment' => $g['comment'] ?? null,
                        'created_by_user_id' => $request->user()->id,
                    ]
                );

                $saved[] = $grade;
            }

            return $saved;
        });

        return response()->json(['grades' => $result], 201);
    }
}

