from typing import Optional, List, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.shared.enums.email import DraftStatus

class CreateDraftRequest(BaseModel):
    recipient_to: List[str]
    subject: str
    body_plain: str
    body_html: Optional[str] = None
    recipient_cc: Optional[List[str]] = None
    recipient_bcc: Optional[List[str]] = None
    thread_id: Optional[uuid.UUID] = None
    agent_plan_id: Optional[uuid.UUID] = None

class DraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    thread_id: Optional[uuid.UUID] = None
    recipient_to: Any
    subject: str
    body_plain: str
    status: DraftStatus
    idempotency_key: str
    created_at: datetime
    updated_at: datetime

