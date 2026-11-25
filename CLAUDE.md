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

The dev server proxies `/api/*` to a FastAPI backend expected at `http://localhost:8000` (see `vite.config.ts`). The backend base URL is otherwise read from `VITE_API_BASE_URL` (see `.env.example`), defaulting to `/api`. Set `VITE_API_MODE=mock` (in a `.env.local`, gitignored via `*.local`) to run `importerCours` against `coursApiMock.ts` instead of the real backend — useful to work on the UI without a running backend. Typing "erreur" as the course title in that mode simulates a `BDD_INDISPONIBLE` failure.

## Architecture

This is a React 19 + TypeScript + Vite single-page app, structured by feature:

- `src/features/<feature>/` — one folder per business feature (currently only `cours`). Each feature folder holds its own components, and in this case a `validation.ts` for client-side form validation.
- `src/api/` — the HTTP layer. `http.ts` is a shared `apiPost` helper that wraps `fetch`, maps backend HTTP status codes to a closed set of French `ApiErrorCode`s (`TITRE_MANQUANT`, `FICHIER_TROP_VOLUMINEUX`, `FORMAT_NON_PDF`, `PDF_ILLISIBLE`, `NON_AUTHENTIFIE`, `BDD_INDISPONIBLE`, `ERREUR_INCONNUE`), and throws a typed `ApiError` carrying a default French user-facing message per code. Feature-specific API functions (e.g. `coursApi.ts`) call `apiPost` and translate the raw response into the feature's domain type. When adding a new backend call, follow this same pattern rather than calling `fetch` directly from a component. `coursApiMock.ts` is `coursApi.ts`'s in-memory stand-in for `VITE_API_MODE=mock` (see above); `coursApi.ts` branches to it at the top of `importerCours` rather than through a separate abstraction, since there is currently only one backend call to mock.
- `src/types/` — domain types shared across a feature (e.g. `Cours`).
- `src/styles/tokens.css` — design tokens as CSS custom properties (color, type, spacing, radius, shadow), imported from `src/index.css`. There are two themes: a light "Tableau de bord" theme (default, teaching/prep screens) and a dark "Session live" theme (live quiz sessions), switched via `prefers-color-scheme` and overridable with `data-theme="light"`/`"dark"` on `:root`. Component styles should consume these tokens (`var(--brand)`, `var(--space-4)`, etc.) instead of hardcoded values. See [`docs/charte-graphique.md`](docs/charte-graphique.md) for the full graphic charter (every token's value and usage, voice/tone, the Kahoot/Razzia-inspired visual direction) before adding or changing UI styles.

### Naming convention

Code in this repo is written in French end-to-end — component names, function names, variables, and all user-facing strings (e.g. `validerTitre`, `gererEnvoi`, `ImportCoursForm`). Keep new code consistent with this convention rather than mixing in English identifiers.
