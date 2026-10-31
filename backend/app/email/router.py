import uuid
import logging
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

logger = logging.getLogger("flow.email.router")
router = APIRouter(prefix="/email", tags=["Self-Owned Email OS"])

# -----------------------------------------------------------------------------
# Inbound Webhook (Resend)
# -----------------------------------------------------------------------------
@router.post("/inbound/webhook")
async def receive_resend_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    svix_id: Optional[str] = Header(None, alias="svix-id"),
    svix_timestamp: Optional[str] = Header(None, alias="svix-timestamp"),
    svix_signature: Optional[str] = Header(None, alias="svix-signature"),
):
    body_bytes = await request.body()
    email_service = EmailService(db)
    
    if not email_service.webhook_handler.verify_signature(
        body_bytes,
        signature_header=svix_signature,
        svix_id=svix_id,
        svix_timestamp=svix_timestamp,
        headers=dict(request.headers),
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Resend webhook signature",
        )

    raw_json = await request.json()
    data = raw_json.get("data") if isinstance(raw_json.get("data"), dict) else raw_json
    recipients = (data.get("to") or []) + (data.get("received_for") or [])
    clean_recipients = [r.lower().strip() for r in recipients if isinstance(r, str)]

    from app.database.models.user import User
    from app.database.models.preference import Preference
    from sqlalchemy import select, or_

    target_user = None

    # 1. Match full recipient email against registered users
    if clean_recipients:
        res = await db.execute(select(User).where(User.email.in_(clean_recipients)))
        target_user = res.scalar_one_or_none()

    # 2. Match recipient prefix (e.g. 'van' from van@aldeourku.resend.app against vanshurana1706@...)
    if not target_user and clean_recipients:
        for r in clean_recipients:
            prefix = r.split("@")[0].strip()
            if len(prefix) >= 3:
                res = await db.execute(
                    select(User).where(
                        or_(
                            User.email.ilike(f"{prefix}%"),
                            User.full_name.ilike(f"%{prefix}%")
                        )
                    ).order_by(User.created_at.asc()).limit(1)
                )
                target_user = res.scalar_one_or_none()
                if target_user:
                    break

    # 3. Match active registered human user (excluding default system placeholder)
    if not target_user:
        res = await db.execute(
            select(User).where(User.email != "user@flow.dev").order_by(User.created_at.asc()).limit(1)
        )
        target_user = res.scalar_one_or_none()

    # 4. Fallback to any user
    if not target_user:
        res = await db.execute(select(User).order_by(User.created_at.asc()).limit(1))
        target_user = res.scalar_one_or_none()

    if not target_user:
        # Auto-provision primary user so inbound emails are never dropped
        target_user = User(
            email="user@flow.dev",
            full_name="FLOW Workspace Owner",
        )
        db.add(target_user)
        await db.flush()
        pref = Preference(user_id=target_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(target_user)

    sender = data.get("from", "unknown")
    subject = data.get("subject", "(No Subject)")
    logger.info(f"[INBOUND EMAIL] Webhook verified: sender='{sender}', subject='{subject}', target='{target_user.email}'")
    print(f"[FLOW EMAIL OS] Inbound email received: from='{sender}' | subject='{subject}' | target_user='{target_user.email}'", flush=True)

    result = await email_service.handle_inbound_webhook(raw_json, target_user.id)

    logger.info(f"[INBOUND EMAIL] Stored thread_id={result.thread_id} for user={target_user.email}")
    print(f"[FLOW EMAIL OS] Successfully saved thread {result.thread_id} in inbox for {target_user.email}", flush=True)

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
