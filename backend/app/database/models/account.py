from typing import List, TYPE_CHECKING
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, ARRAY, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.database.models.user import User

class ConnectedAccount(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "connected_accounts"
    __table_args__ = (
        UniqueConstraint("user_id", "provider", "account_email", name="uq_user_provider_account"),
        Index("idx_connected_accounts_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    account_email: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token_encrypted: Mapped[str] = mapped_column(String, nullable=False)
    refresh_token_encrypted: Mapped[str] = mapped_column(String, nullable=False)
    token_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    scopes: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="accounts")
