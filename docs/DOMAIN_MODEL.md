# Rubika Publisher Domain Model

This document defines the target product entities for the professional rebuild. It is intentionally broader than the current database so future phases can add durable product capability without guessing.

## Current Entities

### User

Current purpose: admin login.

Current fields:

- `id`
- `email`
- `password_hash`
- `full_name`
- `is_active`
- `created_at`

Target direction:

- Add team/workspace membership.
- Add role assignment.
- Add invitation and account status.
- Keep authentication separate from permission decisions.

### Store

Current purpose: workspace profile and content defaults.

Current fields:

- `id`
- `name`
- `category`
- `phone`
- `description`
- `default_hashtags`
- `caption_footer`
- `brand_primary_color`
- `brand_accent_color`
- `brand_voice`
- `default_cta`
- `content_guidelines`
- `timezone`
- `is_active`
- `created_at`
- `updated_at`

Target direction:

- Keep store as workspace/business identity.
- Keep the first Brand Kit slice on Store, then split into a dedicated `BrandKit` entity when logo/avatar assets, forbidden phrases, and versioned rules need their own lifecycle.
- Support multiple stores/workspaces later.

### RubikaAccount

Current purpose: Rubika bot connection settings.

Current fields:

- `id`
- `bot_token`
- `chat_id`
- `bot_name`
- `status`
- `last_error`
- `last_test_at`
- `is_active`
- `created_at`
- `updated_at`

Target direction:

- Encrypt token storage.
- Add token rotation metadata.
- Add connection test audit.
- Add channel/account abstraction only after Rubika single-platform publishing is reliable.

### Post

Current purpose: content record and publish status.

Current fields:

- `id`
- `store_id`
- `title`
- `caption`
- `hashtags`
- `platform`
- `status`
- `timezone`
- `campaign`
- `internal_note`
- `scheduled_at`
- `ready_at`
- `published_at`
- `failed_at`
- `rubika_message_id`
- `last_error`
- `attempt_count`
- `created_at`
- `updated_at`

Target direction:

- Replace free-text `campaign` with `campaign_id`.
- Add `approval_status`.
- Add `owner_user_id`.
- Add `template_id`.
- Add publish eligibility/readiness metadata.
- Move publish execution to `PublishJob`.
- Track changes through `PostVersion`.

### MediaAsset

Current purpose: uploaded media and optional post attachment.

Current fields:

- `id`
- `store_id`
- `post_id`
- `original_filename`
- `stored_filename`
- `file_path`
- `content_type`
- `size_bytes`
- `folder`
- `tags`
- `created_at`

Target direction:

- Add collections.
- Add many-to-many post usage instead of only one `post_id`.
- Add variants/crops.
- Add campaign links.
- Add storage provider abstraction.
- Add safe delete and usage map.

### PublishAttempt

Current purpose: log an attempt to publish a post.

Current fields:

- `id`
- `post_id`
- `action`
- `status`
- `request_payload`
- `response_payload`
- `error`
- `started_at`
- `finished_at`
- `created_at`

Target direction:

- Keep attempts as child records of durable `PublishJob`.
- Add failure class.
- Add request hash or idempotency reference.
- Keep payloads masked/safe where secrets may appear.

## Target Entities

### BrandKit

Purpose: reusable brand identity and content rules for a store.

Suggested fields:

- `id`
- `store_id`
- `logo_asset_id`
- `avatar_asset_id`
- `primary_color`
- `accent_color`
- `tone_of_voice`
- `default_cta`
- `default_hashtags`
- `caption_footer`
- `content_rules`
- `forbidden_phrases`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `Store`.
- References `MediaAsset` for logo/avatar.

Phase: Brand Kit Pro.

### Campaign

Purpose: first-class planning and measurement object.

Suggested fields:

- `id`
- `store_id`
- `name`
- `goal`
- `status`
- `color`
- `owner_user_id`
- `starts_at`
- `ends_at`
- `notes`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `Store`.
- Has many `Post`.
- Can have many `MediaAsset` through campaign collections or usage links.
- Has many `AnalyticsEvent`.

Phase: Campaign OS.

### PostTemplate

Purpose: reusable content creation pattern.

Suggested fields:

- `id`
- `store_id`
- `name`
- `category`
- `description`
- `caption_pattern`
- `hashtag_pattern`
- `default_cta`
- `media_guidance`
- `prompt`
- `is_active`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `Store`.
- Can be referenced by `Post`.

Phase: Composer Studio Pro.

### PostVersion

Purpose: recoverable history of post content changes.

Suggested fields:

- `id`
- `post_id`
- `actor_user_id`
- `version_number`
- `title`
- `caption`
- `hashtags`
- `scheduled_at`
- `media_snapshot`
- `change_note`
- `created_at`

Relationships:

- Belongs to `Post`.
- Belongs to `User` as actor.

Phase: Composer Studio Pro.

### Approval

Purpose: review and governance workflow.

Suggested fields:

- `id`
- `post_id`
- `submitted_by_user_id`
- `reviewer_user_id`
- `state`
- `decision_note`
- `submitted_at`
- `decided_at`
- `created_at`
- `updated_at`

States:

- `draft`
- `submitted`
- `changes_requested`
- `approved`
- `rejected`

Relationships:

- Belongs to `Post`.
- References submitter and reviewer users.
- Has many `Comment`.

Phase: Approvals And Collaboration.

### Comment

Purpose: team discussion on posts, assets, campaigns, or approvals.

Suggested fields:

- `id`
- `store_id`
- `resource_type`
- `resource_id`
- `author_user_id`
- `body`
- `parent_comment_id`
- `created_at`
- `updated_at`

Relationships:

- Belongs to a polymorphic resource.
- Belongs to `User`.
- Can trigger `Notification`.

Phase: Approvals And Collaboration.

### PublishJob

Purpose: durable background publishing state machine.

Suggested fields:

- `id`
- `post_id`
- `store_id`
- `status`
- `scheduled_at`
- `started_at`
- `finished_at`
- `idempotency_key`
- `payload_hash`
- `retry_count`
- `max_retries`
- `next_retry_at`
- `failure_class`
- `last_error`
- `created_at`
- `updated_at`

States:

- `queued`
- `locked`
- `publishing`
- `published`
- `retry_wait`
- `failed`
- `dead_letter`
- `cancelled`

Relationships:

- Belongs to `Post`.
- Has many `PublishAttempt`.

Phase: Publishing Reliability.

### Notification

Purpose: persistent operational and collaboration notification.

Suggested fields:

- `id`
- `store_id`
- `recipient_user_id`
- `actor_user_id`
- `category`
- `severity`
- `title`
- `description`
- `action_label`
- `action_href`
- `resource_type`
- `resource_id`
- `read_at`
- `created_at`

Relationships:

- Belongs to `Store`.
- Optionally references actor and recipient users.

Phase: Approvals, Publishing Reliability, Inbox.

### AnalyticsEvent

Purpose: normalized event stream for reporting.

Suggested fields:

- `id`
- `store_id`
- `post_id`
- `campaign_id`
- `event_type`
- `source`
- `metric_name`
- `metric_value`
- `metadata`
- `occurred_at`
- `created_at`

Event examples:

- `post_published`
- `publish_failed`
- `message_received`
- `reply_sent`
- `engagement_snapshot`
- `report_exported`

Phase: Analytics, Reporting And AI Optimization.

### AuditLog

Purpose: security and governance history.

Suggested fields:

- `id`
- `store_id`
- `actor_user_id`
- `action`
- `resource_type`
- `resource_id`
- `before_snapshot`
- `after_snapshot`
- `ip_address`
- `user_agent`
- `created_at`

Phase: Security and Collaboration.

### InboxThread

Purpose: unified audience conversation thread.

Suggested fields:

- `id`
- `store_id`
- `source`
- `external_thread_id`
- `status`
- `assigned_user_id`
- `last_message_at`
- `resolved_at`
- `created_at`
- `updated_at`

Relationships:

- Has many `InboxMessage`.
- Can have `Notification`.

Phase: Inbox And Engagement.

### InboxMessage

Purpose: individual inbound or outbound audience message.

Suggested fields:

- `id`
- `thread_id`
- `direction`
- `external_message_id`
- `author_name`
- `body`
- `metadata`
- `sent_at`
- `created_at`

Phase: Inbox And Engagement.

## Migration Order

Recommended order:

1. `BrandKit`
2. `Campaign`
3. `PostTemplate`
4. `PostVersion`
5. `PublishJob`
6. `Notification`
7. `Team/UserRole`
8. `Approval`
9. `Comment`
10. `AnalyticsEvent`
11. `InboxThread` and `InboxMessage`
12. `AuditLog`

## State Ownership

| State | Owner entity | Notes |
| --- | --- | --- |
| Draft content | Post | Content can exist before scheduling |
| Brand defaults | BrandKit | Applied into new posts, not copied blindly forever |
| Campaign planning | Campaign | Campaign owns goal/date/color/reporting context |
| Review state | Approval | Do not overload post status with approval |
| Publish execution | PublishJob | Post status can summarize latest job, but job owns execution |
| Attempt details | PublishAttempt | Attempt is historical evidence |
| Operational alert | Notification | Persist important notices instead of deriving all UI notifications |
| Performance metric | AnalyticsEvent | Reports should not scrape UI state |
| Security history | AuditLog | Sensitive changes and workflow decisions |

## Backend API Principles

- Use stable IDs for relationships, not display strings.
- Add pagination and filtering to list endpoints before datasets grow.
- Return structured validation errors.
- Keep secrets masked in responses.
- Use migrations for every schema change.
- Add backend tests for every state transition.
- Keep frontend types aligned with backend response schemas.

## Frontend State Principles

- Use server data as source of truth for durable state.
- Use local state for UI selection, filters, transient draft edits, and optimistic feedback only.
- Every inspector should derive from the selected entity and show a recovery action when state is unhealthy.
- Every destructive or publish-impacting action should produce an audit-relevant backend event.
