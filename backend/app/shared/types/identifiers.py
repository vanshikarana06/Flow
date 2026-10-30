from typing import NewType
import uuid

UserId = NewType("UserId", uuid.UUID)
ActionId = NewType("ActionId", str)
ProofHash = NewType("ProofHash", str)
CorrelationId = NewType("CorrelationId", str)
