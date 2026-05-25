<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;

class TeacherApprovalController extends Controller
{
    public function approve(Request $request, Teacher $teacher)
    {
        $user = $teacher->user;
        if (!$user) {
            return response()->json(['message' => 'Teacher user missing'], 422);
        }

        if ($user->is_active) {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $user->forceFill([
            'is_active' => true,
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Approved',
            'teacher' => $teacher->load(['person', 'subject', 'user']),
        ]);
    }
}

