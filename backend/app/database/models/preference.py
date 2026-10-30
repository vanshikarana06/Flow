from typing import TYPE_CHECKING
import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.database.models.user import User

class Preference(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    work_start_time: Mapped[str] = mapped_column(String(20), default="09:00:00", nullable=False)
    work_end_time: Mapped[str] = mapped_column(String(20), default="18:00:00", nullable=False)
    max_daily_meetings: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    meeting_buffer_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    communication_tone: Mapped[str] = mapped_column(String(50), default="friendly_formal", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="preference")

