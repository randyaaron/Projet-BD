/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 163.123.183.89    Database: ecole2026
-- ------------------------------------------------------
-- Server version	8.0.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `typeAdmin` smallint DEFAULT '1',
  `mobile` varchar(15) DEFAULT NULL,
  `alanyaID` varchar(15) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
INSERT INTO `Admin` VALUES
(1,'Admin Principal','admin@ecole.fr','peda2026',1,1,'','','2026-05-13 08:02:06',0),
(2,'Fedjio Noumbissi','fedjioguenole@gmail.com','1234',1,3,'0',NULL,'2026-05-13 08:04:24',0),
(3,'sibefo','fedjiguenole@gmail.com','1234',1,2,NULL,NULL,'2026-05-13 08:06:14',0),
(4,'Atangana','fedjguenole@gmail.com','1234',1,4,'0',NULL,'2026-05-13 08:07:18',0),
(5,'Admin Test','admin_test','$2y$12$Q2CQhPOsh0nxDOLt9W6Vf.71tAqz.FogrKktZfGxux6lJHvqq16R.',1,0,NULL,NULL,'2026-05-16 17:24:42',0);
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AnneeAcademique`
--

DROP TABLE IF EXISTS `AnneeAcademique`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `AnneeAcademique` (
  `idAnnee` int unsigned NOT NULL,
  `libelle` varchar(200) NOT NULL,
  `periode` varchar(255) NOT NULL,
  `created_at` date NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idAnnee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AnneeAcademique`
--

LOCK TABLES `AnneeAcademique` WRITE;
/*!40000 ALTER TABLE `AnneeAcademique` DISABLE KEYS */;
INSERT INTO `AnneeAcademique` VALUES
(1,'2023-2024','','0000-00-00',1,0),
(2,'2024-2025','Sept-Juin','0000-00-00',1,0),
(3,'2025-2026','Sept-Juin','0000-00-00',1,0),
(4,'2026-2027','Sept-Juin','0000-00-00',1,0),
(5,'2027-2028','Sept-Juin','0000-00-00',1,0);
/*!40000 ALTER TABLE `AnneeAcademique` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Classe`
--

DROP TABLE IF EXISTS `Classe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Classe` (
  `idClasse` int unsigned NOT NULL,
  `libelle` varchar(100) NOT NULL DEFAULT 'INDEFINI',
  `idCycle` int unsigned NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idClasse`),
  KEY `associer` (`idCycle`),
  CONSTRAINT `associer` FOREIGN KEY (`idCycle`) REFERENCES `Cycle` (`idCycle`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Classe`
--

LOCK TABLES `Classe` WRITE;
/*!40000 ALTER TABLE `Classe` DISABLE KEYS */;
INSERT INTO `Classe` VALUES
(1,'SIL',1,1,'0000-00-00 00:00:00',0),
(2,'CP',2,1,'0000-00-00 00:00:00',0),
(3,'CE1',2,1,'0000-00-00 00:00:00',0),
(4,'CE2',2,1,'0000-00-00 00:00:00',0),
(5,'CM1',2,1,'0000-00-00 00:00:00',0);
/*!40000 ALTER TABLE `Classe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cours`
--

DROP TABLE IF EXISTS `Cours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cours` (
  `idCours` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `note` float unsigned NOT NULL DEFAULT '0',
  `coefficient` float unsigned NOT NULL DEFAULT '1',
  `description` text NOT NULL,
  `idClasse` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idCours`),
  KEY `lier` (`idClasse`),
  CONSTRAINT `lier` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cours`
--

LOCK TABLES `Cours` WRITE;
/*!40000 ALTER TABLE `Cours` DISABLE KEYS */;
INSERT INTO `Cours` VALUES
(1,'Mathématiques',20,2,'',1,1,1,'0000-00-00 00:00:00',0),
(2,'Français',20,4,'',1,1,1,'0000-00-00 00:00:00',0),
(3,'Anglais',20,3,'',1,1,1,'0000-00-00 00:00:00',0),
(4,'Sciences',20,3,'',1,1,1,'0000-00-00 00:00:00',0),
(5,'Histoire',20,2,'',1,1,1,'0000-00-00 00:00:00',0);
/*!40000 ALTER TABLE `Cours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cycle`
--

DROP TABLE IF EXISTS `Cycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cycle` (
  `idCycle` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idCycle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cycle`
--

LOCK TABLES `Cycle` WRITE;
/*!40000 ALTER TABLE `Cycle` DISABLE KEYS */;
INSERT INTO `Cycle` VALUES
(1,'Primaire','',0,'0000-00-00 00:00:00',0),
(2,'Primaire','Du SIL au CM2',0,'0000-00-00 00:00:00',0),
(3,'Collège','De la 6ème à la 3ème',0,'0000-00-00 00:00:00',0),
(4,'Lycée','Seconde à Terminale',0,'0000-00-00 00:00:00',0),
(5,'Technique','Formation professionnelle',0,'0000-00-00 00:00:00',0);
/*!40000 ALTER TABLE `Cycle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Discipline`
--

DROP TABLE IF EXISTS `Discipline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Discipline` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Discipline`
--

LOCK TABLES `Discipline` WRITE;
/*!40000 ALTER TABLE `Discipline` DISABLE KEYS */;
INSERT INTO `Discipline` VALUES
(5,'Service rendu',3),
(4,'Excellent travail',5),
(3,'Bavardage',0),
(2,'Retard',0),
(1,'Absence injustifiée',0);
/*!40000 ALTER TABLE `Discipline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Eleve`
--

DROP TABLE IF EXISTS `Eleve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Eleve` (
  `matricule` int unsigned NOT NULL,
  `nom` varchar(60) NOT NULL,
  `prenom` varchar(60) NOT NULL,
  `dateNaissance` date NOT NULL,
  `lieuNaissance` varchar(30) NOT NULL,
  `sexe` smallint unsigned NOT NULL DEFAULT '0' COMMENT '0 = fille, 1 = garcon, 2 = autres',
  `langue` varchar(30) NOT NULL DEFAULT 'NON DEFINI',
  `photoURL` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `actif` tinyint unsigned NOT NULL DEFAULT '0',
  `idVilleNaissance` int unsigned NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`matricule`),
  KEY `lieuNaiss` (`idVilleNaissance`),
  CONSTRAINT `lieuNaiss` FOREIGN KEY (`idVilleNaissance`) REFERENCES `VilleNaissance` (`idVille`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Eleve`
--

LOCK TABLES `Eleve` WRITE;
/*!40000 ALTER TABLE `Eleve` DISABLE KEYS */;
INSERT INTO `Eleve` VALUES
(1,'Atangana','Paul','2026-05-12','Yaoundé',1,'NON DEFINI','INDEFINI',1,1,1,'2026-05-12 14:44:15',0),
(2,'Ngo','Marie','0000-00-00','',2,'NON DEFINI','INDEFINI',0,2,1,'0000-00-00 00:00:00',0),
(3,'Etoa','Pierre','0000-00-00','',1,'NON DEFINI','INDEFINI',0,1,1,'0000-00-00 00:00:00',0),
(4,'Mballa','Alice','0000-00-00','',2,'NON DEFINI','INDEFINI',0,3,1,'0000-00-00 00:00:00',0),
(5,'Fouda','Simon','0000-00-00','',1,'NON DEFINI','INDEFINI',0,1,1,'0000-00-00 00:00:00',0);
/*!40000 ALTER TABLE `Eleve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EmploiDuTemps`
--

DROP TABLE IF EXISTS `EmploiDuTemps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `EmploiDuTemps` (
  `idTemps` int NOT NULL AUTO_INCREMENT,
  `jour` varchar(30) NOT NULL,
  `heure` varchar(6) NOT NULL,
  `idClasse` int unsigned NOT NULL,
  `idCours` int unsigned NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTemps`),
  KEY `classes` (`idClasse`),
  KEY `cours` (`idCours`),
  CONSTRAINT `classes` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`) ON UPDATE CASCADE,
  CONSTRAINT `cours` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EmploiDuTemps`
--

LOCK TABLES `EmploiDuTemps` WRITE;
/*!40000 ALTER TABLE `EmploiDuTemps` DISABLE KEYS */;
/*!40000 ALTER TABLE `EmploiDuTemps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Enseignant`
--

DROP TABLE IF EXISTS `Enseignant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Enseignant` (
  `idEnseignant` int NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `idCours` int unsigned NOT NULL,
  `Actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idEnseignant`),
  KEY `enseigner` (`idCours`),
  KEY `enseignant` (`idPers`),
  CONSTRAINT `enseignant` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE,
  CONSTRAINT `enseigner` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Enseignant`
--

LOCK TABLES `Enseignant` WRITE;
/*!40000 ALTER TABLE `Enseignant` DISABLE KEYS */;
INSERT INTO `Enseignant` VALUES
(1,1,1,1,1,'0000-00-00 00:00:00',0);
/*!40000 ALTER TABLE `Enseignant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Epreuve`
--

DROP TABLE IF EXISTS `Epreuve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Epreuve` (
  `idEpreuve` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `urlDoc` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `auteur` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `idNature` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idEpreuve`),
  KEY `natu` (`idNature`),
  CONSTRAINT `natu` FOREIGN KEY (`idNature`) REFERENCES `NatureEpreuve` (`idNature`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Epreuve`
--

LOCK TABLES `Epreuve` WRITE;
/*!40000 ALTER TABLE `Epreuve` DISABLE KEYS */;
/*!40000 ALTER TABLE `Epreuve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Evaluation`
--

DROP TABLE IF EXISTS `Evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Evaluation` (
  `idEval` int NOT NULL AUTO_INCREMENT,
  `note` float NOT NULL DEFAULT '0',
  `appreciation` varchar(255) NOT NULL,
  `matricule` int unsigned NOT NULL,
  `idEpreuve` int unsigned NOT NULL,
  `idCours` int unsigned NOT NULL,
  `idSession` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEval`),
  KEY `matr` (`matricule`),
  KEY `epre` (`idEpreuve`),
  KEY `matiere` (`idCours`),
  KEY `session` (`idSession`),
  CONSTRAINT `epre` FOREIGN KEY (`idEpreuve`) REFERENCES `Epreuve` (`idEpreuve`) ON UPDATE CASCADE,
  CONSTRAINT `matiere` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`) ON UPDATE CASCADE,
  CONSTRAINT `matr` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `session` FOREIGN KEY (`idSession`) REFERENCES `Session` (`idSession`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Evaluation`
--

LOCK TABLES `Evaluation` WRITE;
/*!40000 ALTER TABLE `Evaluation` DISABLE KEYS */;
INSERT INTO `Evaluation` VALUES
(1,16.5,'',1,0,1,1,1,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Evaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Frequente`
--

DROP TABLE IF EXISTS `Frequente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Frequente` (
  `idFrequente` int NOT NULL AUTO_INCREMENT,
  `idSalle` int unsigned NOT NULL,
  `idAcademi` int unsigned NOT NULL,
  `matricule` int unsigned NOT NULL,
  `commentaire` varchar(255) NOT NULL DEFAULT 'RAS',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFrequente`),
  KEY `freq` (`matricule`),
  KEY `liers` (`idSalle`),
  KEY `Acad` (`idAcademi`),
  CONSTRAINT `Acad` FOREIGN KEY (`idAcademi`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `freq` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `liers` FOREIGN KEY (`idSalle`) REFERENCES `Salle` (`idSalle`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Frequente`
--

LOCK TABLES `Frequente` WRITE;
/*!40000 ALTER TABLE `Frequente` DISABLE KEYS */;
INSERT INTO `Frequente` VALUES
(1,1,1,1,'RAS',1,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Frequente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `JourSemaine`
--

DROP TABLE IF EXISTS `JourSemaine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `JourSemaine` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(15) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `JourSemaine`
--

LOCK TABLES `JourSemaine` WRITE;
/*!40000 ALTER TABLE `JourSemaine` DISABLE KEYS */;
/*!40000 ALTER TABLE `JourSemaine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Livres`
--

DROP TABLE IF EXISTS `Livres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Livres` (
  `idLivre` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) NOT NULL,
  `auteurs` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `prix` float unsigned NOT NULL DEFAULT '0',
  `idSpecialite` int unsigned NOT NULL,
  `edition` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `annee_parution` date DEFAULT NULL,
  `totalCopie` smallint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idLivre`),
  KEY `special` (`idSpecialite`),
  CONSTRAINT `special` FOREIGN KEY (`idSpecialite`) REFERENCES `Specialite` (`idSpecialite`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Livres`
--

LOCK TABLES `Livres` WRITE;
/*!40000 ALTER TABLE `Livres` DISABLE KEYS */;
/*!40000 ALTER TABLE `Livres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Messages` (
  `idMessages` int NOT NULL AUTO_INCREMENT,
  `idExp_Pers` int unsigned NOT NULL,
  `idParent` int unsigned NOT NULL,
  `objet` varchar(255) NOT NULL,
  `information` text NOT NULL,
  `type_message` smallint unsigned NOT NULL DEFAULT '0' COMMENT '0 = individuel, 1= tous les parents , 2 = tous les parents pour paiement',
  `AnneeAcade` varchar(15) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `valider` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`idMessages`),
  KEY `mess` (`idParent`),
  CONSTRAINT `mess` FOREIGN KEY (`idParent`) REFERENCES `Parents` (`idParent`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Messages`
--

LOCK TABLES `Messages` WRITE;
/*!40000 ALTER TABLE `Messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `Messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Mode`
--

DROP TABLE IF EXISTS `Mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mode` (
  `idMode` int unsigned NOT NULL,
  `libelle` varchar(100) NOT NULL DEFAULT 'INDEFINI',
  `information` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idFondateur` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mode`
--

LOCK TABLES `Mode` WRITE;
/*!40000 ALTER TABLE `Mode` DISABLE KEYS */;
INSERT INTO `Mode` VALUES
(1,'Orange Money','',1,1,'0000-00-00 00:00:00'),
(2,'Orange Money','',1,1,'0000-00-00 00:00:00'),
(3,'MTN MoMo','',1,1,'0000-00-00 00:00:00'),
(4,'Virement','',1,1,'0000-00-00 00:00:00'),
(5,'Chèque','',1,1,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Mode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NatureEpreuve`
--

DROP TABLE IF EXISTS `NatureEpreuve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `NatureEpreuve` (
  `idNature` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL DEFAULT 'INDEFINI' COMMENT 'Controle Continu, Examen, Devoir Mercredi, Devoir Week End',
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`idNature`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NatureEpreuve`
--

LOCK TABLES `NatureEpreuve` WRITE;
/*!40000 ALTER TABLE `NatureEpreuve` DISABLE KEYS */;
INSERT INTO `NatureEpreuve` VALUES
(1,'Contrôle continu',NULL),
(2,'Examen trimestriel',NULL),
(3,'Test de niveau',NULL),
(4,'Examen blanc',NULL),
(5,'Séquence',NULL);
/*!40000 ALTER TABLE `NatureEpreuve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Paiement`
--

DROP TABLE IF EXISTS `Paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Paiement` (
  `idPaie` int unsigned NOT NULL,
  `matricule` int unsigned NOT NULL,
  `idAca` int unsigned NOT NULL,
  `montant` float NOT NULL,
  `url` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `comentaire` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `idMode` int unsigned NOT NULL,
  `operation_ID` varchar(30) NOT NULL DEFAULT 'INDEFINI',
  `idPers` int unsigned NOT NULL,
  `datePaie` date NOT NULL,
  `dateEnregistrer` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPaie`),
  KEY `annee` (`idAca`),
  KEY `enf` (`matricule`),
  KEY `via` (`idMode`),
  CONSTRAINT `annee` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `enf` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `via` FOREIGN KEY (`idMode`) REFERENCES `Mode` (`idMode`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Paiement`
--

LOCK TABLES `Paiement` WRITE;
/*!40000 ALTER TABLE `Paiement` DISABLE KEYS */;
INSERT INTO `Paiement` VALUES
(1,1,1,50000,'INDEFINI','INDEFINI',1,'INDEFINI',0,'0000-00-00','0000-00-00 00:00:00'),
(2,2,1,50000,'INDEFINI','INDEFINI',2,'INDEFINI',0,'0000-00-00','0000-00-00 00:00:00'),
(3,3,1,25000,'INDEFINI','INDEFINI',3,'INDEFINI',0,'0000-00-00','0000-00-00 00:00:00'),
(4,4,1,75000,'INDEFINI','INDEFINI',1,'INDEFINI',0,'0000-00-00','0000-00-00 00:00:00'),
(5,5,1,100000,'INDEFINI','INDEFINI',4,'INDEFINI',0,'0000-00-00','0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Paiement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Parents`
--

DROP TABLE IF EXISTS `Parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Parents` (
  `idParent` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `matricule` int unsigned NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idParent`),
  UNIQUE KEY `uniqueParent` (`idPers`,`matricule`) USING BTREE,
  KEY `enft` (`matricule`),
  CONSTRAINT `enft` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `parents` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Parents`
--

LOCK TABLES `Parents` WRITE;
/*!40000 ALTER TABLE `Parents` DISABLE KEYS */;
INSERT INTO `Parents` VALUES
(1,1,1,1,'0000-00-00 00:00:00',0);
/*!40000 ALTER TABLE `Parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Personne`
--

DROP TABLE IF EXISTS `Personne`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Personne` (
  `idPers` int unsigned NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `dateNaissance` date NOT NULL,
  `lieuNaissance` varchar(100) NOT NULL DEFAULT 'INDEFINI',
  `mobile` varchar(15) NOT NULL DEFAULT '0',
  `phone` varchar(15) NOT NULL DEFAULT '0',
  `email` varchar(255) DEFAULT NULL,
  `typePersonne` smallint unsigned NOT NULL COMMENT '1= Enseignant , 2 = Administratif, 3 = Scolarite, 4= parents, 5 = Autres',
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `alanyaID` varchar(15) DEFAULT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idPers`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Personne`
--

LOCK TABLES `Personne` WRITE;
/*!40000 ALTER TABLE `Personne` DISABLE KEYS */;
INSERT INTO `Personne` VALUES
(1,'Directeur','Ecole','0000-00-00','INDEFINI','0','0',NULL,1,'','',NULL,1,'2026-05-13 08:02:06',0),
(2,'Atangana','Luc','0000-00-00','INDEFINI','670000002','0',NULL,2,'','',NULL,1,'2026-05-13 08:02:06',0),
(3,'Mvondo','Cécile','0000-00-00','INDEFINI','670000003','0',NULL,3,'','',NULL,1,'2026-05-13 08:02:06',0),
(4,'Biloa','Marcel','0000-00-00','INDEFINI','670000004','0',NULL,3,'','',NULL,1,'2026-05-13 08:02:06',0),
(5,'Abena','Justin','0000-00-00','INDEFINI','670000005','0',NULL,2,'','',NULL,1,'2026-05-13 08:02:06',0);
/*!40000 ALTER TABLE `Personne` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Quartier`
--

DROP TABLE IF EXISTS `Quartier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Quartier` (
  `idQuartier` int unsigned NOT NULL,
  `libelle` varchar(100) NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`idQuartier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Quartier`
--

LOCK TABLES `Quartier` WRITE;
/*!40000 ALTER TABLE `Quartier` DISABLE KEYS */;
INSERT INTO `Quartier` VALUES
(1,'Bastos','Quartier résidentiel'),
(2,'Mvan','Zone sud'),
(3,'Akwa','Centre commercial'),
(4,'Bonapriso','Zone chic'),
(5,'Ngousso','Proche hôpital');
/*!40000 ALTER TABLE `Quartier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rapport`
--

DROP TABLE IF EXISTS `Rapport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rapport` (
  `idRap` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int unsigned NOT NULL,
  `matricule` int unsigned NOT NULL,
  `idAca` int unsigned NOT NULL,
  `commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_date` date NOT NULL,
  `idPers` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idRap` DESC),
  KEY `enfant` (`matricule`),
  KEY `annees` (`idAca`),
  CONSTRAINT `annees` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `enfant` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rapport`
--

LOCK TABLES `Rapport` WRITE;
/*!40000 ALTER TABLE `Rapport` DISABLE KEYS */;
/*!40000 ALTER TABLE `Rapport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Residents`
--

DROP TABLE IF EXISTS `Residents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Residents` (
  `idResi` int NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `idQuartier` int unsigned NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idResi`),
  KEY `zone` (`idQuartier`),
  KEY `habite` (`idPers`),
  CONSTRAINT `habite` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE,
  CONSTRAINT `zone` FOREIGN KEY (`idQuartier`) REFERENCES `Quartier` (`idQuartier`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Residents`
--

LOCK TABLES `Residents` WRITE;
/*!40000 ALTER TABLE `Residents` DISABLE KEYS */;
/*!40000 ALTER TABLE `Residents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Salle`
--

DROP TABLE IF EXISTS `Salle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Salle` (
  `idSalle` int unsigned NOT NULL,
  `libelle` varchar(30) NOT NULL,
  `position` varchar(100) NOT NULL DEFAULT 'NON DEFINI',
  `surface` varchar(30) NOT NULL,
  `idClasse` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSalle`),
  KEY `lieu` (`idClasse`),
  CONSTRAINT `lieu` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Salle`
--

LOCK TABLES `Salle` WRITE;
/*!40000 ALTER TABLE `Salle` DISABLE KEYS */;
INSERT INTO `Salle` VALUES
(1,'Salle 1','NON DEFINI','',1,1,1,'0000-00-00 00:00:00'),
(2,'Salle A2','NON DEFINI','',2,1,1,'0000-00-00 00:00:00'),
(3,'Salle B1','NON DEFINI','',3,1,1,'0000-00-00 00:00:00'),
(4,'Salle B2','NON DEFINI','',4,1,1,'0000-00-00 00:00:00'),
(5,'Salle C1','NON DEFINI','',5,1,1,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Salle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Scolarite`
--

DROP TABLE IF EXISTS `Scolarite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Scolarite` (
  `idScolarite` int unsigned NOT NULL,
  `inscription` float unsigned NOT NULL,
  `pension` float unsigned NOT NULL,
  `nbreTranche` smallint unsigned NOT NULL DEFAULT '3',
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idCycle` int unsigned NOT NULL,
  `idFondateur` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idScolarite`),
  KEY `argent` (`idCycle`),
  CONSTRAINT `argent` FOREIGN KEY (`idCycle`) REFERENCES `Cycle` (`idCycle`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Scolarite`
--

LOCK TABLES `Scolarite` WRITE;
/*!40000 ALTER TABLE `Scolarite` DISABLE KEYS */;
INSERT INTO `Scolarite` VALUES
(1,15000,120000,3,'',2,0,'0000-00-00 00:00:00'),
(2,20000,150000,3,'',3,0,'0000-00-00 00:00:00'),
(3,25000,200000,4,'',4,0,'0000-00-00 00:00:00'),
(4,10000,80000,2,'',1,0,'0000-00-00 00:00:00'),
(5,30000,250000,4,'',5,0,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Scolarite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Session`
--

DROP TABLE IF EXISTS `Session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Session` (
  `idSession` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `idTrimestre` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `date_passage` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSession`),
  KEY `sessTrim` (`idTrimestre`),
  CONSTRAINT `sessTrim` FOREIGN KEY (`idTrimestre`) REFERENCES `Trimestre` (`idTrimes`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Session`
--

LOCK TABLES `Session` WRITE;
/*!40000 ALTER TABLE `Session` DISABLE KEYS */;
INSERT INTO `Session` VALUES
(1,'Examen Sequentiel 1',NULL,1,1,NULL,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `Session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Specialite`
--

DROP TABLE IF EXISTS `Specialite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Specialite` (
  `idSpecialite` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  PRIMARY KEY (`idSpecialite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Specialite`
--

LOCK TABLES `Specialite` WRITE;
/*!40000 ALTER TABLE `Specialite` DISABLE KEYS */;
/*!40000 ALTER TABLE `Specialite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Titulaire`
--

DROP TABLE IF EXISTS `Titulaire`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Titulaire` (
  `idTitulaire` int NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `idSalle` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTitulaire`),
  KEY `responsable` (`idSalle`),
  KEY `nommer` (`idPers`),
  CONSTRAINT `nommer` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE,
  CONSTRAINT `responsable` FOREIGN KEY (`idSalle`) REFERENCES `Salle` (`idSalle`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Titulaire`
--

LOCK TABLES `Titulaire` WRITE;
/*!40000 ALTER TABLE `Titulaire` DISABLE KEYS */;
/*!40000 ALTER TABLE `Titulaire` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tranches`
--

DROP TABLE IF EXISTS `Tranches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tranches` (
  `idTranche` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `montant` float unsigned NOT NULL DEFAULT '0',
  `delai_mois` char(2) NOT NULL,
  `delai_jour` char(2) NOT NULL,
  `idScolarite` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idFondateur` int unsigned NOT NULL,
  PRIMARY KEY (`idTranche`),
  KEY `scol` (`idScolarite`),
  CONSTRAINT `scol` FOREIGN KEY (`idScolarite`) REFERENCES `Scolarite` (`idScolarite`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tranches`
--

LOCK TABLES `Tranches` WRITE;
/*!40000 ALTER TABLE `Tranches` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tranches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Trimestre`
--

DROP TABLE IF EXISTS `Trimestre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Trimestre` (
  `idTrimes` int unsigned NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `periode` varchar(255) NOT NULL,
  `idAca` int unsigned NOT NULL,
  `idAdmin` int NOT NULL,
  PRIMARY KEY (`idTrimes`),
  KEY `anneTrim` (`idAca`),
  CONSTRAINT `anneTrim` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Trimestre`
--

LOCK TABLES `Trimestre` WRITE;
/*!40000 ALTER TABLE `Trimestre` DISABLE KEYS */;
INSERT INTO `Trimestre` VALUES
(1,'1er Trimestre','',1,1),
(2,'Trimestre 2','',1,1),
(3,'Trimestre 3','',1,1),
(4,'Trimestre 1','',2,1),
(5,'Trimestre 2','',2,1);
/*!40000 ALTER TABLE `Trimestre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VilleNaissance`
--

DROP TABLE IF EXISTS `VilleNaissance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `VilleNaissance` (
  `idVille` int unsigned NOT NULL,
  `libelle` varchar(100) NOT NULL DEFAULT 'Autres',
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`idVille`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VilleNaissance`
--

LOCK TABLES `VilleNaissance` WRITE;
/*!40000 ALTER TABLE `VilleNaissance` DISABLE KEYS */;
INSERT INTO `VilleNaissance` VALUES
(1,'Yaoundé',1),
(2,'Douala',1),
(3,'Bafoussam',1),
(4,'Garoua',1),
(5,'Bamenda',1),
(10,'Buae',1),
(14,'Autre',1);
/*!40000 ALTER TABLE `VilleNaissance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `type_admin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_admin_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_user_id_unique` (`user_id`),
  KEY `admins_parent_admin_id_foreign` (`parent_admin_id`),
  CONSTRAINT `admins_parent_admin_id_foreign` FOREIGN KEY (`parent_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `admins_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,2,'Administrateur','admin',1,'principal',NULL,NULL,'2026-05-15 19:17:28','2026-05-15 19:17:28');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `annee_academiques`
--

DROP TABLE IF EXISTS `annee_academiques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `annee_academiques` (
  `id_annee` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audit_admin_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_annee`),
  KEY `annee_academiques_audit_admin_id_foreign` (`audit_admin_id`),
  CONSTRAINT `annee_academiques_audit_admin_id_foreign` FOREIGN KEY (`audit_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annee_academiques`
--

LOCK TABLES `annee_academiques` WRITE;
/*!40000 ALTER TABLE `annee_academiques` DISABLE KEYS */;
INSERT INTO `annee_academiques` VALUES
(1,'2025-2026','Septembre — Juin',NULL,'2026-05-15 19:17:13','2026-05-15 19:17:13');
/*!40000 ALTER TABLE `annee_academiques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school_class_id` bigint unsigned NOT NULL,
  `teacher_id` bigint unsigned NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `term_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DEVOIR',
  `date` date DEFAULT NULL,
  `total_points` decimal(8,2) NOT NULL DEFAULT '20.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assessments_teacher_id_foreign` (`teacher_id`),
  KEY `assessments_subject_id_foreign` (`subject_id`),
  KEY `assessments_term_id_foreign` (`term_id`),
  KEY `assessments_school_class_id_term_id_index` (`school_class_id`,`term_id`),
  CONSTRAINT `assessments_school_class_id_foreign` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessments_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `assessments_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessments_term_id_foreign` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school_class_id` bigint unsigned NOT NULL,
  `student_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `status` enum('PRESENT','ABSENT','LATE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRESENT',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_school_class_id_student_id_date_unique` (`school_class_id`,`student_id`,`date`),
  KEY `attendances_student_id_foreign` (`student_id`),
  CONSTRAINT `attendances_school_class_id_foreign` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id_classe` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_cycle` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_classe`),
  KEY `classes_id_cycle_foreign` (`id_cycle`),
  CONSTRAINT `classes_id_cycle_foreign` FOREIGN KEY (`id_cycle`) REFERENCES `cycles` (`id_cycle`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES
(1,'CM2',1,'2026-05-15 19:17:08','2026-05-15 19:17:08');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cours`
--

DROP TABLE IF EXISTS `cours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cours` (
  `id_cours` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note_max` decimal(5,2) NOT NULL DEFAULT '20.00',
  `coefficient` decimal(5,2) NOT NULL DEFAULT '1.00',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cours`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cours`
--

LOCK TABLES `cours` WRITE;
/*!40000 ALTER TABLE `cours` DISABLE KEYS */;
INSERT INTO `cours` VALUES
(1,'Mathématiques',20.00,3.00,NULL,'2026-05-15 19:17:11','2026-05-15 19:17:11'),
(2,'Français',20.00,3.00,NULL,'2026-05-15 19:17:11','2026-05-15 19:17:11');
/*!40000 ALTER TABLE `cours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cycles`
--

DROP TABLE IF EXISTS `cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cycles` (
  `id_cycle` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cycle`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cycles`
--

LOCK TABLES `cycles` WRITE;
/*!40000 ALTER TABLE `cycles` DISABLE KEYS */;
INSERT INTO `cycles` VALUES
(1,'Primaire','Cycle primaire','2026-05-15 19:17:07','2026-05-15 19:17:07');
/*!40000 ALTER TABLE `cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eleves`
--

DROP TABLE IF EXISTS `eleves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `eleves` (
  `matricule` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `lieu_naissance` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sexe` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `langue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `id_ville_naissance` bigint unsigned DEFAULT NULL,
  `audit_admin_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`matricule`),
  KEY `eleves_id_ville_naissance_foreign` (`id_ville_naissance`),
  KEY `eleves_audit_admin_id_foreign` (`audit_admin_id`),
  CONSTRAINT `eleves_audit_admin_id_foreign` FOREIGN KEY (`audit_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `eleves_id_ville_naissance_foreign` FOREIGN KEY (`id_ville_naissance`) REFERENCES `villes_naissance` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eleves`
--

LOCK TABLES `eleves` WRITE;
/*!40000 ALTER TABLE `eleves` DISABLE KEYS */;
INSERT INTO `eleves` VALUES
('EL2026001','Obame','Sarah','2016-04-12','Libreville','F','FR',NULL,1,1,NULL,'2026-05-15 19:17:29','2026-05-15 19:17:29');
/*!40000 ALTER TABLE `eleves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enseignants`
--

DROP TABLE IF EXISTS `enseignants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enseignants` (
  `id_enseignant` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pers` bigint unsigned NOT NULL,
  `id_cours` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `audit_admin_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_enseignant`),
  UNIQUE KEY `enseignants_id_pers_unique` (`id_pers`),
  KEY `enseignants_id_cours_foreign` (`id_cours`),
  KEY `enseignants_audit_admin_id_foreign` (`audit_admin_id`),
  CONSTRAINT `enseignants_audit_admin_id_foreign` FOREIGN KEY (`audit_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `enseignants_id_cours_foreign` FOREIGN KEY (`id_cours`) REFERENCES `cours` (`id_cours`) ON DELETE SET NULL,
  CONSTRAINT `enseignants_id_pers_foreign` FOREIGN KEY (`id_pers`) REFERENCES `personnes` (`id_pers`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enseignants`
--

LOCK TABLES `enseignants` WRITE;
/*!40000 ALTER TABLE `enseignants` DISABLE KEYS */;
/*!40000 ALTER TABLE `enseignants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `assessment_id` bigint unsigned NOT NULL,
  `student_id` bigint unsigned NOT NULL,
  `score` decimal(8,2) NOT NULL,
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by_user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grades_assessment_id_student_id_unique` (`assessment_id`,`student_id`),
  KEY `grades_created_by_user_id_foreign` (`created_by_user_id`),
  KEY `grades_student_id_index` (`student_id`),
  CONSTRAINT `grades_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_created_by_user_id_foreign` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `grades_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2026_05_05_000001_add_role_fields_to_users_table',1),
(5,'2026_05_05_000002_add_approval_fields_to_users_table',1),
(6,'2026_05_05_000010_create_people_table',1),
(7,'2026_05_05_000011_create_subjects_table',1),
(8,'2026_05_05_000012_create_teachers_and_parents_tables',1),
(9,'2026_05_05_000020_create_school_years_terms_rooms_classes_tables',1),
(10,'2026_05_05_000021_create_teacher_class_assignments_table',1),
(11,'2026_05_05_000022_create_students_and_parent_student_tables',1),
(12,'2026_05_05_000030_create_assessments_and_grades_tables',1),
(13,'2026_05_05_000031_create_report_cards_table',1),
(14,'2026_05_05_000032_create_payments_and_receipts_tables',1),
(15,'2026_05_05_192656_create_personal_access_tokens_table',1),
(16,'2026_05_15_173050_create_attendances_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modes`
--

DROP TABLE IF EXISTS `modes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `modes` (
  `id_mode` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_mode`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modes`
--

LOCK TABLES `modes` WRITE;
/*!40000 ALTER TABLE `modes` DISABLE KEYS */;
INSERT INTO `modes` VALUES
(1,'Espèces','2026-05-15 19:17:21','2026-05-15 19:17:21'),
(2,'Virement','2026-05-15 19:17:24','2026-05-15 19:17:24');
/*!40000 ALTER TABLE `modes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nature_epreuves`
--

DROP TABLE IF EXISTS `nature_epreuves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nature_epreuves` (
  `id_nature` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_nature`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nature_epreuves`
--

LOCK TABLES `nature_epreuves` WRITE;
/*!40000 ALTER TABLE `nature_epreuves` DISABLE KEYS */;
INSERT INTO `nature_epreuves` VALUES
(1,'Contrôle','2026-05-15 19:17:26','2026-05-15 19:17:26');
/*!40000 ALTER TABLE `nature_epreuves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_student`
--

DROP TABLE IF EXISTS `parent_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent_student` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned NOT NULL,
  `student_id` bigint unsigned NOT NULL,
  `relation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_student_parent_id_student_id_unique` (`parent_id`,`student_id`),
  KEY `parent_student_student_id_foreign` (`student_id`),
  CONSTRAINT `parent_student_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parent_student_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_student`
--

LOCK TABLES `parent_student` WRITE;
/*!40000 ALTER TABLE `parent_student` DISABLE KEYS */;
/*!40000 ALTER TABLE `parent_student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `person_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parents_user_id_unique` (`user_id`),
  UNIQUE KEY `parents_person_id_unique` (`person_id`),
  CONSTRAINT `parents_person_id_foreign` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_by_user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_recorded_by_user_id_foreign` (`recorded_by_user_id`),
  KEY `payments_student_id_paid_at_index` (`student_id`,`paid_at`),
  CONSTRAINT `payments_recorded_by_user_id_foreign` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `payments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `people`
--

DROP TABLE IF EXISTS `people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `people` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `sex` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `people`
--

LOCK TABLES `people` WRITE;
/*!40000 ALTER TABLE `people` DISABLE KEYS */;
/*!40000 ALTER TABLE `people` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',3,'api','bc6c1eaf0008ff9b8edf371d9b4f8f181ad3973a3f75ee3e2f255e6f90b05caa','[\"*\"]',NULL,NULL,'2026-05-16 18:34:04','2026-05-16 18:34:04'),
(2,'App\\Models\\User',3,'api','a1ddad3f7e41801a30dcd3ed5d597e5f35be1c46f015d6b32a6b866a204842b5','[\"*\"]',NULL,NULL,'2026-05-16 18:48:10','2026-05-16 18:48:10'),
(3,'App\\Models\\User',3,'api','0c6f73ed9401fc8c061b557f82c98095dfde17837d6c397947d9c940509b29e5','[\"*\"]',NULL,NULL,'2026-05-16 18:48:39','2026-05-16 18:48:39');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personnes`
--

DROP TABLE IF EXISTS `personnes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personnes` (
  `id_pers` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `lieu_naissance` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_personne` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'parent',
  `audit_admin_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pers`),
  UNIQUE KEY `personnes_user_id_unique` (`user_id`),
  KEY `personnes_audit_admin_id_foreign` (`audit_admin_id`),
  CONSTRAINT `personnes_audit_admin_id_foreign` FOREIGN KEY (`audit_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `personnes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personnes`
--

LOCK TABLES `personnes` WRITE;
/*!40000 ALTER TABLE `personnes` DISABLE KEYS */;
/*!40000 ALTER TABLE `personnes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quartiers`
--

DROP TABLE IF EXISTS `quartiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quartiers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ville_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quartiers_ville_id_foreign` (`ville_id`),
  CONSTRAINT `quartiers_ville_id_foreign` FOREIGN KEY (`ville_id`) REFERENCES `villes_naissance` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quartiers`
--

LOCK TABLES `quartiers` WRITE;
/*!40000 ALTER TABLE `quartiers` DISABLE KEYS */;
/*!40000 ALTER TABLE `quartiers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `payment_id` bigint unsigned NOT NULL,
  `receipt_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipts_payment_id_unique` (`payment_id`),
  UNIQUE KEY `receipts_receipt_number_unique` (`receipt_number`),
  CONSTRAINT `receipts_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_cards`
--

DROP TABLE IF EXISTS `report_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_cards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint unsigned NOT NULL,
  `school_year_id` bigint unsigned NOT NULL,
  `term_id` bigint unsigned NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `generated_by_user_id` bigint unsigned DEFAULT NULL,
  `approved_by_user_id` bigint unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `director_stamp_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_cards_student_id_school_year_id_term_id_unique` (`student_id`,`school_year_id`,`term_id`),
  KEY `report_cards_school_year_id_foreign` (`school_year_id`),
  KEY `report_cards_term_id_foreign` (`term_id`),
  KEY `report_cards_generated_by_user_id_foreign` (`generated_by_user_id`),
  KEY `report_cards_approved_by_user_id_foreign` (`approved_by_user_id`),
  KEY `report_cards_status_index` (`status`),
  CONSTRAINT `report_cards_approved_by_user_id_foreign` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `report_cards_generated_by_user_id_foreign` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `report_cards_school_year_id_foreign` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_cards_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_cards_term_id_foreign` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_cards`
--

LOCK TABLES `report_cards` WRITE;
/*!40000 ALTER TABLE `report_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salles`
--

DROP TABLE IF EXISTS `salles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `salles` (
  `id_salle` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_classe` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_salle`),
  KEY `salles_id_classe_foreign` (`id_classe`),
  CONSTRAINT `salles_id_classe_foreign` FOREIGN KEY (`id_classe`) REFERENCES `classes` (`id_classe`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salles`
--

LOCK TABLES `salles` WRITE;
/*!40000 ALTER TABLE `salles` DISABLE KEYS */;
INSERT INTO `salles` VALUES
(1,'Salle CM2-A',1,'2026-05-15 19:17:09','2026-05-15 19:17:09');
/*!40000 ALTER TABLE `salles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_classes`
--

DROP TABLE IF EXISTS `school_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_classes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school_year_id` bigint unsigned NOT NULL,
  `room_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_classes_school_year_id_name_unique` (`school_year_id`,`name`),
  KEY `school_classes_room_id_foreign` (`room_id`),
  CONSTRAINT `school_classes_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `school_classes_school_year_id_foreign` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_classes`
--

LOCK TABLES `school_classes` WRITE;
/*!40000 ALTER TABLE `school_classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `school_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_years`
--

DROP TABLE IF EXISTS `school_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_years` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_years_name_unique` (`name`),
  KEY `school_years_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_years`
--

LOCK TABLES `school_years` WRITE;
/*!40000 ALTER TABLE `school_years` DISABLE KEYS */;
/*!40000 ALTER TABLE `school_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES
('kr74g1pAc9jPUkNjKxZS2rLqRwZTQzEzEmUPBJqo',NULL,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0','eyJfdG9rZW4iOiJkUHFpS1M4ejcxVTExMW1XazdycGtncjBNeDc4NkpubEJyM1kyY0VVIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9sb2dpbiIsInJvdXRlIjoibG9naW4ifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1778865165);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions_pedagogiques`
--

DROP TABLE IF EXISTS `sessions_pedagogiques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions_pedagogiques` (
  `id_session` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_trimestre` bigint unsigned NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_session`),
  KEY `sessions_pedagogiques_id_trimestre_foreign` (`id_trimestre`),
  CONSTRAINT `sessions_pedagogiques_id_trimestre_foreign` FOREIGN KEY (`id_trimestre`) REFERENCES `trimestres` (`id_trimestre`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions_pedagogiques`
--

LOCK TABLES `sessions_pedagogiques` WRITE;
/*!40000 ALTER TABLE `sessions_pedagogiques` DISABLE KEYS */;
INSERT INTO `sessions_pedagogiques` VALUES
(1,1,'Session A','2026-05-15','2026-06-15','2026-05-15 19:17:17','2026-05-15 19:17:17');
/*!40000 ALTER TABLE `sessions_pedagogiques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `person_id` bigint unsigned NOT NULL,
  `school_class_id` bigint unsigned DEFAULT NULL,
  `enrollment_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `enrolled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_person_id_unique` (`person_id`),
  UNIQUE KEY `students_enrollment_code_unique` (`enrollment_code`),
  KEY `students_school_class_id_foreign` (`school_class_id`),
  KEY `students_status_index` (`status`),
  CONSTRAINT `students_person_id_foreign` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `students_school_class_id_foreign` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subjects_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_class_assignments`
--

DROP TABLE IF EXISTS `teacher_class_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_class_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint unsigned NOT NULL,
  `school_class_id` bigint unsigned NOT NULL,
  `school_year_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_teacher_class_year` (`teacher_id`,`school_class_id`,`school_year_id`),
  KEY `teacher_class_assignments_school_class_id_foreign` (`school_class_id`),
  KEY `teacher_class_assignments_school_year_id_foreign` (`school_year_id`),
  CONSTRAINT `teacher_class_assignments_school_class_id_foreign` FOREIGN KEY (`school_class_id`) REFERENCES `school_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_class_assignments_school_year_id_foreign` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_class_assignments_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_class_assignments`
--

LOCK TABLES `teacher_class_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_class_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_class_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `person_id` bigint unsigned NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `matricule` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teachers_user_id_unique` (`user_id`),
  UNIQUE KEY `teachers_person_id_unique` (`person_id`),
  UNIQUE KEY `teachers_matricule_unique` (`matricule`),
  KEY `teachers_subject_id_foreign` (`subject_id`),
  CONSTRAINT `teachers_person_id_foreign` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachers_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `teachers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `terms`
--

DROP TABLE IF EXISTS `terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `terms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school_year_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `terms_school_year_id_name_unique` (`school_year_id`,`name`),
  CONSTRAINT `terms_school_year_id_foreign` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `terms`
--

LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
/*!40000 ALTER TABLE `terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trimestres`
--

DROP TABLE IF EXISTS `trimestres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `trimestres` (
  `id_trimestre` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_annee` bigint unsigned NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_trimestre`),
  KEY `trimestres_id_annee_foreign` (`id_annee`),
  CONSTRAINT `trimestres_id_annee_foreign` FOREIGN KEY (`id_annee`) REFERENCES `annee_academiques` (`id_annee`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trimestres`
--

LOCK TABLES `trimestres` WRITE;
/*!40000 ALTER TABLE `trimestres` DISABLE KEYS */;
INSERT INTO `trimestres` VALUES
(1,1,'Trimestre 1','2026-01-01','2026-09-15','2026-05-15 19:17:15','2026-05-15 19:17:15');
/*!40000 ALTER TABLE `trimestres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DIRECTEUR',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `approved_by_user_id` bigint unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`),
  KEY `users_is_active_index` (`is_active`),
  KEY `users_approved_by_user_id_foreign` (`approved_by_user_id`),
  CONSTRAINT `users_approved_by_user_id_foreign` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'testuser','testuser@ecole.cm',NULL,'$2y$12$Qv1PFSOOnbXpU7De8Whg8OGKYlIfYmqNHsgUZtoMmqowJ1YzHNCMK',NULL,'2026-05-13 00:35:32','2026-05-13 00:35:32','ENSEIGNANT',1,NULL,NULL,NULL),
(2,'Administrateur','admin@ecole.test',NULL,'$2y$12$GceLicKovvkQgXplxhDdo.BzkRYJReOx7VXYabmEtlB.SNwiR.sX6',NULL,'2026-05-15 19:17:27','2026-05-15 19:17:27','admin',1,NULL,NULL,NULL),
(3,'teacher_test','teacher_test@ecole.local',NULL,'$2y$12$dc1/JcSVz2j6ROTJ8C7cMe.lwUYAO7ffB1jDEsDTpJFmksKt/LFHK',NULL,'2026-05-16 17:21:36','2026-05-16 18:48:38','ENSEIGNANT',1,'2026-05-16 18:48:38',NULL,NULL),
(4,'parent_test','parent_test@ecole.local',NULL,'$2y$12$WjErYlCj/ZA2tZMOxF.qlO6odtBgRRg7/YZwYCngH7.uKmdQPXeVG',NULL,'2026-05-16 17:21:38','2026-05-16 17:24:46','PARENT',1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `villes_naissance`
--

DROP TABLE IF EXISTS `villes_naissance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `villes_naissance` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `villes_naissance`
--

LOCK TABLES `villes_naissance` WRITE;
/*!40000 ALTER TABLE `villes_naissance` DISABLE KEYS */;
INSERT INTO `villes_naissance` VALUES
(1,'Libreville','2026-05-15 19:17:02','2026-05-15 19:17:02');
/*!40000 ALTER TABLE `villes_naissance` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16 20:03:39
