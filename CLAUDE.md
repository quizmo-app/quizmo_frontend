# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start Vite dev server on :5173
npm run build     # type-check (tsc -b) then production build via Vite
npm run lint      # eslint .
npm run preview   # preview the production build locally
```

There is no test suite configured in this project yet (no test runner in `package.json`).

The dev server proxies `/api/*` to a FastAPI backend expected at `http://localhost:8000` (see `vite.config.ts`). The backend base URL is otherwise read from `VITE_API_BASE_URL` (see `.env.example`), defaulting to `/api`. Set `VITE_API_MODE=mock` (in a `.env.local`, gitignored via `*.local`) to run the UI against in-memory mock repositories instead of the real backend — see Architecture below.

## Architecture

This is a React 19 + TypeScript + Vite single-page app using a hexagonal (ports & adapters) structure, matching the convention other feature branches in this codebase also follow:

- `src/app/` — the composition root. `App.tsx` renders the top-level page(s) and injects their adapters as props; `di/container.ts` picks each port's concrete implementation (mock vs. HTTP) based on `VITE_API_MODE` and exposes it as a single `container` object.
- `src/features/<feature>/` — one folder per business feature, each split into `domain/` (framework-free business logic: entities, repository ports, pure validation rules — no I/O, no React), `application/` (React hooks orchestrating the domain for a screen, taking an injected repository and returning the state/handlers a UI component needs), `infrastructure/` (adapters implementing the feature's port(s): an `Http…Repository` for the real backend and a `Mock…Repository` for `VITE_API_MODE=mock`, plus DTOs/mappers and HTTP-status → business-error mapping) and `ui/` (presentational components/pages plus the feature's own stylesheet, imported by the page component rather than globally). When adding a new backend call, follow this same shape: define the port in `domain/`, call it from an `application/` hook, implement it in `infrastructure/` (both HTTP and mock), never call `fetch` directly from a component.
  - `courses` (CU1.2 *Importer un cours PDF*): `CoursRepository` only exposes `importerCours` — the dashboard's course list (`useTableauDeBord`) is local state, not fetched from a server. Opening a course (`CoursList` → `ouvrirCours`) shows a deliberately minimal `CoursDetailPage` (title, version, page/quiz counts) whose only real action is hosting quiz creation; it is not the CU1.6 *Consulter et gérer ses cours* editor (no page thumbnails, no version history, no delete) — that is a separate, not-yet-built story.
  - `quiz` (CU1.3/CU1.4 *Créer un quiz*, QM-12): `QuizRepository.creerQuiz(idCours, NouveauQuiz)` posts a quiz to `/cours/{idCours}/quiz` as JSON (via the shared `apiPostJson`, not `apiPost`, which is for the FormData file uploads). Only the `QCM` and `LIBRE` question types are implemented — `RELIER` (points à relier) is listed as SHOULD and unconfirmed for this sprint in the QM-12 cahier de recette, so it was left out; add it the same way (a new case in `domain/Quiz.ts`'s `Question` union, `domain/validation.ts`, the two DTO mappers in `infrastructure/dto.ts`, and a `QuestionRelierForm` beside `QuestionQcmForm`/`QuestionLibreForm`) if the client confirms it. Client-side validation in `domain/validation.ts` mirrors the server's rules (`mapErreurQuiz.ts` parses the server's `{ details: [{ code, field? }] }` 400 shape as a defensive fallback, since the server re-validates everything per CA7). The duration bounds (`DUREE_MIN_SECONDES`/`DUREE_MAX_SECONDES` in `domain/validation.ts`) are provisional — the cahier de recette's reserves say the client hasn't fixed them yet. Reordering questions uses plain ↑/↓ buttons (`deplacerQuestion`), not drag-and-drop.
  - Known open reserve (from the QM-17 cahier de recette, not yet acted on): that spec's examples use `/api/v1/courses`, while QM-11/QM-12 (and this code) use `/api/cours` — not yet harmonized with the backend team.
- `src/shared/` — cross-feature primitives: `errors/ApiError` (raw transport error: HTTP status + body, thrown by `http/apiClient.ts`'s `apiPost`/`apiPostJson`), `errors/AppError` (business error with a `code`, thrown by repositories after mapping a transport error or a validation failure), `AsyncState<T>` (the `idle | loading | success | error` union used by `application/` hooks for request state), and `ui/Button` (the one shared primitive, wrapping the `btn--primary`/`btn--secondary`/`btn--accent` classes from `index.css`).
- `src/styles/tokens.css` — design tokens as CSS custom properties (color, type, spacing, radius, shadow), imported from `src/index.css`. There are two themes: a light "Tableau de bord" theme (default, teaching/prep screens) and a dark "Session live" theme (live quiz sessions), switched via `prefers-color-scheme` and overridable with `data-theme="light"`/`"dark"` on `:root`. Component styles should consume these tokens (`var(--brand)`, `var(--space-4)`, etc.) instead of hardcoded values. See [`docs/charte-graphique.md`](docs/charte-graphique.md) for the full graphic charter (every token's value and usage, voice/tone, the Kahoot/Razzia-inspired visual direction) before adding or changing UI styles.

### Naming convention

Code in this repo is written in French end-to-end — component names, function names, variables, and all user-facing strings (e.g. `validerTitre`, `gererEnvoi`, `ImportCoursForm`). Keep new code consistent with this convention rather than mixing in English identifiers.
