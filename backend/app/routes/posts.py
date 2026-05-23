from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Post, Store, User
from app.schemas import PostRequest, PostResponse, PostScheduleRequest, PostStatsResponse, PostStatusRequest

router = APIRouter(prefix="/posts", tags=["posts"])

WORKFLOW_STATUSES = {"draft", "ready", "scheduled", "publishing", "published", "failed", "cancelled"}
EDITABLE_STATUSES = {"draft", "ready", "scheduled", "failed"}


def active_store(db: Session) -> Store:
    store = db.scalar(select(Store).where(Store.is_active.is_(True)).order_by(Store.id.asc()))
    if store is None:
        raise HTTPException(status_code=400, detail="Create store profile first")
    return store


def get_store_post(db: Session, store: Store, post_id: int) -> Post:
    post = db.scalar(select(Post).where(Post.id == post_id, Post.store_id == store.id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


def post_response(post: Post) -> PostResponse:
    return PostResponse(
        id=post.id,
        store_id=post.store_id,
        title=post.title,
        caption=post.caption,
        hashtags=post.hashtags,
        platform=post.platform,
        status=post.status,
        timezone=post.timezone,
        campaign=post.campaign,
        internal_note=post.internal_note,
        scheduled_at=post.scheduled_at,
        ready_at=post.ready_at,
        published_at=post.published_at,
        failed_at=post.failed_at,
        rubika_message_id=post.rubika_message_id,
        last_error=post.last_error,
        attempt_count=post.attempt_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def apply_payload(post: Post, payload: PostRequest) -> None:
    post.title = payload.title.strip() or "پست بدون عنوان"
    post.caption = payload.caption.strip()
    post.hashtags = payload.hashtags.strip()
    post.platform = payload.platform.strip() or "rubika"
    post.timezone = payload.timezone.strip() or "Asia/Tehran"
    post.campaign = payload.campaign.strip()
    post.internal_note = payload.internal_note.strip()
    post.scheduled_at = payload.scheduled_at
    post.updated_at = datetime.utcnow()


@router.get("/stats", response_model=PostStatsResponse)
def post_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostStatsResponse:
    store = active_store(db)
    rows = db.execute(
        select(Post.status, func.count(Post.id)).where(Post.store_id == store.id).group_by(Post.status)
    ).all()
    counts = {status: 0 for status in WORKFLOW_STATUSES}
    for status, count in rows:
        counts[status] = count
    return PostStatsResponse(total=sum(counts.values()), **counts)


@router.get("")
def list_posts(status: str | None = Query(default=None), search: str | None = Query(default=None), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    store = active_store(db)
    statement = select(Post).where(Post.store_id == store.id)
    if status and status != "all":
        statement = statement.where(Post.status == status)
    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(Post.title.ilike(pattern) | Post.caption.ilike(pattern) | Post.hashtags.ilike(pattern))
    posts = db.scalars(statement.order_by(Post.scheduled_at.asc().nulls_last(), Post.id.desc())).all()
    return [post_response(post) for post in posts]


@router.get("/{post_id}", response_model=PostResponse)
def read_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    store = active_store(db)
    return post_response(get_store_post(db, store, post_id))


@router.post("", response_model=PostResponse)
def create_post(payload: PostRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    store = active_store(db)
    post = Post(store_id=store.id, status="draft")
    apply_payload(post, payload)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post_response(post)


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, payload: PostRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    store = active_store(db)
    post = get_store_post(db, store, post_id)
    if post.status not in EDITABLE_STATUSES:
        raise HTTPException(status_code=400, detail="Post cannot be edited in its current status")
    apply_payload(post, payload)
    db.commit()
    db.refresh(post)
    return post_response(post)


@router.post("/{post_id}/ready", response_model=PostResponse)
def mark_ready(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    store = active_store(db)
    post = get_store_post(db, store, post_id)
    if post.status not in {"draft", "failed", "cancelled"}:
        raise HTTPException(status_code=400, detail="Only draft, failed, or cancelled posts can be marked ready")
    post.status = "ready"
    post.ready_at = datetime.utcnow()
    post.last_error = ""
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post_response(post)


@router.post("/{post_id}/schedule", response_model=PostResponse)
def schedule_post(post_id: int, payload: PostScheduleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    store = active_store(db)
    post = get_store_post(db, store, post_id)
    if post.status not in {"draft", "ready", "scheduled", "failed"}:
        raise HTTPException(status_code=400, detail="Post cannot be scheduled in its current status")
    post.status = "scheduled"
    post.scheduled_at = payload.scheduled_at
    post.timezone = payload.timezone.strip() or "Asia/Tehran"
    post.ready_at = post.ready_at or datetime.utcnow()
    post.last_error = ""
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post_response(post)


@router.post("/{post_id}/retry", response_model=PostResponse)
def retry_failed_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    store = active_store(db)
    post = get_store_post(db, store, post_id)
    if post.status != "failed":
        raise HTTPException(status_code=400, detail="Only failed posts can be retried")
    now = datetime.utcnow()
    post.status = "scheduled"
    post.scheduled_at = now
    post.ready_at = post.ready_at or now
    post.failed_at = None
    post.last_error = ""
    post.updated_at = now
    db.commit()
    db.refresh(post)
    return post_response(post)


@router.post("/{post_id}/status", response_model=PostResponse)
def change_status(post_id: int, payload: PostStatusRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    if payload.status not in WORKFLOW_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid post status")
    store = active_store(db)
    post = get_store_post(db, store, post_id)
    post.status = payload.status
    post.updated_at = datetime.utcnow()
    if payload.status == "ready":
        post.ready_at = post.ready_at or datetime.utcnow()
    if payload.status == "cancelled":
        post.scheduled_at = None
    db.commit()
    db.refresh(post)
    return post_response(post)
