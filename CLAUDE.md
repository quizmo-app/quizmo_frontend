# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start Vite dev server on :5173
npm run build     # type-check (tsc -b) then production build via Vite
npm run lint      # eslint .
npm run preview   # preview the production build locally
npm test          # run Vitest once
npm run test:watch
```

Tests are plain Vitest (`src/**/*.test.ts`, Node environment, no DOM/testing-library) and cover pure domain logic only (e.g. `src/features/courses/domain/validation.test.ts`, `src/features/quiz/domain/validation.test.ts`).

By default (`VITE_API_MODE=mock`, see `.env.example`), the app makes **no network calls at all**: every repository talks to `src/mocks/server/MockServer.ts`, an in-memory fake backend (fixtures, simulated latency, session persisted in `localStorage`). The dev server's `/api/*` proxy to `http://localhost:8000` (see `vite.config.ts`) only matters once `VITE_API_MODE=http` and an `Http*Repository` is implemented — neither exists yet (see Architecture).

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS v4, in a hexagonal (ports & adapters) structure **shared with the other feature branches** (originally built on `feature/CU2.1`) — keep this shape and these conventions when extending any feature, rather than reverting to a flatter layout:

- **Naming**: identifiers (types, functions, components) are in **English** (`Course`, `Quiz`, `createQuiz`); comments and all user-facing strings are in **French**, following `charte-graphique.md`'s voice (vouvoiement, say what to do, no apology, name things the way the teacher sees them).
- **Alias**: `@/*` resolves to `src/*` (`tsconfig.app.json` + `vite.config.ts`). Prefer `@/shared/...`, `@/features/...` over long relative paths once you leave a feature's own subtree.
- `src/app/` — composition root. `App.tsx` builds a `react-router` `createBrowserRouter` and injects the mock/HTTP adapters (from `di/container.ts`) as props into each route's page. `MockDevPanel.tsx` is an optional `footer` slot on `DashboardPage`, only wired when `devTools` exists (mock mode).
- `src/features/<feature>/` — one folder per business feature, split into:
  - `domain/` — entities, repository ports (interfaces), and plain use-case functions (`listMyCourses`, `importCourse`, `validateQuiz`) that hold real business rules (sorting, client-side validation mirroring the server). No React, no `fetch`, no `@/mocks` import.
  - `application/` — hooks (`useMyCourses`, `useImportCourse`, `useCourse`, `useCreateQuiz`) that call a domain use-case, hold `AsyncState`, and expose what a page needs. One hook per screen/action, not one mega-hook per feature.
  - `infrastructure/` — DTOs (snake_case or French field names, the assumed wire shape) + a pure mapper function + `mock/Mock<X>Repository.ts` implementing the port against `MockServer`, wrapped in `withAppErrors(...)`. An `Http<X>Repository` goes here too once the backend contract is confirmed; nothing in `domain/`, `application/` or `ui/` changes when it's added.
  - `ui/` — pages and components, styled with Tailwind utilities (no per-feature `.css` files) referencing the charte's tokens (`bg-surface-200`, `text-ink`, `p-(--space-4)`, `typo-h2`, …).
  - `courses` (CU1.2 *Importer un cours PDF* + QM-17 *Consulter et gérer ses cours*, merged from `feature/consultation-gestion-cours`): `DashboardPage` (import, and per card: Présenter / Ouvrir / Ajouter un quiz / Supprimer), `CourseEditorPage` (route `/cours/:courseId/editer`: page thumbnails via the `PageThumbnailRenderer` port, move quiz/leaderboard insertions with `CourseStructure`'s pure rules, save via `saveStructure`, delete via `deleteCourse` + `DeleteCourseDialog`), and `CourseDetailPage` (route `/cours/:courseId`, the "Ajouter un quiz" page: same thumbnails to pick the page, then the quiz create/insert forms). Insertion positions are **0..N** everywhere (0 = before the first page), matching quiz creation and CU2.1's `orderPlanElements` — QM-17's state diagram says 1..N, an open reserve. `MockServer` persists courses to `localStorage` (`quizmo.mock.courses`), so every mutating mock method must call `persistCourses()`.
  - `quiz` (CU1.3/CU1.4 *Créer un quiz*, QM-12): `QuizRepository.createQuiz(courseId, NewQuiz)` creates a quiz and inserts it after a chosen page in one call — `MockServer.createQuiz` re-validates everything server-side (CA7) and appends a `MockInsertion` (`type: 'QUIZ'`) to the course, computing `ordre` among existing insertions at the same `apresPage`. Only `MCQ` and `OPEN` question types are implemented (domain `Question` union) — a `RELIER` ("points à relier") type is listed as SHOULD and unconfirmed for this sprint in the QM-12 cahier de recette; add it the same way (a new case in `domain/Quiz.ts`, `domain/validation.ts`, the DTO mappers in `infrastructure/QuizDto.ts`, `MockServer.validateQuestionDto`, and a `RelierQuestionForm` beside `McqQuestionForm`/`OpenQuestionForm`) if the client confirms it. The wire DTO (`QuizDto.ts`) keeps the French contract vocabulary (`type: 'QCM' | 'LIBRE'`, `configuration.choixMultiple`, …) the cahier de recette and dossier de conception specify, even though the domain types are in English — see `toNewQuizDto`/`toQuiz`. Reordering questions uses plain ↑/↓ buttons (`moveQuestion`), not drag-and-drop. Duration bounds (`MIN_DURATION_SECONDS`/`MAX_DURATION_SECONDS`) are provisional per the cahier de recette's reserves.
  - `insertion` (CU1.4 *Insérer un quiz dans le cours*, QM-13): `InsertionRepository.insertQuiz(courseId, NewInsertion)` places an **already-created** quiz (by id) after a chosen page — a separate flow from `quiz.createQuiz`'s combined create-and-insert, kept side by side because QM-12 and QM-13 are not reconciled (see reserve below). There is no catalogue of a course's not-yet-inserted quizzes, so the "Insérer un quiz existant" form on `CourseDetailPage` just takes a free-text quiz id; `MockServer.insertQuiz` simulates `QUIZ_INVALID`/`VERSION_NOT_CURRENT` by magic id (`"invalide"`, `"version-archivee"`) and `QUIZ_ALREADY_INSERTED` by checking if that id is already one of the course's insertions.
  - Known open reserves (not yet acted on): (QM-17) that cahier de recette's examples use `/api/v1/courses`, while QM-11/QM-12 (and this code) use `/api/cours`; (QM-12 vs QM-13) `quiz.createQuiz` and `insertion.insertQuiz` both insert a quiz into a course but via different wire codes for the same situations (QM-12's `POSITION_INVALIDE` vs QM-13's `PAGE_INVALIDE`, etc.) — `ApiError.ts`'s lookup table maps both to the same `AppErrorCode`, but the two flows are not otherwise unified.
- `src/mocks/server/MockServer.ts` — the single in-memory fake backend shared by every feature's mock repository (not one mock per feature); owns `fixtures.ts`, simulates latency/failures, persists the session to `localStorage`, throws `ApiError(status, code)`. `importCourse` and `createQuiz` simulate extra scenarios by **title** (`"illisible"` → 422, `"erreur"` → 503), since there's no real PDF parsing yet.
- `src/shared/` — cross-feature kernel:
  - `domain/AppError.ts` — the single `AppErrorCode` union + default French messages, extended (not duplicated) whenever a feature needs a new code; `AppError.from(error)` normalizes anything to an `AppError`.
  - `domain/AsyncState.ts` — `idle | loading | success | empty | error`, used by every `application/` hook (a single-resource hook like `useCourse` never actually reaches `empty`, but must still handle it for exhaustiveness — see `CourseDetailPage`).
  - `infrastructure/http/ApiError.ts` — `ApiError` (transport: status + wire code) and `toAppError`/`withAppErrors`. A wire `code` is checked first, against the `APP_ERROR_CODE_PAR_CODE_FIL` lookup table (one entry per backend error code across every feature); only a `code` not in that table falls back to a plain HTTP-status default. Add a new feature's error codes there, not as more `if` statements.
  - `routing/paths.ts` — every route path as one object (`paths.dashboard`, `paths.course`, `paths.login`, `paths.presentation`), plus `safeRedirect` and `FlashState`. A route's literal pattern (`/cours/:courseId`) is still written by hand in `App.tsx`'s router config — `paths.course(':courseId')` would URL-encode the `:`.
  - `ui/Button.tsx`, `ui/Spinner.tsx`, `ui/Wordmark.tsx`, `ui/fullscreen.ts` — the only shared UI primitives; everything else is feature-local.
- `src/styles/tokens.css` — the charte's tokens as CSS custom properties, exposed to Tailwind via `@theme inline` (colors, so they follow `[data-theme]`) and `@theme` (fonts/radii/shadows), plus hand-written `@utility typo-*` classes. Two themes: light "Tableau de bord" (`:root`, default) and dark "Session live" (`[data-theme='live']`, for the live/projected screen — not an OS `prefers-color-scheme` switch). Fonts are self-hosted via `@fontsource/*` (imported in `main.tsx`), not a Google Fonts `<link>`. Full charter: [`docs/charte-graphique.md`](docs/charte-graphique.md).

### Known gaps / out of scope here

- No `Http*Repository` yet — `createDependencies()` throws if `VITE_API_MODE` isn't `"mock"`.
- `CourseCard`'s "Présenter" button links to `paths.presentation(id)`, a route only defined on `feature/CU2.1`; here it falls through the router's catch-all back to the dashboard.
- No listing of a course's existing (not-yet-inserted) quizzes — "Insérer un quiz existant" takes a free-text id. No new PDF version upload (EF-04/EF-05).
- The `PUT …/structure` wire code `POSITION_INVALIDE` (422) collides with QM-12's `POSITION_INVALIDE` (400); `ApiError.ts` disambiguates by status via `APP_ERROR_CODE_PAR_STATUT_ET_CODE`.
