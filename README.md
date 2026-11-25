# Quizmo Frontend

Application frontend du projet **Quizmo** développée avec [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) et [Tailwind CSS](https://tailwindcss.com/).

## Installation

```bash
npm install
```

## Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.
Les requêtes vers `/api/*` sont automatiquement redirigées vers `http://localhost:8000` (backend FastAPI).

> Par défaut (`VITE_API_MODE=mock`), **aucun appel réseau n'est effectué** : toutes les données proviennent d'un faux back-end en mémoire (`src/mocks/server`). Voir `.env.example`.

## Tests

```bash
npm test
```

## Build de production

```bash
npm run build
```

---

## Architecture (Clean Architecture par fonctionnalité)

```
src/
├── app/                         # Composition root
│   ├── App.tsx                  #   routeur + injection des adaptateurs dans les pages
│   ├── MockDevPanel.tsx         #   scénarios de démonstration (mode mock uniquement)
│   └── di/container.ts          #   choix mock / http (VITE_API_MODE)
├── features/
│   ├── courses/                 # ── CU1.2 Importer un cours PDF, tableau de bord ──
│   │   ├── domain/              #   Course, CourseRepository (port), listMyCourses,
│   │   │                        #   importCourse (cas d'usage + validation CU1.2)
│   │   ├── application/         #   useMyCourses, useImportCourse, useCourse (détail)
│   │   ├── infrastructure/      #   CoursDto, courseMapper, MockCourseRepository
│   │   └── ui/                  #   DashboardPage, CourseCard, ImportCourseForm, CourseDetailPage
│   ├── quiz/                     # ── CU1.3/CU1.4 Créer un quiz (QM-12) ──
│   │   ├── domain/              #   Quiz, Question (MCQ/OPEN), QuizRepository (port),
│   │   │                        #   validateQuiz (règles E1-E7 rejouées côté client)
│   │   ├── application/         #   useCreateQuiz (saisie, validation, soumission)
│   │   ├── infrastructure/      #   QuizDto (contrat QCM/LIBRE), MockQuizRepository
│   │   └── ui/                  #   CreateQuizForm, McqQuestionForm, OpenQuestionForm
│   ├── insertion/                # ── CU1.4 Insérer un quiz dans le cours (QM-13) ──
│   │   ├── domain/              #   Insertion, InsertionRepository (port), validation
│   │   ├── application/         #   useInsertQuiz
│   │   ├── infrastructure/      #   InsertionDto, MockInsertionRepository
│   │   └── ui/                  #   InsertQuizForm
│   └── auth/                    # Placeholder CU1.1 (cible de la redirection 401)
├── mocks/server/                # Faux back-end : API REST + CoursService + PostgreSQL simulés
└── shared/                      # Noyau partagé : AppError, AsyncState, ApiError→AppError, routes, UI de base
```

Règle de dépendance : `ui → application → domain ← infrastructure`. Le domaine ne dépend ni de React ni du réseau ; les pages reçoivent leurs ports par props depuis `app/App.tsx`.

### Brancher le vrai back-end

1. Créer `HttpCourseRepository` dans `infrastructure/` : appel HTTP → DTO → mapper existant, erreurs via `withAppErrors` (`shared/infrastructure/http/ApiError.ts`).
2. L'instancier dans `createDependencies()` quand `VITE_API_MODE=http`.

Aucune modification n'est nécessaire dans `domain/`, `application/` ni `ui/`.

## Charte graphique

La charte est décrite dans [`docs/charte-graphique.md`](docs/charte-graphique.md) et implémentée dans [`src/styles/tokens.css`](src/styles/tokens.css) :

- couleurs exposées à Tailwind (`bg-surface-200`, `text-ink`, `bg-brand`, `bg-accent`…) ; thème clair par défaut, thème « Session live » via `data-theme="live"` (mode présentation) ;
- espacements consommés par variable : `p-(--space-4)`, `gap-(--space-2)`… ;
- rayons `rounded-sm|md|lg|full`, ombres `shadow-card|stage|podium` ;
- styles typographiques `typo-display-xl`, `typo-code-lg`, `typo-display-lg`, `typo-h2`, `typo-body`, `typo-body-small`, `typo-label`, `typo-button` ;
- polices Fredoka et Poppins servies localement (`@fontsource`).

## CU1.2 — scénarios mock

| Action                                   | Scénario couvert                                   |
| ----------------------------------------- | --------------------------------------------------- |
| Importer un cours, titre et PDF valides   | 201 ; le cours apparaît dans le tableau de bord     |
| Titre vide                                | 400 → message « Veuillez saisir le titre du cours » |
| Fichier non PDF                           | 415 → message de format                              |
| Fichier de plus de 50 Mo                  | 413 → message de taille                              |
| Titre « illisible »                       | 422 → simule un PDF illisible/chiffré                |
| Titre « erreur »                          | 503 → simule une base de données indisponible        |
| Panneau mock « Expirer la session »       | 401 → redirection vers la connexion (CU1.1)          |

## CU1.3/CU1.4 — créer un quiz (« Gérer » sur une carte → « Insérer un quiz »)

| Action                                              | Scénario couvert                                           |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Quiz avec titre, position et une question valides    | Créé et inséré ; le compteur « N quiz » du cours augmente   |
| Aucune question                                      | 400 → « Un quiz doit contenir au moins une question. »      |
| QCM à moins de 2 ou plus de 8 options                | 400 → message sur le nombre d'options                        |
| QCM sans bonne réponse / plusieurs sans choix multiple | 400 → message dédié, question encadrée en rouge             |
| Question libre notée sans réponse acceptée           | 400 → message dédié                                          |
| Position hors du cours (page > nombre de pages)      | 400 → « La position choisie est hors du cours. »             |
| Annuler avec du contenu saisi                        | Confirmation demandée avant de fermer sans enregistrer        |

Seuls les types QCM et réponse libre sont implémentés (« points à relier » reste SHOULD, non confirmé pour ce sprint).

Le bouton « Présenter » de chaque carte renvoie vers `/cours/:id/presenter` (CU2.1, branche `feature/CU2.1`) : cette route n'est pas définie ici, le routeur revient au tableau de bord. Cette branche couvre CU1.2 et CU1.3/CU1.4.
