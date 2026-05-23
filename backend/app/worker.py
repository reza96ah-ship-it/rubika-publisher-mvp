from datetime import datetime

from celery import Celery
from sqlalchemy import select

from app.config import get_settings
from app.database import SessionLocal
from app.models import Post
from app.services.publisher import publish_text_post, reserve_post

settings = get_settings()

celery_app = Celery(
    "rubika_publisher_worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    timezone="Asia/Tehran",
    enable_utc=True,
    task_track_started=True,
    beat_schedule={
        "publish-due-posts-every-minute": {
            "task": "posts.publish_due",
            "schedule": 60.0,
        }
    },
)


@celery_app.task(name="system.ping")
def ping() -> str:
    return "pong"


@celery_app.task(name="posts.publish_due")
def publish_due_posts(limit: int = 10) -> dict:
    now = datetime.utcnow()
    results: list[dict] = []

    with SessionLocal() as db:
        posts = db.scalars(
            select(Post)
            .where(Post.status == "scheduled", Post.scheduled_at.is_not(None), Post.scheduled_at <= now)
            .order_by(Post.scheduled_at.asc(), Post.id.asc())
            .limit(limit)
        ).all()

        for post in posts:
            try:
                reserve_post(db, post)
                results.append(publish_text_post(db, post, action="scheduled"))
            except Exception as exc:
                post.status = "failed"
                post.failed_at = datetime.utcnow()
                post.last_error = str(exc)
                post.updated_at = datetime.utcnow()
                db.commit()
                results.append({"ok": False, "post_id": post.id, "error": str(exc)})

    return {"checked_at": now.isoformat(), "count": len(results), "results": results}
