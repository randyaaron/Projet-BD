<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('fr_FR');

        // 1. Inserer 20 élèves
        $eleveIds = [];
        for ($i = 1; $i <= 20; $i++) {
            $matricule = 1000 + $i;
            DB::table('Eleve')->insert([
                'matricule' => $matricule,
                'nom' => strtoupper($faker->lastName),
                'prenom' => $faker->firstName,
                'dateNaissance' => $faker->dateTimeBetween('-15 years', '-6 years')->format('Y-m-d'),
                'lieuNaissance' => $faker->city,
                'sexe' => $faker->randomElement([1, 2]), // 1: M, 2: F
                'langue' => 'Français',
                'photoURL' => 'INDEFINI',
                'actif' => 1,
                'idVilleNaissance' => 1,
                'idAdmin' => 1,
                'created_at' => now(),
                'isDelete' => 0
            ]);
            $eleveIds[] = $matricule;
        }

        // 2. Inserer 15 paiements
        $maxIdPaie = DB::table('Paiement')->max('idPaie') ?? 0;
        for ($i = 1; $i <= 15; $i++) {
            $maxIdPaie++;
            DB::table('Paiement')->insert([
                'idPaie' => $maxIdPaie,
                'matricule' => $faker->randomElement($eleveIds),
                'idAca' => 1,
                'montant' => $faker->randomElement([15000, 25000, 50000, 100000]),
                'url' => 'INDEFINI',
                'comentaire' => $faker->sentence(3),
                'idMode' => 1,
                'operation_ID' => strtoupper($faker->bothify('OP-####-????')),
                'idPers' => 1,
                'datePaie' => $faker->dateTimeBetween('-2 months', 'now')->format('Y-m-d'),
                'dateEnregistrer' => now(),
            ]);
        }

        // 3. Inserer 10 rapports de discipline
        for ($i = 1; $i <= 10; $i++) {
            $gravite = $faker->randomElement(['Mineur', 'Moyen', 'Majeur']);
            $points = 2;
            if ($gravite === 'Moyen') $points = 8;
            if ($gravite === 'Majeur') $points = 15;

            DB::table('Rapport')->insert([
                'matricule' => $faker->randomElement($eleveIds),
                'libelle' => $faker->randomElement(['Bavardage', 'Retard', 'Insolence', 'Bagarre', 'Absence non justifiée']),
                'points' => $points,
                'commentaire' => $faker->sentence(6),
                'event_date' => $faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
                'idAca' => 1,
                'idPers' => 1,
                'created_at' => now(),
                'isDelete' => 0
            ]);
        }

        $this->command->info('Données de démonstration (Eleves, Paiements, Rapports) générées avec succès!');
    }
}
