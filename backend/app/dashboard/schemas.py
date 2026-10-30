import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.tasks.schemas import TaskResponse
from app.calendar.schemas import EventResponse
from app.email.threads.schemas import ThreadListItem

class ActivityItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    log_type: str
    action_name: str
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

class ApprovalItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action_type: str
    target_service: str
    proposed_payload: Dict[str, Any]
    status: str
    idempotency_key: str
    created_at: datetime

class AlertItemSchema(BaseModel):
    id: str
    type: str  # "CONFLICT", "DEADLINE", "APPROVAL_REQUIRED", "FOLLOWUP"
    severity: str  # "HIGH", "MEDIUM", "LOW"
    title: str
    message: str
    action_url: Optional[str] = None
    timestamp: datetime

class InboxSummaryResponse(BaseModel):
    unread_count: int
    total_threads: int
    threads: List[ThreadListItem] = Field(default_factory=list)

class UpcomingEventsResponse(BaseModel):
    total_events: int
    focus_blocks_count: int
    events: List[EventResponse] = Field(default_factory=list)

class DashboardSummaryResponse(BaseModel):
    # Metrics
    unread_emails_count: int
    active_tasks_count: int
    todays_events_count: int
    pending_approvals_count: int
    recent_activities_count: int
    alerts_count: int

    # Aggregate Unified Payload
    emails: List[ThreadListItem] = Field(default_factory=list)
    tasks: List[TaskResponse] = Field(default_factory=list)
    calendar: List[EventResponse] = Field(default_factory=list)
    approvals: List[ApprovalItemSchema] = Field(default_factory=list)
    activities: List[ActivityItemSchema] = Field(default_factory=list)
    alerts: List[AlertItemSchema] = Field(default_factory=list)

