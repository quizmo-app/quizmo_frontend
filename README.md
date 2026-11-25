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
│   ├── courses/                 # Tableau de bord (point d'entrée « Présenter » et de retour)
│   └── auth/                    # Placeholder CU1.1 (cible de la redirection 401)
├── mocks/server/                # Faux back-end : API REST + CoursService + PdfService + PostgreSQL simulés
└── shared/                      # Noyau partagé : AppError, AsyncState, ApiError→AppError, routes, UI de base
```

Règle de dépendance : `ui → application → domain ← infrastructure`. Le domaine ne dépend ni de React ni du réseau ; les pages reçoivent leurs ports par props depuis `app/App.tsx`.

### Brancher le vrai back-end

1. Créer `HttpPresentationRepository` / `HttpCourseRepository` dans `infrastructure/` : appel HTTP → DTO → mapper existant, erreurs via `withAppErrors` (`shared/infrastructure/http/ApiError.ts`).
2. Les instancier dans `createDependencies()` quand `VITE_API_MODE=http`.

Aucune modification n'est nécessaire dans `domain/`, `application/` ni `ui/`.

## Charte graphique

La charte est décrite dans [`charte-graphique.md`](charte-graphique.md) et implémentée dans [`src/styles/tokens.css`](src/styles/tokens.css) :

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
