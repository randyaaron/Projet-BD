# Projet-BD — Portail Numérique Scolaire « Les Génies »

Application web de gestion scolaire complète pour l'École Primaire Les Génies, développée dans le cadre du cours de Bases de Données (3GI — ENSPY 2025/2026).

---

## 🌐 Liens de déploiement

| Espace | URL |
|--------|-----|
| Login + Admin | https://projet-bd-les-genies.vercel.app |
| Espace Enseignant | https://projet-bd-ffvz.vercel.app |
| Espace Parent | https://admin-interface-design.vercel.app |
| Backend API | https://projet-bd-8agb.onrender.com |

---

## 🔐 Identifiants de test

### Administrateur
| Identifiant | Mot de passe |
|-------------|--------------|
| admin_test | password123 |

### Enseignants
| Identifiant | Mot de passe | Classe |
|-------------|--------------|--------|
| prof601 | prof123 | SIL |
| prof602 | prof123 | CP |
| prof603 | prof123 | CP |
| prof604 | prof123 | CP |
| prof605 | prof123 | CP |

### Parents
| Identifiant | Mot de passe | Enfant |
|-------------|--------------|--------|
| parent501 | parent123 | KAMWA Junior (ELV001) |
| parent502 | parent123 | NGUELE Sophie (ELV002) |
| parent503 | parent123 | TALLA Marc (ELV003) |
| parent504 | parent123 | MBARGA Alice (ELV004) |
| parent505 | parent123 | DJOKO Paul (ELV005) |

---

## 🏗️ Architecture du projet
Projet-BD/
├── backend-app/          # API Laravel (PHP 8.3)
└── fronted/
├── src/              # Interface Admin + Login (Vite/React)
├── teacher-page-design/   # Espace Enseignant (Next.js)
└── admin-interface-design/ # Espace Parent (Next.js)

---

## ⚙️ Installation locale

### Prérequis
- Node.js 18+
- PHP 8.3+
- Composer
- pnpm

### 1. Cloner le repo
```bash
git clone https://github.com/randyaaron/Projet-BD.git
cd Projet-BD
```

### 2. Backend Laravel
```bash
cd backend-app
composer install
cp .env.example .env
# Remplir les variables DB dans .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### 3. Frontend (depuis le dossier fronted/)
```bash
cd fronted
pnpm install
pnpm dev:hot
```

Les trois interfaces démarrent simultanément :
- Admin/Login → http://localhost:5173
- Enseignant → http://localhost:3001
- Parent → http://localhost:3002

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 13 (PHP 8.3) |
| Frontend Admin | Vite + React + TypeScript |
| Frontend Enseignant | Next.js 16 |
| Frontend Parent | Next.js 16 |
| Base de données | MySQL |
| Hébergement Backend | Render (Docker) |
| Hébergement Frontend | Vercel |
| UI Components | shadcn/ui + Tailwind CSS |

---

## 📋 Fonctionnalités

### Espace Admin
- Tableau de bord avec statistiques globales
- Gestion des élèves (inscriptions, profils)
- Gestion académique (classes, salles, titulaires)
- Pédagogie (cours, emplois du temps, épreuves, notes)
- Suivi (présences, discipline)
- Gestion financière (paiements, impayés)
- Communication (messagerie)
- Administration système (utilisateurs, configuration)

### Espace Enseignant
- Tableau de bord avec statistiques de classe
- Liste et profils des élèves
- Saisie des absences
- Gestion des devoirs et évaluations
- Saisie des notes
- Emploi du temps

### Espace Parent
- Tableau de bord avec suivi des enfants
- Carnet de notes
- Suivi des présences
- Consultation des bulletins PDF
- Suivi financier
- Messagerie

## 📚 Contexte académique

- **Établissement** : École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)
- **Département** : Génie Informatique
- **Niveau** : 3GI
- **Année académique** : 2025/2026