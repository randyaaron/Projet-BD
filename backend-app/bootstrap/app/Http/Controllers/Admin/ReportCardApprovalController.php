<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveReportCardRequest;
use App\Http\Requests\Admin\PublishReportCardRequest;
use App\Models\ReportCard;
use Illuminate\Http\Request;

class ReportCardApprovalController extends Controller
{
    public function approve(ApproveReportCardRequest $request, ReportCard $reportCard)
    {
        if ($reportCard->status !== ReportCard::STATUS_SUBMITTED) {
            return response()->json(['message' => 'Report card must be SUBMITTED'], 422);
        }

        $reportCard->forceFill([
            'status' => ReportCard::STATUS_APPROVED,
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
            'director_stamp_path' => $request->input('director_stamp_path'),
            'pdf_path' => $request->input('pdf_path', $reportCard->pdf_path),
        ])->save();

        return response()->json(['report_card' => $reportCard]);
    }

    public function publish(PublishReportCardRequest $request, ReportCard $reportCard)
    {
        if ($reportCard->status !== ReportCard::STATUS_APPROVED) {
            return response()->json(['message' => 'Report card must be APPROVED'], 422);
        }

        $reportCard->forceFill([
            'status' => ReportCard::STATUS_PUBLISHED,
            'published_at' => now(),
            'pdf_path' => $request->input('pdf_path', $reportCard->pdf_path),
        ])->save();

        return response()->json(['report_card' => $reportCard]);
    }

    public function show(Request $request, ReportCard $reportCard)
    {
        return response()->json(['report_card' => $reportCard]);
    }
}

