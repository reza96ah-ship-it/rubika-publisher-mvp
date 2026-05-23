import asyncio
import json
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Post, PublishAttempt, RubikaAccount
from app.services.rubika_client import RubikaClient


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)


def build_post_text(post: Post) -> str:
    parts = [post.caption.strip(), post.hashtags.strip()]
    text = "\n\n".join([part for part in parts if part])
    return text or post.title.strip() or "پست بدون متن"


def get_active_rubika_account(db: Session) -> RubikaAccount | None:
    return db.scalar(select(RubikaAccount).where(RubikaAccount.is_active.is_(True)).order_by(RubikaAccount.id.asc()))


def extract_message_id(payload: dict) -> str:
    data = payload.get("data") if isinstance(payload, dict) else None
    candidates = []
    if isinstance(data, dict):
        candidates.extend([data.get("message_id"), data.get("messageId"), data.get("id")])
    candidates.extend([payload.get("message_id"), payload.get("messageId"), payload.get("id")])
    for value in candidates:
        if value is not None:
            return str(value)
    return ""


def start_attempt(db: Session, post: Post, request_payload: dict, action: str) -> PublishAttempt:
    now = datetime.utcnow()
    attempt = PublishAttempt(
        post_id=post.id,
        action=action,
        status="started",
        request_payload=json_text(request_payload),
        started_at=now,
        created_at=now,
    )
    db.add(attempt)
    post.attempt_count = (post.attempt_count or 0) + 1
    post.updated_at = now
    db.commit()
    db.refresh(attempt)
    return attempt


def finish_success(db: Session, post: Post, attempt: PublishAttempt, response_payload: dict) -> None:
    now = datetime.utcnow()
    attempt.status = "success"
    attempt.response_payload = json_text(response_payload)
    attempt.finished_at = now
    post.status = "published"
    post.published_at = now
    post.failed_at = None
    post.last_error = ""
    post.rubika_message_id = extract_message_id(response_payload)
    post.updated_at = now
    db.commit()


def finish_failure(db: Session, post: Post, attempt: PublishAttempt, error: str) -> None:
    now = datetime.utcnow()
    attempt.status = "failed"
    attempt.error = error
    attempt.finished_at = now
    post.status = "failed"
    post.failed_at = now
    post.last_error = error
    post.updated_at = now
    db.commit()


def reserve_due_posts(db: Session, now: datetime, limit: int) -> list[Post]:
    posts = db.scalars(
        select(Post)
        .where(Post.status == "scheduled", Post.scheduled_at.is_not(None), Post.scheduled_at <= now)
        .order_by(Post.scheduled_at.asc(), Post.id.asc())
        .limit(limit)
        .with_for_update(skip_locked=True)
    ).all()

    for post in posts:
        post.status = "publishing"
        post.last_error = ""
        post.updated_at = now

    db.commit()
    for post in posts:
        db.refresh(post)
    return list(posts)


def recover_stale_publishing_posts(db: Session, now: datetime, stale_after_minutes: int = 15) -> int:
    cutoff = now - timedelta(minutes=stale_after_minutes)
    posts = db.scalars(
        select(Post)
        .where(Post.status == "publishing", Post.updated_at <= cutoff)
        .order_by(Post.updated_at.asc(), Post.id.asc())
        .with_for_update(skip_locked=True)
    ).all()

    for post in posts:
        post.status = "failed"
        post.failed_at = now
        post.last_error = "Publishing timed out before worker completed"
        post.updated_at = now

    db.commit()
    return len(posts)


def publish_text_post(db: Session, post: Post, action: str = "scheduled") -> dict:
    account = get_active_rubika_account(db)
    text = build_post_text(post)
    request_payload = {"post_id": post.id, "text": text, "chat_id": account.chat_id if account else ""}
    attempt = start_attempt(db, post, request_payload, action)

    if account is None or not account.bot_token.strip() or not account.chat_id.strip():
        error = "Rubika account is not configured"
        finish_failure(db, post, attempt, error)
        return {"ok": False, "post_id": post.id, "error": error}

    try:
        client = RubikaClient(account.bot_token)
        response_payload = asyncio.run(client.send_message(account.chat_id, text))
        finish_success(db, post, attempt, response_payload)
        return {"ok": True, "post_id": post.id, "message_id": post.rubika_message_id}
    except Exception as exc:
        error = str(exc)
        finish_failure(db, post, attempt, error)
        return {"ok": False, "post_id": post.id, "error": error}
