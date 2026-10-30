from typing import Dict, Any, TYPE_CHECKING
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.database.models.user import User

class ActivityLog(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("idx_activity_logs_user_id", "user_id"),
        Index("idx_activity_logs_log_type", "log_type"),
        Index("idx_activity_logs_created_at", "created_at"),
        Index("idx_activity_logs_user_time", "user_id", "created_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_type: Mapped[str] = mapped_column(String(50), nullable=False) # EXECUTION, APPROVAL, VERIFICATION
    action_name: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="activity_logs")
