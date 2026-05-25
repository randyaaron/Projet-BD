<?php

namespace App\Http\Controllers\Parents;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\ReportCard;
use Illuminate\Http\Request;

class ParentPortalController extends Controller
{
    public function children(Request $request)
    {
        $parent = $request->user()->parentProfile;
        if (!$parent) {
            return response()->json(['message' => 'Parent profile missing'], 422);
        }

        $children = $parent->students()->with(['person', 'schoolClass'])->get();
        return response()->json(['children' => $children]);
    }

    public function publishedReportCards(Request $request, int $studentId)
    {
        $parent = $request->user()->parentProfile;
        if (!$parent) {
            return response()->json(['message' => 'Parent profile missing'], 422);
        }

        $owns = $parent->students()->where('students.id', $studentId)->exists();
        if (!$owns) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = ReportCard::query()
            ->where('student_id', $studentId)
            ->where('status', ReportCard::STATUS_PUBLISHED)
            ->latest('id');

        if ($request->filled('term_id')) {
            $query->where('term_id', (int) $request->input('term_id'));
        }

        return response()->json(['report_cards' => $query->get()]);
    }

    public function payments(Request $request, int $studentId)
    {
        $parent = $request->user()->parentProfile;
        if (!$parent) {
            return response()->json(['message' => 'Parent profile missing'], 422);
        }

        $owns = $parent->students()->where('students.id', $studentId)->exists();
        if (!$owns) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $payments = Payment::query()
            ->where('student_id', $studentId)
            ->with('receipt')
            ->latest('id')
            ->get();

        return response()->json(['payments' => $payments]);
    }
}

