import uuid
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: uuid.UUID

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
