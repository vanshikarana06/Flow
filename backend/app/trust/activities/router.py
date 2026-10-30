from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse

router = APIRouter(prefix="/activities", tags=["Activity Ledger"])

@router.get("/ledger", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_activity_ledger(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return StandardResponse(data=[])
