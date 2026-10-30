from typing import Optional, Dict, Any, TYPE_CHECKING
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.database.models.approval import Approval

class VerificationLog(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "verification_logs"

    approval_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("approvals.id", ondelete="CASCADE"), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # VERIFIED, VERIFICATION_FAILED
    external_resource_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    proof_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    verification_evidence: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    approval: Mapped["Approval"] = relationship("Approval", back_populates="verification")
