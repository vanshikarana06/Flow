from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, UserContext
from app.shared.schemas.responses import StandardResponse
from app.trust.activities.service import ActivityService

router = APIRouter(prefix="/activities", tags=["Activity Ledger"])

class ActivityLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    log_type: str
    action_name: str
    details: Dict[str, Any]
    created_at: datetime

@router.get("/ledger", response_model=StandardResponse[List[ActivityLogItem]])
async def get_activity_ledger(
    log_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ActivityService(db)
    activities = await service.get_ledger(
        user_id=current_user.user_id,
        log_type=log_type,
        limit=limit,
        offset=offset,
    )
    return StandardResponse(data=[ActivityLogItem.model_validate(a) for a in activities])
