<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreAssessmentRequest;
use App\Models\Assessment;
use App\Models\TeacherClassAssignment;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile missing'], 422);
        }

        $assessments = Assessment::query()
            ->where('teacher_id', $teacher->id)
            ->latest('id')
            ->paginate(20);

        return response()->json($assessments);
    }

    public function store(StoreAssessmentRequest $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile missing'], 422);
        }

        $schoolClassId = (int) $request->input('school_class_id');
        $termId = (int) $request->input('term_id');

        $assigned = TeacherClassAssignment::query()
            ->where('teacher_id', $teacher->id)
            ->where('school_class_id', $schoolClassId)
            ->exists();

        if (!$assigned) {
            return response()->json(['message' => 'You are not assigned to this class'], 403);
        }

        $assessment = Assessment::create([
            'school_class_id' => $schoolClassId,
            'teacher_id' => $teacher->id,
            'subject_id' => $teacher->subject_id,
            'term_id' => $termId,
            'title' => $request->string('title'),
            'type' => $request->input('type', 'DEVOIR'),
            'date' => $request->input('date'),
            'total_points' => $request->input('total_points', 20),
        ]);

        return response()->json(['assessment' => $assessment], 201);
    }
}

