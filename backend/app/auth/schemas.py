import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserPreferencesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    work_start_time: Optional[str] = "09:00:00"
    work_end_time: Optional[str] = "18:00:00"
    max_daily_meetings: Optional[int] = 4
    meeting_buffer_minutes: Optional[int] = 15
    communication_tone: Optional[str] = "friendly_formal"

class UserContext(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    email: str
    full_name: str
    preferences: UserPreferencesSchema = Field(default_factory=UserPreferencesSchema)

    @property
    def id(self) -> uuid.UUID:
        return self.user_id

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    refresh_token: Optional[str] = None
    user: UserContext

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    preferences: Optional[UserPreferencesSchema] = None

class SupabaseWebhookRecord(BaseModel):
    id: str
    email: Optional[str] = None
    raw_user_meta_data: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None

class SupabaseWebhookPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str  # INSERT, UPDATE, DELETE
    table: str
    schema_: str = Field("auth", alias="schema")
    record: Optional[SupabaseWebhookRecord] = None
    old_record: Optional[Dict[str, Any]] = None
