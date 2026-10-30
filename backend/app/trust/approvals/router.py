from fastapi import APIRouter, Depends, status
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.shared.enums.approval import ApprovalState

router = APIRouter(prefix="/approvals", tags=["Approvals"])

class ApprovalResponse(BaseModel):
    id: uuid.UUID
    action_type: str
    target_service: str
    status: ApprovalState
    proposed_payload: Dict[str, Any]
    modified_payload: Optional[Dict[str, Any]] = None

class ModifyApprovalRequest(BaseModel):
    modified_payload: Dict[str, Any]

@router.get("/pending", response_model=StandardResponse[List[ApprovalResponse]])
async def list_pending_approvals(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return StandardResponse(data=[])

@router.post("/{approval_id}/approve", response_model=StandardResponse[Dict[str, Any]])
async def approve_action(
    approval_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return StandardResponse(data={"approval_id": str(approval_id), "status": ApprovalState.APPROVED.value})

@router.post("/{approval_id}/reject", response_model=StandardResponse[Dict[str, Any]])
async def reject_action(
    approval_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return StandardResponse(data={"approval_id": str(approval_id), "status": ApprovalState.REJECTED.value})

@router.post("/{approval_id}/modify", response_model=StandardResponse[Dict[str, Any]])
async def modify_action(
    approval_id: uuid.UUID,
    request: ModifyApprovalRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return StandardResponse(data={"approval_id": str(approval_id), "status": ApprovalState.MODIFIED.value, "payload": request.modified_payload})

