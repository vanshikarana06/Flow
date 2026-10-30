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
        log_type: str,
        action_name: str,
        details: Dict[str, Any],
    ) -> ActivityLog:
        log = ActivityLog(
            user_id=user_id,
            log_type=log_type,
            action_name=action_name,
            details=details,
        )
        return await self.create(log)

    async def list_by_user_and_type(
        self, user_id: uuid.UUID, log_type: Optional[str] = None, limit: int = 50, offset: int = 0
    ) -> List[ActivityLog]:
        stmt = select(ActivityLog).where(ActivityLog.user_id == user_id)
        if log_type:
            stmt = stmt.where(ActivityLog.log_type == log_type)
        stmt = stmt.order_by(ActivityLog.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
