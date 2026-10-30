from typing import Optional, List, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.shared.enums.email import EmailDirection

class EmailMessageSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    direction: EmailDirection
    sender_email: str
    sender_name: Optional[str] = None
    recipient_to: Any
    subject: str
    body_plain: str
    body_html: Optional[str] = None
    received_at: datetime
    is_read: bool

class ThreadDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject: str
    snippet: Optional[str] = None
    message_count: int
    has_attachments: bool
    is_read: bool
    is_archived: bool
    last_message_at: datetime
    messages: List[EmailMessageSummary]

class ThreadListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject: str
    snippet: Optional[str] = None
    message_count: int
    has_attachments: bool
    is_read: bool
    is_archived: bool
    last_message_at: datetime

