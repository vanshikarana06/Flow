import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.database.repositories.email_repo import EmailRepository
from app.database.repositories.approval_repo import ApprovalRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.approval import ApprovalState
from app.shared.enums.email import DraftStatus, DeliveryStatus, EmailDirection
from app.email.outbound.appscript_client import GoogleAppsScriptClient
from app.email.outbound.verifier import DeliveryVerifier
from app.email.outbound.schemas import OutboundEmailRequest, OutboundDeliveryResult

class OutboundEmailSender:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_repo = EmailRepository(db)
        self.approval_repo = ApprovalRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.client = GoogleAppsScriptClient()
        self.verifier = DeliveryVerifier(db)

    async def send_approved_draft(
        self,
        draft_id: uuid.UUID,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> OutboundDeliveryResult:
        # 1. Validate Approval State
        approval = await self.approval_repo.get_by_id(approval_id)
        if not approval or approval.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval record not found",
            )
        if approval.status != ApprovalState.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Approval is in state '{approval.status}', expected 'APPROVED'",
            )

        # 2. Retrieve Draft
        draft = await self.email_repo.get_draft_by_id(draft_id, user_id)
        if not draft:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email draft not found",
            )

        # 3. Build Outbound Request
        outbound_req = OutboundEmailRequest(
            idempotency_key=draft.idempotency_key,
            recipient_to=draft.recipient_to if isinstance(draft.recipient_to, list) else [draft.recipient_to],
            recipient_cc=draft.recipient_cc,
            recipient_bcc=draft.recipient_bcc,
            subject=draft.subject,
            body_plain=draft.body_plain,
            body_html=draft.body_html,
            thread_id=str(draft.thread_id) if draft.thread_id else None,
        )

        # 4. Dispatch to Google Apps Script Webhook
        delivery_resp = await self.client.send_email(outbound_req)

        # 5. Persist Delivery Log
        delivery_status = DeliveryStatus.DELIVERED if delivery_resp.success else DeliveryStatus.FAILED
        delivery_log = await self.email_repo.create_delivery_log(
            draft_id=draft.id,
            user_id=user_id,
            endpoint_url=self.client.settings.APPSCRIPT_WEBHOOK_URL,
            http_status=200 if delivery_resp.success else 500,
            delivery_status=delivery_status,
            gmail_message_id=delivery_resp.gmail_message_id,
            gmail_thread_id=delivery_resp.gmail_thread_id,
            response_payload=delivery_resp.model_dump(),
        )

        # 6. Verify and Log Proof
        verification = await self.verifier.verify_and_log(
            approval_id=approval_id,
            user_id=user_id,
            delivery_response=delivery_resp,
        )

        if delivery_resp.success:
            # 7. Update Draft Status to SENT
            await self.email_repo.update_draft_status(draft.id, DraftStatus.SENT)

            # 8. Record Outbound Message in Thread if thread exists
            if draft.thread_id:
                outbound_msg = await self.email_repo.create_message(
                    thread_id=draft.thread_id,
                    user_id=user_id,
                    direction=EmailDirection.OUTBOUND,
                    sender_email="me@flow.dev",
                    recipient_to=draft.recipient_to,
                    subject=draft.subject,
                    body_plain=draft.body_plain,
                    body_html=draft.body_html,
                    received_at=datetime.now(timezone.utc),
                )
                delivery_log.message_id = outbound_msg.id
                await self.email_repo.update_thread_activity(
                    thread_id=draft.thread_id,
                    snippet=draft.body_plain[:150],
                    last_message_at=datetime.now(timezone.utc),
                )

            # 9. Append Activity
            await self.activity_repo.append_log(
                user_id=user_id,
                action_type="EMAIL_SENT",
                entity_type="EMAIL_DELIVERY_LOG",
                entity_id=delivery_log.id,
                details={
                    "draft_id": str(draft.id),
                    "gmail_message_id": delivery_resp.gmail_message_id,
                    "recipient": draft.recipient_to,
                },
            )

        return OutboundDeliveryResult(
            success=delivery_resp.success,
            draft_id=str(draft.id),
            delivery_log_id=str(delivery_log.id),
            gmail_message_id=delivery_resp.gmail_message_id,
            proof_hash=verification.proof_hash,
            status=delivery_status.value,
            error=delivery_resp.error,
        )
