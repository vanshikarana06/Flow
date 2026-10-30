import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.database.models.activity import ActivityLog
from app.database.repositories.activity_repo import ActivityRepository

class ActivityService:
    """
    Append-only Activity Ledger Service.
    Enforces absolute immutability: records can only be created and queried.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ActivityRepository(db)

    async def log_activity(
        self,
        user_id: uuid.UUID,
        action_type: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[uuid.UUID] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> ActivityLog:
        return await self.repo.append_log(
            user_id=user_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
        )

    async def get_ledger(
        self,
        user_id: uuid.UUID,
        log_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ActivityLog]:
        return await self.repo.list_by_user_and_type(
            user_id=user_id,
            log_type=log_type,
            limit=limit,
            offset=offset,
        )

    # -------------------------------------------------------------------------
    # Immutability Guards
    # -------------------------------------------------------------------------
    def update(self, *args, **kwargs):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail="Activity Ledger is strictly append-only: updates are prohibited.",
        )

    def delete(self, *args, **kwargs):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail="Activity Ledger is strictly append-only: deletions are prohibited.",
        )
