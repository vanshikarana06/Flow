from enum import Enum

class TaskType(str, Enum):
    QUICK = "QUICK"
    PROJECT = "PROJECT"
    STUDY_PLAN = "STUDY_PLAN"
    EVENT_TASK = "EVENT_TASK"

class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

