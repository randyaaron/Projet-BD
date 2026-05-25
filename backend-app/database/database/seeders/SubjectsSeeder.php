<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectsSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            'Français',
            'Mathématiques',
            'Sciences',
            'Histoire-Géographie',
            'Éducation civique',
            'Anglais',
            'Sport',
            'Arts',
        ];

        foreach ($subjects as $name) {
            Subject::query()->firstOrCreate(['name' => $name]);
        }
    }
}

