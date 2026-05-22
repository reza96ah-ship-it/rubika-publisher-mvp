from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str


class StoreUpsertRequest(BaseModel):
    name: str
    category: str = ""
    phone: str = ""
    description: str = ""
    default_hashtags: str = ""
    caption_footer: str = ""
    timezone: str = "Asia/Tehran"


class StoreResponse(BaseModel):
    id: int
    name: str
    category: str
    phone: str
    description: str
    default_hashtags: str
    caption_footer: str
    timezone: str
    is_active: bool
