# Nashrino Executable Implementation Roadmap

Last updated: 2026-06-25  
Canonical branch: `main`  
Statuses: `done`, `in progress`, `next`, `planned`, `blocked`, `deferred`

## Operating rules

- Preserve backend contracts and publishing behavior unless a change is explicitly scoped.
- Use one focused branch and pull request per concern.
- Completed product features use real APIs, not permanent fixtures.
- Persian RTL, Jalali flows, mobile behavior, accessibility, and honest channel capability are acceptance requirements.
- Milestone-changing pull requests update this file and `docs/CURRENT_STATUS.md`.

## Milestone summary

| Milestone | Status | Outcome |
|---|---|---|
| M0 Repository and governance | done | Canonical `main`, GitHub-flow, CI, and continuity |
| M1 Design-system foundation | done | Liquid Glass, AppShell V2, and shared workspace layout |
| M2 Production deployment | in progress | Repository implementation validated; staging drill remains |
| M3 Single workspace shell | done | One layout-owned AuthGate and AppShell |
| M4 Dashboard V2 | next | First real-data product vertical slice |
| M5 Composer V2 | planned | Creation, approval, scheduling, and recovery |
| M6 Planner V2 | planned | Jalali month/week/list planning and mobile agenda |
| M7 Campaigns, content, media | planned | Coherent campaign and asset operations |
| M8 Inbox and reports | planned | Engagement, recovery, and actionable insight |
| M9 Channels and settings | planned | Production-ready workspace administration |
| M10 Security hardening | planned | Sessions, credentials, tokens, audit, and abuse controls |
| M11 Final audit | planned | Responsive, accessibility, performance, and consistency sign-off |

## M0 — Repository and governance

Status: `done`

Completed:

- accepted history consolidated into `main`;
- default branch, contribution workflow, PR template, CI, and continuity package established;
- generated browser and review artifacts excluded.

Remaining administration:

- verify the active GitHub ruleset targets `main`;
- retire obsolete merged branches after uniqueness and deployment checks.

## M1 — Design-system foundation

Status: `done`

Completed:

- deterministic frontend installation, token audit, semantic token bridge, Liquid Glass materials, radius hierarchy, themes, and reduced-motion/transparency behavior;
- AppShell V2, shared navigation, top bar, mobile drawer, fixed canvas, and one scroll owner;
- shared protected `(workspace)` layout without URL changes;
- page-level shell wrappers removed and structural ownership audit added.

Remaining tooling follow-up: align Next.js and `eslint-config-next` major versions in a dedicated PR.

## M2 — Production deployment

Status: `in progress`

Repository work completed through PRs #27–#29:

- immutable frontend/backend images and separate production Compose;
- shared API/worker/Beat/migration backend image;
- internal PostgreSQL/Redis, persistent volumes, migrations, health checks, restart policies, and reverse-proxy-ready bindings;
- deployment, smoke check, rollback, backup, checksum, restore, environment template, runbook, and Deployment CI.

Operational acceptance still required:

- deploy `main` on a non-production host;
- verify health, persistence, HTTPS proxying, CORS, and OAuth callbacks;
- complete backup, restore, and image rollback drills;
- verify development Compose on the target host.

M2 becomes `done` after the documented staging drill passes.

## M3 — Single workspace shell ownership

Status: `done`

Completed through PR #30:

- removed `AuthGate` and `AppShell` imports and wrappers from all 16 protected route implementations;
- retained sole ownership in `frontend/app/(workspace)/layout.tsx`;
- removed nested compatibility contexts;
- preserved URLs and centralized one auth check, notification loop, command shortcut, haptic listener, and scroll owner;
- added `npm run shell:audit` to the frontend aggregate check and CI;
- updated AppShell architecture and continuity documentation.

Acceptance: protected pages do not own the shell, `/login` remains public, and Frontend, Backend, and Deployment CI pass.

## M4 — Dashboard V2

Status: `next`

Recommended branch: `feat/dashboard-v2`

Dashboard owns:

- today state and one clear primary action;
- publishing health, failure categories, and operational alerts;
- next scheduled post and active campaign summary;
- channel readiness and approval/failure backlogs;
- compact throughput and performance insight.

Dashboard does not own the full calendar, permanent queue/log tables, full campaign reporting, duplicate content-library views, or permanent onboarding progress.

Acceptance:

- real backend data with loading, empty, degraded, partially connected, error, and recovery states;
- 390 px mobile, tablet, and desktop hierarchy without horizontal overflow;
- RTL, dark, high-contrast, keyboard, and screen-reader review;
- automated coverage and before/after PR evidence.

## M5 — Composer and publishing V2

Status: `planned`

Recommended branch: `feat/composer-v2`

Preserve create/edit, autosave/restore, campaigns, media, channel capability, previews, approval, scheduling, manual publishing, automation rules, retry, cancel, and recovery. Split the monolith into typed domain, repository, hook, form, capability, media, preview, readiness, and submission-state modules.

Acceptance: real APIs, no silent data loss, clear autosave state, mobile step flow, keyboard-accessible controls, and tests for create/edit/approval/schedule/manual modes.

## M6 — Planner and Jalali calendar V2

Status: `planned`

Recommended branch: `feat/planner-calendar-v2`

Deliver month/week/list modes, Persian/Jalali navigation, shared filters, validated rescheduling with rollback, day/post inspection, Composer handoff, gap detection, Queue as a secondary view, and agenda-first mobile behavior.

Acceptance: tested timezone/Jalali behavior, keyboard alternatives for drag actions, no nested scroll traps, and usable 390 px agenda.

## M7 — Campaigns, content, and media V2

Status: `planned`

Deliver campaign portfolio/workbench, a unified content library with approvals and recoverable bulk actions, and a media library/editor with folders, tags, associations, aspect variants, brand assets, and templates.

Acceptance: shared query/filter primitives, backend-enforced permissions, responsive keyboard behavior, and a solid performant editor.

## M8 — Inbox and reports V2

Status: `planned`

Unify operational notifications, Instagram engagement, automation events, assignment, priority, saved replies, internal notes, human takeover, resolution, and retries. Reports cover publishing health, error categories, campaign/automation/channel performance, insights, exports, and Logs as a secondary view.

Acceptance: bounded queries, clear filters, visible delivery/failure/retry state, and no double-scrolling charts.

## M9 — Channels, onboarding, and settings V2

Status: `planned`

Deliver Rubika health, official Meta OAuth, professional-account discovery, personal-account manual/reminder mode, webhooks, permissions/capability matrix, minimal onboarding, workspace profile, brand kit, team/roles, and security settings.

Acceptance: honest capabilities, hidden stored credentials, documented reconnect flows, mobile setup, and backend-enforced permissions.

## M10 — Production security hardening

Status: `planned`

Move toward HTTP-only sessions, encrypted platform credentials, token expiry/rotation, privileged-change audit, rate limiting, CSRF/session review, secret-management review, backup retention drills, and security headers. Split and deliver earlier where production deployment requires it.

## M11 — Final application audit

Status: `planned`

Audit all core routes at 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1280×800, 1440×900, and 1920×1080.

Review RTL and mixed text, Jalali correctness, keyboard/focus/screen readers, contrast, reduced motion/transparency, overflow, nested scrolling, blur/image performance, duplicate requests/listeners, state consistency, dead code, deployment documentation, and feature parity.

Final acceptance requires clean CI, completed production smoke tests, and release-candidate continuity status.
