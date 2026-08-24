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

## Component conventions

- One React component per `.tsx` file.
- Component props: `interface Props { ... }` above the component, never `type`; the component is
  declared `export const ComponentName: FC<Props> = (...) => ...` (`FC` with no type param when
  there are no props). Prefer `import type { FC } from 'react'`.
- `interface` over `type` for any object shape in this app (props, context values, API response
  shapes, etc.); keep `type` for unions, tuples, and other non-object aliases `interface` can't
  express (e.g. `export type Theme = 'light' | 'dark' | 'system'`).
- Exemption: `src/shared/ui/*` (shadcn-vendored primitives) keeps shadcn's own shape — several
  related sub-components and `function` declarations per file — so `shadcn` CLI updates stay a
  clean drop-in.
- No nested ternaries for conditional rendering (e.g. `cond1 ? a : cond2 ? b : c`). Use early
  `if` returns — inline in the component for one or two branches, or a `getContent`/similar helper
  function returning `ReactNode` for three or more branches. Extract a named component per branch
  when a branch's JSX is more than a couple of lines (see `pages/feeds/ui/FeedsPage.tsx` for the
  pattern: `FeedsLoadingState`, `FeedsErrorState`, `FeedsTable`).

## Filename case

- Component `.tsx` files use PascalCase matching the exported component name (e.g.
  `FeedCard.tsx`, `AddFeedButton.tsx`) — this overrides the repo-wide camelCase default and is
  enforced by an `apps/web/src/**/*.tsx` override in the root `.oxlintrc.json`. Non-component
  files (`.ts`, `index.ts` barrels) keep camelCase.
- Exempt from PascalCase (stay camelCase): `src/app/routes/**` (TanStack Router file-based
  routing names them), `src/main.tsx` and `src/app/providers/**` (entry/composition files, not
  components themselves), and `src/shared/ui/*` (shadcn-vendored primitives keep shadcn's own
  lowercase file names).

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
