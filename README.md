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
│   ├── course-presentation/     # ── CU2.1 Présenter un cours ──
│   │   ├── domain/              #   PresentationPlan, PresentationRepository (port),
│   │   │                        #   presentationMachine (Figure 4), planQueries, useCases
│   │   ├── application/         #   usePresentation (cycle de vie), useCoursePage (chargement + préchargement)
│   │   ├── infrastructure/      #   DTO de l'API, mappers DTO → domaine, MockPresentationRepository
│   │   └── ui/                  #   PresentationPage, composants (toolbar, sommaire, quiz, leaderboard…), hooks clavier
│   ├── courses/                 # ── CU1.2 Importer un cours PDF · QM-17 Consulter et gérer ses cours ──
│   │   ├── domain/              #   Course (états du cours), CourseStructure (positions des quiz),
│   │   │                        #   CourseRepository + PageThumbnailRenderer (ports), useCases, importCourse
│   │   ├── application/         #   useMyCourses, useImportCourse, useCourse, useCourseEditor,
│   │   │                        #   useCourseDeletion, usePageThumbnail
│   │   ├── infrastructure/      #   CoursDto, courseMapper, structureMapper, MockCourseRepository
│   │   └── ui/                  #   DashboardPage, CourseCard, ImportCourseForm, CourseDetailPage,
│   │                            #   editor/CourseEditorPage, DeleteCourseDialog
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
├── mocks/server/                # Faux back-end : API REST + CoursService + PdfService + PostgreSQL simulés
└── shared/                      # Noyau partagé : AppError, AsyncState, ApiError→AppError, routes, UI de base
```

Règle de dépendance : `ui → application → domain ← infrastructure`. Le domaine ne dépend ni de React ni du réseau ; les pages reçoivent leurs ports par props depuis `app/App.tsx`.

### Brancher le vrai back-end

1. Créer `HttpPresentationRepository` / `HttpCourseRepository` / `HttpQuizRepository` / `HttpInsertionRepository` dans `infrastructure/` : appel HTTP → DTO → mapper existant, erreurs via `withAppErrors` (`shared/infrastructure/http/ApiError.ts`).
2. Les instancier dans `createDependencies()` quand `VITE_API_MODE=http`.

Aucune modification n'est nécessaire dans `domain/`, `application/` ni `ui/`.

## Charte graphique

La charte est décrite dans [`docs/charte-graphique.md`](docs/charte-graphique.md) et implémentée dans [`src/styles/tokens.css`](src/styles/tokens.css) :

- couleurs exposées à Tailwind (`bg-surface-200`, `text-ink`, `bg-brand`, `bg-accent`…) ; thème clair par défaut, thème « Session live » via `data-theme="live"` (mode présentation) ;
- espacements consommés par variable : `p-(--space-4)`, `gap-(--space-2)`… ;
- rayons `rounded-sm|md|lg|full`, ombres `shadow-card|stage|podium` ;
- styles typographiques `typo-display-xl`, `typo-code-lg`, `typo-display-lg`, `typo-h2`, `typo-body`, `typo-body-small`, `typo-label`, `typo-button` ;
- polices Fredoka et Poppins servies localement (`@fontsource`).

## CU2.1 — scénarios mock

| Cours / action                          | Scénario couvert                                               |
| --------------------------------------- | -------------------------------------------------------------- |
| Algorithmique — Les algorithmes de tri  | Nominal : 12 pages, 2 quiz, 2 leaderboards intercalés          |
| Réseaux — Le modèle OSI                 | Présentation déjà active → reprise à la dernière page          |
| Bases de données — Introduction à SQL   | Plan sans insertion                                            |
| Web — Le protocole HTTP                 | Coupure réseau au 1er chargement de la page 3 → « Interrompue » |
| Java — POO (2024)                       | Cours archivé → refus                                          |
| Sécurité — Cryptographie appliquée      | PDF indisponible → refus                                       |
| Panneau mock « 403 » / « 404 »          | Autre propriétaire / cours introuvable → refus                 |
| Panneau mock « Expirer la session »     | 401 → redirection vers la connexion (CU1.1), puis retour       |
| DevTools › Network › Offline            | Coupure réseau réelle → « Interrompue », reprise au retour     |

Raccourcis : `→`/`Espace`/`Page suiv.` suivant · `←`/`Page préc.` précédent · `Début`/`Fin` · chiffres + `Entrée` aller à l'élément n · `P` sommaire · `Échap` terminer.

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

## CU1.3/CU1.4 — créer un quiz (« Ajouter un quiz » sur une carte ou dans l'éditeur → « Insérer un quiz »)

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

## CU1.4 — insérer un quiz existant (QM-13)

| Action                                               | Scénario couvert                                        |
| ----------------------------------------------------- | -------------------------------------------------------- |
| Identifiant de quiz et position valides               | Inséré ; le compteur « N quiz » du cours augmente         |
| Identifiant « invalide » ou vide                      | 422 → « Quiz invalide »                                   |
| Identifiant « version-archivee »                      | 409 → « Version non courante »                            |
| Identifiant déjà inséré dans le cours                 | 409 → « Quiz déjà inséré »                                 |
| Position hors du cours (page > nombre de pages)       | 400 → « La position choisie est hors du cours. »          |

Il n'existe pas encore de catalogue des quiz non insérés d'un cours : le champ identifiant est une saisie libre.

Le bouton « Présenter » de chaque carte renvoie vers `/cours/:id/presenter`.

## QM-17 — Consulter et gérer ses cours

| Écran | Étapes du dossier | Route |
| --- | --- | --- |
| Tableau de bord | EF-01 (liste, version active, nb quiz) · EF-07 (suppression confirmée) · import CU1.2 | `/tableau-de-bord` |
| Éditeur de cours | EF-03 (miniatures + emplacements) · EF-06 (enregistrer) · EF-07 | `/cours/:id/editer` |
| Ajouter un quiz | Miniatures pour choisir la page · création (CU1.3) ou insertion d'un quiz existant (CU1.4) | `/cours/:id` |

Contrats d'API supposés (`features/courses/infrastructure/CourseDto.ts`) :
`GET /api/v1/courses` ·
`GET /api/v1/courses/{id}/structure` ·
`PUT /api/v1/courses/{id}/structure` (`{positions: [{id, after_page, ordre}]}`) · `DELETE /api/v1/courses/{id}` → 204.

### Scénarios mock

| Cours / action | Scénario couvert |
| --- | --- |
| Algorithmique — tris (12 pages, 2 quiz, 2 classements) | Déplacement des quiz et enregistrement de la structure |
| Réseaux — OSI | En séance : verrouillé (lecture seule, suppression refusée — 409) |
| Bases de données — SQL | « Sans quiz » (état Initialisé) |
| Java — POO (2024) | Archivé : lecture seule (hypothèse) |

Les cours modifiés sont conservés dans `localStorage` (« Réinitialiser les données » restaure les fixtures).

### Hypothèses prises (à valider)

- **Nouvelle version du PDF (EF-04 / EF-05)** : hors périmètre ; l'import d'un nouveau cours est couvert par CU1.2 ci-dessus.
- **Miniatures** : le dossier prévoit PDF.js ; le mock rend des pages générées via le port `PageThumbnailRenderer`. Brancher un adaptateur PDF.js (ou une URL de miniature serveur) sans toucher l'UI.
- **Endpoint de lecture de la structure** (`GET …/structure`) : non nommé dans le diagramme de séquence, supposé.
- **Positions** : un quiz est placé après une page entre 0 et N, 0 signifiant « avant la première page » — la règle de la création de quiz (CU1.3/CU1.4) et de la présentation (CU2.1), alors que le diagramme d'états de QM-17 dit « entre les pages 1..N » (réserve à faire trancher) ; plusieurs quiz sur la même page sont ordonnés par `ordre`.
- **Verrouillage** : pendant une séance, déplacement et suppression sont refusés (409 `COURS_VERROUILLE`) ; un cours archivé est en lecture seule mais reste supprimable.
- **Création d'un quiz** : depuis l'éditeur, « Ajouter un quiz » mène à la page CU1.3/CU1.4 ; l'éditeur lui-même ne fait que déplacer les insertions existantes. La modification du contenu d'un quiz (CU3.1) reste hors périmètre.
- **Codes d'erreur** : 409 cours verrouillé, 422 position invalide, 401 session expirée, 403 / 404 cours inaccessible.
- **Purge RGPD** : côté front, seule la confirmation est gérée ; la purge des résultats est la responsabilité du back-end.
