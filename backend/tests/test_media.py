from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import MediaAsset, Store
from app.routes.media import media_response, update_media_metadata
from app.schemas import MediaMetadataRequest


def test_update_media_metadata_and_response() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    now = datetime(2026, 1, 1, 12, 0, 0)

    with session_factory() as db:
        store = Store(name="Main", created_at=now, updated_at=now)
        db.add(store)
        db.flush()

        asset = MediaAsset(
            store_id=store.id,
            original_filename="launch.webp",
            stored_filename="launch.webp",
            file_path="/tmp/launch.webp",
            content_type="image/webp",
            size_bytes=100,
            created_at=now,
        )
        db.add(asset)
        db.commit()

        response = update_media_metadata(
            asset.id,
            MediaMetadataRequest(folder="  کمپین خرداد  ", tags="  محصول، لانچ  "),
            store=store,
            db=db,
        )

        assert response.folder == "کمپین خرداد"
        assert response.tags == "محصول، لانچ"
        assert media_response(asset).folder == "کمپین خرداد"
