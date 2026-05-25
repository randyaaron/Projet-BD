<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUser(
            env('DIRECTEUR_EMAIL', 'directeur@ecole.local'),
            env('DIRECTEUR_PASSWORD', 'password123'),
            UserRole::DIRECTEUR
        );

        $this->seedUser(
            env('ADMIN_EMAIL', 'admin@ecole.local'),
            env('ADMIN_PASSWORD', 'password123'),
            UserRole::ADMIN
        );

        $this->seedUser(
            env('FONDATEUR_EMAIL', 'fondateur@ecole.local'),
            env('FONDATEUR_PASSWORD', 'password123'),
            UserRole::FONDATEUR
        );

        $this->seedUser(
            env('SECRETAIRE_EMAIL', 'secretaire@ecole.local'),
            env('SECRETAIRE_PASSWORD', 'password123'),
            UserRole::SECRETAIRE
        );

        $this->call([
            SubjectsSeeder::class,
            SchoolStructureSeeder::class,
        ]);
    }

    private function seedUser(string $email, string $password, UserRole $role): void
    {
        User::query()->firstOrCreate(
            ['email' => $email],
            [
                'password' => Hash::make($password),
                'role' => $role,
                'is_active' => true,
            ]
        );
    }
}

