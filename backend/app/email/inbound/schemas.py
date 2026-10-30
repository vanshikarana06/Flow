from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AttachmentPayload(BaseModel):
    filename: str
    content_type: str
    size: int
    content: Optional[str] = None  # Base64 string if embedded
    storage_path: Optional[str] = None

class InboundEmailPayload(BaseModel):
    from_: str = Field(..., alias="from")
    to: List[str]
    cc: Optional[List[str]] = None
    bcc: Optional[List[str]] = None
    subject: str
    text: Optional[str] = ""
    html: Optional[str] = None
    headers: Optional[Dict[str, Any]] = None
    attachments: Optional[List[AttachmentPayload]] = None
    message_id: Optional[str] = None

    class Config:
        populate_by_name = True

class ProcessedEmailResult(BaseModel):
    thread_id: str
    message_id: str
    user_id: str
    is_new_thread: bool
    tasks_extracted: int = 0
