from typing import Optional, List, Any, TYPE_CHECKING
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, BigInteger, Text, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin
from app.shared.enums.email import EmailDirection, DraftStatus, DeliveryStatus

if TYPE_CHECKING:
    from app.database.models.user import User
    from app.database.models.plan import AgentPlan
    from app.database.models.approval import Approval
    from app.database.models.verification import VerificationLog

class EmailThread(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_threads"
    __table_args__ = (
        Index("idx_email_threads_user_id", "user_id"),
        Index("idx_email_threads_last_message", "user_id", "last_message_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    snippet: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    message_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    has_attachments: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_message_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="email_threads")
    messages: Mapped[List["EmailMessage"]] = relationship("EmailMessage", back_populates="thread", cascade="all, delete-orphan", order_by="EmailMessage.received_at")
    drafts: Mapped[List["EmailDraft"]] = relationship("EmailDraft", back_populates="thread", cascade="all, delete-orphan")


class EmailMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_messages"
    __table_args__ = (
        Index("idx_email_messages_thread_id", "thread_id"),
        Index("idx_email_messages_user_id", "user_id"),
        Index("idx_email_messages_message_id_header", "message_id_header"),
        Index("idx_email_messages_received_at", "received_at"),
    )

    thread_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("email_threads.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    direction: Mapped[EmailDirection] = mapped_column(SQLEnum(EmailDirection), nullable=False)
    message_id_header: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    in_reply_to_header: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    references_header: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sender_email: Mapped[str] = mapped_column(String(255), nullable=False)
    sender_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recipient_to: Mapped[Any] = mapped_column(JSONB, nullable=False)
    recipient_cc: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    recipient_bcc: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    body_plain: Mapped[str] = mapped_column(Text, nullable=False)
    body_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_headers: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    thread: Mapped["EmailThread"] = relationship("EmailThread", back_populates="messages")
    user: Mapped["User"] = relationship("User", back_populates="email_messages")
    attachments: Mapped[List["EmailAttachment"]] = relationship("EmailAttachment", back_populates="message", cascade="all, delete-orphan")
    delivery_log: Mapped[Optional["EmailDeliveryLog"]] = relationship("EmailDeliveryLog", back_populates="message", uselist=False)


class EmailDraft(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_drafts"
    __table_args__ = (
        Index("idx_email_drafts_user_id", "user_id"),
        Index("idx_email_drafts_thread_id", "thread_id"),
        Index("idx_email_drafts_status", "status"),
    )

    thread_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("email_threads.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agent_plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agent_plans.id", ondelete="SET NULL"), nullable=True)
    recipient_to: Mapped[Any] = mapped_column(JSONB, nullable=False)
    recipient_cc: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    recipient_bcc: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    body_plain: Mapped[str] = mapped_column(Text, nullable=False)
    body_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[DraftStatus] = mapped_column(SQLEnum(DraftStatus), default=DraftStatus.DRAFT, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="email_drafts")
    thread: Mapped[Optional["EmailThread"]] = relationship("EmailThread", back_populates="drafts")
    agent_plan: Mapped[Optional["AgentPlan"]] = relationship("AgentPlan")
    delivery_log: Mapped[Optional["EmailDeliveryLog"]] = relationship("EmailDeliveryLog", back_populates="draft", uselist=False)


class EmailAttachment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_attachments"
    __table_args__ = (
        Index("idx_email_attachments_message_id", "message_id"),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("email_messages.id", ondelete="CASCADE"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(128), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    content_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    message: Mapped["EmailMessage"] = relationship("EmailMessage", back_populates="attachments")


class EmailDeliveryLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_delivery_logs"
    __table_args__ = (
        Index("idx_email_delivery_logs_user_id", "user_id"),
        Index("idx_email_delivery_logs_draft_id", "draft_id"),
    )

    draft_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("email_drafts.id", ondelete="CASCADE"), unique=True, nullable=False)
    message_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("email_messages.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    endpoint_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    http_status: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_status: Mapped[DeliveryStatus] = mapped_column(SQLEnum(DeliveryStatus), default=DeliveryStatus.PENDING, nullable=False)
    gmail_message_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    gmail_thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    response_payload: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    draft: Mapped["EmailDraft"] = relationship("EmailDraft", back_populates="delivery_log")
    message: Mapped[Optional["EmailMessage"]] = relationship("EmailMessage", back_populates="delivery_log")
    user: Mapped["User"] = relationship("User")
