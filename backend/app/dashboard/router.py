from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=StandardResponse[Dict[str, Any]])
async def get_dashboard_summary(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return StandardResponse(data={
        "pending_approvals_count": 0,
        "todays_events_count": 0,
        "priority_tasks_count": 0,
        "unread_emails_count": 0,
        "proactive_alerts": [],
    })

