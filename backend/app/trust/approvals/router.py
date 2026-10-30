from fastapi import APIRouter, Depends, status
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, UserContext
from app.shared.schemas.responses import StandardResponse
from app.shared.enums.approval import ApprovalState, ActionType
from app.trust.approvals.service import ApprovalService

router = APIRouter(prefix="/approvals", tags=["Approvals"])

class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action_type: ActionType
    target_service: str
    status: ApprovalState
    proposed_payload: Dict[str, Any]
    modified_payload: Optional[Dict[str, Any]] = None

class ModifyApprovalRequest(BaseModel):
    modified_payload: Dict[str, Any]

class RejectApprovalRequest(BaseModel):
    reason: Optional[str] = None

@router.get("/pending", response_model=StandardResponse[List[ApprovalResponse]])
async def list_pending_approvals(
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    approvals = await service.list_pending(current_user.user_id)
    return StandardResponse(data=[ApprovalResponse.model_validate(a) for a in approvals])

@router.get("/{approval_id}", response_model=StandardResponse[ApprovalResponse])
async def get_approval(
    approval_id: uuid.UUID,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    approval = await service.get_by_id(approval_id, current_user.user_id)
    return StandardResponse(data=ApprovalResponse.model_validate(approval))

@router.post("/{approval_id}/approve", response_model=StandardResponse[ApprovalResponse])
async def approve_action(
    approval_id: uuid.UUID,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    approval = await service.approve(approval_id, current_user.user_id)
    return StandardResponse(data=ApprovalResponse.model_validate(approval))

@router.post("/{approval_id}/modify", response_model=StandardResponse[ApprovalResponse])
async def modify_action(
    approval_id: uuid.UUID,
    request: ModifyApprovalRequest,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    approval = await service.modify(approval_id, current_user.user_id, request.modified_payload)
    return StandardResponse(data=ApprovalResponse.model_validate(approval))

@router.post("/{approval_id}/reject", response_model=StandardResponse[ApprovalResponse])
async def reject_action(
    approval_id: uuid.UUID,
    request: Optional[RejectApprovalRequest] = None,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    reason = request.reason if request else None
    approval = await service.reject(approval_id, current_user.user_id, reason=reason)
    return StandardResponse(data=ApprovalResponse.model_validate(approval))
