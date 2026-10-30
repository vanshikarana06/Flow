import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.email.inbound.processor import InboundEmailProcessor
from app.email.inbound.resend_webhook import ResendWebhookHandler
from app.email.inbound.schemas import InboundEmailPayload, ProcessedEmailResult
from app.email.outbound.sender import OutboundEmailSender
from app.email.outbound.schemas import OutboundDeliveryResult
from app.email.drafts.manager import DraftManager
from app.email.drafts.schemas import CreateDraftRequest, DraftResponse
from app.email.threads.service import ThreadService
from app.email.threads.schemas import ThreadDetailResponse, ThreadListItem
from app.database.models.email import EmailDraft
from app.database.models.approval import Approval
from app.shared.enums.email import DraftStatus

class EmailService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.inbound_processor = InboundEmailProcessor(db)
        self.webhook_handler = ResendWebhookHandler()
        self.outbound_sender = OutboundEmailSender(db)
        self.draft_manager = DraftManager(db)
        self.thread_service = ThreadService(db)

    # Inbound
    async def handle_inbound_webhook(self, raw_payload: Dict[str, Any], target_user_id: uuid.UUID) -> ProcessedEmailResult:
        payload = self.webhook_handler.parse_payload(raw_payload)
        return await self.inbound_processor.process(payload, target_user_id)

    # Threads & Inbox
    async def get_inbox_threads(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[ThreadListItem]:
        return await self.thread_service.list_threads(user_id=user_id, is_archived=False, limit=limit, offset=offset)

    async def get_thread(self, thread_id: uuid.UUID, user_id: uuid.UUID) -> ThreadDetailResponse:
        return await self.thread_service.get_thread_details(thread_id=thread_id, user_id=user_id)

    # Drafts
    async def create_draft(self, request: CreateDraftRequest, user_id: uuid.UUID) -> EmailDraft:
        return await self.draft_manager.create_draft(request, user_id)

    async def submit_draft_for_approval(self, draft_id: uuid.UUID, user_id: uuid.UUID) -> Approval:
        return await self.draft_manager.submit_for_approval(draft_id, user_id)

    async def list_drafts(self, user_id: uuid.UUID, status: Optional[DraftStatus] = None) -> List[EmailDraft]:
        return await self.draft_manager.list_drafts(user_id=user_id, status=status)

    # Outbound Execution
    async def execute_approved_send(self, draft_id: uuid.UUID, approval_id: uuid.UUID, user_id: uuid.UUID) -> OutboundDeliveryResult:
        return await self.outbound_sender.send_approved_draft(
            draft_id=draft_id,
            approval_id=approval_id,
            user_id=user_id,
        )
