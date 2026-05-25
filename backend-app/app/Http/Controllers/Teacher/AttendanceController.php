<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // Get all classes with their students
        $classes = SchoolClass::with('students')->get();
        $date = date('Y-m-d'); // Today's date

        // Get attendances for today
        $attendances = Attendance::where('date', $date)->get();

        $attendanceData = $classes->map(function ($schoolClass) use ($attendances) {
            $classAttendances = $attendances->where('school_class_id', $schoolClass->id);
            
            $total = $schoolClass->students->count();
            
            // If no attendance recorded yet, assume everyone is present (or 0)
            // The mock data shows counts. Let's compute actuals.
            $absents = $classAttendances->where('status', 'ABSENT')->count();
            $retards = $classAttendances->where('status', 'LATE')->count();
            
            // If no record exists for a student, what is their status? Default PRESENT.
            // So presents = total - absents
            $presents = $total - $absents;

            return [
                'classe' => $schoolClass->name,
                'presents' => $presents,
                'absents' => $absents,
                'retards' => $retards,
                'total' => $total,
            ];
        });

        return response()->json($attendanceData);
    }
}
