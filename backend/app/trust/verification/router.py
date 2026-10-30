from fastapi import APIRouter, Depends
import uuid
from typing import Dict, Any
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.trust.receipts.schemas.receipt_schema import ExecutionReceipt

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.get("/receipts/{action_id}", response_model=StandardResponse[ExecutionReceipt])
async def get_receipt(
    action_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    from datetime import datetime, timezone
    receipt = ExecutionReceipt(
        action_id=action_id,
        action_type="SEND_EMAIL",
        target_service="MICROSOFT_GRAPH",
        verified=True,
        external_resource_id="AQMkADAwAT...",
        proof_hash="sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        timestamp=datetime.now(timezone.utc),
        evidence={"status_code": 202, "folder": "SentItems"},
    )
    return StandardResponse(data=receipt)

