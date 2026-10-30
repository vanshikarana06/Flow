import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database.models.calendar import CalendarEvent
from app.database.repositories.calendar_repo import CalendarRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.calendar import CalendarProvider, SyncStatus
from app.calendar.schemas import (
    EventCreateRequest,
    EventUpdateRequest,
    FocusBlockCreateRequest,
    ConflictReport,
)
from app.calendar.conflicts import ConflictEngine
from app.core.exceptions import EntityNotFoundException

class CalendarService:
    """
    Calendar Runtime Service supporting:
    - Create, Update, Delete Events
    - Focus Blocks (protected deep-work time blocks)
    - Schedule and range queries
    - Conflict engine integration
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.calendar_repo = CalendarRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.conflict_engine = ConflictEngine(db)

    async def create_event(self, user_id: uuid.UUID, data: EventCreateRequest) -> CalendarEvent:
        event = CalendarEvent(
            user_id=user_id,
            title=data.title,
            description=data.description,
            start_time=data.start_time,
            end_time=data.end_time,
            is_focus_block=data.is_focus_block,
            external_provider=data.external_provider,
            sync_status=SyncStatus.IN_SYNC,
        )
        self.db.add(event)
        await self.db.flush()

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="EVENT_CREATED" if not data.is_focus_block else "FOCUS_BLOCK_CREATED",
            entity_type="CALENDAR_EVENT",
            entity_id=event.id,
            details={
                "title": event.title,
                "start_time": event.start_time.isoformat(),
                "end_time": event.end_time.isoformat(),
                "is_focus_block": event.is_focus_block,
            },
        )
        await self.db.commit()
        return event

    async def get_event(self, user_id: uuid.UUID, event_id: uuid.UUID) -> CalendarEvent:
        event = await self.calendar_repo.get_by_id(event_id)
        if not event or event.user_id != user_id:
            raise EntityNotFoundException(entity_name="CalendarEvent", entity_id=str(event_id))
        return event

    async def list_events(
        self,
        user_id: uuid.UUID,
        start_time: datetime,
        end_time: datetime,
    ) -> List[CalendarEvent]:
        return await self.calendar_repo.list_events_in_range(user_id, start_time, end_time)

    async def update_event(
        self,
        user_id: uuid.UUID,
        event_id: uuid.UUID,
        data: EventUpdateRequest,
    ) -> CalendarEvent:
        event = await self.get_event(user_id, event_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(event, key, value)

        event.sync_status = SyncStatus.PENDING_SYNC

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="EVENT_UPDATED",
            entity_type="CALENDAR_EVENT",
            entity_id=event.id,
            details={"updated_fields": list(update_dict.keys())},
        )
        await self.db.commit()
        return event

    async def delete_event(self, user_id: uuid.UUID, event_id: uuid.UUID) -> bool:
        event = await self.get_event(user_id, event_id)
        title = event.title

        await self.calendar_repo.delete(event_id)
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="EVENT_DELETED",
            entity_type="CALENDAR_EVENT",
            entity_id=event_id,
            details={"deleted_title": title},
        )
        await self.db.commit()
        return True

    async def create_focus_block(
        self,
        user_id: uuid.UUID,
        data: FocusBlockCreateRequest,
    ) -> CalendarEvent:
        event_req = EventCreateRequest(
            title=data.title,
            description=data.description,
            start_time=data.start_time,
            end_time=data.end_time,
            is_focus_block=True,
            external_provider=CalendarProvider.FLOW_NATIVE,
        )
        return await self.create_event(user_id, event_req)

    async def check_conflicts(
        self,
        user_id: uuid.UUID,
        start_time: datetime,
        end_time: datetime,
        exclude_event_id: Optional[uuid.UUID] = None,
        is_target_focus_block: bool = False,
    ) -> ConflictReport:
        return await self.conflict_engine.evaluate_conflicts(
            user_id=user_id,
            start_time=start_time,
            end_time=end_time,
            exclude_event_id=exclude_event_id,
            is_target_focus_block=is_target_focus_block,
        )
