<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class EnrollmentValidationController extends Controller
{
    public function validateEnrollment(Request $request, Student $student)
    {
        // Règle: on ne valide que si paiement reçu
        if (!in_array($student->status, ['PAID'], true)) {
            return response()->json(['message' => 'Student must be in PAID status before validation'], 422);
        }

        $student->forceFill(['status' => 'ACTIVE'])->save();

        return response()->json(['student' => $student->load(['person', 'schoolClass'])]);
    }
}

