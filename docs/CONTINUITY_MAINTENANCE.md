# Continuity Documentation Maintenance

The continuity package lets a new agent reconstruct the project from GitHub alone. Milestone-changing pull requests must keep these files accurate.

## File ownership

### `AGENTS.md`

Update when the canonical repository, branch, stack, navigation, validation commands, or mandatory working rules change.

### `docs/CURRENT_STATUS.md`

Update whenever completed work, immediate next work, blockers, risks, CI state, or deployment state changes. This file represents the present, not a historical diary.

### `docs/IMPLEMENTATION_ROADMAP.md`

Update when milestone status, sequencing, deliverables, or acceptance criteria change.

### `docs/DECISION_LOG.md`

Add a dated decision when product ownership, architecture, domain semantics, deployment, security, or a major technology choice changes. Do not erase old accepted decisions; mark them superseded and add a replacement.

### `docs/REPO_MAP.md`

Update when important code, route entry points, services, tests, or documentation move.

### `docs/HANDOFF_PROMPT.md`

Update when the mandatory reading order or startup protocol changes.

### Product specifications

Update the master roadmap and feature specifications when user-facing scope, navigation ownership, supported channel capability, or success metrics change.

## Pull-request continuity checklist

Use this section in milestone pull requests:

```markdown
## Continuity updates

- [ ] `docs/CURRENT_STATUS.md` updated
- [ ] `docs/IMPLEMENTATION_ROADMAP.md` updated or not required
- [ ] `docs/DECISION_LOG.md` updated or not required
- [ ] `docs/REPO_MAP.md` updated or not required
- [ ] Product specification updated or not required
```

## Status vocabulary

Use only:

- `done`
- `in progress`
- `next`
- `planned`
- `blocked`
- `deferred`
- `superseded`

## Evidence rules

- Use absolute ISO dates: `YYYY-MM-DD`.
- Reference pull-request and issue numbers when available.
- Separate verified repository state from plans and assumptions.
- Do not claim repository settings are active unless verified.
- Never store credentials or real production backups in documentation.

## Continuity audit

At the end of every major milestone:

1. Start a temporary new chat or agent with only GitHub access.
2. Use the prompt in `docs/HANDOFF_PROMPT.md`.
3. Ask it to summarize current phase, next milestone, architecture, and risks.
4. Compare the result with the project owner's understanding.
5. Correct stale or ambiguous documents before the next milestone.

A successful independent summary is the acceptance test for the continuity package.
