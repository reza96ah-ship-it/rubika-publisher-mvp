# Reusable New-Chat Handoff Prompt

Use the prompt below in a new ChatGPT/Codex/agent conversation after connecting the GitHub repository `reza96ah-ship-it/rubika-publisher-mvp`.

```text
Work on the GitHub repository `reza96ah-ship-it/rubika-publisher-mvp`.

This repository contains the complete Nashrino project context. Do not rely on assumptions or previous chat memory.

Before proposing or changing anything:

1. Confirm the default branch and current `main` state.
2. Inspect open pull requests, open issues, latest commits, and CI status.
3. Read these files in order:
   - `AGENTS.md`
   - `docs/CURRENT_STATUS.md`
   - `docs/AI_CONTEXT.md`
   - `docs/IMPLEMENTATION_ROADMAP.md`
   - `docs/DECISION_LOG.md`
   - `docs/REPO_MAP.md`
   - `docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md`
   - `CONTRIBUTING.md`
4. Inspect the affected implementation and tests before making assumptions.
5. Summarize:
   - the current completed phase;
   - the immediate next milestone;
   - current technical risks;
   - the exact branch and PR scope you recommend.
6. Wait for my approval before changing product scope, backend contracts, database schema, publishing semantics, or deployment architecture.

Important constraints:

- `rubika-publisher-mvp` is the only active production repository.
- `publisher` is a frontend feature-parity reference only.
- `publish-new` is a design-system/architecture reference only.
- Preserve Persian-first RTL, Jalali workflows, mobile usability, accessibility, and honest Rubika/Instagram capability differences.
- Completed features must use real backend APIs, not final fixture-only business state.
- Update `docs/CURRENT_STATUS.md`, `docs/IMPLEMENTATION_ROADMAP.md`, and `docs/DECISION_LOG.md` whenever the work changes project state or durable decisions.
- Run all required Frontend and Backend checks before merging.

Start by reading the repository and report the current state. Do not begin implementation until the state report is complete.
```

## Short version

```text
Connect to `reza96ah-ship-it/rubika-publisher-mvp`, read `AGENTS.md` and the continuity files it lists, verify current GitHub state and CI, then summarize current phase, risks, and next recommended branch before implementing anything.
```

## When continuing a specific milestone

Append one of these instructions:

### Production deployment

```text
Continue milestone M2, Production Compose and deployment. Preserve the existing development Compose. Create immutable production images, explicit migrations, health checks, backup/restore, rollback, and deployment documentation. Do not redesign product pages in this PR.
```

### Legacy wrapper cleanup

```text
Continue milestone M3, removing legacy page-level AuthGate/AppShell wrappers. Confirm the shared `(workspace)` layout is the sole owner. Preserve route URLs and behavior, test for duplicate polling/listeners, and do not redesign pages.
```

### Dashboard V2

```text
Continue milestone M4, Dashboard V2. Use real APIs and existing backend domain behavior. Follow route ownership in the master roadmap. Include loading, empty, degraded, disconnected-channel, error, mobile, RTL, dark, high-contrast, and accessibility states.
```
