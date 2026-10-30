from typing import Optional, Dict, Any, TYPE_CHECKING
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin
from app.shared.enums.approval import ApprovalState, ActionType

if TYPE_CHECKING:
    from app.database.models.user import User
    from app.database.models.plan import AgentPlan
    from app.database.models.verification import VerificationLog
    from app.database.models.execution import ExecutionLog

class Approval(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "approvals"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agent_plans.id", ondelete="SET NULL"), nullable=True)
    action_type: Mapped[ActionType] = mapped_column(SQLEnum(ActionType), nullable=False)
    target_service: Mapped[str] = mapped_column(String(50), nullable=False)
    proposed_payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    modified_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    status: Mapped[ApprovalState] = mapped_column(SQLEnum(ApprovalState), default=ApprovalState.PENDING, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="approvals")
    plan: Mapped[Optional["AgentPlan"]] = relationship("AgentPlan", back_populates="approvals")
    verification: Mapped[Optional["VerificationLog"]] = relationship("VerificationLog", back_populates="approval", uselist=False)
    execution: Mapped[Optional["ExecutionLog"]] = relationship("ExecutionLog", back_populates="approval", uselist=False)
