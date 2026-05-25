## school-backend (overlay)

Copie ces fichiers **dans la racine** d’un projet Laravel 11.

Le pack ajoute:
- Auth API (Sanctum)
- Middleware RBAC `role:*`
- Modèles + migrations:
  - Personnes, enseignants (1 matière), parents, élèves + pivot parent↔élève
  - Années / trimestres / salles / classes
  - Affectations enseignant↔classes
  - Épreuves / notes
  - Bulletins avec workflow (cachet directeur)
  - Paiements caisse + reçus
- Contrôleurs API (secrétaire / enseignant / admin / parent)

### Workflow inscription
- Secrétaire crée l’élève → `students.status = PENDING_PAYMENT`
- Secrétaire enregistre paiement → statut passe à `PAID`
- Admin valide → `ACTIVE` via `POST /api/admin/students/{student}/validate-enrollment`

### Autorisation fondateur (enseignants)
- Admin crée un enseignant → compte créé avec `is_active=false` (donc **connexion impossible**)
- Fondateur approuve → `POST /api/founder/teachers/{teacher}/approve` (active le compte)

Voir `INSTALL_PATCHES.md` pour les 2-3 modifications nécessaires dans un Laravel 11.

