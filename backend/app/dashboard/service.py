import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.database.models.email import EmailThread
from app.database.models.task import Task
from app.database.models.calendar import CalendarEvent
from app.database.models.approval import Approval
from app.database.models.activity import ActivityLog
from app.database.repositories.email_repo import EmailRepository
from app.database.repositories.task_repo import TaskRepository
from app.database.repositories.calendar_repo import CalendarRepository
from app.database.repositories.approval_repo import ApprovalRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.approval import ApprovalState
from app.shared.enums.tasks import TaskStatus, TaskPriority

from app.tasks.schemas import TaskResponse, SubtaskSchema
from app.calendar.schemas import EventResponse
from app.email.threads.schemas import ThreadListItem
from app.dashboard.schemas import (
    DashboardSummaryResponse,
    ActivityItemSchema,
    ApprovalItemSchema,
    AlertItemSchema,
    InboxSummaryResponse,
    UpcomingEventsResponse,
)
from app.calendar.conflicts import ConflictEngine

class DashboardService:
    """
    Unified Dashboard Aggregator Service.
    Aggregates:
    - Inbound/Outbound Emails (Threads, unread counts, recent exchanges)
    - Active & Scheduled Tasks (Priority order, upcoming deadlines)
    - Smart Calendar (Today's agenda, focus blocks, upcoming 7 days)
    - Trust Layer Pending Approvals
    - Immutable Activity Ledger Feed
    - Proactive AI Alerts (Conflicts, looming deadlines, urgent reviews)
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_repo = EmailRepository(db)
        self.task_repo = TaskRepository(db)
        self.calendar_repo = CalendarRepository(db)
        self.approval_repo = ApprovalRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.conflict_engine = ConflictEngine(db)

    async def get_summary(self, user_id: uuid.UUID) -> DashboardSummaryResponse:
        now = datetime.now(timezone.utc)
        start_of_today = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        end_of_today = start_of_today + timedelta(days=1)

        # 1. Emails: Fetch recent threads and unread count
        threads = await self.email_repo.list_threads(user_id=user_id, limit=10)
        unread_emails_count = sum(1 for t in threads if not t.is_read)
        thread_items = [
            ThreadListItem(
                id=t.id,
                subject=t.subject,
                snippet=t.snippet,
                message_count=t.message_count,
                has_attachments=t.has_attachments,
                is_read=t.is_read,
                is_archived=t.is_archived,
                last_message_at=t.last_message_at,
            )
            for t in threads
        ]

        # 2. Tasks: Active tasks ordered by due date & priority
        tasks = await self.task_repo.list_active(user_id=user_id)
        task_items = [TaskResponse.model_validate(t) for t in tasks]

        # 3. Calendar: Today's agenda
        todays_events = await self.calendar_repo.list_events_in_range(
            user_id=user_id,
            start_time=start_of_today,
            end_time=end_of_today,
        )
        event_items = [EventResponse.model_validate(e) for e in todays_events]

        # 4. Approvals: Pending Human-in-the-Loop requests
        pending_approvals = await self.approval_repo.list_pending(user_id=user_id)
        approval_items = [
            ApprovalItemSchema(
                id=a.id,
                action_type=a.action_type.value if hasattr(a.action_type, "value") else str(a.action_type),
                target_service=a.target_service,
                proposed_payload=a.proposed_payload,
                status=a.status.value if hasattr(a.status, "value") else str(a.status),
                idempotency_key=a.idempotency_key,
                created_at=a.created_at,
            )
            for a in pending_approvals
        ]

        # 5. Activity Ledger: Latest immutable events
        activities = await self.activity_repo.list_by_user_and_type(user_id=user_id, limit=15)
        activity_items = [
            ActivityItemSchema(
                id=act.id,
                log_type=act.log_type,
                action_name=act.action_name,
                details=act.details or {},
                created_at=act.created_at,
            )
            for act in activities
        ]

        # 6. Proactive AI Alerts
        alerts = await self.get_alerts(user_id=user_id)

        return DashboardSummaryResponse(
            unread_emails_count=unread_emails_count,
            active_tasks_count=len(tasks),
            todays_events_count=len(todays_events),
            pending_approvals_count=len(pending_approvals),
            recent_activities_count=len(activities),
            alerts_count=len(alerts),
            emails=thread_items,
            tasks=task_items,
            calendar=event_items,
            approvals=approval_items,
            activities=activity_items,
            alerts=alerts,
        )

    async def get_alerts(self, user_id: uuid.UUID) -> List[AlertItemSchema]:
        alerts: List[AlertItemSchema] = []
        now = datetime.now(timezone.utc)

        # Alert A: Looming Task Deadlines (due within 24 hours)
        next_24h = now + timedelta(hours=24)
        tasks = await self.task_repo.list_active(user_id=user_id)
        for t in tasks:
            if t.due_date and now <= t.due_date <= next_24h:
                alerts.append(
                    AlertItemSchema(
                        id=f"alert-task-{t.id}",
                        type="DEADLINE",
                        severity="HIGH" if t.priority in (TaskPriority.HIGH, TaskPriority.URGENT) else "MEDIUM",
                        title=f"Task Due Soon: {t.title}",
                        message=f"Task is due by {t.due_date.strftime('%Y-%m-%d %H:%M UTC')}.",
                        action_url=f"/tasks/{t.id}",
                        timestamp=t.due_date,
                    )
                )

        # Alert B: Pending Approval Action Requests
        pending = await self.approval_repo.list_pending(user_id=user_id)
        for app in pending:
            action_name = app.action_type.value if hasattr(app.action_type, "value") else str(app.action_type)
            alerts.append(
                AlertItemSchema(
                    id=f"alert-approval-{app.id}",
                    type="APPROVAL_REQUIRED",
                    severity="HIGH",
                    title=f"Approval Required: {action_name}",
                    message=f"Action '{action_name}' on {app.target_service} requires operator review before execution.",
                    action_url=f"/trust/approvals/{app.id}",
                    timestamp=app.created_at,
                )
            )

        # Alert C: Calendar Conflict Alerts (inspect next 48 hours)
        conflicts = await self.conflict_engine.evaluate_conflicts(
            user_id=user_id,
            start_time=now,
            end_time=now + timedelta(hours=48),
        )
        for conflict in conflicts.meeting_overlaps + conflicts.focus_block_violations:
            alerts.append(
                AlertItemSchema(
                    id=f"alert-conflict-{uuid.uuid4().hex[:8]}",
                    type="CONFLICT",
                    severity=conflict.severity,
                    title=f"Schedule Conflict: {conflict.type}",
                    message=conflict.description,
                    action_url="/calendar/conflicts",
                    timestamp=now,
                )
            )

        # Sort alerts by severity (HIGH first) then timestamp
        severity_weight = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        alerts.sort(key=lambda a: (severity_weight.get(a.severity, 3), a.timestamp))
        return alerts

    async def get_activities(self, user_id: uuid.UUID, limit: int = 20) -> List[ActivityItemSchema]:
        logs = await self.activity_repo.list_by_user_and_type(user_id=user_id, limit=limit)
        return [
            ActivityItemSchema(
                id=l.id,
                log_type=l.log_type,
                action_name=l.action_name,
                details=l.details or {},
                created_at=l.created_at,
            )
            for l in logs
        ]

    async def get_inbox_summary(self, user_id: uuid.UUID, limit: int = 10) -> InboxSummaryResponse:
        threads = await self.email_repo.list_threads(user_id=user_id, limit=limit)
        try:
            total_stmt = select(func.count(EmailThread.id)).where(EmailThread.user_id == user_id)
            total_res = await self.db.execute(total_stmt)
            total_count = total_res.scalar()
            if total_count is None:
                total_count = len(threads)

            unread_stmt = select(func.count(EmailThread.id)).where(
                and_(EmailThread.user_id == user_id, EmailThread.is_read.is_(False))
            )
            unread_res = await self.db.execute(unread_stmt)
            unread_count = unread_res.scalar()
            if unread_count is None:
                unread_count = sum(1 for t in threads if not t.is_read)
        except Exception:
            total_count = len(threads)
            unread_count = sum(1 for t in threads if not t.is_read)

        items = [
            ThreadListItem(
                id=t.id,
                subject=t.subject,
                snippet=t.snippet,
                message_count=t.message_count,
                has_attachments=t.has_attachments,
                is_read=t.is_read,
                is_archived=t.is_archived,
                last_message_at=t.last_message_at,
            )
            for t in threads
        ]
        return InboxSummaryResponse(
            unread_count=unread_count,
            total_threads=total_count,
            threads=items,
        )

    async def get_upcoming_events(self, user_id: uuid.UUID, days_ahead: int = 7) -> UpcomingEventsResponse:
        now = datetime.now(timezone.utc)
        end_window = now + timedelta(days=days_ahead)

        events = await self.calendar_repo.list_events_in_range(
            user_id=user_id,
            start_time=now,
            end_time=end_window,
        )
        focus_count = sum(1 for e in events if e.is_focus_block)
        return UpcomingEventsResponse(
            total_events=len(events),
            focus_blocks_count=focus_count,
            events=[EventResponse.model_validate(e) for e in events],
        )

