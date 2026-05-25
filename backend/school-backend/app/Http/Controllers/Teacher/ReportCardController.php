<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ReportCard;
use App\Models\SchoolYear;
use App\Models\Student;
use App\Models\TeacherClassAssignment;
use Illuminate\Http\Request;

class ReportCardController extends Controller
{
    public function submit(Request $request, Student $student)
    {
        $request->validate([
            'term_id' => ['required', 'integer', 'exists:terms,id'],
            'school_year_id' => ['nullable', 'integer', 'exists:school_years,id'],
        ]);

        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile missing'], 422);
        }

        $termId = (int) $request->input('term_id');
        $schoolYearId = (int) ($request->input('school_year_id') ?: (SchoolYear::query()->where('is_active', true)->value('id')));

        if (!$schoolYearId) {
            return response()->json(['message' => 'No active school year'], 422);
        }

        // Teacher must be assigned to the student's class
        $assigned = TeacherClassAssignment::query()
            ->where('teacher_id', $teacher->id)
            ->where('school_class_id', $student->school_class_id)
            ->exists();
        if (!$assigned) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reportCard = ReportCard::query()->firstOrCreate(
            [
                'student_id' => $student->id,
                'school_year_id' => $schoolYearId,
                'term_id' => $termId,
            ],
            [
                'status' => ReportCard::STATUS_DRAFT,
                'generated_by_user_id' => $request->user()->id,
            ]
        );

        // Only DRAFT can be submitted
        if (!in_array($reportCard->status, [ReportCard::STATUS_DRAFT], true)) {
            return response()->json(['message' => 'Report card not in DRAFT state'], 422);
        }

        $reportCard->forceFill([
            'status' => ReportCard::STATUS_SUBMITTED,
            'generated_by_user_id' => $request->user()->id,
        ])->save();

        return response()->json(['report_card' => $reportCard]);
    }
}

