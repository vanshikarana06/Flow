import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.calendar.service import CalendarService
from app.calendar.schemas import (
    EventCreateRequest,
    EventUpdateRequest,
    FocusBlockCreateRequest,
    EventResponse,
    ConflictReport,
)

router = APIRouter(prefix="/calendar", tags=["Smart Calendar"])

@router.post("/events", response_model=StandardResponse[EventResponse], status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    event = await service.create_event(current_user.id, payload)
    return StandardResponse(data=EventResponse.model_validate(event))

@router.get("/events", response_model=StandardResponse[List[EventResponse]])
async def list_events(
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    events = await service.list_events(current_user.id, start_time, end_time)
    return StandardResponse(data=[EventResponse.model_validate(e) for e in events])

@router.get("/events/{event_id}", response_model=StandardResponse[EventResponse])
async def get_event(
    event_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    event = await service.get_event(current_user.id, event_id)
    return StandardResponse(data=EventResponse.model_validate(event))

@router.patch("/events/{event_id}", response_model=StandardResponse[EventResponse])
async def update_event(
    event_id: uuid.UUID,
    payload: EventUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    event = await service.update_event(current_user.id, event_id, payload)
    return StandardResponse(data=EventResponse.model_validate(event))

@router.delete("/events/{event_id}", response_model=StandardResponse[Dict[str, Any]])
async def delete_event(
    event_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    await service.delete_event(current_user.id, event_id)
    return StandardResponse(data={"deleted": True, "event_id": str(event_id)})

@router.post("/focus-blocks", response_model=StandardResponse[EventResponse], status_code=status.HTTP_201_CREATED)
async def create_focus_block(
    payload: FocusBlockCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    block = await service.create_focus_block(current_user.id, payload)
    return StandardResponse(data=EventResponse.model_validate(block))

@router.get("/conflicts", response_model=StandardResponse[ConflictReport])
async def check_conflicts(
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    exclude_event_id: Optional[uuid.UUID] = Query(None),
    is_target_focus_block: bool = Query(False),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CalendarService(db)
    report = await service.check_conflicts(
        user_id=current_user.id,
        start_time=start_time,
        end_time=end_time,
        exclude_event_id=exclude_event_id,
        is_target_focus_block=is_target_focus_block,
    )
    return StandardResponse(data=report)
