from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict

class ExecutionReceipt(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action_id: str
    action_type: str
    target_service: str
    status: str = "VERIFIED"  # "VERIFIED" or "VERIFICATION_FAILED"
    verified: bool = True
    external_resource_id: Optional[str] = None
    proof_hash: str
    timestamp: datetime
    evidence: Dict[str, Any] = Field(default_factory=dict)
