import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models.activity import ActivityLog
from app.database.repositories.base_repo import BaseRepository

class ActivityRepository(BaseRepository[ActivityLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(ActivityLog, session)

    async def append_log(
        self,
        user_id: uuid.UUID,
        action_type: Optional[str] = None,
        log_type: Optional[str] = None,
        action_name: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[uuid.UUID] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> ActivityLog:
        """
        Appends an immutable log entry to the Activity Ledger.
        Supports both (log_type, action_name) and (action_type, entity_type, entity_id) signatures.
        """
        final_log_type = log_type or (entity_type if entity_type else "SYSTEM")
        final_action_name = action_name or (action_type if action_type else "UNKNOWN_ACTION")

        final_details = dict(details or {})
        if entity_id:
            final_details["entity_id"] = str(entity_id)
        if entity_type:
            final_details["entity_type"] = entity_type

        log = ActivityLog(
            user_id=user_id,
            log_type=final_log_type,
            action_name=final_action_name,
            details=final_details,
        )
        return await self.create(log)

    async def list_by_user_and_type(
        self,
        user_id: uuid.UUID,
        log_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ActivityLog]:
        stmt = select(ActivityLog).where(ActivityLog.user_id == user_id)
        if log_type:
            stmt = stmt.where(ActivityLog.log_type == log_type)
        stmt = stmt.order_by(ActivityLog.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    # -------------------------------------------------------------------------
    # Immutability Enforcement (Append-only: No updates, No deletes)
    # -------------------------------------------------------------------------
    async def delete(self, entity_id: uuid.UUID) -> bool:
        raise NotImplementedError("Activity Ledger is strictly append-only: deletions are forbidden.")

    async def update(self, entity_id: uuid.UUID, **kwargs: Any) -> Any:
        raise NotImplementedError("Activity Ledger is strictly append-only: updates are forbidden.")
