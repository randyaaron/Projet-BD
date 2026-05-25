<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin account in the legacy database (without altering table structure)
        // If the 'Admin' table exists, this will insert or update the record.
        try {
            DB::table('Admin')->updateOrInsert(
                ['username' => 'admin_test'],
                [
                    'nom' => 'Admin Test',
                    'password' => Hash::make('password123'),
                    'typeAdmin' => 0, // 0 = SUPER_ADMIN
                    'actif' => 1
                ]
            );
        } catch (\Exception $e) {
            // Table might not exist, but we assume it does based on LegacyAuthController
            $this->command->warn('Could not seed Admin legacy table: ' . $e->getMessage());
        }

        // 2. Teacher account in the modern database
        User::query()->updateOrCreate(
            ['name' => 'teacher_test'],
            [
                'email' => 'teacher_test@ecole.local',
                'password' => Hash::make('password123'),
                'role' => UserRole::ENSEIGNANT,
                'is_active' => true,
            ]
        );

        // 3. Parent account in the modern database
        User::query()->updateOrCreate(
            ['name' => 'parent_test'],
            [
                'email' => 'parent_test@ecole.local',
                'password' => Hash::make('password123'),
                'role' => UserRole::PARENT,
                'is_active' => true,
            ]
        );
    }
}
