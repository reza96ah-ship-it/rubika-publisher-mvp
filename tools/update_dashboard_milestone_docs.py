from pathlib import Path

root = Path(__file__).resolve().parents[1]

status_path = root / "docs" / "CURRENT_STATUS.md"
status = status_path.read_text(encoding="utf-8")
status = status.replace(
    "active_program: Dashboard V2 preparation and production deployment operational acceptance",
    "active_program: Composer and publishing V2; production deployment operational acceptance",
)
status = status.replace(
    "next_recommended_branch: feat/dashboard-v2",
    "next_recommended_branch: feat/composer-v2",
)
status = status.replace(
    "- Shared workspace shell cleanup is completed through PR #30.\n",
    "- Shared workspace shell cleanup is completed through PR #30.\n"
    "- Dashboard V2 implementation and acceptance are completed through PRs #32 and #36.\n"
    "- Next 16 TypeScript configuration normalization is completed through PR #35.\n",
)
status = status.replace(
    "- durable repository continuity and contribution guidance.\n",
    "- durable repository continuity and contribution guidance;\n"
    "- real-data Dashboard V2 with publishing pulse, channel readiness, action backlog, campaign summary, operational alerts, and rolling throughput;\n"
    "- production-browser visual acceptance at 390 × 844 and 1440 × 900 in light and dark modes.\n",
)
old_sequence = '''### 2. Dashboard V2

Recommended branch: `feat/dashboard-v2`

Use real backend data for:

- publishing health;
- next scheduled publication;
- active campaign summary;
- channel readiness;
- approval and failure backlogs;
- operational alerts;
- compact throughput and performance insight.

Do not add full onboarding progress, the full calendar, full campaign reports, duplicate content lists, or permanent queue/log tables to Dashboard.

### 3. Composer and publishing V2

Preserve create/edit, autosave, media, campaigns, readiness, approval, scheduling, previews, automation rules, queue actions, retry, cancel, and manual publication.

### 4. Planner and Jalali calendar V2
'''
new_sequence = '''### 2. Composer and publishing V2

Recommended branch: `feat/composer-v2`

Preserve create/edit, autosave and restore, campaign assignment, media selection and editing, Rubika and Instagram capability/readiness, previews, approval, scheduling, automation rules, retry, cancel, recovery, and manual publication.

Split the current route into typed domain, repository, query/mutation, form-state, capability-adapter, media, preview, readiness, and submission-state modules without changing backend contracts.

### 3. Planner and Jalali calendar V2
'''
if old_sequence not in status:
    raise RuntimeError("CURRENT_STATUS immediate sequence did not match expected Dashboard phase")
status = status.replace(old_sequence, new_sequence)
status_path.write_text(status, encoding="utf-8")

roadmap_path = root / "docs" / "IMPLEMENTATION_ROADMAP.md"
roadmap = roadmap_path.read_text(encoding="utf-8")
roadmap = roadmap.replace(
    "| Dashboard V2 | next | First complete real-data product vertical slice |",
    "| Dashboard V2 | done | Real-data operational dashboard with production visual acceptance |",
)
roadmap = roadmap.replace(
    "| Composer and publishing V2 | planned | Professional creation, preview, approval, scheduling, and recovery |",
    "| Composer and publishing V2 | next | Professional creation, preview, approval, scheduling, and recovery |",
)
roadmap = roadmap.replace(
    "## M4 — Dashboard V2\n\nStatus: `next`\n\nRecommended branch: `feat/dashboard-v2`",
    "## M4 — Dashboard V2\n\nStatus: `done`\n\nCompleted through PR #32 with final acceptance through PR #36.",
)
roadmap = roadmap.replace(
    "### Acceptance\n\n- no final fixture-only business state;\n- backend/API failures show recovery guidance;\n- mobile, desktop, RTL, dark, high-contrast, keyboard, and screen-reader review complete;\n- automated unit/integration coverage;\n- before/after screenshots included in PR.\n\n---\n\n## M5 — Composer and publishing workflow V2\n\nStatus: `planned`",
    "### Delivered and accepted\n\n- real posts, publishing attempts, campaigns, channel accounts, workspace state, and operational notifications;\n- partial-source degradation with recovery guidance;\n- publishing pulse, next action, channel readiness, approval/failure backlog, active campaigns, alerts, and rolling seven-day throughput;\n- no duplicate Planner, Content, Campaign report, Queue, or Logs ownership;\n- fresh-workspace onboarding state without unnecessary store-scoped requests;\n- unit coverage for scheduling, attempts, backlogs, throughput, degradation, and missing-store behavior;\n- Frontend, Backend, and Deployment CI passed;\n- immutable production-browser screenshots passed at 390 × 844 and 1440 × 900 in light and dark modes;\n- RTL order, single-column mobile hierarchy, contrast, readability, and horizontal overflow reviewed.\n\n---\n\n## M5 — Composer and publishing workflow V2\n\nStatus: `next`",
)
roadmap_path.write_text(roadmap, encoding="utf-8")

print("Dashboard milestone continuity updated.")
