from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("/", response_model=StandardResponse[List[Dict[str, Any]]])
async def list_notifications(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return StandardResponse(data=[])
