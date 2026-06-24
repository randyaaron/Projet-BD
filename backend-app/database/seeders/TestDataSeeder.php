<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // USERS (modern)
        $users = [
            [1, 'admin@ecole.fr', Hash::make('admin123'), 'ADMIN', 1, now(), now()],
            [2, 'prof.martin@ecole.fr', Hash::make('prof123'), 'ENSEIGNANT', 1, now(), now()],
            [3, 'prof.ngo@ecole.fr', Hash::make('prof123'), 'ENSEIGNANT', 1, now(), now()],
            [4, 'prof.tabi@ecole.fr', Hash::make('prof123'), 'ENSEIGNANT', 1, now(), now()],
            [5, 'parent.atangana@ecole.fr', Hash::make('parent123'), 'PARENT', 1, now(), now()],
            [6, 'parent.mvondo@ecole.fr', Hash::make('parent123'), 'PARENT', 1, now(), now()],
            [7, 'parent.fouda@ecole.fr', Hash::make('parent123'), 'PARENT', 1, now(), now()],
        ];
        DB::table('users')->truncate();
        foreach ($users as $u) {
            DB::table('users')->insert(['id'=>$u[0],'email'=>$u[1],'password'=>$u[2],'role'=>$u[3],'is_active'=>$u[4],'created_at'=>$u[5],'updated_at'=>$u[6]]);
        }

        // PERSONNES (legacy) — type: 1=Enseignant, 4=Parent
        DB::table('Personne')->truncate();
        $personnes = [
            [1,'Martin','Jean','1980-03-15','Yaoundé','670001001','0','jean.martin@ecole.fr',1,'jean.martin','prof123',null,1,now(),0],
            [2,'Ngo','Cécile','1985-07-22','Douala','670001002','0','cecile.ngo@ecole.fr',1,'cecile.ngo','prof123',null,1,now(),0],
            [3,'Tabi','Emmanuel','1979-11-10','Bafoussam','670001003','0','emmanuel.tabi@ecole.fr',1,'emmanuel.tabi','prof123',null,1,now(),0],
            [4,'Atangana','Pierre','1975-04-05','Yaoundé','670002001','0','pierre.atangana@ecole.fr',4,'pierre.atangana','parent123',null,1,now(),0],
            [5,'Mvondo','Sophie','1978-09-18','Yaoundé','670002002','0','sophie.mvondo@ecole.fr',4,'sophie.mvondo','parent123',null,1,now(),0],
            [6,'Fouda','André','1982-01-30','Douala','670002003','0','andre.fouda@ecole.fr',4,'andre.fouda','parent123',null,1,now(),0],
            [7,'Biloa','Marie','1980-06-12','Bafoussam','670002004','0','marie.biloa@ecole.fr',4,'marie.biloa','parent123',null,1,now(),0],
        ];
        foreach ($personnes as $p) {
            DB::table('Personne')->insert(['idPers'=>$p[0],'nom'=>$p[1],'prenom'=>$p[2],'dateNaissance'=>$p[3],'lieuNaissance'=>$p[4],'mobile'=>$p[5],'phone'=>$p[6],'email'=>$p[7],'typePersonne'=>$p[8],'username'=>$p[9],'password'=>$p[10],'alanyaID'=>$p[11],'idAdmin'=>$p[12],'created_at'=>$p[13],'isDelete'=>$p[14]]);
        }

        // ELEVES (legacy)
        DB::table('Eleve')->truncate();
        $eleves = [
            [10,'Atangana','Paul','2015-03-10','Yaoundé',1,'FR','INDEFINI',1,1,1,now(),0],
            [11,'Mvondo','Claire','2016-07-15','Douala',2,'FR','INDEFINI',1,2,1,now(),0],
            [12,'Fouda','Simon','2015-11-20','Bafoussam',1,'FR','INDEFINI',1,1,1,now(),0],
            [13,'Biloa','Alice','2016-02-08','Yaoundé',2,'FR','INDEFINI',1,3,1,now(),0],
            [14,'Nkomo','Eric','2015-05-25','Douala',1,'FR','INDEFINI',1,2,1,now(),0],
            [15,'Owona','Fatima','2016-09-01','Yaoundé',2,'FR','INDEFINI',1,1,1,now(),0],
            [16,'Essama','Kevin','2015-12-14','Bafoussam',1,'FR','INDEFINI',1,3,1,now(),0],
            [17,'Abena','Grace','2016-04-19','Douala',2,'FR','INDEFINI',1,2,1,now(),0],
            [18,'Meke','Justin','2015-08-07','Yaoundé',1,'FR','INDEFINI',1,1,1,now(),0],
            [19,'Nana','Priscille','2016-06-22','Bafoussam',2,'FR','INDEFINI',1,3,1,now(),0],
            [20,'Tsanga','David','2015-01-11','Douala',1,'FR','INDEFINI',1,2,1,now(),0],
            [21,'Ebanga','Nadège','2016-10-03','Yaoundé',2,'FR','INDEFINI',1,1,1,now(),0],
        ];
        foreach ($eleves as $e) {
            DB::table('Eleve')->insert(['matricule'=>$e[0],'nom'=>$e[1],'prenom'=>$e[2],'dateNaissance'=>$e[3],'lieuNaissance'=>$e[4],'sexe'=>$e[5],'langue'=>$e[6],'photoURL'=>$e[7],'actif'=>$e[8],'idVilleNaissance'=>$e[9],'idAdmin'=>$e[10],'created_at'=>$e[11],'isDelete'=>$e[12]]);
        }

        // COURS (legacy)
        DB::table('Cours')->truncate();
        $cours = [
            [1,'Mathématiques',20,3,'',1,1,1,now(),0],
            [2,'Français',20,4,'',1,1,1,now(),0],
            [3,'Anglais',20,2,'',1,1,1,now(),0],
            [4,'Sciences',20,2,'',1,1,1,now(),0],
            [5,'Histoire-Géo',20,2,'',1,1,1,now(),0],
            [6,'Éducation Physique',20,1,'',1,1,1,now(),0],
        ];
        foreach ($cours as $c) {
            DB::table('Cours')->insert(['idCours'=>$c[0],'libelle'=>$c[1],'note'=>$c[2],'coefficient'=>$c[3],'description'=>$c[4],'idClasse'=>$c[5],'actif'=>$c[6],'idAdmin'=>$c[7],'created_at'=>$c[8],'isDelete'=>$c[9]]);
        }

        // CLASSES (legacy)
        DB::table('Classe')->truncate();
        $classes = [
            [1,'SIL',1,1,now(),0],[2,'CP',2,1,now(),0],[3,'CE1',2,1,now(),0],
            [4,'CE2',2,1,now(),0],[5,'CM1',2,1,now(),0],[6,'CM2',2,1,now(),0],
        ];
        foreach ($classes as $cl) {
            DB::table('Classe')->insert(['idClasse'=>$cl[0],'libelle'=>$cl[1],'idCycle'=>$cl[2],'idAdmin'=>$cl[3],'created_at'=>$cl[4],'isDelete'=>$cl[5]]);
        }

        // ENSEIGNANT (legacy)
        DB::table('Enseignant')->truncate();
        DB::table('Enseignant')->insert(['idEnseignant'=>1,'idPers'=>1,'idCours'=>1,'Actif'=>1,'idAdmin'=>1,'created_at'=>now(),'isDelete'=>0]);
        DB::table('Enseignant')->insert(['idEnseignant'=>2,'idPers'=>2,'idCours'=>2,'Actif'=>1,'idAdmin'=>1,'created_at'=>now(),'isDelete'=>0]);
        DB::table('Enseignant')->insert(['idEnseignant'=>3,'idPers'=>3,'idCours'=>3,'Actif'=>1,'idAdmin'=>1,'created_at'=>now(),'isDelete'=>0]);

        // PARENTS (legacy)
        DB::table('Parents')->truncate();
        $parents = [
            [1,4,10,1,now(),0],[2,5,11,1,now(),0],[3,6,12,1,now(),0],
            [4,7,13,1,now(),0],[5,4,14,1,now(),0],[6,5,15,1,now(),0],
        ];
        foreach ($parents as $par) {
            DB::table('Parents')->insert(['idParent'=>$par[0],'idPers'=>$par[1],'matricule'=>$par[2],'idAdmin'=>$par[3],'created_at'=>$par[4],'isDelete'=>$par[5]]);
        }

        // FREQUENTE (inscriptions legacy)
        DB::table('Frequente')->truncate();
        foreach (range(10, 21) as $i => $mat) {
            DB::table('Frequente')->insert(['idSalle'=>($i%5)+1,'idAcademi'=>3,'matricule'=>$mat,'commentaire'=>'RAS','idAdmin'=>1,'created_at'=>now()]);
        }

        // SESSIONS & TRIMESTRES (legacy)
        DB::table('Trimestre')->truncate();
        DB::table('Trimestre')->insert(['idTrimes'=>7,'libelle'=>'Trimestre 1 2025-2026','periode'=>'Sep-Dec','idAca'=>3,'idAdmin'=>1]);
        DB::table('Trimestre')->insert(['idTrimes'=>8,'libelle'=>'Trimestre 2 2025-2026','periode'=>'Jan-Mar','idAca'=>3,'idAdmin'=>1]);
        DB::table('Trimestre')->insert(['idTrimes'=>9,'libelle'=>'Trimestre 3 2025-2026','periode'=>'Avr-Jun','idAca'=>3,'idAdmin'=>1]);

        DB::table('Session')->truncate();
        DB::table('Session')->insert(['idSession'=>2,'libelle'=>'Séquence 1','description'=>'Premier contrôle','idTrimestre'=>7,'idPers'=>1,'date_passage'=>'2025-10-15','created_at'=>now()]);
        DB::table('Session')->insert(['idSession'=>3,'libelle'=>'Séquence 2','description'=>'Deuxième contrôle','idTrimestre'=>7,'idPers'=>1,'date_passage'=>'2025-11-20','created_at'=>now()]);
        DB::table('Session')->insert(['idSession'=>4,'libelle'=>'Séquence 3','description'=>'Troisième contrôle','idTrimestre'=>8,'idPers'=>1,'date_passage'=>'2026-02-10','created_at'=>now()]);

        // EPREUVES (legacy)
        DB::table('Epreuve')->truncate();
        $epreuves = [
            [1,'CC Maths T1','INDEFINI','Jean Martin',1,1,now(),0],
            [2,'CC Français T1','INDEFINI','Cécile Ngo',1,2,now(),0],
            [3,'CC Anglais T1','INDEFINI','Emmanuel Tabi',1,3,now(),0],
            [4,'Examen Maths T1','INDEFINI','Jean Martin',2,1,now(),0],
            [5,'Examen Français T1','INDEFINI','Cécile Ngo',2,2,now(),0],
        ];
        foreach ($epreuves as $ep) {
            DB::table('Epreuve')->insert(['idEpreuve'=>$ep[0],'libelle'=>$ep[1],'urlDoc'=>$ep[2],'auteur'=>$ep[3],'idNature'=>$ep[4],'idPers'=>$ep[5],'created_at'=>$ep[6],'isDelete'=>$ep[7]]);
        }

        // EVALUATIONS (notes legacy)
        DB::table('Evaluation')->truncate();
        $notes = [
            [10,1,1,2],[10,2,2,2],[10,3,3,2],[10,4,1,3],[10,5,2,3],
            [11,1,1,2],[11,2,2,2],[11,3,3,2],[11,4,1,3],[11,5,2,3],
            [12,1,1,2],[12,2,2,2],[12,3,3,2],
            [13,1,1,2],[13,2,2,2],
            [14,1,1,2],[14,3,3,2],[14,4,1,3],
            [15,1,1,2],[15,2,2,2],[15,5,2,3],
        ];
        $scores = [15,13,16,14,12,17,11,18,10,9,16,14,13,15,12,11,17,14,13,12,16,15];
        $apprec = ['Bien','Assez Bien','Très Bien','Passable','Insuffisant','Excellent'];
        foreach ($notes as $idx => $n) {
            $score = $scores[$idx % count($scores)];
            DB::table('Evaluation')->insert(['note'=>$score,'appreciation'=>$apprec[$score>15?5:($score>13?2:($score>11?0:($score>9?1:4)))],'matricule'=>$n[0],'idEpreuve'=>$n[1],'idCours'=>$n[2],'idSession'=>$n[3],'idPers'=>1,'created_at'=>now()]);
        }

        // RAPPORTS DISCIPLINAIRES (legacy)
        DB::table('Rapport')->truncate();
        $rapports = [
            ['Bavardage',0,10,3,'A perturbé la classe pendant le cours de maths','2025-10-05'],
            ['Retard',0,11,3,'Arrivée en retard de 15 minutes','2025-10-12'],
            ['Absence injustifiée',0,12,3,'Absent sans justification','2025-11-03'],
            ['Excellent travail',5,13,3,'A obtenu 18/20 à l évaluation','2025-11-15'],
            ['Service rendu',3,14,3,'A aidé ses camarades en mathématiques','2025-12-01'],
            ['Bavardage',0,15,3,'A perturbé le cours d anglais','2025-12-08'],
            ['Retard',0,16,3,'En retard 3 fois cette semaine','2026-01-10'],
            ['Excellent travail',5,10,3,'Meilleure note de la classe','2026-01-20'],
        ];
        foreach ($rapports as $r) {
            DB::table('Rapport')->insert(['libelle'=>$r[0],'points'=>$r[1],'matricule'=>$r[2],'idAca'=>3,'commentaire'=>$r[3],'event_date'=>$r[4],'idPers'=>1,'created_at'=>now(),'isDelete'=>0]);
        }

        // PAIEMENTS (legacy)
        DB::table('Paiement')->truncate();
        $paiements = [
            [10,10,3,75000,'Orange Money','Inscription + 1ère tranche',1,'OM-001','2025-09-05'],
            [11,11,3,75000,'MTN MoMo','Inscription + 1ère tranche',3,'MTN-001','2025-09-10'],
            [12,12,3,50000,'Virement','1ère tranche',4,'VIR-001','2025-09-15'],
            [13,13,3,75000,'Orange Money','Inscription + 1ère tranche',1,'OM-002','2025-09-20'],
            [14,14,3,45000,'Chèque','Inscription',5,'CHQ-001','2025-10-01'],
            [15,10,3,40000,'Orange Money','2ème tranche',1,'OM-003','2025-12-05'],
            [16,11,3,40000,'MTN MoMo','2ème tranche',3,'MTN-002','2025-12-10'],
            [17,15,3,75000,'Orange Money','Inscription + 1ère tranche',1,'OM-004','2026-01-08'],
        ];
        foreach ($paiements as $p) {
            DB::table('Paiement')->insert(['idPaie'=>$p[0],'matricule'=>$p[1],'idAca'=>$p[2],'montant'=>$p[3],'url'=>'INDEFINI','comentaire'=>$p[4],'idMode'=>$p[6],'operation_ID'=>$p[8],'idPers'=>1,'datePaie'=>$p[8],'dateEnregistrer'=>now()]);
        }

        // MESSAGES (legacy)
        DB::table('Messages')->truncate();
        $messages = [
            [1,1,'Réunion de parents','Nous vous informons qu\'une réunion de parents est prévue le 15 novembre 2025 à 15h.',1,'2025-2026',now(),1],
            [1,1,'Résultats du 1er trimestre','Les bulletins du premier trimestre sont disponibles.',0,'2025-2026',now(),1],
            [1,1,'Calendrier des examens','Voici le calendrier des examens du 2ème trimestre.',1,'2025-2026',now(),1],
            [1,2,'Message personnel','Votre enfant Paul a réalisé d\'excellentes performances ce mois-ci.',0,'2025-2026',now(),1],
            [1,3,'Retard signalé','Votre enfant Claire a été signalée en retard à plusieurs reprises.',0,'2025-2026',now(),1],
        ];
        foreach ($messages as $m) {
            DB::table('Messages')->insert(['idExp_Pers'=>$m[0],'idParent'=>$m[1],'objet'=>$m[2],'information'=>$m[3],'type_message'=>$m[4],'AnneeAcade'=>$m[5],'created_at'=>$m[6],'valider'=>$m[7]]);
        }

        // EMPLOI DU TEMPS (legacy)
        DB::table('EmploiDuTemps')->truncate();
        $edt = [
            ['Lundi','08:00',1,1],['Lundi','10:00',1,2],['Lundi','14:00',1,3],
            ['Mardi','08:00',1,4],['Mardi','10:00',1,5],['Mardi','14:00',1,6],
            ['Mercredi','08:00',1,1],['Mercredi','10:00',1,2],
            ['Jeudi','08:00',1,3],['Jeudi','10:00',1,4],['Jeudi','14:00',1,5],
            ['Vendredi','08:00',1,6],['Vendredi','10:00',1,1],['Vendredi','14:00',1,2],
        ];
        foreach ($edt as $e) {
            DB::table('EmploiDuTemps')->insert(['jour'=>$e[0],'heure'=>$e[1],'idClasse'=>$e[2],'idCours'=>$e[3],'idAdmin'=>1,'created_at'=>now()]);
        }

        // TITULAIRES (legacy)
        DB::table('Titulaire')->truncate();
        DB::table('Titulaire')->insert(['idPers'=>1,'idSalle'=>1,'actif'=>1,'idAdmin'=>1,'created_at'=>now()]);
        DB::table('Titulaire')->insert(['idPers'=>2,'idSalle'=>2,'actif'=>1,'idAdmin'=>1,'created_at'=>now()]);
        DB::table('Titulaire')->insert(['idPers'=>3,'idSalle'=>3,'actif'=>1,'idAdmin'=>1,'created_at'=>now()]);

        // ======= MODERN TABLES =======
        // teachers
        DB::table('teachers')->truncate();
        DB::table('teachers')->insert(['id'=>1,'user_id'=>2,'nom'=>'Martin','prenom'=>'Jean','created_at'=>now(),'updated_at'=>now()]);
        DB::table('teachers')->insert(['id'=>2,'user_id'=>3,'nom'=>'Ngo','prenom'=>'Cécile','created_at'=>now(),'updated_at'=>now()]);
        DB::table('teachers')->insert(['id'=>3,'user_id'=>4,'nom'=>'Tabi','prenom'=>'Emmanuel','created_at'=>now(),'updated_at'=>now()]);

        // school_classes
        DB::table('school_classes')->truncate();
        foreach ([1=>'SIL',2=>'CP',3=>'CE1',4=>'CE2',5=>'CM1',6=>'CM2'] as $id=>$lib) {
            DB::table('school_classes')->insert(['id'=>$id,'libelle'=>$lib,'created_at'=>now(),'updated_at'=>now()]);
        }

        // subjects
        DB::table('subjects')->truncate();
        foreach ([1=>'Mathématiques',2=>'Français',3=>'Anglais',4=>'Sciences',5=>'Histoire-Géo',6=>'Éducation Physique'] as $id=>$lib) {
            DB::table('subjects')->insert(['id'=>$id,'libelle'=>$lib,'created_at'=>now(),'updated_at'=>now()]);
        }

        // terms
        DB::table('terms')->truncate();
        DB::table('terms')->insert(['id'=>1,'libelle'=>'Trimestre 1','periode'=>'Sep-Dec','school_year_id'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('terms')->insert(['id'=>2,'libelle'=>'Trimestre 2','periode'=>'Jan-Mar','school_year_id'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('terms')->insert(['id'=>3,'libelle'=>'Trimestre 3','periode'=>'Avr-Jun','school_year_id'=>1,'created_at'=>now(),'updated_at'=>now()]);

        // students (modern)
        DB::table('students')->truncate();
        $studentData = [
            [1,'EL-001',5,1,now()],[2,'EL-002',5,1,now()],[3,'EL-003',5,1,now()],
            [4,'EL-004',5,1,now()],[5,'EL-005',5,1,now()],[6,'EL-006',5,1,now()],
        ];
        foreach ($studentData as $s) {
            DB::table('students')->insert(['id'=>$s[0],'matricule'=>$s[1],'school_class_id'=>$s[2],'actif'=>$s[3],'created_at'=>$s[4],'updated_at'=>$s[4]]);
        }

        // assessments (modern)
        DB::table('assessments')->truncate();
        $assessments = [
            [1,5,1,1,1,'Contrôle Maths Oct','CONTROLE','2025-10-15',20],
            [2,5,2,2,1,'Dictée Français Oct','DICTEE','2025-10-20',20],
            [3,5,1,1,2,'Devoir Maths Nov','DEVOIR','2025-11-10',20],
            [4,5,3,3,1,'Test Anglais Nov','TEST','2025-11-18',20],
            [5,5,1,1,1,'Examen Trim1 Maths','EXAMEN','2025-12-10',20],
            [6,5,2,2,1,'Examen Trim1 Français','EXAMEN','2025-12-12',20],
        ];
        foreach ($assessments as $a) {
            DB::table('assessments')->insert(['id'=>$a[0],'school_class_id'=>$a[1],'teacher_id'=>$a[2],'subject_id'=>$a[3],'term_id'=>$a[4],'title'=>$a[5],'type'=>$a[6],'date'=>$a[7],'total_points'=>$a[8],'created_at'=>now(),'updated_at'=>now()]);
        }

        // grades (modern)
        DB::table('grades')->truncate();
        $gradeScores = [[18,17,15,14,12,16],[14,16,13,15,11,17],[16,13,18,12,15,14],[15,14,12,16,13,17],[17,15,14,13,16,12],[13,18,15,14,17,11]];
        foreach ($gradeScores as $aIdx => $scores) {
            foreach ($scores as $sIdx => $score) {
                DB::table('grades')->insert(['assessment_id'=>$aIdx+1,'student_id'=>$sIdx+1,'score'=>$score,'created_by_user_id'=>2,'created_at'=>now(),'updated_at'=>now()]);
            }
        }

        // attendances (modern)
        DB::table('attendances')->truncate();
        $statuses = ['PRESENT','PRESENT','PRESENT','LATE','ABSENT'];
        $dates = ['2025-10-01','2025-10-02','2025-10-03','2025-10-06','2025-10-07','2025-11-03','2025-11-04','2025-12-01'];
        foreach ($dates as $date) {
            foreach (range(1,6) as $sid) {
                DB::table('attendances')->insert(['school_class_id'=>5,'student_id'=>$sid,'date'=>$date,'status'=>$statuses[($sid+crc32($date))%count($statuses)],'created_at'=>now(),'updated_at'=>now()]);
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $this->command->info('✅ TestDataSeeder terminé avec succès!');
    }
}
