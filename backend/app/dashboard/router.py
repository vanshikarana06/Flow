from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.dashboard.service import DashboardService
from app.dashboard.schemas import (
    DashboardSummaryResponse,
    ActivityItemSchema,
    AlertItemSchema,
    InboxSummaryResponse,
    UpcomingEventsResponse,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=StandardResponse[DashboardSummaryResponse])
async def get_dashboard_summary(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Unified Single-Payload Dashboard Summary.
    Aggregates Emails, Tasks, Calendar, Approvals, Activities, and AI Alerts.
    """
    service = DashboardService(db)
    summary = await service.get_summary(current_user.id)
    return StandardResponse(data=summary)

@router.get("/activity", response_model=StandardResponse[List[ActivityItemSchema]])
async def get_dashboard_activity(
    limit: int = Query(20, ge=1, le=100),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns recent immutable events from the Activity Ledger.
    """
    service = DashboardService(db)
    activities = await service.get_activities(current_user.id, limit=limit)
    return StandardResponse(data=activities)

@router.get("/alerts", response_model=StandardResponse[List[AlertItemSchema]])
async def get_dashboard_alerts(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns proactive AI alerts: schedule conflicts, approaching deadlines, and pending approvals.
    """
    service = DashboardService(db)
    alerts = await service.get_alerts(current_user.id)
    return StandardResponse(data=alerts)

@router.get("/inbox-summary", response_model=StandardResponse[InboxSummaryResponse])
async def get_inbox_summary(
    limit: int = Query(10, ge=1, le=50),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns email thread counts, unread statistics, and recent conversations.
    """
    service = DashboardService(db)
    summary = await service.get_inbox_summary(current_user.id, limit=limit)
    return StandardResponse(data=summary)

@router.get("/upcoming-events", response_model=StandardResponse[UpcomingEventsResponse])
async def get_upcoming_events(
    days_ahead: int = Query(7, ge=1, le=30),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns upcoming calendar schedule and focus block counts.
    """
    service = DashboardService(db)
    upcoming = await service.get_upcoming_events(current_user.id, days_ahead=days_ahead)
    return StandardResponse(data=upcoming)
