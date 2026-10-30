from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.shared.enums.tasks import TaskType, TaskPriority, TaskStatus

class SubtaskSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[uuid.UUID] = None
    title: str
    is_completed: bool = False
    order_index: int = 0

class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    task_type: TaskType = TaskType.QUICK
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    scheduled_slot_start: Optional[datetime] = None
    scheduled_slot_end: Optional[datetime] = None
    subtask_titles: Optional[List[str]] = None

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    scheduled_slot_start: Optional[datetime] = None
    scheduled_slot_end: Optional[datetime] = None

class TaskPrioritizeRequest(BaseModel):
    priority: TaskPriority

class TaskScheduleRequest(BaseModel):
    scheduled_slot_start: datetime
    scheduled_slot_end: datetime

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    task_type: str
    priority: str
    status: str
    due_date: Optional[datetime] = None
    scheduled_slot_start: Optional[datetime] = None
    scheduled_slot_end: Optional[datetime] = None
    subtasks: List[SubtaskSchema] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
