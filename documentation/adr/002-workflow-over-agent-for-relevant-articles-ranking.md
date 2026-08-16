# ADR 002: Workflow, not agent, for relevant-articles ranking

## Context

The relevant-articles feature fetches a feed and decides which articles are
relevant to a user's interest profile. Mastra offers two primitives for
driving this kind of LLM-assisted work: a workflow (a fixed sequence of
typed steps) or an agent (a single LLM given a goal and tools, deciding
its own next action in a reasoning loop).

An agent could plausibly do the whole thing from one prompt — fetch the
feed, read each article, judge relevance, report back — and would need less
orchestration code up front. But ranking here is a bounded, well-specified
task: given a fixed interest profile and a batch of articles, produce a
score per article from a known formula (semantic similarity, keyword
overlap, freshness, source affinity). An agent's core strength —
autonomously figuring out how to reach a fuzzy goal — solves a problem this
feature doesn't have, and costs things FeedPlex depends on:

- **Non-deterministic control.** An agent decides its own next step at
  runtime; the same feed and profile could take a different path through
  the reasoning loop on different runs.
- **Unpredictable cost and latency.** A reasoning loop makes a variable
  number of model calls per run — hard to bound or forecast for something
  meant to run on a schedule.
- **Hard to test and reproduce.** There's no stable path to assert
  against; reproducing a failure means reproducing a specific chain of
  model decisions, not a specific calculation.
- **Undermines explainability.** FeedPlex's premise is that a ranking
  comes with a legible "why." A workflow step returns a fixed, inspectable
  `ArticleScore` breakdown; an agent returns a free-form justification with
  no guaranteed link back to a reproducible number.

## Decision

Use a Mastra **workflow** (`createWorkflow`/`createStep`) for the
relevant-articles feature: a fixed pipeline — fetch-feed-articles, then
score-articles — with typed schemas at every step boundary. The only model
calls are deterministic embedding lookups (`embed`/`embedMany`), not an LLM
deciding what to do next; relevance itself is a transparent weighted
formula over embeddings, keywords, freshness, and source affinity, not a
model's conclusion.

An agent remains the right tool for genuinely open-ended, tool-using
work — e.g. the planned on-demand research requests, where the shape of
the task isn't known in advance. It isn't the right tool for a task that
already has a known shape.
