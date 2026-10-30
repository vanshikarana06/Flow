from typing import Optional, List, Dict, Any, TYPE_CHECKING
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.database.models.user import User
    from app.database.models.approval import Approval

class AgentPlan(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "agent_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    intent: Mapped[str] = mapped_column(String(100), nullable=False)
    plan_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="agent_plans")
    approvals: Mapped[List["Approval"]] = relationship("Approval", back_populates="plan")
