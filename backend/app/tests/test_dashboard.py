import pytest
import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.database.session import get_db
from app.dashboard.service import DashboardService
from app.database.models.email import EmailThread
from app.database.models.task import Task
from app.database.models.calendar import CalendarEvent
from app.database.models.approval import Approval
from app.database.models.activity import ActivityLog
from app.shared.enums.tasks import TaskType, TaskPriority, TaskStatus
from app.shared.enums.calendar import CalendarProvider, SyncStatus
from app.shared.enums.approval import ActionType, ApprovalState
from app.calendar.schemas import ConflictReport, ConflictItem

@pytest.fixture
def test_user():
    return AuthenticatedUser(
        user_id=uuid.uuid4(),
        email="operator@flow.dev",
        full_name="FLOW Operator",
    )

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.commit = AsyncMock()
    db.flush = AsyncMock()
    db.rollback = AsyncMock()
    db.add = MagicMock()
    return db

# ==============================================================================
# 1. DASHBOARD SERVICE TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_dashboard_summary_aggregation(mock_db, test_user):
    service = DashboardService(mock_db)
    now = datetime.now(timezone.utc)

    # 1. Mock Emails
    mock_thread = EmailThread(
        id=uuid.uuid4(),
        user_id=test_user.id,
        subject="Important Contract Update",
        snippet="Please find the attached agreement...",
        message_count=2,
        has_attachments=True,
        is_read=False,
        is_archived=False,
        last_message_at=now,
    )
    service.email_repo.list_threads = AsyncMock(return_value=[mock_thread])

    # Unread count mock
    mock_unread_res = MagicMock()
    mock_unread_res.scalar.return_value = 1
    mock_db.execute = AsyncMock(return_value=mock_unread_res)

    # 2. Mock Tasks
    mock_task = Task(
        id=uuid.uuid4(),
        user_id=test_user.id,
        title="Deploy Version 2.0",
        task_type=TaskType.PROJECT,
        priority=TaskPriority.HIGH,
        status=TaskStatus.IN_PROGRESS,
        due_date=now + timedelta(hours=5),
        created_at=now,
        updated_at=now,
    )
    service.task_repo.list_active = AsyncMock(return_value=[mock_task])

    # 3. Mock Calendar
    mock_event = CalendarEvent(
        id=uuid.uuid4(),
        user_id=test_user.id,
        title="Architecture Sync",
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=3),
        is_focus_block=False,
        external_provider=CalendarProvider.FLOW_NATIVE,
        sync_status=SyncStatus.IN_SYNC,
        created_at=now,
        updated_at=now,
    )
    service.calendar_repo.list_events_in_range = AsyncMock(return_value=[mock_event])

    # 4. Mock Approvals
    mock_approval = Approval(
        id=uuid.uuid4(),
        user_id=test_user.id,
        action_type=ActionType.SEND_EMAIL,
        target_service="EMAIL",
        proposed_payload={"subject": "Review Request"},
        status=ApprovalState.PENDING,
        idempotency_key="idemp_summary_001",
        created_at=now,
    )
    service.approval_repo.list_pending = AsyncMock(return_value=[mock_approval])

    # 5. Mock Activities
    mock_activity = ActivityLog(
        id=uuid.uuid4(),
        user_id=test_user.id,
        log_type="EMAIL",
        action_name="EMAIL_RECEIVED",
        details={"sender": "alex@company.com"},
        created_at=now,
    )
    service.activity_repo.list_by_user_and_type = AsyncMock(return_value=[mock_activity])

    # 6. Mock Conflict Engine
    service.conflict_engine.evaluate_conflicts = AsyncMock(
        return_value=ConflictReport(
            has_conflict=False,
            conflict_count=0,
            summary="Clear",
        )
    )

    summary = await service.get_summary(test_user.id)

    # Validate All 6 Aggregate Dimensions in Single Payload
    assert summary.unread_emails_count == 1
    assert summary.active_tasks_count == 1
    assert summary.todays_events_count == 1
    assert summary.pending_approvals_count == 1
    assert summary.recent_activities_count == 1

    # Check payload objects
    assert len(summary.emails) == 1
    assert summary.emails[0].subject == "Important Contract Update"

    assert len(summary.tasks) == 1
    assert summary.tasks[0].title == "Deploy Version 2.0"

    assert len(summary.calendar) == 1
    assert summary.calendar[0].title == "Architecture Sync"

    assert len(summary.approvals) == 1
    assert summary.approvals[0].action_type == "SEND_EMAIL"

    assert len(summary.activities) == 1
    assert summary.activities[0].action_name == "EMAIL_RECEIVED"

    # AI Alerts generated from task deadline + pending approval
    assert len(summary.alerts) >= 2
    alert_types = [a.type for a in summary.alerts]
    assert "DEADLINE" in alert_types
    assert "APPROVAL_REQUIRED" in alert_types

@pytest.mark.asyncio
async def test_dashboard_alerts_generation(mock_db, test_user):
    service = DashboardService(mock_db)
    now = datetime.now(timezone.utc)

    # Task due in 2 hours
    urgent_task = Task(
        id=uuid.uuid4(),
        user_id=test_user.id,
        title="Critical Security Patch",
        priority=TaskPriority.URGENT,
        due_date=now + timedelta(hours=2),
    )
    service.task_repo.list_active = AsyncMock(return_value=[urgent_task])

    # Pending approval
    pending_app = Approval(
        id=uuid.uuid4(),
        user_id=test_user.id,
        action_type=ActionType.DELETE_TASK,
        target_service="TASK",
        proposed_payload={"task_id": "tsk_01"},
        created_at=now,
    )
    service.approval_repo.list_pending = AsyncMock(return_value=[pending_app])

    # Conflict in calendar
    service.conflict_engine.evaluate_conflicts = AsyncMock(
        return_value=ConflictReport(
            has_conflict=True,
            conflict_count=1,
            meeting_overlaps=[
                ConflictItem(
                    type="MEETING_OVERLAP",
                    severity="HIGH",
                    description="Collision between 1:1 and Town Hall",
                    time_window="10:00 - 11:00",
                )
            ],
            summary="1 conflict",
        )
    )

    alerts = await service.get_alerts(test_user.id)
    assert len(alerts) == 3

    types = {a.type for a in alerts}
    assert types == {"DEADLINE", "APPROVAL_REQUIRED", "CONFLICT"}
    assert alerts[0].severity == "HIGH"

@pytest.mark.asyncio
async def test_inbox_summary(mock_db, test_user):
    service = DashboardService(mock_db)
    now = datetime.now(timezone.utc)

    threads = [
        EmailThread(
            id=uuid.uuid4(),
            user_id=test_user.id,
            subject="Thread 1",
            snippet="Hello...",
            message_count=1,
            has_attachments=False,
            is_read=True,
            is_archived=False,
            last_message_at=now,
        )
    ]
    service.email_repo.list_threads = AsyncMock(return_value=threads)

    # Mock count queries
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 5
    mock_res_unread = MagicMock()
    mock_res_unread.scalar.return_value = 2

    mock_db.execute = AsyncMock(side_effect=[mock_res_total, mock_res_unread])

    inbox = await service.get_inbox_summary(test_user.id, limit=5)
    assert inbox.total_threads == 5
    assert inbox.unread_count == 2
    assert len(inbox.threads) == 1

@pytest.mark.asyncio
async def test_upcoming_events(mock_db, test_user):
    service = DashboardService(mock_db)
    now = datetime.now(timezone.utc)

    events = [
        CalendarEvent(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Design Jam",
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2, hours=1),
            is_focus_block=False,
            external_provider=CalendarProvider.FLOW_NATIVE,
            sync_status=SyncStatus.IN_SYNC,
            created_at=now,
            updated_at=now,
        ),
        CalendarEvent(
            id=uuid.uuid4(),
            user_id=test_user.id,
            title="Deep Code Block",
            start_time=now + timedelta(days=3),
            end_time=now + timedelta(days=3, hours=3),
            is_focus_block=True,
            external_provider=CalendarProvider.FLOW_NATIVE,
            sync_status=SyncStatus.IN_SYNC,
            created_at=now,
            updated_at=now,
        ),
    ]
    service.calendar_repo.list_events_in_range = AsyncMock(return_value=events)

    upcoming = await service.get_upcoming_events(test_user.id, days_ahead=7)
    assert upcoming.total_events == 2
    assert upcoming.focus_blocks_count == 1
    assert len(upcoming.events) == 2

# ==============================================================================
# 2. REST API ROUTER TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_dashboard_api_endpoints(test_user, mock_db):
    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = lambda: mock_db

    now = datetime.now(timezone.utc)
    mock_scalar = MagicMock()
    mock_scalar.scalar.return_value = 0
    mock_db.execute = AsyncMock(return_value=mock_scalar)

    # Empty mocks
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # GET /summary
        res_summary = await ac.get("/api/v1/dashboard/summary")
        assert res_summary.status_code == 200
        data = res_summary.json()["data"]
        assert "emails" in data
        assert "tasks" in data
        assert "calendar" in data
        assert "approvals" in data
        assert "activities" in data
        assert "alerts" in data

        # GET /activity
        res_act = await ac.get("/api/v1/dashboard/activity")
        assert res_act.status_code == 200

        # GET /alerts
        res_alerts = await ac.get("/api/v1/dashboard/alerts")
        assert res_alerts.status_code == 200

        # GET /inbox-summary
        res_inbox = await ac.get("/api/v1/dashboard/inbox-summary")
        assert res_inbox.status_code == 200

        # GET /upcoming-events
        res_events = await ac.get("/api/v1/dashboard/upcoming-events")
        assert res_events.status_code == 200

    app.dependency_overrides.clear()
