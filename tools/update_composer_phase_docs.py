from pathlib import Path

root = Path(__file__).resolve().parents[1]

status_path = root / "docs" / "CURRENT_STATUS.md"
status = status_path.read_text(encoding="utf-8")
status = status.replace(
    "- Dashboard V2 implementation and acceptance are completed through PRs #32 and #36.\n",
    "- Dashboard V2 implementation and acceptance are completed through PRs #32 and #36.\n"
    "- Composer V2 domain and repository foundation is implemented through PR #37.\n",
)
status = status.replace(
    "## Remaining foundation administration\n",
    "## Composer V2 current architecture\n\n"
    "- `frontend/lib/composer/domain.ts` owns Composer form contracts, autosave parsing, readiness derivation, and save-action validation.\n"
    "- `frontend/lib/composer/repository.ts` owns Composer loading, media, post persistence, scheduling, readiness, and status API operations.\n"
    "- `frontend/app/compose/_page.tsx` still owns workflow orchestration and presentation, but no longer defines duplicate API or domain contracts.\n"
    "- Pure domain tests cover title/body requirements, schedule readiness, approval blocking, local drafts, and meaningful unsaved content.\n"
    "- The next Composer slice should separate orchestration/form state and then split presentation panels without changing backend semantics.\n\n"
    "## Remaining foundation administration\n",
)
status = status.replace(
    "Split the current route into typed domain, repository, query/mutation, form-state, capability-adapter, media, preview, readiness, and submission-state modules without changing backend contracts.",
    "Typed domain and repository modules are complete. Continue with orchestration/form state, capability adapters, media workflow, preview/readiness panels, and the submission state machine without changing backend contracts.",
)
status_path.write_text(status, encoding="utf-8")

roadmap_path = root / "docs" / "IMPLEMENTATION_ROADMAP.md"
roadmap = roadmap_path.read_text(encoding="utf-8")
roadmap = roadmap.replace(
    "| Composer and publishing V2 | next | Professional creation, preview, approval, scheduling, and recovery |",
    "| Composer and publishing V2 | in progress | Domain/repository foundation complete; workflow decomposition active |",
)
roadmap = roadmap.replace(
    "## M5 — Composer and publishing workflow V2\n\nStatus: `next`",
    "## M5 — Composer and publishing workflow V2\n\nStatus: `in progress`",
)
roadmap = roadmap.replace(
    "Recommended branch: `feat/composer-v2`\n\n### Preserve existing capabilities",
    "Recommended branch: `feat/composer-v2`\n\nFoundation delivered through PR #37:\n\n"
    "- typed form, media, autosave, workspace-mode, and save-action contracts;\n"
    "- pure readiness and validation derivation;\n"
    "- validated local-draft parsing and serialization;\n"
    "- centralized Composer loading, media, post persistence, scheduling, readiness, and status repository;\n"
    "- route migration away from duplicate local API/domain implementations;\n"
    "- unit coverage for readiness, approval blocking, validation precedence, and local drafts.\n\n"
    "### Preserve existing capabilities",
)
roadmap_path.write_text(roadmap, encoding="utf-8")

print("Composer V2 phase continuity updated.")
