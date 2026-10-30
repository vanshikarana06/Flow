from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timezone
from sqlalchemy import select, update, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.base_repo import BaseRepository
from app.database.models.email import (
    EmailThread,
    EmailMessage,
    EmailDraft,
    EmailAttachment,
    EmailDeliveryLog,
)
from app.shared.enums.email import EmailDirection, DraftStatus, DeliveryStatus

class EmailRepository(BaseRepository[EmailThread]):
    def __init__(self, db: AsyncSession):
        super().__init__(EmailThread, db)

    # -------------------------------------------------------------------------
    # Thread Operations
    # -------------------------------------------------------------------------
    async def get_thread_with_messages(self, thread_id: uuid.UUID, user_id: uuid.UUID) -> Optional[EmailThread]:
        result = await self.db.execute(
            select(EmailThread)
            .options(
                selectinload(EmailThread.messages).selectinload(EmailMessage.attachments),
                selectinload(EmailThread.drafts),
            )
            .where(EmailThread.id == thread_id, EmailThread.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_threads(
        self,
        user_id: uuid.UUID,
        is_archived: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[EmailThread]:
        result = await self.db.execute(
            select(EmailThread)
            .where(EmailThread.user_id == user_id, EmailThread.is_archived == is_archived)
            .order_by(desc(EmailThread.last_message_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def create_thread(
        self,
        user_id: uuid.UUID,
        subject: str,
        snippet: Optional[str] = None,
        last_message_at: Optional[datetime] = None,
    ) -> EmailThread:
        if last_message_at is None:
            last_message_at = datetime.now(timezone.utc)
        thread = EmailThread(
            user_id=user_id,
            subject=subject,
            snippet=snippet,
            last_message_at=last_message_at,
            message_count=1,
            is_read=False,
            is_archived=False,
        )
        self.db.add(thread)
        await self.db.flush()
        return thread

    async def update_thread_activity(
        self,
        thread_id: uuid.UUID,
        snippet: str,
        last_message_at: datetime,
        has_attachments: bool = False,
    ) -> None:
        await self.db.execute(
            update(EmailThread)
            .where(EmailThread.id == thread_id)
            .values(
                snippet=snippet,
                last_message_at=last_message_at,
                message_count=EmailThread.message_count + 1,
                has_attachments=EmailThread.has_attachments | has_attachments,
                is_read=False,
            )
        )
        await self.db.flush()

    # -------------------------------------------------------------------------
    # Message Operations
    # -------------------------------------------------------------------------
    async def create_message(
        self,
        thread_id: uuid.UUID,
        user_id: uuid.UUID,
        direction: EmailDirection,
        sender_email: str,
        recipient_to: Any,
        subject: str,
        body_plain: str,
        received_at: Optional[datetime] = None,
        body_html: Optional[str] = None,
        sender_name: Optional[str] = None,
        recipient_cc: Optional[Any] = None,
        recipient_bcc: Optional[Any] = None,
        message_id_header: Optional[str] = None,
        in_reply_to_header: Optional[str] = None,
        references_header: Optional[str] = None,
        raw_headers: Optional[Any] = None,
    ) -> EmailMessage:
        if received_at is None:
            received_at = datetime.now(timezone.utc)
        message = EmailMessage(
            thread_id=thread_id,
            user_id=user_id,
            direction=direction,
            sender_email=sender_email,
            sender_name=sender_name,
            recipient_to=recipient_to,
            recipient_cc=recipient_cc,
            recipient_bcc=recipient_bcc,
            subject=subject,
            body_plain=body_plain,
            body_html=body_html,
            message_id_header=message_id_header,
            in_reply_to_header=in_reply_to_header,
            references_header=references_header,
            raw_headers=raw_headers,
            received_at=received_at,
            is_read=False,
        )
        self.db.add(message)
        await self.db.flush()
        return message

    async def find_message_by_header_id(self, message_id_header: str) -> Optional[EmailMessage]:
        result = await self.db.execute(
            select(EmailMessage).where(EmailMessage.message_id_header == message_id_header)
        )
        return result.scalar_one_or_none()

    # -------------------------------------------------------------------------
    # Draft Operations
    # -------------------------------------------------------------------------
    async def create_draft(
        self,
        user_id: uuid.UUID,
        recipient_to: Any,
        subject: str,
        body_plain: str,
        idempotency_key: str,
        thread_id: Optional[uuid.UUID] = None,
        agent_plan_id: Optional[uuid.UUID] = None,
        body_html: Optional[str] = None,
        recipient_cc: Optional[Any] = None,
        recipient_bcc: Optional[Any] = None,
    ) -> EmailDraft:
        draft = EmailDraft(
            user_id=user_id,
            thread_id=thread_id,
            agent_plan_id=agent_plan_id,
            recipient_to=recipient_to,
            recipient_cc=recipient_cc,
            recipient_bcc=recipient_bcc,
            subject=subject,
            body_plain=body_plain,
            body_html=body_html,
            status=DraftStatus.DRAFT,
            idempotency_key=idempotency_key,
        )
        self.db.add(draft)
        await self.db.flush()
        return draft

    async def get_draft_by_id(self, draft_id: uuid.UUID, user_id: uuid.UUID) -> Optional[EmailDraft]:
        result = await self.db.execute(
            select(EmailDraft).where(EmailDraft.id == draft_id, EmailDraft.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_draft_by_idempotency_key(self, idempotency_key: str) -> Optional[EmailDraft]:
        result = await self.db.execute(
            select(EmailDraft).where(EmailDraft.idempotency_key == idempotency_key)
        )
        return result.scalar_one_or_none()

    async def update_draft_status(self, draft_id: uuid.UUID, status: DraftStatus) -> None:
        await self.db.execute(
            update(EmailDraft).where(EmailDraft.id == draft_id).values(status=status)
        )
        await self.db.flush()

    async def list_drafts(
        self,
        user_id: uuid.UUID,
        status: Optional[DraftStatus] = None,
    ) -> List[EmailDraft]:
        query = select(EmailDraft).where(EmailDraft.user_id == user_id)
        if status:
            query = query.where(EmailDraft.status == status)
        query = query.order_by(desc(EmailDraft.updated_at))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    # -------------------------------------------------------------------------
    # Delivery Log Operations
    # -------------------------------------------------------------------------
    async def create_delivery_log(
        self,
        draft_id: uuid.UUID,
        user_id: uuid.UUID,
        endpoint_url: str,
        http_status: int,
        delivery_status: DeliveryStatus,
        gmail_message_id: Optional[str] = None,
        gmail_thread_id: Optional[str] = None,
        response_payload: Optional[Dict[str, Any]] = None,
        message_id: Optional[uuid.UUID] = None,
    ) -> EmailDeliveryLog:
        log = EmailDeliveryLog(
            draft_id=draft_id,
            message_id=message_id,
            user_id=user_id,
            endpoint_url=endpoint_url,
            http_status=http_status,
            delivery_status=delivery_status,
            gmail_message_id=gmail_message_id,
            gmail_thread_id=gmail_thread_id,
            response_payload=response_payload,
            sent_at=datetime.now(timezone.utc),
        )
        self.db.add(log)
        await self.db.flush()
        return log
