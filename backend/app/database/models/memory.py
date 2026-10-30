from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.database.base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.database.models.user import User

class MemoryRecord(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "memory_records"
    __table_args__ = (
        Index("idx_memory_records_user_id", "user_id"),
        Index("idx_memory_records_category", "category"),
        Index("idx_memory_records_observed_at", "observed_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # PREFERENCE, EVENT, BEHAVIORAL
    content: Mapped[str] = mapped_column(String, nullable=False)
    embedding: Mapped[Optional[list[float]]] = mapped_column(Vector(1536), nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user: Mapped["User"] = relationship("User")
