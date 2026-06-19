import json
from datetime import datetime
from types import SimpleNamespace

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import InstagramAccount, InstagramAutomationEvent, InstagramAutomationRule, Store
from app.services.instagram_automation import build_simulated_comment_event, ingest_instagram_comment_events, process_instagram_automation_event
from app.services.instagram_client import InstagramSendResult


def make_session():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)


def create_connected_account_with_rule(db, now: datetime) -> tuple[InstagramAccount, InstagramAutomationRule]:
    store = Store(name="Main", created_at=now, updated_at=now)
    db.add(store)
    db.flush()
    account = InstagramAccount(
        store_id=store.id,
        username="shop",
        account_type="business",
        publish_mode="direct",
        professional_account_id="ig-1",
        page_id="page-1",
        access_token="token-1",
        status="connected",
        created_at=now,
        updated_at=now,
    )
    rule = InstagramAutomationRule(
        store_id=store.id,
        instagram_account_id=None,
        name="Code 5",
        status="active",
        trigger_type="exact",
        trigger_keywords=json.dumps(["5"], ensure_ascii=False),
        normalized_keywords=json.dumps(["5"], ensure_ascii=False),
        private_reply_message="Here is your link",
        created_at=now,
        updated_at=now,
    )
    db.add_all([account, rule])
    db.commit()
    return account, rule


def test_instagram_automation_ingests_matches_and_dedupes_persian_digit_comment() -> None:
    session_factory = make_session()
    now = datetime.utcnow()

    with session_factory() as db:
        account, rule = create_connected_account_with_rule(db, now)
        event = build_simulated_comment_event(account, "\u06f5", "comment-1", "media-1", "buyer")

        summary = ingest_instagram_comment_events(db, [event])
        stored = db.scalar(select(InstagramAutomationEvent).where(InstagramAutomationEvent.ig_comment_id == "comment-1"))

        assert summary.received == 1
        assert summary.created == 1
        assert summary.matched == 1
        assert summary.queued == 1
        assert stored is not None
        assert stored.rule_id == rule.id
        assert stored.normalized_comment_text == "5"
        assert stored.event_status == "queued"

        duplicate_summary = ingest_instagram_comment_events(db, [event])

        assert duplicate_summary.created == 0
        assert duplicate_summary.duplicates == 1


def test_instagram_automation_processes_as_dry_run_when_dispatch_disabled(monkeypatch) -> None:
    session_factory = make_session()
    now = datetime.utcnow()
    monkeypatch.setattr("app.services.instagram_automation.get_settings", lambda: SimpleNamespace(instagram_automation_dispatch_enabled=False))

    with session_factory() as db:
        account, _rule = create_connected_account_with_rule(db, now)
        event = build_simulated_comment_event(account, "5", "comment-2", "media-1", "buyer")
        summary = ingest_instagram_comment_events(db, [event])

        result = process_instagram_automation_event(db, summary.event_ids[0])
        stored = db.get(InstagramAutomationEvent, summary.event_ids[0])

        assert result["ok"] is True
        assert result["status"] == "dry_run"
        assert stored is not None
        assert stored.event_status == "dry_run"
        assert stored.attempt_count == 1


def test_instagram_automation_processes_private_reply_when_dispatch_enabled(monkeypatch) -> None:
    session_factory = make_session()
    now = datetime.utcnow()
    calls: list[tuple[str, str, str, str]] = []
    monkeypatch.setattr("app.services.instagram_automation.get_settings", lambda: SimpleNamespace(instagram_automation_dispatch_enabled=True))

    class FakeInstagramClient:
        def send_private_reply(self, page_id: str, access_token: str, comment_id: str, text: str) -> InstagramSendResult:
            calls.append((page_id, access_token, comment_id, text))
            return InstagramSendResult(ok=True, message_id="dm-1")

        def send_public_comment_reply(self, access_token: str, comment_id: str, text: str) -> InstagramSendResult:
            return InstagramSendResult(ok=True, comment_id="reply-1")

    with session_factory() as db:
        account, _rule = create_connected_account_with_rule(db, now)
        event = build_simulated_comment_event(account, "5", "comment-3", "media-1", "buyer")
        summary = ingest_instagram_comment_events(db, [event])

        result = process_instagram_automation_event(db, summary.event_ids[0], client=FakeInstagramClient())
        stored = db.get(InstagramAutomationEvent, summary.event_ids[0])

        assert result["ok"] is True
        assert result["status"] == "sent"
        assert calls == [("page-1", "token-1", "comment-3", "Here is your link")]
        assert stored is not None
        assert stored.event_status == "sent"
        assert stored.private_reply_message_id == "dm-1"
