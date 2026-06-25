from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True


def ensure_phase4a_schema() -> None:
    """Apply additive schema upgrades used by the Phase 4A workflow refactor.

    This project currently relies on SQLAlchemy create_all during MVP development.
    create_all does not alter existing tables, so these idempotent ALTER statements
    keep local databases compatible without introducing Alembic yet.
    """

    statements = [
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Tehran'",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS campaign VARCHAR(255) NOT NULL DEFAULT ''",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS internal_note TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP NULL",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP NULL",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP NULL",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS rubika_message_id VARCHAR(255) NOT NULL DEFAULT ''",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS last_error TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0",
        "CREATE INDEX IF NOT EXISTS ix_posts_status ON posts (status)",
        "CREATE INDEX IF NOT EXISTS ix_posts_scheduled_at ON posts (scheduled_at)",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
