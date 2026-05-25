<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Term;
use Illuminate\Database\Seeder;

class SchoolStructureSeeder extends Seeder
{
    public function run(): void
    {
        $yearName = env('SCHOOL_YEAR_NAME', date('Y') . '-' . (date('Y') + 1));

        /** @var SchoolYear $year */
        $year = SchoolYear::query()->firstOrCreate(
            ['name' => $yearName],
            [
                'start_date' => env('SCHOOL_YEAR_START', date('Y-09-01')),
                'end_date' => env('SCHOOL_YEAR_END', (date('Y') + 1) . '-07-01'),
                'is_active' => true,
            ]
        );

        // Trimestres T1/T2/T3
        foreach (['T1', 'T2', 'T3'] as $termName) {
            Term::query()->firstOrCreate(
                ['school_year_id' => $year->id, 'name' => $termName],
                ['start_date' => null, 'end_date' => null]
            );
        }

        // Quelques salles + classes exemple (facultatif)
        $roomA = Room::query()->firstOrCreate(['name' => 'Salle A']);
        $roomB = Room::query()->firstOrCreate(['name' => 'Salle B']);

        SchoolClass::query()->firstOrCreate(['school_year_id' => $year->id, 'name' => 'CP-A'], ['room_id' => $roomA->id]);
        SchoolClass::query()->firstOrCreate(['school_year_id' => $year->id, 'name' => 'CE1-A'], ['room_id' => $roomB->id]);
    }
}

