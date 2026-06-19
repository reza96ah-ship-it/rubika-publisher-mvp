import json
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import get_settings
from app.database import get_db
from app.dependencies import get_active_store
from app.models import InstagramAccount, InstagramAutomationEvent, InstagramAutomationRule, Store, User
from app.schemas import InstagramAccountResponse, InstagramAutomationCommentSimulationRequest, InstagramAutomationEventListResponse, InstagramAutomationEventResponse, InstagramAutomationIngestResponse, InstagramAutomationRuleListResponse, InstagramAutomationRuleRequest, InstagramAutomationRuleResponse, InstagramAutomationRuleTestRequest, InstagramAutomationRuleTestResponse, InstagramSettingsRequest, InstagramTestResponse
from app.services.instagram_automation import build_simulated_comment_event, clean_keywords, ingest_instagram_comment_events, ingest_instagram_webhook_payload, json_list, normalized_keywords, rule_matches, verify_meta_signature
from app.services.publishing_channels import get_active_instagram_account

router = APIRouter(prefix="/instagram", tags=["instagram"])

ACCOUNT_TYPES = {"personal", "creator", "business"}
PUBLISH_MODES = {"reminder", "direct"}
TRIGGER_TYPES = {"exact", "contains", "code", "any_of"}
RULE_STATUSES = {"draft", "active", "paused", "archived"}


def automation_rule_response(rule: InstagramAutomationRule) -> InstagramAutomationRuleResponse:
    return InstagramAutomationRuleResponse(
        id=rule.id,
        store_id=rule.store_id,
        instagram_account_id=rule.instagram_account_id,
        campaign_id=rule.campaign_id,
        post_id=rule.post_id,
        name=rule.name,
        status=rule.status,
        trigger_type=rule.trigger_type,
        trigger_keywords=json_list(rule.trigger_keywords),
        normalized_keywords=json_list(rule.normalized_keywords),
        private_reply_message=rule.private_reply_message,
        public_reply_enabled=rule.public_reply_enabled,
        public_reply_message=rule.public_reply_message,
        match_limit_per_hour=rule.match_limit_per_hour,
        match_limit_total=rule.match_limit_total,
        starts_at=rule.starts_at,
        ends_at=rule.ends_at,
        created_at=rule.created_at,
        updated_at=rule.updated_at,
    )


def automation_event_response(event: InstagramAutomationEvent) -> InstagramAutomationEventResponse:
    return InstagramAutomationEventResponse(
        id=event.id,
        store_id=event.store_id,
        rule_id=event.rule_id,
        instagram_account_id=event.instagram_account_id,
        post_id=event.post_id,
        ig_media_id=event.ig_media_id,
        ig_comment_id=event.ig_comment_id,
        commenter_username=event.commenter_username,
        comment_text=event.comment_text,
        normalized_comment_text=event.normalized_comment_text,
        event_status=event.event_status,
        skip_reason=event.skip_reason,
        failure_reason=event.failure_reason,
        private_reply_message_id=event.private_reply_message_id,
        public_reply_comment_id=event.public_reply_comment_id,
        attempt_count=event.attempt_count,
        last_attempt_at=event.last_attempt_at,
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


def automation_ingest_response(summary, events: list[InstagramAutomationEvent]) -> InstagramAutomationIngestResponse:
    return InstagramAutomationIngestResponse(
        received=summary.received,
        created=summary.created,
        duplicates=summary.duplicates,
        matched=summary.matched,
        queued=summary.queued,
        skipped=summary.skipped,
        event_ids=summary.event_ids,
        events=[automation_event_response(event) for event in events],
    )


def enqueue_instagram_automation_events(event_ids: list[int]) -> None:
    if not event_ids:
        return
    from app.worker import process_instagram_automation_event

    for event_id in event_ids:
        process_instagram_automation_event.delay(event_id)

def normalize_account_type(value: str) -> str:
    account_type = value.strip().lower() or "creator"
    return account_type if account_type in ACCOUNT_TYPES else "creator"


def normalize_publish_mode(account_type: str, value: str) -> str:
    publish_mode = value.strip().lower() or ("reminder" if account_type == "personal" else "direct")
    if account_type == "personal":
        return "reminder"
    return publish_mode if publish_mode in PUBLISH_MODES else "direct"


def instagram_response(account: InstagramAccount) -> InstagramAccountResponse:
    masked_token = f"{account.access_token[:6]}..." if account.access_token else ""
    return InstagramAccountResponse(
        id=account.id,
        store_id=account.store_id,
        username=account.username,
        account_type=account.account_type,
        publish_mode=account.publish_mode,
        professional_account_id=account.professional_account_id,
        page_id=account.page_id,
        has_access_token=bool(account.access_token),
        access_token_masked=masked_token,
        token_expires_at=account.token_expires_at,
        status=account.status,
        permissions=account.permissions,
        last_error=account.last_error,
        last_test_at=account.last_test_at,
        is_active=account.is_active,
    )


@router.get("/webhook")
def verify_instagram_webhook(
    mode: str = Query("", alias="hub.mode"),
    verify_token: str = Query("", alias="hub.verify_token"),
    challenge: str = Query("", alias="hub.challenge"),
) -> Response:
    settings = get_settings()
    if mode == "subscribe" and settings.instagram_webhook_verify_token and verify_token == settings.instagram_webhook_verify_token:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Instagram webhook verification failed")


@router.post("/webhook", response_model=InstagramAutomationIngestResponse)
async def receive_instagram_webhook(
    request: Request,
    x_hub_signature_256: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> InstagramAutomationIngestResponse:
    settings = get_settings()
    raw_body = await request.body()
    if not verify_meta_signature(raw_body, x_hub_signature_256, settings.instagram_webhook_app_secret):
        raise HTTPException(status_code=403, detail="Invalid Meta webhook signature")
    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook JSON") from exc
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Webhook payload must be an object")

    summary = ingest_instagram_webhook_payload(db, payload)
    enqueue_instagram_automation_events(summary.event_ids)
    events = db.scalars(
        select(InstagramAutomationEvent)
        .where(InstagramAutomationEvent.id.in_(summary.event_ids))
        .order_by(InstagramAutomationEvent.created_at.desc(), InstagramAutomationEvent.id.desc())
    ).all() if summary.event_ids else []
    return automation_ingest_response(summary, events)


@router.get("/settings")
def read_settings(store: Store = Depends(get_active_store), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = get_active_instagram_account(db, store.id)
    if account is None:
        return None
    return instagram_response(account)


@router.put("/settings", response_model=InstagramAccountResponse)
def save_settings(
    payload: InstagramSettingsRequest,
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAccountResponse:
    account = get_active_instagram_account(db, store.id)
    if account is None:
        account = InstagramAccount(store_id=store.id)
        db.add(account)

    account_type = normalize_account_type(payload.account_type)
    publish_mode = normalize_publish_mode(account_type, payload.publish_mode)

    account.username = payload.username.strip()
    account.account_type = account_type
    account.publish_mode = publish_mode
    account.professional_account_id = payload.professional_account_id.strip()
    account.page_id = payload.page_id.strip()
    if payload.access_token.strip():
        account.access_token = payload.access_token.strip()
    account.token_expires_at = payload.token_expires_at
    account.permissions = payload.permissions.strip()
    direct_ready = bool(account.professional_account_id and account.page_id and account.access_token)
    account.status = "reminder_ready" if publish_mode == "reminder" else ("connected" if direct_ready else "oauth_required")
    account.last_error = "" if publish_mode == "reminder" or direct_ready else "Meta OAuth, Page ID, Professional Account ID, and access token are required"
    account.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(account)
    return instagram_response(account)


@router.post("/test", response_model=InstagramTestResponse)
def test_connection(
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramTestResponse:
    account = get_active_instagram_account(db, store.id)
    now = datetime.utcnow()
    if account is not None:
        if account.publish_mode == "reminder":
            account.status = "reminder_ready"
            account.last_error = ""
            account.last_test_at = now
            account.updated_at = now
            db.commit()
            return InstagramTestResponse(
                ok=True,
                status="reminder_ready",
                error="Personal Instagram account is ready for manual reminder publishing",
                last_test_at=now,
            )
        account.status = "oauth_required"
        account.last_error = "Meta OAuth, instagram_basic, instagram_content_publish, and page linkage are required"
        account.last_test_at = now
        account.updated_at = now
        db.commit()
    return InstagramTestResponse(
        ok=False,
        status="oauth_required",
        error="Meta OAuth connection is planned but not implemented in this phase",
        last_test_at=now,
    )


@router.get("/automation/rules", response_model=InstagramAutomationRuleListResponse)
def list_automation_rules(
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAutomationRuleListResponse:
    rules = db.scalars(
        select(InstagramAutomationRule)
        .where(InstagramAutomationRule.store_id == store.id)
        .order_by(InstagramAutomationRule.updated_at.desc(), InstagramAutomationRule.id.desc())
    ).all()
    return InstagramAutomationRuleListResponse(rules=[automation_rule_response(rule) for rule in rules], total=len(rules))


@router.post("/automation/rules", response_model=InstagramAutomationRuleResponse)
def create_automation_rule(
    payload: InstagramAutomationRuleRequest,
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAutomationRuleResponse:
    trigger_type = payload.trigger_type.strip().lower() or "exact"
    if trigger_type not in TRIGGER_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported trigger type")
    status = payload.status.strip().lower() or "draft"
    if status not in RULE_STATUSES:
        raise HTTPException(status_code=400, detail="Unsupported rule status")
    keywords = clean_keywords(payload.trigger_keywords)
    normalized = normalized_keywords(keywords)
    if not normalized:
        raise HTTPException(status_code=400, detail="At least one trigger keyword is required")
    if not payload.private_reply_message.strip():
        raise HTTPException(status_code=400, detail="Private reply message is required")
    account = get_active_instagram_account(db, store.id)
    if status == "active" and (account is None or account.publish_mode == "reminder"):
        raise HTTPException(status_code=400, detail="Active automation requires an Instagram professional account")
    now = datetime.utcnow()
    rule = InstagramAutomationRule(
        store_id=store.id,
        instagram_account_id=account.id if account else None,
        campaign_id=payload.campaign_id,
        post_id=payload.post_id,
        name=payload.name.strip() or f"Instagram trigger: {keywords[0]}",
        status=status,
        trigger_type=trigger_type,
        trigger_keywords=json.dumps(keywords, ensure_ascii=False),
        normalized_keywords=json.dumps(normalized, ensure_ascii=False),
        private_reply_message=payload.private_reply_message.strip(),
        public_reply_enabled=payload.public_reply_enabled,
        public_reply_message=payload.public_reply_message.strip(),
        match_limit_per_hour=max(1, min(payload.match_limit_per_hour, 750)),
        match_limit_total=max(0, payload.match_limit_total),
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        created_at=now,
        updated_at=now,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return automation_rule_response(rule)


@router.post("/automation/rules/{rule_id}/test", response_model=InstagramAutomationRuleTestResponse)
def test_automation_rule(
    rule_id: int,
    payload: InstagramAutomationRuleTestRequest,
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAutomationRuleTestResponse:
    rule = db.scalar(select(InstagramAutomationRule).where(InstagramAutomationRule.id == rule_id, InstagramAutomationRule.store_id == store.id))
    if rule is None:
        raise HTTPException(status_code=404, detail="Automation rule not found")
    matched, normalized_comment, reason = rule_matches(rule, payload.comment_text)
    return InstagramAutomationRuleTestResponse(
        matched=matched,
        normalized_comment_text=normalized_comment,
        normalized_keywords=json_list(rule.normalized_keywords),
        reason=reason,
    )


@router.get("/automation/events", response_model=InstagramAutomationEventListResponse)
def list_automation_events(
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAutomationEventListResponse:
    events = db.scalars(
        select(InstagramAutomationEvent)
        .where(InstagramAutomationEvent.store_id == store.id)
        .order_by(InstagramAutomationEvent.created_at.desc(), InstagramAutomationEvent.id.desc())
        .limit(100)
    ).all()
    return InstagramAutomationEventListResponse(events=[automation_event_response(event) for event in events], total=len(events))


@router.post("/automation/simulate-comment", response_model=InstagramAutomationIngestResponse)
def simulate_automation_comment(
    payload: InstagramAutomationCommentSimulationRequest,
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAutomationIngestResponse:
    account = get_active_instagram_account(db, store.id)
    if account is None:
        raise HTTPException(status_code=400, detail="Instagram account is not configured")
    comment_text = payload.comment_text.strip()
    if not comment_text:
        raise HTTPException(status_code=400, detail="Comment text is required")
    comment_id = payload.ig_comment_id.strip() or f"local-{int(datetime.utcnow().timestamp() * 1000)}"
    event = build_simulated_comment_event(
        account=account,
        comment_text=comment_text,
        comment_id=comment_id,
        media_id=payload.ig_media_id.strip() or "local-media",
        username=payload.commenter_username.strip() or "local_tester",
    )
    summary = ingest_instagram_comment_events(db, [event])
    enqueue_instagram_automation_events(summary.event_ids)
    events = db.scalars(
        select(InstagramAutomationEvent)
        .where(InstagramAutomationEvent.id.in_(summary.event_ids))
        .order_by(InstagramAutomationEvent.created_at.desc(), InstagramAutomationEvent.id.desc())
    ).all() if summary.event_ids else []
    return automation_ingest_response(summary, events)
