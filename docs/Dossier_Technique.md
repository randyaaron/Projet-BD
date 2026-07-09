# Dossier Technique - Plateforme de Gestion Académique "Les Génies"

Ce dossier technique décrit l'architecture, l'organisation des fichiers, la configuration, et les procédures d'installation et de maintenance de la plateforme "Les Génies".

---

## 1. Architecture Globale et Schéma du Logiciel

La plateforme suit une architecture **Client-Serveur (SPA - Single Page Application)** avec séparation stricte entre le Frontend (interface utilisateur) et le Backend (API et base de données).

```mermaid
graph TD
    subgraph Frontend [Frontend (React + Vite)]
        UI[Interface Utilisateur]
        Router[React Router]
        State[State Management]
        API_Client[Legacy API Fetcher]
        
        UI --> Router
        Router --> State
        State --> API_Client
    end

    subgraph Backend [Backend (Laravel)]
        Routes[API Routes /api/legacy/*]
        Controllers[Contrôleurs Logiques]
        Middleware[Middleware d'Authentification]
        ORM[Query Builder / Eloquent]
        
        Routes --> Middleware
        Middleware --> Controllers
        Controllers --> ORM
    end

    subgraph Database [Base de Données]
        MySQL[(MySQL / MariaDB)]
    end

    API_Client -- "Requêtes HTTP (JSON) + X-Admin-Role" --> Routes
    ORM -- "Requêtes SQL" --> MySQL
```

### 1.1 Modules Principaux

Le système est divisé en trois grands espaces distincts, interconnectés via la même base de données centrale :

1. **Espace Administration** (`/admin/*`)
   - **Gestion Académique** : Configuration des années, trimestres, cycles, classes, salles, matières, et cours.
   - **Inscriptions** : Pré-inscriptions, validation, et assignation automatique des salles.
   - **Finances** : Historique des paiements de scolarité, reçus, gestion des impayés.
   - **Pédagogie** : Gestion des enseignants (titulaires), notes, impression des bulletins PDF (avec tampons et cachets).
   - **Sécurité** : Gestion des rôles (Fondateur, Directeur, Intendant, Secrétaire, Super Admin) avec restrictions d'accès dynamiques.

2. **Espace Enseignant** (`/teacher/*`)
   - **Classes assignées** : Vue restreinte aux seules classes où l'enseignant intervient.
   - **Saisie des présences et notes** : Interfaces optimisées pour l'appel quotidien et l'enregistrement des notes (incluant l'import/export Excel).
   - **Discipline** : Remontée d'informations comportementales.

3. **Espace Parent** (`/parent/*`)
   - **Suivi multi-enfants** : Centralisation des profils des différents enfants du même parent (liaison automatique via le matricule).
   - **Tableau de bord de suivi** : Consultation des présences, notes, bulletins, et état des paiements.

---

## 2. Organisation des Fichiers et Configuration

Le projet est divisé en deux répertoires principaux à la racine : `/backend-app` et `/fronted`.

### 2.1 Backend (Laravel)

*   **Dossier Principal** : `/backend-app`
*   **Fichiers Clés de Configuration** :
    *   `.env` : Contient les informations de connexion à la base de données (`DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`). C'est ici que l'on configure l'environnement (local ou production).
    *   `config/database.php` : Configuration détaillée des connexions SQL.
    *   `config/cors.php` : Gère les autorisations Cross-Origin (essentiel pour permettre au Frontend React de communiquer avec l'API).
*   **Routage** :
    *   `routes/api.php` : Définit tous les endpoints RESTful utilisés par le Frontend (sous le préfixe `/legacy/`).
*   **Logique Métier** :
    *   `app/Http/Controllers/Legacy/` : Contient les contrôleurs spécifiques (Auth, Élèves, Paiements, Bulletins, etc.).
    *   `app/Http/Middleware/EnsureLegacyAdminType.php` : Gère la sécurité et les autorisations basées sur les rôles (via les headers HTTP `X-Admin-Role`).

### 2.2 Frontend (React + Vite)

*   **Dossier Principal** : `/fronted`
*   **Fichiers Clés de Configuration** :
    *   `.env` : Variables d'environnement frontend (ex: `VITE_API_URL`).
    *   `vite.config.ts` : Configuration du bundler Vite, définition des alias, et des plugins React.
    *   `package.json` : Liste des dépendances npm (React, Lucide-react pour les icônes, Tailwind CSS, etc.) et scripts de lancement.
*   **Architecture des Composants** :
    *   `src/app/App.tsx` : Point d'entrée principal gérant le routage global et la persistance de la session de connexion.
    *   `src/app/components/admin/` : Composants de l'interface administrateur.
    *   `src/app/components/teacher/` : Composants de l'interface enseignant.
    *   `src/app/components/parent/` : Composants de l'interface parent.
    *   `src/app/lib/` : Fonctions utilitaires, notamment `legacyApi.ts` qui encapsule la logique d'appel API `fetch` avec l'injection des headers d'authentification.

---

## 3. Guide d'Installation et Déploiement

### 3.1 Prérequis

*   Serveur web (Apache ou Nginx).
*   PHP 8.2 ou supérieur (avec extensions PDO, Mbstring, OpenSSL, GD, etc.).
*   MySQL 8.0 ou MariaDB 10.4+.
*   Node.js (v18+) et npm/yarn.
*   Composer (Gestionnaire de paquets PHP).

### 3.2 Installation du Backend (Laravel)

1.  Ouvrir un terminal et naviguer dans le dossier du backend : `cd backend-app`
2.  Installer les dépendances PHP : `composer install`
3.  Créer le fichier de configuration : `cp .env.example .env`
4.  Générer la clé d'application : `php artisan key:generate`
5.  Configurer la base de données dans le fichier `.env` :
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=ecole2026_local
    DB_USERNAME=ecole
    DB_PASSWORD=peda2026
    ```
6.  Créer le lien symbolique pour le stockage public (essentiel pour les photos de profil, les cachets et tampons) :
    `php artisan storage:link`
7.  Démarrer le serveur de développement : `php artisan serve` (Le backend tourne par défaut sur le port `8000`).

### 3.3 Installation du Frontend (React)

1.  Ouvrir un nouveau terminal et naviguer dans le dossier frontend : `cd fronted`
2.  Installer les dépendances Node : `npm install`
3.  Vérifier que l'API URL est bien configurée dans `src/app/lib/legacyApi.ts` (ou via `.env`).
4.  Lancer le serveur de développement : `npm run dev` (Le frontend tourne généralement sur le port `5173`).

---

## 4. Maintenance et Sauvegardes

### 4.1 Sauvegarde de la Base de Données
Il est crucial de mettre en place une sauvegarde régulière (cron job) de la base de données MySQL :
```bash
mysqldump -u ecole -p ecole2026_local > backup_ecole_$(date +%F).sql
```

### 4.2 Nettoyage des Fichiers Temporaires
Les logs Laravel peuvent s'accumuler dans `/backend-app/storage/logs/`. Il est recommandé de configurer une rotation des logs dans `config/logging.php`.

### 4.3 Mise à Jour
Lors du déploiement de nouvelles fonctionnalités :
*   **Backend** : Exécuter `composer install --no-dev --optimize-autoloader` puis `php artisan migrate` pour appliquer les éventuelles modifications de base de données.
*   **Frontend** : Exécuter `npm run build` pour générer le dossier `/dist` optimisé pour la production. Copier le contenu de `/dist` à la racine publique de votre serveur web (ex: `/var/www/html`).
