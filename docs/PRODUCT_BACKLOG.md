# نشرینو Product Backlog

This backlog translates the roadmap and RFP into implementation epics. Items are ordered by product value, not by code file.

The active reset document is `docs/REBUILD_FROM_ZERO_2026.md`. It overrides older incremental UI repair thinking. The product shell must follow this Persian workflow: **امروز، ساخت، برنامه‌ریزی، محتوا، رسانه، پیام‌ها، گزارش‌ها، تنظیمات**.

Priority levels:

- **P0:** required for professional product credibility.
- **P1:** required for competitive product depth.
- **P2:** important but can follow after core workflows are stable.

## Epic 0: Product System Reset

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E0-1 | P0 | Document benchmark research and product principles | Benchmark, roadmap, RFP, UI system, backlog exist and agree |
| E0-2 | P0 | Remove permanent setup from daily dashboard | Completed setup does not show as permanent progress |
| E0-3 | P0 | Define UI visual system around channel/campaign/content/report assets | UI/UX doc includes product-specific patterns |
| E0-4 | P0 | Audit duplicate actions across pages | No page has duplicate primary create/save/schedule actions |

## Epic 1: Command Center Pro

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E1-1 | P0 | Replace dashboard with daily operations sections | Shows risks, upcoming posts, inbox alerts, campaign blocks, top insight |
| E1-2 | P0 | Add risk queue module | Failed jobs, review blocks, channel issues are ranked |
| E1-3 | P1 | Add campaign timeline preview | Active campaigns show stage and next action |
| E1-4 | P1 | Add analytics insight card | Shows one actionable recommendation with source metric |
| E1-5 | P1 | Add empty state for clean workspace | Suggests create/schedule/report actions without setup noise |
| E1-6 | P0 | Add mobile command center task stack | Mobile home shows urgent tasks, next publish, inbox count, and one insight only |
| E1-7 | P1 | Add command palette/search | User can jump to post, campaign, channel, report, or setting |

## Epic 1A: Design System + Brand Language Pro

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E1A-1 | P0 | Define product-specific page templates | Command, studio, planner, report, inbox, settings, and table/list templates exist |
| E1A-2 | P0 | Add channel rail component | Channel status/capabilities appear consistently in composer, planner, queue, reports |
| E1A-3 | P0 | Add campaign timeline component | Campaign stages are visual and reusable on dashboard, campaign, planner |
| E1A-4 | P0 | Add content card system | Post preview, media, status, channel, campaign, and action are consistent everywhere |
| E1A-5 | P1 | Add inbox thread card system | Customer, channel, SLA, assignment, labels, and reply status are consistent |
| E1A-6 | P1 | Add report panel system | KPI, insight, source metric, chart, and recommendation share a professional pattern |
| E1A-7 | P1 | Add motion/interaction tokens | Live updates, selection, progress, upload, save, publish, and notification states feel premium |
| E1A-8 | P1 | Add mobile-specific layouts | Mobile pages are task-first, not mini desktop pages |

## Epic 2: Channels Hub + Capability Model

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E2-1 | P0 | Complete shared `ChannelAccount` model | Rubika and Instagram read from same abstraction |
| E2-2 | P0 | Move Rubika settings into Channels Hub tab/drawer | `/rubika` becomes deep link/compat route |
| E2-3 | P0 | Move Instagram settings into Channels Hub tab/drawer | `/instagram` becomes deep link/compat route |
| E2-4 | P0 | Add capability API | Composer/Planner/Queue can ask what each channel supports |
| E2-5 | P0 | Add channel limitations and recovery actions | UI explains exact blocker and next action |
| E2-6 | P1 | Add token/health timeline | Last test, last failure, token age visible |

## Epic 3: Composer Studio Pro

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E3-1 | P0 | Introduce source idea + channel variants | One post can have Rubika and Instagram variants |
| E3-2 | P0 | Add channel tabs/rail in composer | Variant validation appears beside each channel |
| E3-3 | P0 | Add sync content on/off | User can copy base content then customize per channel |
| E3-4 | P0 | Add autosave and draft recovery | Refresh does not lose draft |
| E3-5 | P1 | Add version history | User can restore older draft/version |
| E3-6 | P1 | Add objective template picker | Sale, launch, education, reminder, testimonial |
| E3-7 | P1 | Add inline media editor workspace | Edited variant attaches without leaving composer |
| E3-8 | P1 | Add per-channel alt text and accessibility fields | Each media variant can store platform-ready alt text |
| E3-9 | P1 | Add approval-aware composer states | Draft, review, changes requested, approved, scheduled are visible in one path |

## Epic 4: Planner + Campaign Timeline Pro

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E4-1 | P1 | Add campaign lane view | Campaigns show as timelines with post stages |
| E4-2 | P1 | Add channel rails to calendar chips | User sees channel and capability at a glance |
| E4-3 | P1 | Add saved planner views | User saves filters/view mode |
| E4-4 | P1 | Add bulk move/schedule | Selected posts move safely |
| E4-5 | P1 | Add best-time suggestions v1 | Suggestions cite historical schedule/performance source |
| E4-6 | P1 | Improve compact Jalali date/time popovers everywhere | Popovers are small, anchored, close on outside click |
| E4-7 | P1 | Add feed/grid preview planner | User can view Instagram-style/feed-style visual continuity |
| E4-8 | P1 | Add bulk CSV scheduling import | User can schedule many posts safely with validation |

## Epic 5: Campaign OS Pro

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E5-1 | P1 | Add campaign brief fields | Goal, audience, offer, CTA, owner, budget, KPI |
| E5-2 | P1 | Add channel mix and content pillars | Campaign explains where and what it publishes |
| E5-3 | P1 | Add campaign timeline | Planned/review/scheduled/published/failed visible |
| E5-4 | P1 | Add campaign risk panel | Missing media, failed jobs, approval blocks visible |
| E5-5 | P1 | Add exportable campaign report | Print-ready HTML with KPIs and posts |
| E5-6 | P2 | Add campaign templates | Prebuilt launch/sale/education campaign structures |
| E5-7 | P1 | Add campaign KPI targets | Campaign stores target reach/engagement/sales/clicks and compares actuals |
| E5-8 | P2 | Add competitor notes and reference board | Campaign can track competitor examples and positioning notes |

## Epic 6: Media + Creative Studio Pro

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E6-1 | P1 | Add source/variant asset model | Variants link to source asset and channel preset |
| E6-2 | P1 | Add brand template blocks | Logo, price, CTA, title, caption presets reusable |
| E6-3 | P1 | Add creative QA | Aspect ratio, size, text density, safe-zone, alt text warnings |
| E6-4 | P1 | Add batch variant export | One asset creates multiple channel formats |
| E6-5 | P1 | Add campaign/media collections | Assets grouped by campaign and usage |
| E6-6 | P2 | Add rights/owner/lifecycle metadata | Usage and safe delete are production-grade |

## Epic 7: Collaboration + Approvals

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E7-1 | P1 | Add users/roles/permissions | Owner, manager, creator, reviewer, client, viewer |
| E7-2 | P1 | Add comments and mentions on posts | Feedback stays with post |
| E7-3 | P1 | Add internal-only notes/comments | Client-safe and internal feedback separated |
| E7-4 | P1 | Add review queue | Pending approval content visible in one place |
| E7-5 | P1 | Add approval history | Who approved/rejected/requested change is visible |
| E7-6 | P1 | Add audit log | Sensitive channel/publish actions are recorded |

## Epic 8: Publishing Reliability Engine

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E8-1 | P0 | Add `PublishJob` state machine | Jobs separate from post status |
| E8-2 | P0 | Add idempotency keys/payload hashes | Retry cannot duplicate post |
| E8-3 | P0 | Add retry/backoff policy | Failures retry predictably |
| E8-4 | P0 | Add dead-letter queue | Failed jobs can be parked with reason |
| E8-5 | P0 | Add worker heartbeat and queue depth | Ops can see worker health |
| E8-6 | P0 | Add failure classification | Auth/network/validation/rate-limit/manual classified |
| E8-7 | P0 | Add manual publish task lifecycle | Complete, skip, remind, audit |

## Epic 9: Inbox + Engagement

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E9-1 | P2 | Add unified thread model | Comments/messages map to channel/post/customer |
| E9-2 | P2 | Add assignment and status | Open, pending, resolved, assigned user |
| E9-3 | P2 | Add saved replies | User can respond consistently |
| E9-4 | P2 | Add internal notes | Team context stays hidden from customer |
| E9-5 | P2 | Add SLA and inbox metrics | Response time/unresolved visible |
| E9-6 | P1 | Add labels and topic filters | Threads can be grouped by campaign, topic, customer, channel |
| E9-7 | P1 | Add dashboard inbox alerts | Urgent unresolved threads surface in Command Center |
| E9-8 | P2 | Add AI reply suggestions gated by saved replies and brand voice | Suggestions are editable and never auto-send |

## Epic 10: Analytics + Reports + Listening

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E10-1 | P1 | Add analytics event/metric snapshot model | Metrics are stored, not UI-derived |
| E10-2 | P1 | Add channel performance report | Per-channel reach/engagement/publishing health |
| E10-3 | P1 | Add campaign KPI report | Goals and results visible |
| E10-4 | P1 | Add content/creative performance | Top posts, formats, variants |
| E10-5 | P1 | Add report builder HTML export | Client-ready report layout |
| E10-6 | P2 | Add competitor/listening-lite tracker | Manual tracked competitors/keywords at first |
| E10-7 | P2 | Add recommendations | Best-time and content suggestions cite source metrics |
| E10-8 | P1 | Add executive report page template | Report has summary, KPI table, charts, source notes, and recommended actions |
| E10-9 | P1 | Add scheduled report export/email-ready package | User can generate recurring manager/client-ready reports |
| E10-10 | P2 | Add UTM/link tracking foundation | Links can be tagged and later attributed |

## Epic 11: AI Assistance

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E11-1 | P2 | Add brand-aware caption helper | Uses brand voice and content rules |
| E11-2 | P2 | Add channel variant suggestions | Suggests but does not auto-publish |
| E11-3 | P2 | Add report summary | Summary cites visible metric cards |
| E11-4 | P2 | Add recovery explanation helper | Explains known failure classes only |

## Epic 12: Agency/Team Scale

| ID | Priority | Story | Acceptance |
| --- | --- | --- | --- |
| E12-1 | P2 | Add multi-workspace switcher | Users can switch clients/stores |
| E12-2 | P2 | Add client review links | Clients can review without seeing internal comments |
| E12-3 | P2 | Add white-label report settings | Workspace logo/name on exports |
| E12-4 | P2 | Add admin/team settings | Invites, roles, activity |

## Immediate Next Implementation Order

1. E0-2/E0-4: finish shell cleanup, remove duplicate setup/action/filter furniture, and keep contextual routes out of primary navigation.
2. E1-1/E1-2/E1-6: rebuild Today as a compact Command Center for daily operations and mobile task flow.
3. E1A-1/E1A-4: implement the design-system v2 product primitives that make pages feel like one professional app.
4. E2-1/E2-4: surface the shared channel capability model everywhere.
5. E3-1/E3-3: rebuild Composer around source idea plus channel variants.
6. E4-1/E4-2/E4-7: add campaign lanes, channel rails, saved planner views, and visual feed planning.
7. E8-1/E8-2: add durable publish jobs, idempotency, recovery, and job-first logs.
8. E10-8/E10-9: build client/manager-ready reports after the operational model is stable.

This order fixes the user journey first, then deepens professional capability.
