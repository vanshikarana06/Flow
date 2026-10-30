from enum import Enum

class CalendarProvider(str, Enum):
    FLOW_NATIVE = "FLOW_NATIVE"
    MICROSOFT = "MICROSOFT"
    GOOGLE = "GOOGLE"

class SyncStatus(str, Enum):
    IN_SYNC = "IN_SYNC"
    PENDING_SYNC = "PENDING_SYNC"
    FAILED = "FAILED"

