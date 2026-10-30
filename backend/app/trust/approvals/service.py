import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.database.models.approval import Approval
from app.database.repositories.approval_repo import ApprovalRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.approval import ApprovalState, ActionType
from app.trust.approvals.state_machine import ApprovalStateMachine
from app.core.exceptions import EntityNotFoundException

class ApprovalService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.approval_repo = ApprovalRepository(db)
        self.activity_repo = ActivityRepository(db)

    async def get_by_id(self, approval_id: uuid.UUID, user_id: uuid.UUID) -> Approval:
        approval = await self.approval_repo.get_by_id(approval_id)
        if not approval or approval.user_id != user_id:
            raise EntityNotFoundException(entity_name="Approval", entity_id=str(approval_id))
        return approval

    async def list_pending(self, user_id: uuid.UUID) -> List[Approval]:
        return await self.approval_repo.list_pending(user_id)

    async def create_approval(
        self,
        user_id: uuid.UUID,
        action_type: ActionType,
        target_service: str,
        proposed_payload: Dict[str, Any],
        idempotency_key: str,
        plan_id: Optional[uuid.UUID] = None,
    ) -> Approval:
        # Check idempotency
        existing = await self.approval_repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        approval = await self.approval_repo.create_request(
            user_id=user_id,
            action_type=action_type,
            target_service=target_service,
            proposed_payload=proposed_payload,
            idempotency_key=idempotency_key,
            plan_id=plan_id,
        )

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="APPROVAL_REQUESTED",
            entity_type="APPROVAL",
            entity_id=approval.id,
            details={
                "action_type": action_type.value,
                "target_service": target_service,
                "idempotency_key": idempotency_key,
            },
        )
        return approval

    async def approve(self, approval_id: uuid.UUID, user_id: uuid.UUID) -> Approval:
        approval = await self.get_by_id(approval_id, user_id)
        next_state = ApprovalStateMachine.transition(approval.status, ApprovalState.APPROVED)

        updated = await self.approval_repo.resolve(
            approval_id=approval.id,
            new_status=next_state,
        )

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="ACTION_APPROVED",
            entity_type="APPROVAL",
            entity_id=approval.id,
            details={
                "action_type": approval.action_type.value,
                "previous_status": approval.status.value,
                "new_status": next_state.value,
            },
        )
        return updated or approval

    async def modify(
        self,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
        modified_payload: Dict[str, Any],
    ) -> Approval:
        approval = await self.get_by_id(approval_id, user_id)
        next_state = ApprovalStateMachine.transition(approval.status, ApprovalState.MODIFIED)

        updated = await self.approval_repo.resolve(
            approval_id=approval.id,
            new_status=next_state,
            modified_payload=modified_payload,
        )

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="ACTION_MODIFIED",
            entity_type="APPROVAL",
            entity_id=approval.id,
            details={
                "action_type": approval.action_type.value,
                "previous_status": approval.status.value,
                "new_status": next_state.value,
                "modified_fields": list(modified_payload.keys()),
            },
        )
        return updated or approval

    async def reject(
        self,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
        reason: Optional[str] = None,
    ) -> Approval:
        approval = await self.get_by_id(approval_id, user_id)
        next_state = ApprovalStateMachine.transition(approval.status, ApprovalState.REJECTED)

        updated = await self.approval_repo.resolve(
            approval_id=approval.id,
            new_status=next_state,
        )

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="ACTION_REJECTED",
            entity_type="APPROVAL",
            entity_id=approval.id,
            details={
                "action_type": approval.action_type.value,
                "previous_status": approval.status.value,
                "new_status": next_state.value,
                "reason": reason or "User manually rejected",
            },
        )
        return updated or approval
