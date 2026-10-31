import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.email_repo import EmailRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.database.models.email import EmailMessage, EmailThread
from app.shared.enums.email import EmailDirection
from app.email.inbound.schemas import InboundEmailPayload, ProcessedEmailResult
from app.email.inbound.parser import InboundEmailParser

class InboundEmailProcessor:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_repo = EmailRepository(db)
        self.activity_repo = ActivityRepository(db)

    async def process(self, payload: InboundEmailPayload, target_user_id: uuid.UUID) -> ProcessedEmailResult:
        sender_name, sender_email = InboundEmailParser.parse_sender(payload.from_)
        in_reply_to, references = InboundEmailParser.extract_header_references(payload.headers)
        snippet = InboundEmailParser.extract_snippet(payload.text or "")
        cleaned_subject = InboundEmailParser.clean_subject(payload.subject or "")
        if not cleaned_subject:
            cleaned_subject = "(No Subject)"
        now = datetime.now(timezone.utc)

        # 1. Thread Resolution: Check if in-reply-to references an existing message
        existing_thread_id: Optional[uuid.UUID] = None
        if in_reply_to:
            parent_msg = await self.email_repo.find_message_by_header_id(in_reply_to)
            if parent_msg:
                existing_thread_id = parent_msg.thread_id

        is_new_thread = False
        if existing_thread_id:
            thread_id = existing_thread_id
            await self.email_repo.update_thread_activity(
                thread_id=thread_id,
                snippet=snippet,
                last_message_at=now,
                has_attachments=bool(payload.attachments),
            )
        else:
            is_new_thread = True
            new_thread = await self.email_repo.create_thread(
                user_id=target_user_id,
                subject=cleaned_subject,
                snippet=snippet,
                last_message_at=now,
            )
            thread_id = new_thread.id

        # 2. Persist Message
        message = await self.email_repo.create_message(
            thread_id=thread_id,
            user_id=target_user_id,
            direction=EmailDirection.INBOUND,
            sender_email=sender_email,
            sender_name=sender_name,
            recipient_to=payload.to,
            recipient_cc=payload.cc,
            recipient_bcc=payload.bcc,
            subject=payload.subject,
            body_plain=payload.text or "",
            body_html=payload.html,
            message_id_header=payload.message_id,
            in_reply_to_header=in_reply_to,
            references_header=references,
            raw_headers=payload.headers,
            received_at=now,
        )

        # 3. Log Activity in Ledger
        await self.activity_repo.append_log(
            user_id=target_user_id,
            action_type="INBOUND_EMAIL_RECEIVED",
            entity_type="EMAIL_MESSAGE",
            entity_id=message.id,
            details={
                "thread_id": str(thread_id),
                "sender": sender_email,
                "subject": payload.subject,
                "is_new_thread": is_new_thread,
            },
        )

        return ProcessedEmailResult(
            thread_id=str(thread_id),
            message_id=str(message.id),
            user_id=str(target_user_id),
            is_new_thread=is_new_thread,
            tasks_extracted=0,
        )

