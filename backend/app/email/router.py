import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Request, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.email.service import EmailService
from app.email.drafts.schemas import CreateDraftRequest, DraftResponse
from app.email.threads.schemas import ThreadDetailResponse, ThreadListItem
from app.email.outbound.schemas import OutboundDeliveryResult

router = APIRouter(prefix="/email", tags=["Self-Owned Email OS"])

# -----------------------------------------------------------------------------
# Inbound Webhook (Resend)
# -----------------------------------------------------------------------------
@router.post("/inbound/webhook")
async def receive_resend_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    svix_signature: Optional[str] = Header(None, alias="svix-signature"),
):
    body_bytes = await request.body()
    email_service = EmailService(db)
    
    if not email_service.webhook_handler.verify_signature(body_bytes, svix_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Resend webhook signature",
        )

    raw_json = await request.json()
    # Resolve target user from recipient domain / headers (default fallback to first user or system recipient)
    # Target user resolution:
    from app.database.models.user import User
    from sqlalchemy import select
    res = await db.execute(select(User).limit(1))
    target_user = res.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=500, detail="No system user found for inbound delivery")

    result = await email_service.handle_inbound_webhook(raw_json, target_user.id)
    return StandardResponse(data=result.model_dump())

# -----------------------------------------------------------------------------
# Inbox & Threads
# -----------------------------------------------------------------------------
@router.get("/inbox", response_model=StandardResponse[List[ThreadListItem]])
async def get_inbox(
    limit: int = 50,
    offset: int = 0,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    email_service = EmailService(db)
    threads = await email_service.get_inbox_threads(user_id=current_user.id, limit=limit, offset=offset)
    return StandardResponse(data=threads)

@router.get("/threads/{thread_id}", response_model=StandardResponse[ThreadDetailResponse])
async def get_thread(
    thread_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    email_service = EmailService(db)
    thread = await email_service.get_thread(thread_id=thread_id, user_id=current_user.id)
    return StandardResponse(data=thread)

# -----------------------------------------------------------------------------
# Drafts
# -----------------------------------------------------------------------------
@router.post("/drafts", response_model=StandardResponse[DraftResponse])
async def create_draft(
    request: CreateDraftRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    email_service = EmailService(db)
    draft = await email_service.create_draft(request=request, user_id=current_user.id)
    return StandardResponse(data=DraftResponse.model_validate(draft))

@router.post("/drafts/{draft_id}/submit-approval")
async def submit_draft_for_approval(
    draft_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    email_service = EmailService(db)
    approval = await email_service.submit_draft_for_approval(draft_id=draft_id, user_id=current_user.id)
    return StandardResponse(data={"approval_id": str(approval.id), "status": approval.status})

# -----------------------------------------------------------------------------
# Outbound Send (Execution of Approved Draft)
# -----------------------------------------------------------------------------
@router.post("/send-approved", response_model=StandardResponse[OutboundDeliveryResult])
async def send_approved_draft(
    draft_id: uuid.UUID,
    approval_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    email_service = EmailService(db)
    result = await email_service.execute_approved_send(
        draft_id=draft_id,
        approval_id=approval_id,
        user_id=current_user.id,
    )
    return StandardResponse(data=result)
