# ADR 001: Monorepo and modular monolith foundation

## Context
FeePlex is a personal research project.

The first product capability is feed intelligence: users subscribe to technical blogs,
RSS/Atom feeds, sitemaps, archive pages, or other permitted sources; the system discovers
new articles, extracts and normalizes their content, determines relevance to a user profile,
and presents a personalized, explainable news feed.

The architecture must support
rapid iteration and a low operational burden, while demonstrating production-oriented practices:
clear module boundaries, durable background processing, observability, testability, data
provenance, and an explicit evolution path.

1. **Interactive serving workload**
    - User-facing feed reads, source management, profile updates, and later research requests.
    - Requires predictable latency and stable API behavior.

2. **Asynchronous processing workload**
    - Feed polling, source discovery, article fetching, parsing, canonicalization, deduplication,
      content extraction, enrichment, embedding, indexing, and reindexing.
    - Requires retries, idempotency, scheduling, rate limiting, long-running execution,
      observability, and safe recovery from partial failures.

A single deployable application would make these workloads harder to isolate and operate.
Conversely, independently deployable microservices would introduce an unnecessary operational
tax at the current scale: distributed deployment, inter-service contracts, network failures,
cross-service tracing, duplicate infrastructure, and complex data consistency concerns.

## Decision

FeedPlex will use a TypeScript monorepo and a modular-monolith architecture with
separately runnable web, API, and worker applications.

The system will initially use one primary PostgreSQL database as the source of truth, Redis for
ephemeral coordination and caching, and Mastra as the workflow engine for asynchronous
processing.

```text
feed-plex/
├── apps/
│   ├── web/                   # Frontend only
│   │   ├── TanStack Start
│   │   ├── React
│   │   ├── TanStack Router
│   │   ├── TanStack Query
│   │   ├── TanStack AI
│   │   ├── TanStack Form
│   │   └── UI, client state, SSR presentation
│   │
│   ├── api/                   # Backend only
│   │   ├── Fastify
│   │   ├── REST endpoints
│   │   ├── SSE endpoints
│   │   ├── Auth/session boundary
│   │   ├── API authorization
│   │   ├── Request validation
│   │   ├── Rate limiting
│   │   └── Application use-case invocation
│   │
│   └── worker/                # Background processing only
│       ├── Mastra workflows
│       ├── Feed polling schedules
│       ├── Source discovery
│       ├── RSS/sitemap/index-page parsing
│       ├── Article extraction
│       ├── Enrichment and embeddings
│       ├── Indexing/reindexing
│       └── Long-running research workflows later
│
└── packages/
    ├── contracts/
    ├── domain/
    ├── application/
    ├── database/
    ├── providers/
    ├── ranking/
    ├── evaluation/
    ├── observability/
    └── ui/
```