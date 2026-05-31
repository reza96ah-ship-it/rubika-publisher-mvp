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
    default_hashtags: str = ""
    caption_footer: str = ""
    timezone: str = "Asia/Tehran"


class StoreResponse(BaseModel):
    id: int
    name: str
    category: str
    phone: str
    description: str
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


class PostRequest(BaseModel):
    title: str
    caption: str = ""
    hashtags: str = ""
    platform: str = "rubika"
    timezone: str = "Asia/Tehran"
    campaign: str = ""
    internal_note: str = ""
    scheduled_at: datetime | None = None


class PostScheduleRequest(BaseModel):
    scheduled_at: datetime
    timezone: str = "Asia/Tehran"


class PostStatusRequest(BaseModel):
    status: str


class PostResponse(BaseModel):
    id: int
    store_id: int
    title: str
    caption: str
    hashtags: str
    platform: str
    status: str
    timezone: str
    campaign: str
    internal_note: str
    scheduled_at: datetime | None
    ready_at: datetime | None
    published_at: datetime | None
    failed_at: datetime | None
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
    failed: int
    cancelled: int


class RetryFailedPostsResponse(BaseModel):
    retried_count: int
    post_ids: list[int]


class PublishAttemptResponse(BaseModel):
    id: int
    post_id: int
    post_title: str
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
