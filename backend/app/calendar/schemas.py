import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.shared.enums.calendar import CalendarProvider, SyncStatus

class EventCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_focus_block: bool = False
    external_provider: CalendarProvider = CalendarProvider.FLOW_NATIVE

class EventUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_focus_block: Optional[bool] = None

class FocusBlockCreateRequest(BaseModel):
    title: str = "Focus Block"
    description: Optional[str] = "Protected deep work focus block"
    start_time: datetime
    end_time: datetime

class ConflictItem(BaseModel):
    type: str  # "MEETING_OVERLAP", "TASK_OVERLAP", "FOCUS_BLOCK_VIOLATION"
    severity: str  # "HIGH", "MEDIUM", "LOW"
    description: str
    primary_event_id: Optional[str] = None
    conflicting_entity_id: Optional[str] = None
    time_window: str

class ConflictReport(BaseModel):
    has_conflict: bool
    conflict_count: int
    meeting_overlaps: List[ConflictItem] = Field(default_factory=list)
    task_overlaps: List[ConflictItem] = Field(default_factory=list)
    focus_block_violations: List[ConflictItem] = Field(default_factory=list)
    summary: str

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_focus_block: bool
    external_provider: str
    external_event_id: Optional[str] = None
    sync_status: str
    created_at: datetime
    updated_at: datetime
