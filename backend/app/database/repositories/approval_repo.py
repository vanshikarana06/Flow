import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database.models.approval import Approval
from app.shared.enums.approval import ApprovalState, ActionType
from app.database.repositories.base_repo import BaseRepository

class ApprovalRepository(BaseRepository[Approval]):
    def __init__(self, session: AsyncSession):
        super().__init__(Approval, session)

    async def get_by_idempotency_key(self, idempotency_key: str) -> Optional[Approval]:
        result = await self.session.execute(
            select(Approval).where(Approval.idempotency_key == idempotency_key)
        )
        return result.scalars().first()

    async def list_pending(self, user_id: uuid.UUID) -> List[Approval]:
        result = await self.session.execute(
            select(Approval)
            .where(Approval.user_id == user_id, Approval.status == ApprovalState.PENDING)
            .order_by(Approval.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_request(
        self,
        user_id: uuid.UUID,
        action_type: ActionType,
        target_service: str,
        proposed_payload: Dict[str, Any],
        idempotency_key: str,
        plan_id: Optional[uuid.UUID] = None,
    ) -> Approval:
        approval = Approval(
            user_id=user_id,
            plan_id=plan_id,
            action_type=action_type,
            target_service=target_service,
            proposed_payload=proposed_payload,
            status=ApprovalState.PENDING,
            idempotency_key=idempotency_key,
        )
        return await self.create(approval)

    async def resolve(
        self,
        approval_id: uuid.UUID,
        new_status: ApprovalState,
        modified_payload: Optional[Dict[str, Any]] = None,
    ) -> Optional[Approval]:
        values: Dict[str, Any] = {
            "status": new_status,
            "reviewed_at": datetime.now(timezone.utc),
        }
        if modified_payload is not None:
            values["modified_payload"] = modified_payload

        await self.session.execute(
            update(Approval).where(Approval.id == approval_id).values(**values)
        )
        return await self.get_by_id(approval_id)

