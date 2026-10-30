from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.trust.receipts.schemas.receipt_schema import ExecutionReceipt
from app.trust.receipts.hashes.proof_hasher import ProofHasher

class ReceiptBuilder:
    def __init__(self):
        self._action_id: Optional[str] = None
        self._action_type: Optional[str] = None
        self._target_service: Optional[str] = None
        self._verified: bool = False
        self._external_resource_id: Optional[str] = None
        self._evidence: Dict[str, Any] = {}

    def set_action(self, action_id: str, action_type: str, target_service: str) -> "ReceiptBuilder":
        self._action_id = action_id
        self._action_type = action_type
        self._target_service = target_service
        return self

    def set_verified(self, verified: bool, external_resource_id: Optional[str] = None) -> "ReceiptBuilder":
        self._verified = verified
        self._external_resource_id = external_resource_id
        return self

    def set_evidence(self, evidence: Dict[str, Any]) -> "ReceiptBuilder":
        self._evidence = evidence
        return self

    def build(self) -> ExecutionReceipt:
        if not self._action_id or not self._action_type or not self._target_service:
            raise ValueError("Incomplete receipt builder attributes")

        timestamp = datetime.now(timezone.utc)
        payload_to_hash = {
            "action_id": self._action_id,
            "action_type": self._action_type,
            "target_service": self._target_service,
            "verified": self._verified,
            "external_resource_id": self._external_resource_id,
            "timestamp": timestamp.isoformat(),
            "evidence": self._evidence,
        }
        proof_hash = ProofHasher.generate_hash(payload_to_hash)

        return ExecutionReceipt(
            action_id=self._action_id,
            action_type=self._action_type,
            target_service=self._target_service,
            verified=self._verified,
            external_resource_id=self._external_resource_id,
            proof_hash=proof_hash,
            timestamp=timestamp,
            evidence=self._evidence,
        )

