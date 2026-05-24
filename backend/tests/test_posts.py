from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Post, Store
from app.routes.posts import apply_payload, post_response, schedule_post
from app.schemas import PostRequest, PostScheduleRequest


def test_apply_payload_stores_aware_schedule_as_utc_naive() -> None:
    tehran = timezone(timedelta(hours=3, minutes=30))
    now = datetime(2026, 1, 1, 12, 0, 0)
    post = Post(store_id=1, title="", created_at=now, updated_at=now)
    payload = PostRequest(title="Launch", scheduled_at=datetime(2026, 1, 10, 9, 15, tzinfo=tehran), timezone="")

    apply_payload(post, payload)

    assert post.scheduled_at == datetime(2026, 1, 10, 5, 45)
    assert post.scheduled_at.tzinfo is None
    assert post.timezone == "Asia/Tehran"


def test_post_response_returns_stored_naive_datetimes_as_utc_aware() -> None:
    stored_time = datetime(2026, 1, 10, 5, 45)
    post = Post(
        id=1,
        store_id=1,
        title="Launch",
        caption="",
        hashtags="",
        platform="rubika",
        status="scheduled",
        timezone="Asia/Tehran",
        campaign="",
        internal_note="",
        scheduled_at=stored_time,
        rubika_message_id="",
        last_error="",
        attempt_count=0,
        created_at=stored_time,
        updated_at=stored_time,
    )

    response = post_response(post)

    assert response.scheduled_at == stored_time.replace(tzinfo=timezone.utc)
    assert response.created_at == stored_time.replace(tzinfo=timezone.utc)
    assert response.updated_at == stored_time.replace(tzinfo=timezone.utc)


def test_schedule_post_normalizes_tehran_time_and_returns_utc_response() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    tehran = timezone(timedelta(hours=3, minutes=30))
    now = datetime(2026, 1, 1, 12, 0, 0)

    with session_factory() as db:
        store = Store(name="Main", created_at=now, updated_at=now)
        db.add(store)
        db.flush()

        post = Post(store_id=store.id, title="Launch", status="draft", created_at=now, updated_at=now)
        db.add(post)
        db.commit()

        response = schedule_post(
            post.id,
            PostScheduleRequest(scheduled_at=datetime(2026, 1, 10, 9, 15, tzinfo=tehran), timezone="Asia/Tehran"),
            store=store,
            db=db,
        )
        db.refresh(post)

        expected_utc_naive = datetime(2026, 1, 10, 5, 45)
        assert post.status == "scheduled"
        assert post.scheduled_at == expected_utc_naive
        assert post.scheduled_at.tzinfo is None
        assert post.timezone == "Asia/Tehran"
        assert response.scheduled_at == expected_utc_naive.replace(tzinfo=timezone.utc)
        assert response.ready_at is not None
