from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin
from app.shared.enums.calendar import CalendarProvider, SyncStatus

if TYPE_CHECKING:
    from app.database.models.user import User

class CalendarEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "calendar_events"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_focus_block: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    external_provider: Mapped[CalendarProvider] = mapped_column(SQLEnum(CalendarProvider), default=CalendarProvider.FLOW_NATIVE, nullable=False)
    external_event_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sync_status: Mapped[SyncStatus] = mapped_column(SQLEnum(SyncStatus), default=SyncStatus.IN_SYNC, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="calendar_events")
