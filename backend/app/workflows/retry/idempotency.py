import uuid
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.database.models.approval import Approval
from app.database.models.execution import ExecutionLog
from app.shared.enums.approval import ApprovalState

class DuplicateExecutionException(HTTPException):
    def __init__(self, approval_id: str, idempotency_key: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Action with approval_id '{approval_id}' (key: '{idempotency_key}') has already been executed.",
        )

class InvalidExecutionStateException(HTTPException):
    def __init__(self, current_status: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only APPROVED actions may execute. Current status is '{current_status}'.",
        )

class IdempotencyGuard:
    """
    Enforces retry safety and duplicate execution prevention.
    Verifies Approval status, idempotency keys, and existing ExecutionLog records.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def validate_for_execution(
        self,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Tuple[Approval, Optional[ExecutionLog]]:
        # 1. Fetch Approval
        result = await self.db.execute(
            select(Approval).where(Approval.id == approval_id, Approval.user_id == user_id)
        )
        approval = result.scalar_one_or_none()
        if not approval:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Approval with ID '{approval_id}' not found.",
            )

        # 2. Check Execution Records (Duplicate check)
        exec_result = await self.db.execute(
            select(ExecutionLog).where(ExecutionLog.approval_id == approval_id)
        )
        existing_exec = exec_result.scalar_one_or_none()
        if existing_exec:
            raise DuplicateExecutionException(
                approval_id=str(approval_id),
                idempotency_key=approval.idempotency_key,
            )

        # 3. Validate Approval State
        if approval.status != ApprovalState.APPROVED:
            raise InvalidExecutionStateException(current_status=approval.status.value)

        return approval, existing_exec

    async def get_existing_execution(self, approval_id: uuid.UUID) -> Optional[ExecutionLog]:
        result = await self.db.execute(
            select(ExecutionLog).where(ExecutionLog.approval_id == approval_id)
        )
        return result.scalar_one_or_none()
