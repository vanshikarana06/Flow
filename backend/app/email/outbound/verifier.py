import hashlib
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.verification import VerificationLog
from app.database.repositories.activity_repo import ActivityRepository
from app.email.outbound.schemas import AppsScriptDeliveryResponse

class DeliveryVerifier:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.activity_repo = ActivityRepository(db)

    @staticmethod
    def calculate_proof_hash(idempotency_key: str, gmail_id: str, rfc_id: str, timestamp: str) -> str:
        combined = f"{idempotency_key}:{gmail_id}:{rfc_id}:{timestamp}".encode("utf-8")
        return hashlib.sha256(combined).hexdigest()

    async def verify_and_log(
        self,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
        delivery_response: AppsScriptDeliveryResponse,
    ) -> VerificationLog:
        if delivery_response.success:
            proof_hash = self.calculate_proof_hash(
                idempotency_key=delivery_response.flow_idempotency_key,
                gmail_id=delivery_response.gmail_message_id or "",
                rfc_id=delivery_response.rfc822_message_id or "",
                timestamp=delivery_response.timestamp,
            )
            status = "VERIFIED"
        else:
            proof_hash = "FAILED_DELIVERY"
            status = "VERIFICATION_FAILED"

        verification = VerificationLog(
            approval_id=approval_id,
            status=status,
            external_resource_id=delivery_response.gmail_message_id,
            proof_hash=proof_hash,
            verification_evidence=delivery_response.model_dump(),
            verified_at=datetime.now(timezone.utc),
        )
        self.db.add(verification)
        await self.db.flush()

        # Log Activity
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="EMAIL_VERIFIED" if delivery_response.success else "EMAIL_VERIFICATION_FAILED",
            entity_type="VERIFICATION_LOG",
            entity_id=verification.id,
            details={
                "approval_id": str(approval_id),
                "proof_hash": proof_hash,
                "gmail_message_id": delivery_response.gmail_message_id,
                "status": status,
            },
        )

        return verification

