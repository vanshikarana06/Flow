from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ExecutionReceipt(BaseModel):
    action_id: str
    action_type: str
    target_service: str
    verified: bool
    external_resource_id: Optional[str] = None
    proof_hash: str
    timestamp: datetime
    evidence: Dict[str, Any] = Field(default_factory=dict)
