## Backend – Gestion école primaire (Laravel + PostgreSQL)

Ce dossier contient **le code métier** (models/controllers/migrations/routes) du backend Laravel correspondant à ton projet:

- Auth API via **Laravel Sanctum**
- **RBAC** par rôles: `SECRETAIRE`, `DIRECTEUR`, `FONDATEUR`, `ENSEIGNANT`, `PARENT`
- École: années/trimestres/salles/classes, matières
- Enseignant: affectations à plusieurs classes (une seule matière par enseignant), évaluations, notes
- Bulletins: workflow **DRAFT → SUBMITTED → APPROVED → PUBLISHED** (cachet directeur avant visibilité parent)
- Finance: **caisse simple** (paiements + reçus), pas de compte bancaire

### Important (environnement Cursor)
Sur cette machine, `composer` n’est pas disponible, donc je ne peux pas installer Laravel automatiquement.
Tu peux toutefois **exporter ce dossier** et l’appliquer sur ta machine.

## Installation sur ta machine (recommandé)

### Pré-requis
- PHP 8.2+
- Composer
- PostgreSQL

### Étapes
1. Crée un projet Laravel:

```bash
composer create-project laravel/laravel backend
cd backend
```

2. Installe Sanctum:

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
```

3. Copie **le contenu** de `school-backend/` dans le projet Laravel (en écrasant/ajoutant les fichiers):

```bash
cp -R ../school-backend/* .
```

4. Configure PostgreSQL dans `.env` (exemple):

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ecole
DB_USERNAME=postgres
DB_PASSWORD=secret
```

5. Exécute les migrations + seed:

```bash
php artisan migrate
php artisan db:seed
```

6. Démarre:

```bash
php artisan serve
```

## API (résumé)
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Enseignant: `/api/teacher/*`
- Secrétaire: `/api/secretary/*`
- Admin (Directeur/Fondateur): `/api/admin/*`
- Parent: `/api/parent/*`

