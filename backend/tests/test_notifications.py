from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Post, RubikaAccount, Store
from app.routes.notifications import build_operational_notifications


def session_factory():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)


def test_notifications_group_action_required_and_recent_success_events() -> None:
    factory = session_factory()
    now = datetime(2026, 5, 31, 12, 0, 0)

    with factory() as db:
        store = Store(name="Main", created_at=now, updated_at=now)
        db.add(store)
        db.flush()
        db.add(RubikaAccount(bot_token="token", chat_id="channel", status="connected", last_test_at=now))
        db.add_all(
            [
                Post(store_id=store.id, title="Failed", status="failed", last_error="Attached media file is missing", failed_at=now - timedelta(minutes=3), created_at=now, updated_at=now),
                Post(store_id=store.id, title="Stale", status="publishing", created_at=now, updated_at=now - timedelta(minutes=20)),
                Post(store_id=store.id, title="Manual", status="manual_ready", platform="instagram", created_at=now, updated_at=now - timedelta(minutes=2)),
                Post(store_id=store.id, title="Published", status="published", published_at=now - timedelta(hours=1), created_at=now, updated_at=now),
                Post(store_id=store.id, title="Old published", status="published", published_at=now - timedelta(days=2), created_at=now, updated_at=now),
            ]
        )
        db.commit()

        result = build_operational_notifications(db, store, now)

        assert [item.id for item in result.notifications] == [
            f"post-failed-1-{int((now - timedelta(minutes=3)).timestamp())}",
            f"post-manual-ready-3-{int((now - timedelta(minutes=2)).timestamp())}",
            f"post-stale-2-{int((now - timedelta(minutes=20)).timestamp())}",
            f"post-published-4-{int((now - timedelta(hours=1)).timestamp())}",
        ]
        assert result.summary.total == 4
        assert result.summary.action_required == 3
        assert result.summary.critical == 1
        assert result.summary.warning == 2
        assert result.summary.info == 1


def test_notifications_include_connection_readiness_and_scope_posts_to_store() -> None:
    factory = session_factory()
    now = datetime(2026, 5, 31, 12, 0, 0)

    with factory() as db:
        current_store = Store(name="Main", created_at=now, updated_at=now)
        other_store = Store(name="Other", created_at=now, updated_at=now)
        db.add_all([current_store, other_store])
        db.flush()
        db.add(Post(store_id=other_store.id, title="Other failure", status="failed", last_error="Other error", failed_at=now, created_at=now, updated_at=now))
        db.commit()

        result = build_operational_notifications(db, current_store, now)

        assert [item.id for item in result.notifications] == ["rubika-readiness"]
        assert result.notifications[0].category == "connection"
        assert result.notifications[0].action_href == "/rubika"
        assert result.summary.action_required == 1
