from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse

router = APIRouter(prefix="/calendar", tags=["Smart Calendar"])

@router.get("/events", response_model=StandardResponse[List[Dict[str, Any]]])
async def list_events(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return StandardResponse(data=[])

@router.get("/conflicts", response_model=StandardResponse[List[Dict[str, Any]]])
async def check_conflicts(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return StandardResponse(data=[])

