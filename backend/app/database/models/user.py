from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.database.models.preference import Preference
    from app.database.models.account import ConnectedAccount
    from app.database.models.contact import Contact
    from app.database.models.task import Task
    from app.database.models.calendar import CalendarEvent
    from app.database.models.approval import Approval
    from app.database.models.plan import AgentPlan
    from app.database.models.activity import ActivityLog
    from app.database.models.email import EmailThread, EmailMessage, EmailDraft

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    preference: Mapped["Preference"] = relationship("Preference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    accounts: Mapped[List["ConnectedAccount"]] = relationship("ConnectedAccount", back_populates="user", cascade="all, delete-orphan")
    contacts: Mapped[List["Contact"]] = relationship("Contact", back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    calendar_events: Mapped[List["CalendarEvent"]] = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
    approvals: Mapped[List["Approval"]] = relationship("Approval", back_populates="user", cascade="all, delete-orphan")
    agent_plans: Mapped[List["AgentPlan"]] = relationship("AgentPlan", back_populates="user", cascade="all, delete-orphan")
    activity_logs: Mapped[List["ActivityLog"]] = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    email_threads: Mapped[List["EmailThread"]] = relationship("EmailThread", back_populates="user", cascade="all, delete-orphan")
    email_messages: Mapped[List["EmailMessage"]] = relationship("EmailMessage", back_populates="user", cascade="all, delete-orphan")
    email_drafts: Mapped[List["EmailDraft"]] = relationship("EmailDraft", back_populates="user", cascade="all, delete-orphan")

