from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_active_store
from app.models import MediaAsset, Store
from app.schemas import AttachMediaRequest, MediaMetadataRequest, MediaResponse
from app.store_scope import get_store_media_asset, get_store_post

router = APIRouter(prefix="/media", tags=["media"])
settings = get_settings()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 8 * 1024 * 1024


def media_response(asset: MediaAsset) -> MediaResponse:
    return MediaResponse(
        id=asset.id,
        store_id=asset.store_id,
        post_id=asset.post_id,
        original_filename=asset.original_filename,
        stored_filename=asset.stored_filename,
        content_type=asset.content_type,
        size_bytes=asset.size_bytes,
        folder=asset.folder,
        tags=asset.tags,
        url=f"/media/{asset.id}/file",
    )


@router.get("")
def list_media(store: Store = Depends(get_active_store), db: Session = Depends(get_db)):
    assets = db.scalars(select(MediaAsset).where(MediaAsset.store_id == store.id).order_by(MediaAsset.id.desc())).all()
    return [media_response(asset) for asset in assets]


async def save_uploaded_media(file: UploadFile, store: Store, db: Session, folder: str = "", tags: str = "") -> MediaAsset:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG and WEBP images are allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File is too large")

    media_dir = Path(settings.media_dir)
    media_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "image").suffix.lower() or ".jpg"
    stored_filename = f"{uuid4().hex}{extension}"
    file_path = media_dir / stored_filename
    file_path.write_bytes(content)

    asset = MediaAsset(
        store_id=store.id,
        original_filename=file.filename or stored_filename,
        stored_filename=stored_filename,
        file_path=str(file_path),
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        folder=folder.strip(),
        tags=tags.strip(),
    )
    db.add(asset)
    return asset


@router.post("")
async def upload_media(
    file: UploadFile = File(...),
    folder: str = Form(""),
    tags: str = Form(""),
    store: Store = Depends(get_active_store),
    db: Session = Depends(get_db),
):
    asset = await save_uploaded_media(file, store, db, folder, tags)
    db.commit()
    db.refresh(asset)
    return media_response(asset)


@router.post("/batch")
async def upload_media_batch(
    files: list[UploadFile] = File(...),
    folder: str = Form(""),
    tags: str = Form(""),
    store: Store = Depends(get_active_store),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=400, detail="Select at least one file")
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Upload up to 20 files at a time")

    assets: list[MediaAsset] = []
    try:
        for file in files:
            assets.append(await save_uploaded_media(file, store, db, folder, tags))
        db.commit()
    except Exception:
        db.rollback()
        for asset in assets:
            Path(asset.file_path).unlink(missing_ok=True)
        raise
    for asset in assets:
        db.refresh(asset)
    return [media_response(asset) for asset in assets]


@router.get("/{asset_id}/file")
def read_media_file(asset_id: int, store: Store = Depends(get_active_store), db: Session = Depends(get_db)):
    asset = get_store_media_asset(db, store, asset_id)
    return FileResponse(asset.file_path, media_type=asset.content_type, filename=asset.original_filename)


@router.put("/{asset_id}/attach")
def attach_media(asset_id: int, payload: AttachMediaRequest, store: Store = Depends(get_active_store), db: Session = Depends(get_db)):
    asset = get_store_media_asset(db, store, asset_id)

    if payload.post_id is not None:
        get_store_post(db, store, payload.post_id)

    asset.post_id = payload.post_id
    db.commit()
    db.refresh(asset)
    return media_response(asset)


@router.put("/{asset_id}/metadata")
def update_media_metadata(
    asset_id: int,
    payload: MediaMetadataRequest,
    store: Store = Depends(get_active_store),
    db: Session = Depends(get_db),
):
    asset = get_store_media_asset(db, store, asset_id)
    asset.folder = payload.folder.strip()
    asset.tags = payload.tags.strip()
    db.commit()
    db.refresh(asset)
    return media_response(asset)
