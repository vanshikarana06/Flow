from enum import Enum

class MemoryCategory(str, Enum):
    PREFERENCE = "PREFERENCE"
    EVENT = "EVENT"
    BEHAVIORAL = "BEHAVIORAL"

class RelationType(str, Enum):
    CO_LEAD = "co-lead"
    MENTOR = "mentor"
    CLIENT = "client"
    PEER = "peer"
    FAMILY = "family"

