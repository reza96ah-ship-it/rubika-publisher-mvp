import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.dependencies import get_active_store
from app.models import InstagramAccount, InstagramAutomationEvent, InstagramAutomationRule, Store, User
from app.schemas import InstagramAccountResponse, InstagramAutomationEventListResponse, InstagramAutomationEventResponse, InstagramAutomationRuleListResponse, InstagramAutomationRuleRequest, InstagramAutomationRuleResponse, InstagramAutomationRuleTestRequest, InstagramAutomationRuleTestResponse, InstagramSettingsRequest, InstagramTestResponse
from app.services.publishing_channels import get_active_instagram_account

router = APIRouter(prefix="/instagram", tags=["instagram"])

ACCOUNT_TYPES = {"personal", "creator", "business"}
PUBLISH_MODES = {"reminder", "direct"}
TRIGGER_TYPES = {"exact", "contains", "code", "any_of"}
RULE_STATUSES = {"draft", "active", "paused", "archived"}
PERSIAN_DIGIT_MAP = str.maketrans("\u06f0\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669", "01234567890123456789")


def normalize_trigger_text(value: str) -> str:
    return " ".join(value.translate(PERSIAN_DIGIT_MAP).strip().lower().split())


def clean_keywords(values: list[str]) -> list[str]:
    keywords: list[str] = []
    for value in values:
        keyword = value.strip()
        if keyword and keyword not in keywords:
            keywords.append(keyword)
    return keywords


def normalized_keywords(values: list[str]) -> list[str]:
    return [normalize_trigger_text(value) for value in values if normalize_trigger_text(value)]


def json_list(value: str) -> list[str]:
    try:
        parsed = json.loads(value or "[]")
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def rule_matches(rule: InstagramAutomationRule, comment_text: str) -> tuple[bool, str, str]:
    normalized_comment = normalize_trigger_text(comment_text)
    keywords = json_list(rule.normalized_keywords)
    if not normalized_comment:
        return False, normalized_comment, "Comment is empty."
    if not keywords:
        return False, normalized_comment, "Rule has no keywords."
    if rule.trigger_type in {"exact", "code"}:
        return normalized_comment in keywords, normalized_comment, "Exact match evaluated."
    if rule.trigger_type in {"contains", "any_of"}:
        return any(keyword in normalized_comment for keyword in keywords), normalized_comment, "Contains match evaluated."
    return False, normalized_comment, "Unsupported trigger type."


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

def normalize_account_type(value: str) -> str:
    account_type = value.strip().lower() or "creator"
    return account_type if account_type in ACCOUNT_TYPES else "creator"


def normalize_publish_mode(account_type: str, value: str) -> str:
    publish_mode = value.strip().lower() or ("reminder" if account_type == "personal" else "direct")
    if account_type == "personal":
        return "reminder"
    return publish_mode if publish_mode in PUBLISH_MODES else "direct"


def instagram_response(account: InstagramAccount) -> InstagramAccountResponse:
    return InstagramAccountResponse(
        id=account.id,
        store_id=account.store_id,
        username=account.username,
        account_type=account.account_type,
        publish_mode=account.publish_mode,
        professional_account_id=account.professional_account_id,
        page_id=account.page_id,
        status=account.status,
        permissions=account.permissions,
        last_error=account.last_error,
        last_test_at=account.last_test_at,
        is_active=account.is_active,
    )


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
    account.permissions = payload.permissions.strip()
    account.status = "reminder_ready" if publish_mode == "reminder" else "oauth_required"
    account.last_error = "" if publish_mode == "reminder" else "Meta OAuth is not connected yet"
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