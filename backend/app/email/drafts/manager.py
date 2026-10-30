import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.database.repositories.email_repo import EmailRepository
from app.database.repositories.approval_repo import ApprovalRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.database.models.email import EmailDraft
from app.database.models.approval import Approval
from app.shared.enums.email import DraftStatus
from app.shared.enums.approval import ActionType
from app.email.drafts.schemas import CreateDraftRequest

class DraftManager:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_repo = EmailRepository(db)
        self.approval_repo = ApprovalRepository(db)
        self.activity_repo = ActivityRepository(db)

    async def create_draft(self, request: CreateDraftRequest, user_id: uuid.UUID) -> EmailDraft:
        idempotency_key = f"draft_{uuid.uuid4().hex}"
        draft = await self.email_repo.create_draft(
            user_id=user_id,
            recipient_to=request.recipient_to,
            recipient_cc=request.recipient_cc,
            recipient_bcc=request.recipient_bcc,
            subject=request.subject,
            body_plain=request.body_plain,
            body_html=request.body_html,
            idempotency_key=idempotency_key,
            thread_id=request.thread_id,
            agent_plan_id=request.agent_plan_id,
        )

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="EMAIL_DRAFT_CREATED",
            entity_type="EMAIL_DRAFT",
            entity_id=draft.id,
            details={
                "subject": draft.subject,
                "recipients": draft.recipient_to,
                "idempotency_key": idempotency_key,
            },
        )
        return draft

    async def submit_for_approval(self, draft_id: uuid.UUID, user_id: uuid.UUID) -> Approval:
        draft = await self.email_repo.get_draft_by_id(draft_id, user_id)
        if not draft:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email draft not found",
            )
        if draft.status != DraftStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit draft in state '{draft.status}' for approval",
            )

        # 1. Create Approval Record
        approval = await self.approval_repo.create_request(
            user_id=user_id,
            action_type=ActionType.SEND_EMAIL,
            target_service="FLOW_EMAIL_OUTBOUND",
            proposed_payload={
                "draft_id": str(draft.id),
                "recipient_to": draft.recipient_to,
                "subject": draft.subject,
                "body_snippet": draft.body_plain[:200],
            },
            idempotency_key=draft.idempotency_key,
            plan_id=draft.agent_plan_id,
        )

        # 2. Lock Draft status
        await self.email_repo.update_draft_status(draft.id, DraftStatus.PENDING_APPROVAL)

        # 3. Log Activity
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="APPROVAL_REQUESTED",
            entity_type="APPROVAL",
            entity_id=approval.id,
            details={
                "draft_id": str(draft.id),
                "action_type": ActionType.SEND_EMAIL.value,
                "target_service": "FLOW_EMAIL_OUTBOUND",
            },
        )
        return approval

    async def list_drafts(self, user_id: uuid.UUID, status: Optional[DraftStatus] = None) -> List[EmailDraft]:
        return await self.email_repo.list_drafts(user_id=user_id, status=status)

