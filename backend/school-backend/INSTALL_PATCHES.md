## Intégration dans un projet Laravel 11

Après avoir créé un projet Laravel (`composer create-project laravel/laravel backend`) et copié le contenu de `school-backend/` à la racine de ton projet, fais ces 3 ajustements.

### 1) Installer Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
```

### 2) Activer l’auth Sanctum pour l’API

Dans `config/auth.php`, assure-toi que le guard `sanctum` est disponible (Laravel le fournit déjà).

### 3) Déclarer l’alias middleware `role`

Dans `bootstrap/app.php`, ajoute l’alias `role`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureRole::class,
    ]);
})
```

### 4) Migrations / seed

```bash
php artisan migrate
php artisan db:seed
```

Le seeder crée un compte directeur par défaut (modifiable dans `.env`):
- Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (défaut `admin@ecole.local` / `password123`)
- Directeur: `DIRECTEUR_EMAIL` / `DIRECTEUR_PASSWORD` (défaut `directeur@ecole.local` / `password123`)
- Fondateur: `FONDATEUR_EMAIL` / `FONDATEUR_PASSWORD` (défaut `fondateur@ecole.local` / `password123`)
- Secrétaire: `SECRETAIRE_EMAIL` / `SECRETAIRE_PASSWORD` (défaut `secretaire@ecole.local` / `password123`)

