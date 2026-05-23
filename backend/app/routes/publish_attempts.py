from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Post, PublishAttempt, User
from app.schemas import PublishAttemptResponse

router = APIRouter(prefix="/publish-attempts", tags=["publish-attempts"])


def attempt_response(attempt: PublishAttempt, post_title: str) -> PublishAttemptResponse:
    return PublishAttemptResponse(
        id=attempt.id,
        post_id=attempt.post_id,
        post_title=post_title,
        action=attempt.action,
        status=attempt.status,
        request_payload=attempt.request_payload,
        response_payload=attempt.response_payload,
        error=attempt.error,
        started_at=attempt.started_at,
        finished_at=attempt.finished_at,
        created_at=attempt.created_at,
    )


@router.get("", response_model=list[PublishAttemptResponse])
def list_publish_attempts(
    post_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PublishAttemptResponse]:
    statement = select(PublishAttempt, Post.title).join(Post, Post.id == PublishAttempt.post_id)
    if post_id is not None:
        statement = statement.where(PublishAttempt.post_id == post_id)
    if status and status != "all":
        statement = statement.where(PublishAttempt.status == status)
    rows = db.execute(statement.order_by(PublishAttempt.created_at.desc()).limit(100)).all()
    return [attempt_response(attempt, post_title) for attempt, post_title in rows]
