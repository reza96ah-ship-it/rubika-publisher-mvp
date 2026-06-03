# Multi-Channel Social Operations Domain Model

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
- `logo_asset_id`
- `avatar_asset_id`
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
- Keep the first Brand Kit slice on Store, with logo/avatar references pointing at `MediaAsset`.
- Split into a dedicated `BrandKit` entity when forbidden phrases, versioned rules, or multiple brand variants need their own lifecycle.
- Support multiple stores/workspaces later.

### RubikaAccount

Current purpose: Rubika bot/channel connection settings.

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
- Move under shared `ChannelAccount` abstraction so Rubika becomes one account type in the Channels Hub.
- Keep Rubika-specific fields and health checks behind channel-specific metadata.

### Post

Current purpose: source content record and publish status summary.

Current fields:

- `id`
- `store_id`
- `title`
- `caption`
- `hashtags`
- `platform`
- `status`
- `timezone`
- `campaign_id`
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

- Keep `campaign_id` as the primary relationship and retain free-text `campaign` only as a compatibility label until all UI screens use Campaign objects.
- Add `approval_status`.
- Add `owner_user_id`.
- Add `template_id`.
- Add publish eligibility/readiness metadata.
- Move publish execution to `PublishJob`.
- Track changes through `PostVersion`.
- Split per-channel copy/media/schedule into `PostChannelVariant` so one idea can produce Rubika, Instagram, and future network variants.

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

Current purpose: log an attempt to publish a post or post variant to one channel.

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
- Link attempts to `ChannelAccount` and `PostChannelVariant`.
- Add failure class.
- Add request hash or idempotency reference.
- Keep payloads masked/safe where secrets may appear.

### InstagramAccount

Current purpose: Instagram connection/mode foundation.

Target direction:

- Move into `ChannelAccount`.
- Preserve account mode: API-capable professional account, manual personal reminder, disconnected.
- Do not represent personal Instagram account publishing as automatic API publishing.
- Store Meta OAuth/token metadata only for eligible professional accounts after official setup.

## Target Entities

### ChannelAccount

Purpose: unified account/configuration record for Rubika, Instagram, and future channels.

Suggested fields:

- `id`
- `store_id`
- `channel`
- `display_name`
- `external_account_id`
- `mode`
- `status`
- `capabilities`
- `limitations`
- `credentials_ref`
- `token_expires_at`
- `last_test_at`
- `last_error`
- `is_active`
- `created_at`
- `updated_at`

Mode examples:

- `rubika_bot`
- `instagram_professional_api`
- `instagram_personal_manual`
- `manual_reminder`
- `disconnected`

Capability examples:

- `schedule`
- `auto_publish`
- `manual_publish`
- `image_post`
- `video_post`
- `analytics`
- `inbox`
- `comments`

Relationships:

- Belongs to `Store`.
- Has many `PublishJob`.
- Has many `PublishAttempt`.

Phase: Channels Hub And Account Capability Model.

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
- `audience`
- `channel_mix`
- `kpi_targets`
- `budget`
- `landing_url`
- `content_pillars`
- `report_cadence`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `Store`.
- Has many `Post`.
- Can have many `MediaAsset` through campaign collections or usage links.
- Has many `AnalyticsEvent`.

Phase: Campaign OS.

Current implementation:

- Exists as a backend model and scoped CRUD API.
- Backfilled from existing post campaign labels.
- Posts can reference it through `campaign_id`.

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

### PostChannelVariant

Purpose: channel-specific version of a source post.

Suggested fields:

- `id`
- `post_id`
- `channel_account_id`
- `channel`
- `caption`
- `hashtags`
- `first_comment`
- `alt_text`
- `link_url`
- `media_asset_id`
- `media_variant_id`
- `scheduled_at`
- `readiness_state`
- `validation_errors`
- `status`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `Post`.
- Optionally belongs to `ChannelAccount`.
- References media/variant records.
- Has many `PublishJob`.

Phase: Multi-Channel Composer Studio.

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

Purpose: durable background publishing state machine for one post/channel variant.

Suggested fields:

- `id`
- `post_id`
- `post_channel_variant_id`
- `store_id`
- `channel_account_id`
- `channel`
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
- `manual_ready`
- `manual_completed`
- `manual_cancelled`
- `retry_wait`
- `failed`
- `dead_letter`
- `cancelled`

Relationships:

- Belongs to `Post`.
- Optionally belongs to `PostChannelVariant`.
- Belongs to `ChannelAccount`.
- Has many `PublishAttempt`.

Phase: Publishing Reliability.

### ManualPublishTask

Purpose: explicit task for channels that cannot be auto-published, such as normal personal Instagram account workflows.

Suggested fields:

- `id`
- `publish_job_id`
- `post_channel_variant_id`
- `channel_account_id`
- `status`
- `instructions`
- `copy_payload`
- `external_url`
- `remind_at`
- `completed_at`
- `completed_by_user_id`
- `created_at`
- `updated_at`

States:

- `ready`
- `reminded`
- `completed`
- `cancelled`
- `expired`

Phase: Publishing Reliability And Operations.

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
- `channel_account_id`
- `post_channel_variant_id`
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

### MetricSnapshot

Purpose: normalized point-in-time performance data for posts, variants, campaigns, and channels.

Suggested fields:

- `id`
- `store_id`
- `resource_type`
- `resource_id`
- `channel`
- `metric_name`
- `metric_value`
- `source`
- `captured_at`
- `created_at`

Phase: Analytics, Reporting, Listening, And AI Insight.

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

1. Product rename/config cleanup
2. `ChannelAccount`
3. Migrate Rubika and Instagram settings into channel accounts
4. `BrandKit`
5. Campaign strategy fields
6. `PostChannelVariant`
7. `PostTemplate`
8. `PostVersion`
9. `PublishJob`
10. `ManualPublishTask`
11. `Notification`
12. `Team/UserRole`
13. `Approval`
14. `Comment`
15. `AnalyticsEvent` and `MetricSnapshot`
16. `InboxThread` and `InboxMessage`
17. `AuditLog`

## State Ownership

| State | Owner entity | Notes |
| --- | --- | --- |
| Draft content | Post | Content can exist before scheduling |
| Channel-specific content | PostChannelVariant | Keeps one source idea from turning into duplicated posts |
| Channel setup/capability | ChannelAccount | Rubika and Instagram should share the same account abstraction |
| Brand defaults | BrandKit | Applied into new posts, not copied blindly forever |
| Campaign planning | Campaign | Campaign owns goal/date/color/reporting context |
| Review state | Approval | Do not overload post status with approval |
| Publish execution | PublishJob | Post status can summarize latest job, but job owns execution |
| Manual publishing | ManualPublishTask | Personal Instagram/manual channels need an explicit task lifecycle |
| Attempt details | PublishAttempt | Attempt is historical evidence |
| Operational alert | Notification | Persist important notices instead of deriving all UI notifications |
| Performance event | AnalyticsEvent | Reports should not scrape UI state |
| Performance snapshot | MetricSnapshot | Metrics should be comparable over time |
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
