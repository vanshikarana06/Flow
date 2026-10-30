from fastapi import APIRouter, Depends, status
import uuid
from typing import Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, UserContext
from app.shared.schemas.responses import StandardResponse
from app.trust.receipts.schemas.receipt_schema import ExecutionReceipt
from app.trust.verification.service import VerificationEngine

router = APIRouter(prefix="/verification", tags=["Verification"])

class VerifyActionRequest(BaseModel):
    evidence: Dict[str, Any]
    action_type: Optional[str] = None

@router.post("/verify/{approval_id}", response_model=StandardResponse[ExecutionReceipt])
async def verify_executed_action(
    approval_id: uuid.UUID,
    request: VerifyActionRequest,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = VerificationEngine(db)
    receipt = await engine.verify_action(
        approval_id=approval_id,
        user_id=current_user.user_id,
        evidence=request.evidence,
        action_type_override=request.action_type,
    )
    return StandardResponse(data=receipt)

@router.get("/receipts/{approval_id}", response_model=StandardResponse[ExecutionReceipt])
async def get_receipt(
    approval_id: uuid.UUID,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = VerificationEngine(db)
    receipt = await engine.get_receipt_by_approval_id(approval_id, current_user.user_id)
    return StandardResponse(data=receipt)
