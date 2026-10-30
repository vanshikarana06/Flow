import uuid
from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_
from app.database.models.calendar import CalendarEvent
from app.shared.enums.calendar import CalendarProvider, SyncStatus
from app.database.repositories.base_repo import BaseRepository

class CalendarRepository(BaseRepository[CalendarEvent]):
    def __init__(self, session: AsyncSession):
        super().__init__(CalendarEvent, session)

    async def list_events_in_range(
        self, user_id: uuid.UUID, start_time: datetime, end_time: datetime
    ) -> List[CalendarEvent]:
        stmt = (
            select(CalendarEvent)
            .where(
                CalendarEvent.user_id == user_id,
                CalendarEvent.start_time < end_time,
                CalendarEvent.end_time > start_time,
            )
            .order_by(CalendarEvent.start_time.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def detect_conflicts(
        self, user_id: uuid.UUID, start_time: datetime, end_time: datetime, exclude_event_id: Optional[uuid.UUID] = None
    ) -> List[CalendarEvent]:
        conditions = [
            CalendarEvent.user_id == user_id,
            CalendarEvent.start_time < end_time,
            CalendarEvent.end_time > start_time,
        ]
        if exclude_event_id:
            conditions.append(CalendarEvent.id != exclude_event_id)

        stmt = select(CalendarEvent).where(and_(*conditions))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def reschedule(
        self, event_id: uuid.UUID, new_start: datetime, new_end: datetime
    ) -> Optional[CalendarEvent]:
        await self.session.execute(
            update(CalendarEvent)
            .where(CalendarEvent.id == event_id)
            .values(start_time=new_start, end_time=new_end, sync_status=SyncStatus.PENDING_SYNC)
        )
        return await self.get_by_id(event_id)

