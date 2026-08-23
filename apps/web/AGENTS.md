# apps/web

Client-only SPA (ADR 004): Vite + React + TanStack Router + Query, structured per
Feature-Sliced Design (see the `feature-sliced-design` skill before adding slices/layers). Calls
`apps/api` exclusively over REST via `src/lib/apiClient.ts` — never imports `@feed-plex/database`
or talks to Redis/Postgres directly, even for SSR if that's added later.

## Commands

- Dev: `pnpm --filter @feed-plex/web dev`
- Build: `pnpm --filter @feed-plex/web build`
- Preview production build: `pnpm --filter @feed-plex/web start`
- Typecheck: `pnpm --filter @feed-plex/web typecheck`
- Test / coverage: `pnpm --filter @feed-plex/web test`, `... test:coverage`

## Env

Only `VITE_API_URL` (e.g. `http://localhost:3000/api`) — Vite exposes only `VITE_`-prefixed vars
to client code.

## Routing

The `app` layer (`src/app/`) owns app-wide setup and routing. File-based routes live under
`src/app/routes/`; the tree is generated to `src/app/routeTree.gen.ts` by the
`@tanstack/router-plugin` Vite plugin on `dev`/`build` and is committed to git as runtime source
— **never hand-edit it**, regenerate by running `dev` or `build`. The plugin's `.tanstack/` tmp
dir is gitignored.

## Boundary / lint exemptions

The `react` oxlint plugin is enabled here only (`react/rules-of-hooks` error,
`react/only-export-components` warn); `react/react-in-jsx-scope` is off since the app uses the
automatic JSX runtime. `src/app/routes/**` is additionally exempt from `unicorn/filename-case`
and `react/only-export-components` — TanStack Router's file-based routing mandates names
(`__root.tsx`, `$param` segments) and a per-route `Route` export that don't fit those rules
elsewhere.

## Testing quirk

Runs under `jsdom` (other apps use `node`) with `@testing-library/react`/`jest-dom`, loaded via
`test.setupFiles` (`src/testSetup.ts`).
