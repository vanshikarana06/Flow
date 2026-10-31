import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.database.repositories.email_repo import EmailRepository
from app.email.threads.schemas import ThreadDetailResponse, ThreadListItem, EmailMessageSummary

class ThreadService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_repo = EmailRepository(db)

    async def list_threads(
        self,
        user_id: uuid.UUID,
        is_archived: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ThreadListItem]:
        threads = await self.email_repo.list_threads(
            user_id=user_id,
            is_archived=is_archived,
            limit=limit,
            offset=offset,
        )
        items: List[ThreadListItem] = []
        for t in threads:
            sender_email = None
            sender_name = None
            if hasattr(t, "messages") and t.messages:
                last_msg = t.messages[-1]
                sender_email = getattr(last_msg, "sender_email", None)
                sender_name = getattr(last_msg, "sender_name", None)
            
            items.append(
                ThreadListItem(
                    id=t.id,
                    subject=t.subject,
                    snippet=t.snippet,
                    message_count=t.message_count,
                    has_attachments=t.has_attachments,
                    is_read=t.is_read,
                    is_archived=t.is_archived,
                    last_message_at=t.last_message_at,
                    sender_email=sender_email,
                    sender_name=sender_name,
                )
            )
        return items

    async def get_thread_details(self, thread_id: uuid.UUID, user_id: uuid.UUID) -> ThreadDetailResponse:
        thread = await self.email_repo.get_thread_with_messages(thread_id, user_id)
        if not thread:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email thread not found",
            )
        
        messages = [EmailMessageSummary.model_validate(m) for m in thread.messages]
        return ThreadDetailResponse(
            id=thread.id,
            subject=thread.subject,
            snippet=thread.snippet,
            message_count=thread.message_count,
            has_attachments=thread.has_attachments,
            is_read=thread.is_read,
            is_archived=thread.is_archived,
            last_message_at=thread.last_message_at,
            messages=messages,
        )

