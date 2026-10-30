from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class OutboundEmailRequest(BaseModel):
    idempotency_key: str
    recipient_to: List[str]
    recipient_cc: Optional[List[str]] = None
    recipient_bcc: Optional[List[str]] = None
    subject: str
    body_plain: str
    body_html: Optional[str] = None
    thread_id: Optional[str] = None

class AppsScriptDeliveryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    success: bool
    flow_idempotency_key: Optional[str] = Field(None, alias="idempotency_key")
    gmail_message_id: Optional[str] = Field(None, alias="message_id")
    gmail_thread_id: Optional[str] = Field(None, alias="thread_id")
    rfc822_message_id: Optional[str] = None
    timestamp: Optional[str] = None
    recipient_count: int = 1
    script_execution_duration_ms: Optional[int] = None
    error: Optional[str] = None
    signature: Optional[str] = None

class OutboundDeliveryResult(BaseModel):
    success: bool
    draft_id: str
    delivery_log_id: str
    gmail_message_id: Optional[str] = None
    proof_hash: Optional[str] = None
    status: str
    error: Optional[str] = None

