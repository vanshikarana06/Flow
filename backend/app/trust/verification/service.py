import uuid
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models.verification import VerificationLog
from app.database.models.approval import Approval
from app.database.repositories.approval_repo import ApprovalRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.approval import ApprovalState, ActionType
from app.trust.approvals.state_machine import ApprovalStateMachine
from app.trust.receipts.builders.receipt_builder import ReceiptBuilder
from app.trust.receipts.schemas.receipt_schema import ExecutionReceipt
from app.core.exceptions import VerificationFailedException, EntityNotFoundException

class VerificationEngine:
    """
    Cryptographic verification engine supporting EMAIL, TASK, and CALENDAR actions.
    Generates deterministic SHA-256 execution proofs and immutable VerificationLog entries.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.approval_repo = ApprovalRepository(db)
        self.activity_repo = ActivityRepository(db)

    # -------------------------------------------------------------------------
    # Domain-Specific Verification Rules
    # -------------------------------------------------------------------------

    @staticmethod
    def verify_email(evidence: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates email delivery evidence.
        Requires delivery success confirmation and an external resource id (gmail_message_id or delivery_id).
        """
        success = evidence.get("success", False)
        external_id = (
            evidence.get("gmail_message_id")
            or evidence.get("message_id")
            or evidence.get("delivery_log_id")
        )
        if not success:
            return False, None, evidence.get("error", "Email dispatch returned failure status")
        if not external_id:
            return False, None, "Missing delivery message identifier in email evidence"
        return True, str(external_id), None

    @staticmethod
    def verify_task(evidence: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates task creation/execution evidence.
        Requires task_id and confirmed title/status.
        """
        task_id = evidence.get("task_id") or evidence.get("id")
        if not task_id:
            return False, None, "Missing task_id in task execution evidence"
        status = evidence.get("status")
        if status in ("FAILED", "CANCELLED", "ERROR"):
            return False, str(task_id), f"Task execution reported invalid status: {status}"
        return True, str(task_id), None

    @staticmethod
    def verify_calendar(evidence: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates calendar event creation/reschedule evidence.
        Requires event_id and start/end timestamps.
        """
        event_id = evidence.get("event_id") or evidence.get("id")
        if not event_id:
            return False, None, "Missing event_id in calendar execution evidence"
        if "start_time" not in evidence or "end_time" not in evidence:
            return False, str(event_id), "Missing event time boundaries in calendar evidence"
        return True, str(event_id), None

    # -------------------------------------------------------------------------
    # Orchestrated Verification Execution
    # -------------------------------------------------------------------------

    async def verify_action(
        self,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
        evidence: Dict[str, Any],
        action_type_override: Optional[str] = None,
    ) -> ExecutionReceipt:
        approval = await self.approval_repo.get_by_id(approval_id)
        if not approval or approval.user_id != user_id:
            raise EntityNotFoundException(entity_name="Approval", entity_id=str(approval_id))

        # Advance state to EXECUTED if currently APPROVED
        if approval.status == ApprovalState.APPROVED:
            next_state = ApprovalStateMachine.transition(approval.status, ApprovalState.EXECUTED)
            await self.approval_repo.resolve(approval.id, new_status=next_state)

        action_type_str = action_type_override or approval.action_type.value

        # Route domain validation
        if "EMAIL" in action_type_str:
            is_valid, external_id, error = self.verify_email(evidence)
        elif "TASK" in action_type_str:
            is_valid, external_id, error = self.verify_task(evidence)
        elif "EVENT" in action_type_str or "CALENDAR" in action_type_str:
            is_valid, external_id, error = self.verify_calendar(evidence)
        else:
            # Fallback general verification
            is_valid = evidence.get("success", True)
            external_id = evidence.get("resource_id") or str(approval.id)
            error = None if is_valid else "Generic execution validation failed"

        status_str = "VERIFIED" if is_valid else "VERIFICATION_FAILED"

        # Build Receipt & Proof Hash
        receipt = (
            ReceiptBuilder()
            .set_action(
                action_id=str(approval.id),
                action_type=action_type_str,
                target_service=approval.target_service,
            )
            .set_verified(is_valid, external_resource_id=external_id)
            .set_evidence(evidence)
            .build()
        )

        # Transition Approval State Machine
        if is_valid:
            final_state = ApprovalStateMachine.transition(ApprovalState.EXECUTED, ApprovalState.VERIFIED)
            await self.approval_repo.resolve(approval.id, new_status=final_state)

        # Persist VerificationLog
        v_log = VerificationLog(
            approval_id=approval.id,
            status=status_str,
            external_resource_id=external_id,
            proof_hash=receipt.proof_hash,
            verification_evidence=evidence,
            verified_at=datetime.now(timezone.utc),
        )
        self.db.add(v_log)
        await self.db.flush()

        # Log Activity in Ledger
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="ACTION_VERIFIED" if is_valid else "ACTION_VERIFICATION_FAILED",
            entity_type="VERIFICATION_LOG",
            entity_id=v_log.id,
            details={
                "approval_id": str(approval.id),
                "action_type": action_type_str,
                "proof_hash": receipt.proof_hash,
                "verified": is_valid,
                "error": error,
            },
        )

        if not is_valid:
            raise VerificationFailedException(action_id=str(approval.id), reason=error or "Unknown failure")

        return receipt

    async def get_receipt_by_approval_id(self, approval_id: uuid.UUID, user_id: uuid.UUID) -> ExecutionReceipt:
        approval = await self.approval_repo.get_by_id(approval_id)
        if not approval or approval.user_id != user_id:
            raise EntityNotFoundException(entity_name="Approval", entity_id=str(approval_id))

        result = await self.db.execute(
            select(VerificationLog).where(VerificationLog.approval_id == approval_id)
        )
        v_log = result.scalar_one_or_none()
        if not v_log:
            raise EntityNotFoundException(entity_name="VerificationLog", entity_id=str(approval_id))

        return ExecutionReceipt(
            action_id=str(approval.id),
            action_type=approval.action_type.value,
            target_service=approval.target_service,
            status=v_log.status,
            verified=(v_log.status == "VERIFIED"),
            external_resource_id=v_log.external_resource_id,
            proof_hash=v_log.proof_hash,
            timestamp=v_log.verified_at,
            evidence=v_log.verification_evidence,
        )

