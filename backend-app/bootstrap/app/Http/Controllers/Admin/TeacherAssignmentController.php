<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherAssignmentRequest;
use App\Models\SchoolClass;
use App\Models\TeacherClassAssignment;
use Illuminate\Http\Request;

class TeacherAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = TeacherClassAssignment::query()
            ->with(['teacher.person', 'teacher.subject', 'schoolClass', 'schoolYear'])
            ->latest('id');

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', (int) $request->input('teacher_id'));
        }
        if ($request->filled('school_class_id')) {
            $query->where('school_class_id', (int) $request->input('school_class_id'));
        }
        if ($request->filled('school_year_id')) {
            $query->where('school_year_id', (int) $request->input('school_year_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(StoreTeacherAssignmentRequest $request)
    {
        $schoolClass = SchoolClass::query()->findOrFail((int) $request->input('school_class_id'));
        $schoolYearId = (int) $request->input('school_year_id');

        if ($schoolClass->school_year_id !== $schoolYearId) {
            return response()->json(['message' => 'Class does not belong to this school year'], 422);
        }

        $assignment = TeacherClassAssignment::query()->firstOrCreate([
            'teacher_id' => (int) $request->input('teacher_id'),
            'school_class_id' => (int) $request->input('school_class_id'),
            'school_year_id' => $schoolYearId,
        ]);

        return response()->json(['assignment' => $assignment], 201);
    }

    public function destroy(TeacherClassAssignment $assignment)
    {
        $assignment->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

