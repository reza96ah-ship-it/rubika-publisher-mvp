from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.dependencies import get_active_store
from app.models import InstagramAccount, Store, User
from app.schemas import InstagramAccountResponse, InstagramSettingsRequest, InstagramTestResponse
from app.services.publishing_channels import get_active_instagram_account

router = APIRouter(prefix="/instagram", tags=["instagram"])


def instagram_response(account: InstagramAccount) -> InstagramAccountResponse:
    return InstagramAccountResponse(
        id=account.id,
        store_id=account.store_id,
        username=account.username,
        professional_account_id=account.professional_account_id,
        page_id=account.page_id,
        status=account.status,
        permissions=account.permissions,
        last_error=account.last_error,
        last_test_at=account.last_test_at,
        is_active=account.is_active,
    )


@router.get("/settings")
def read_settings(store: Store = Depends(get_active_store), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = get_active_instagram_account(db, store.id)
    if account is None:
        return None
    return instagram_response(account)


@router.put("/settings", response_model=InstagramAccountResponse)
def save_settings(
    payload: InstagramSettingsRequest,
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramAccountResponse:
    account = get_active_instagram_account(db, store.id)
    if account is None:
        account = InstagramAccount(store_id=store.id)
        db.add(account)

    account.username = payload.username.strip()
    account.professional_account_id = payload.professional_account_id.strip()
    account.page_id = payload.page_id.strip()
    account.permissions = payload.permissions.strip()
    account.status = "oauth_required"
    account.last_error = "Meta OAuth is not connected yet"
    account.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(account)
    return instagram_response(account)


@router.post("/test", response_model=InstagramTestResponse)
def test_connection(
    store: Store = Depends(get_active_store),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InstagramTestResponse:
    account = get_active_instagram_account(db, store.id)
    now = datetime.utcnow()
    if account is not None:
        account.status = "oauth_required"
        account.last_error = "Meta OAuth, instagram_basic, instagram_content_publish, and page linkage are required"
        account.last_test_at = now
        account.updated_at = now
        db.commit()
    return InstagramTestResponse(
        ok=False,
        status="oauth_required",
        error="Meta OAuth connection is planned but not implemented in this phase",
        last_test_at=now,
    )
