# packages/contracts

Shared types across `api`/`worker`: `Article`, `ArticleScore`, `RankedArticle`, `Interest`,
`Source`, `Feed`/`CreateFeedInput`/`UpdateFeedInput`, and the `RelevantArticlesJobData`
(`{ feedId: string }`)/`RelevantArticlesJobResult` job contract plus the
`RELEVANT_ARTICLES_QUEUE_NAME` BullMQ queue name constant.

Import shared shapes from here rather than redefining them locally in `api`/`worker` — this
package is the single source of truth for the queue name and job data/result types that both the
API's producer and the worker's consumer depend on. Other packages named in ADR 001's target
layout (`domain`, `application`, `providers`, `ranking`, `evaluation`, `observability`, `ui`)
don't exist yet — don't assume their presence.

## Commands

- Typecheck: `pnpm --filter @feed-plex/contracts typecheck`
- Test / coverage: `pnpm --filter @feed-plex/contracts test`, `... test:coverage`

No `@/*` alias here (unlike the apps) — use relative `../` imports; `import/no-relative-parent-imports` is off for `packages/*/src/**`.
