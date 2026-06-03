from datetime import datetime

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str


class StoreUpsertRequest(BaseModel):
    name: str
    category: str = ""
    phone: str = ""
    description: str = ""
    logo_asset_id: int | None = None
    avatar_asset_id: int | None = None
    brand_primary_color: str = "#0F766E"
    brand_accent_color: str = "#2563EB"
    brand_voice: str = ""
    default_cta: str = ""
    content_guidelines: str = ""
    default_hashtags: str = ""
    caption_footer: str = ""
    timezone: str = "Asia/Tehran"


class StoreResponse(BaseModel):
    id: int
    name: str
    category: str
    phone: str
    description: str
    logo_asset_id: int | None
    avatar_asset_id: int | None
    brand_primary_color: str
    brand_accent_color: str
    brand_voice: str
    default_cta: str
    content_guidelines: str
    default_hashtags: str
    caption_footer: str
    timezone: str
    is_active: bool


class RubikaSettingsRequest(BaseModel):
    bot_token: str = ""
    chat_id: str


class RubikaAccountResponse(BaseModel):
    id: int
    chat_id: str
    bot_token_masked: str
    bot_name: str
    status: str
    last_error: str
    last_test_at: datetime | None
    is_active: bool


class RubikaTestResponse(BaseModel):
    ok: bool
    status: str
    bot_name: str = ""
    error: str = ""
    last_test_at: datetime | None = None


class InstagramSettingsRequest(BaseModel):
    username: str = ""
    account_type: str = "creator"
    publish_mode: str = "direct"
    professional_account_id: str = ""
    page_id: str = ""
    permissions: str = ""


class InstagramAccountResponse(BaseModel):
    id: int
    store_id: int
    username: str
    account_type: str
    publish_mode: str
    professional_account_id: str
    page_id: str
    status: str
    permissions: str
    last_error: str
    last_test_at: datetime | None
    is_active: bool


class InstagramTestResponse(BaseModel):
    ok: bool
    status: str
    error: str = ""
    last_test_at: datetime | None = None


class CampaignRequest(BaseModel):
    name: str
    goal: str = ""
    status: str = "active"
    color: str = "#0F766E"
    owner: str = ""
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    notes: str = ""


class CampaignResponse(BaseModel):
    id: int
    store_id: int
    name: str
    goal: str
    status: str
    color: str
    owner: str
    starts_at: datetime | None
    ends_at: datetime | None
    notes: str
    post_count: int = 0
    created_at: datetime
    updated_at: datetime


class PostRequest(BaseModel):
    title: str
    caption: str = ""
    hashtags: str = ""
    platform: str = "rubika"
    timezone: str = "Asia/Tehran"
    campaign_id: int | None = None
    campaign: str = ""
    internal_note: str = ""
    scheduled_at: datetime | None = None


class PostScheduleRequest(BaseModel):
    scheduled_at: datetime
    timezone: str = "Asia/Tehran"


class PostStatusRequest(BaseModel):
    status: str


class PostReviewRequest(BaseModel):
    note: str = ""


class PostResponse(BaseModel):
    id: int
    store_id: int
    title: str
    caption: str
    hashtags: str
    platform: str
    status: str
    timezone: str
    campaign_id: int | None
    campaign: str
    internal_note: str
    scheduled_at: datetime | None
    ready_at: datetime | None
    published_at: datetime | None
    failed_at: datetime | None
    approval_status: str = "not_required"
    approval_note: str = ""
    submitted_at: datetime | None = None
    reviewed_at: datetime | None = None
    reviewed_by: str = ""
    rubika_message_id: str
    last_error: str
    attempt_count: int
    created_at: datetime
    updated_at: datetime


class PostStatsResponse(BaseModel):
    total: int
    draft: int
    ready: int
    scheduled: int
    publishing: int
    published: int
    partially_published: int = 0
    manual_ready: int = 0
    failed: int
    cancelled: int


class RetryFailedPostsResponse(BaseModel):
    retried_count: int
    post_ids: list[int]


class BulkPostStatusRequest(BaseModel):
    post_ids: list[int]
    status: str


class BulkPostCampaignRequest(BaseModel):
    post_ids: list[int]
    campaign_id: int | None = None


class BulkPostStatusResponse(BaseModel):
    updated_count: int
    post_ids: list[int]
    skipped_post_ids: list[int]


class OperationalNotificationResponse(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    recovery_hint: str
    action_label: str
    action_href: str
    post_id: int | None = None
    created_at: datetime
    action_required: bool


class OperationalNotificationSummaryResponse(BaseModel):
    total: int
    action_required: int
    critical: int
    warning: int
    info: int


class OperationalNotificationListResponse(BaseModel):
    notifications: list[OperationalNotificationResponse]
    summary: OperationalNotificationSummaryResponse


class PublishAttemptResponse(BaseModel):
    id: int
    post_id: int
    post_title: str
    post_platform: str
    channel: str
    action: str
    status: str
    request_payload: str
    response_payload: str
    error: str
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime


class MediaResponse(BaseModel):
    id: int
    store_id: int
    post_id: int | None
    original_filename: str
    stored_filename: str
    content_type: str
    size_bytes: int
    folder: str
    tags: str
    url: str


class AttachMediaRequest(BaseModel):
    post_id: int | None = None


class MediaMetadataRequest(BaseModel):
    folder: str = ""
    tags: str = ""
