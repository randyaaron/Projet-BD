<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        /** @var User|null $user */
        $user = User::query()->where('name', $request->string('username'))->first();

        if (!$user || !$user->is_active || !Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken('api')->plainTextToken;

        $legacyPersonne = \Illuminate\Support\Facades\DB::table('Personne')
            ->where('username', $user->name)
            ->orWhere('email', $user->email)
            ->first();

        if ($legacyPersonne && $user->role === \App\Enums\Role::TEACHER) {
            $enseignant = \Illuminate\Support\Facades\DB::table('Enseignant')->where('idPers', $legacyPersonne->idPers)->first();
            if (!$enseignant || !$enseignant->Actif) {
                return response()->json(['message' => 'Ce compte enseignant est désactivé. Contactez l\'administration.'], 403);
            }
        }

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'legacy_id' => $legacyPersonne ? $legacyPersonne->idPers : $user->id,
                'email' => $user->email,
                'role' => $user->role?->value ?? $user->role,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => $user ? array_merge($user->toArray(), [
                'role' => $user->role?->value ?? $user->role,
            ]) : null,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logged out']);
    }
}

