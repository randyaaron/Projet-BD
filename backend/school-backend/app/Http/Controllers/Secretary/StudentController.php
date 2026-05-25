<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\StoreStudentRequest;
use App\Http\Requests\Secretary\UpdateStudentRequest;
use App\Models\Person;
use App\Models\Student;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query()
            ->with(['person', 'schoolClass'])
            ->latest('id');

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->whereHas('person', function ($p) use ($q) {
                $p->where('first_name', 'ilike', "%{$q}%")
                  ->orWhere('last_name', 'ilike', "%{$q}%");
            })->orWhere('enrollment_code', 'ilike', "%{$q}%");
        }

        if ($request->filled('school_class_id')) {
            $query->where('school_class_id', (int) $request->input('school_class_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(StoreStudentRequest $request)
    {
        $person = Person::create($request->only([
            'first_name', 'last_name', 'phone', 'address', 'birth_date', 'sex',
        ]));

        $code = $request->input('enrollment_code') ?: strtoupper(Str::random(10));

        $student = Student::create([
            'person_id' => $person->id,
            'school_class_id' => $request->input('school_class_id'),
            'enrollment_code' => $code,
            // L’admin valide après réception du paiement
            'status' => 'PENDING_PAYMENT',
            'enrolled_at' => now(),
        ]);

        return response()->json(['student' => $student->load(['person', 'schoolClass'])], 201);
    }

    public function show(Student $student)
    {
        return response()->json(['student' => $student->load(['person', 'schoolClass', 'parents.person'])]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $data = $request->validated();

        $personData = array_intersect_key($data, array_flip(['first_name','last_name','phone','address','birth_date','sex']));
        if (!empty($personData)) {
            $student->person()->update($personData);
        }

        $studentData = array_intersect_key($data, array_flip(['school_class_id','status']));
        if (!empty($studentData)) {
            $student->fill($studentData)->save();
        }

        return response()->json(['student' => $student->refresh()->load(['person', 'schoolClass'])]);
    }
}

