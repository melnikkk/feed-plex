---
description: Fix dead code reported by knip. Pass knip section names to restrict scope; omit to fix every auto-fixable category (excludes report-only).
allowed-tools: Bash(pnpm knip:*), Bash(pnpm -r:*), Bash(pnpm --filter:*), Bash(pnpm -C:*), Bash(pnpm remove:*), Bash(pnpm lint:*), Bash(pnpm format:*), Bash(pnpm test:*), Bash(pnpm build:*), Bash(grep:*), Bash(rm:*), Bash(git status:*), Bash(git restore:*), Read, Edit
argument-hint: "[Unused exports, Unused files, ...]"
---

Pass knip section names (from the table below) to restrict scope; omit arguments to fix **every auto-fixable category** (see Step 2).

**Examples:**
- `/knip-fix` — fix every auto-fixable category (see Step 2)
- `/knip-fix Unused files` — unused files only
- `/knip-fix Unused exports, Unused exported types, Unused exported enum members` — all export-related

| knip section | JSON key |
|---|---|
| Unused files | `files` |
| Unused dependencies | `dependencies` |
| Unused exports | `exports` |
| Unused exported types | `types` |
| Unused exported enum members | `enumMembers` |
| Unused exported namespace members | `namespaceMembers` |
| Unused catalog entries | `catalog` |
| Unlisted dependencies | `unlisted` |
| Unlisted binaries | `binaries` |
| Unresolved imports | `unresolved` |
| Duplicate exports | `duplicates` |
| Exports in used namespace | `nsExports` |
| Exported types in used namespace | `nsTypes` |

---

## Step 1 — Get the knip report

**Stop condition (check first):** run `git status --porcelain`. If it prints **any** output, the tree is dirty — stop immediately and ask the user to commit or stash. Do not proceed past this line. This command deletes files with `rm` and `git restore` is the only undo, which works solely from a clean baseline.

```bash
git status --porcelain
```

Then get the report. `knip` is a pinned root devDependency with a `knip.json` config (workspace entry points + `pino-pretty`/`.agents/**` false-positive suppressions already tuned in), run via the root script:

```bash
pnpm knip --reporter json
```

Find the JSON line in stdout (the only line that starts with `{`). Parse it. **Record the full `files` set now** (flatten every `files[].name` across all issues), even when `files` is not a targeted category — Step 3b diffs against this baseline to detect files newly orphaned by your deletions. The auto-fixable issue fields are below; report-only keys carry the same `{ name }` shape.

```json
{
  "issues": [
    {
      "file": "apps/web/src/...",
      "files":            [{ "name": "apps/web/src/..." }],
      "dependencies":     [{ "name": "lodash" }],
      "exports":          [{ "name": "Symbol",    "line": 3,  "col": 10 }],
      "types":            [{ "name": "MyType",    "line": 6,  "col": 18 }],
      "enumMembers":      [{ "name": "MyMember",  "line": 12, "col": 3  }],
      "namespaceMembers": [{ "name": "MyMember",  "line": 20, "col": 3  }],
      "catalog":          [{ "name": "pkg-name" }]
    }
  ]
}
```

## Step 2 — Determine target categories

`$ARGUMENTS` is a comma-separated list of knip section names (e.g. `"Unused files, Unused exports"`).

Parse: split by comma, trim each token, normalise (lowercase, strip spaces/dashes/underscores), look up the JSON key from the table above.

**Auto-fixable:** `files`, `dependencies`, `exports`, `types`, `enumMembers`, `namespaceMembers`, `catalog`
**Report-only (never auto-fixed):** the remaining table keys (`unlisted`, `binaries`, `unresolved`, `duplicates`, `nsExports`, `nsTypes`)

If `$ARGUMENTS` is empty, target every auto-fixable category. If a parsed token maps to a report-only key, note it and skip.

Flatten the issues array into per-category lists:
- `files` → each `files[].name` is the path of the unused file
- `dependencies` → each `dependencies[].name` is a package name; the parent `file` is the `package.json` that declares it — root `package.json` or an `apps/*/package.json` / `packages/*/package.json`
- `catalog` → each `catalog[].name` is an entry name under the `catalog:` key in `pnpm-workspace.yaml` (this repo has no `catalog:` block today — if this category fires, one exists now)
- `exports` / `types` / `enumMembers` / `namespaceMembers` → `{ file, name, line }` from parent issue + item fields

## Step 3 — Verify and fix

**Verification model.** Every category fixes the same way; only two things vary — whether a pre-action grep guard is needed, and (for symbol removals) the edit form. knip statically traces *imports*, so:

- **Archetype A — knip authoritative** (`exports`, `types`, `dependencies`, `catalog`): the artifact is reachable only via an explicit import, so knip's graph is complete. **No pre-grep.**
- **Archetype B — grep guard** (`files`, `enumMembers`, `namespaceMembers`): the artifact is reachable *without* an import — a file via a barrel re-export / dynamic `require` / string path, an enum or namespace member via property access (`Enum.Member`). knip can miss these, so grep one token, **skip on any match**, act only on no match.

> **Edit-safety rule — knip's `line` is a hint, not a coordinate.** Files drift between the report and your edit, and earlier removals shift later lines. Always anchor an edit on the declaration *text*, never on a raw line number. When making multiple removals in one file, edit **bottom-to-top** so each removal can't invalidate the positions below it.

**Shared rules (all categories).** Batch all edits to one file into a single Edit call. After all edits are done: run `pnpm -r run typecheck` **once** (never per symbol; there's no root `tsc` script — each `apps/*`/`packages/*` package runs its own `tsc --noEmit`) and resolve the cascade (TS6133/TS6196, per section); then the Step 3b orphan & stale-reference sweep if anything was fully deleted; then format (Step 3c) and verify (Step 4).

### `files` — guard (B)
Token = the **import specifier**, not the bare filename (stems like `index`, `styled`, `types` match everywhere → false skip):
1. Derive it: drop the extension and, for `index.*`, the `/index` segment too (`apps/web/src/foo/Bar/index.tsx` → `foo/Bar` and `foo/Bar/index`). Add the alias form for `apps/*` packages — `@/*` maps to `./src/*`, so `apps/web/src/foo/Bar` → `@/foo/Bar` — plus relative forms (`./Bar`, `../Bar`). `packages/*` have **no alias** (per their `AGENTS.md`) — relative forms only.
2. `grep -rn "foo/Bar\|/Bar'" apps packages --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage`.
3. Match → **skip**; no match → delete the file.

### `dependencies` — authoritative (A)
Group unused deps by the declaring `package.json` (the issue's `file`), then remove each group from the right workspace — a plain `pnpm remove` at the repo root only touches the root manifest and pnpm requires `-w` to confirm that:
- Declared in root `package.json` → `pnpm remove -w PKG_A PKG_B …`
- Declared in `apps/<name>/package.json` or `packages/<name>/package.json` → `pnpm -C apps/<name> remove PKG_A PKG_B …` (or `-C packages/<name>`)

Each `pnpm remove` updates that workspace's `package.json` + the shared lockfile atomically.

### `catalog` — authoritative (A)
Remove each entry from `pnpm-workspace.yaml` under the `catalog:` key.

### `exports` — authoritative (A)
Remove the export per its form:
- `export const/let/function/class/enum NAME …` → drop the leading `export `
- `export default NAME` / `export default function NAME` → remove `export default` (keep the declaration if `NAME` is still referenced; otherwise it's dead — see cascade)
- `export const A = 1, B = 2` (only `B` unused) → drop just the unused binding; if exported as a whole, split the statement to un-export one binding
- `export { NAME }` (sole) → remove the whole statement
- `export { …, NAME, … }` (list) → remove just `NAME`
- `export { NAME } from './x'` / `export { NAME as ALIAS } from './x'` (re-export) → remove `NAME`/`ALIAS`, or the whole line if sole; if the source file is now unreferenced it surfaces as a `files` orphan in Step 3b
- `export * from './x'` → reported under `nsExports`/`duplicates`, not `exports`; leave it

**Cascade:** for every `TS6133: 'NAME' is declared but its value is never read`, the symbol is also internally unused — delete the whole declaration plus any imports and private supporting types used only by it (repeat until clean). Record any emptied file / removed module in the `deleted` list for Step 3b.

Each `deleted` entry typically leaves debris `tsc`/`build` do NOT catch (Step 3b cleans it): sibling files imported only by the deleted code (e.g. a `styles.ts` whose only importer was the deleted `index.tsx`); and `vi.mock('…')`/imports in `__tests__` that now resolve to nothing (fails the test run with an unresolved-import error, e.g. Vitest's `Error: Failed to resolve import "…" from "…"`).

### `types` — authoritative (A)
Forms (handled like `exports`, with type-specific syntax):
- `export type/interface NAME` → drop the leading `export `
- `export type { NAME }` / `export { type NAME }` (sole) → remove the whole statement
- `export type { …, NAME, … }` / `export { …, type NAME, … }` (list) → remove just `NAME`
- `export type { NAME } from './x'` (re-export) → remove `NAME`, or the whole line if sole

**Cascade:** `TS6196: 'NAME' is declared but never used` → delete the whole declaration (repeat if it cascades). Record emptied files / removed modules in the `deleted` list.

### `enumMembers` / `namespaceMembers` — guard (B)
Token = `\bNAME\b`, excluding the declaring file. Match → **skip**; no match → remove the member line (with its trailing comma) from the enum body, or from the `namespace` block for `namespaceMembers`.

> The `\bNAME\b` token is deliberately conservative: common names (`Active`, `Default`, `None`) match unrelated code and get skipped — erring toward leaving dead code rather than breaking a real reference. To resolve a suspected false skip, narrow to qualified usages (`EnumName.NAME`); don't widen.

## Step 3b — Orphan & stale-reference sweep

Run this whenever Step 3 produced a non-empty `deleted` list (a file emptied or a whole module removed). `tsc`, `lint`, and `build` stay green on these because nothing references the debris — only this sweep and the test run surface it. Skip the sweep only if nothing was fully deleted. Run it **before** formatting (Step 3c) so the formatter only touches files that survive.

**1. Re-run knip to catch newly-orphaned files.** Deleting a module's last importer turns its siblings into unused files that the first knip pass could not see:

```bash
pnpm knip --reporter json
```

For every path in the new `files` list that was not present before Step 3, delete it (`rm`), then re-run knip and repeat until the `files` list stops growing. This is what catches an orphaned-`styles.ts` cascade. Also remove any directory left empty by these deletions.

**2. Clean stale references in tests.** For each path in the `deleted` list, grep for what still points at it — primarily test mocks and imports (tests live in `__tests__/` beside the code they cover, per this repo's `AGENTS.md`, and use Vitest, not Jest):

```bash
grep -rn "MODULE_PATH" apps packages --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage
```

(MODULE_PATH = the import specifier of the deleted module, e.g. `features/manageFeed/ui/EditFeedDialog`.) For each hit:
- `vi.mock('…/MODULE_PATH')` → remove the `vi.mock` call.
- `import … from '…/MODULE_PATH'` in a `__tests__/*.test.ts(x)` file → remove the import and any now-dead test blocks that used it (an `it.skip`/`it` referencing only the deleted component's `data-testid`).
- A hit in **production** code (outside `__tests__`) → STOP. knip mis-reported, or the deletion was wrong. Restore the deleted file with `git restore -- PATH` (recoverable because Step 1 required a clean tree), surface the conflict to the user, and do not patch around it.

Add every file touched here to the report's "Changed files" under "stale test refs removed" / "orphan deleted".

## Step 3c — Format

After all edits and the orphan sweep are complete, run the repo's formatters (oxlint/oxfmt, not ESLint/Prettier) to clean up any spacing or style issues introduced by the removals:

```bash
pnpm lint:fix
pnpm format
```

Both commands are non-destructive (they only reformat, not refactor). Ignore exit codes — linting errors that require manual fixes will surface in Step 4.

## Step 4 — Verify

Run these checks in order. If any step fails, surface the errors and stop — do not proceed to the next step.

1. `pnpm -r run typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`

Do not print the report until all four pass. If the test run fails with an unresolved-import error (Vitest's `Error: Failed to resolve import "…" from "…"` or similar), a deleted module still has a stale `vi.mock`/import — Step 3b was skipped or incomplete; go back and finish the stale-reference sweep rather than editing the Vitest config.

## Step 5 — Report

```
## Knip Fix Report

### Fixed
- files:            X fixed, Y skipped
- dependencies:     X removed
- exports:          X fixed
- types:            X fixed
- enumMembers:      X fixed, Y skipped
- namespaceMembers: X fixed, Y skipped
- catalog:          X removed

### Changed files
- apps/web/src/foo/bar.ts — deleted
- apps/web/src/foo/baz.ts — removed exports: Foo, Bar
- apps/web/src/foo/Search/styles.ts — orphan deleted (sibling of removed module)
- apps/web/src/foo/__tests__/baz.test.tsx — stale test refs removed: Search mock
- packages/database/package.json — removed: lodash, moment

### Skipped (false positives)
- apps/web/src/foo/store.ts → Store — referenced in apps/web/src/foo/consumer.ts:12

### Not targeted this run
- exports: 102 issues

### Report-only
- unlisted:   N issues
- binaries:   N issues
- unresolved: N issues
- duplicates: N issues
- nsExports:  N issues
- nsTypes:    N issues
```

Omit any section that has nothing to show.
