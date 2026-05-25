<?php

namespace App\Http\Controllers\Secretary;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\LinkParentStudentRequest;
use App\Http\Requests\Secretary\StoreParentRequest;
use App\Models\ParentModel;
use App\Models\Person;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ParentController extends Controller
{
    public function index()
    {
        $parents = ParentModel::query()
            ->with(['person', 'user', 'students.person'])
            ->latest('id')
            ->paginate(20);

        return response()->json($parents);
    }

    public function store(StoreParentRequest $request)
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
            'role' => UserRole::PARENT,
            'is_active' => true,
        ]);

        $person = Person::create($request->only([
            'first_name', 'last_name', 'phone', 'address',
        ]));

        $parent = ParentModel::create([
            'user_id' => $user->id,
            'person_id' => $person->id,
        ]);

        if ($request->filled('student_id')) {
            $parent->students()->syncWithoutDetaching([
                (int) $request->input('student_id') => [
                    'relation' => $request->input('relation'),
                    'is_primary' => (bool) $request->input('is_primary', false),
                ],
            ]);
        }

        return response()->json([
            'parent' => $parent->load(['person', 'user', 'students.person']),
            'generated_password' => $request->filled('password') ? null : $password,
        ], 201);
    }

    public function linkStudent(LinkParentStudentRequest $request, ParentModel $parent)
    {
        $parent->students()->syncWithoutDetaching([
            (int) $request->input('student_id') => [
                'relation' => $request->input('relation'),
                'is_primary' => (bool) $request->input('is_primary', false),
            ],
        ]);

        return response()->json(['parent' => $parent->load(['students.person'])]);
    }
}

