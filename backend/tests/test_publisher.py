from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Post
from app.services.publisher import build_post_text, extract_message_id, json_text
from app.services.publisher import recover_stale_publishing_posts, reserve_due_posts


class PostStub:
    def __init__(self, title: str = "", caption: str = "", hashtags: str = "") -> None:
        self.title = title
        self.caption = caption
        self.hashtags = hashtags


def test_build_post_text_combines_caption_and_hashtags() -> None:
    post = PostStub(caption="A launch caption", hashtags="#rubika #shop")

    assert build_post_text(post) == "A launch caption\n\n#rubika #shop"


def test_build_post_text_falls_back_to_title() -> None:
    post = PostStub(title="Internal title")

    assert build_post_text(post) == "Internal title"


def test_build_post_text_has_default_empty_message() -> None:
    post = PostStub()

    assert build_post_text(post) == "پست بدون متن"


def test_extract_message_id_checks_nested_and_top_level_fields() -> None:
    assert extract_message_id({"data": {"message_id": 123}}) == "123"
    assert extract_message_id({"messageId": "abc"}) == "abc"
    assert extract_message_id({"data": {"id": "nested-id"}}) == "nested-id"


def test_json_text_keeps_persian_text_readable() -> None:
    assert json_text({"text": "سلام"}) == '{"text": "سلام"}'


def test_reserve_due_posts_claims_only_due_scheduled_posts() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    now = datetime(2026, 1, 1, 12, 0, 0)

    with session_factory() as db:
        due_post = Post(store_id=1, title="Due", status="scheduled", scheduled_at=now - timedelta(minutes=1), created_at=now, updated_at=now)
        future_post = Post(store_id=1, title="Future", status="scheduled", scheduled_at=now + timedelta(minutes=1), created_at=now, updated_at=now)
        draft_post = Post(store_id=1, title="Draft", status="draft", scheduled_at=now - timedelta(minutes=1), created_at=now, updated_at=now)
        db.add_all([due_post, future_post, draft_post])
        db.commit()

        reserved = reserve_due_posts(db, now, limit=10)

        assert [post.id for post in reserved] == [due_post.id]
        assert due_post.status == "publishing"
        assert future_post.status == "scheduled"
        assert draft_post.status == "draft"

        assert reserve_due_posts(db, now, limit=10) == []


def test_recover_stale_publishing_posts_marks_only_old_claims_failed() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    now = datetime(2026, 1, 1, 12, 0, 0)

    with session_factory() as db:
        stale_post = Post(store_id=1, title="Stale", status="publishing", scheduled_at=now, created_at=now, updated_at=now - timedelta(minutes=30))
        fresh_post = Post(store_id=1, title="Fresh", status="publishing", scheduled_at=now, created_at=now, updated_at=now - timedelta(minutes=2))
        db.add_all([stale_post, fresh_post])
        db.commit()

        recovered_count = recover_stale_publishing_posts(db, now, stale_after_minutes=15)

        assert recovered_count == 1
        assert stale_post.status == "failed"
        assert stale_post.failed_at == now
        assert stale_post.last_error == "Publishing timed out before worker completed"
        assert fresh_post.status == "publishing"
