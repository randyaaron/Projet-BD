<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherRequest;
use App\Models\Person;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = Teacher::query()
            ->with(['person', 'subject', 'user'])
            ->latest('id')
            ->paginate(20);

        return response()->json($teachers);
    }

    public function store(StoreTeacherRequest $request)
    {
        $email = (string) $request->string('email');
        if (User::query()->where('email', $email)->exists()) {
            return response()->json(['message' => 'Email already used'], 422);
        }

        $password = $request->filled('password')
            ? (string) $request->string('password')
            : Str::random(10);

        $user = User::query()->create([
            'email' => $email,
            'password' => Hash::make($password),
            'role' => UserRole::ENSEIGNANT,
            // Nécessite l’autorisation du fondateur
            'is_active' => false,
        ]);

        $person = Person::create($request->only([
            'first_name', 'last_name', 'phone', 'address',
        ]));

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'person_id' => $person->id,
            'subject_id' => (int) $request->input('subject_id'),
            'matricule' => $request->input('matricule'),
        ]);

        return response()->json([
            'teacher' => $teacher->load(['person', 'subject', 'user']),
            'generated_password' => $request->filled('password') ? null : $password,
            'status' => 'PENDING_FOUNDER_APPROVAL',
        ], 201);
    }
}

