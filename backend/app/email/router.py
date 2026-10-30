from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse

router = APIRouter(prefix="/email", tags=["Smart Email"])

@router.get("/inbox", response_model=StandardResponse[List[Dict[str, Any]]])
async def list_inbox(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return StandardResponse(data=[])
