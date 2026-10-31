import pytest
import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from app.database.models.task import Task
from app.database.models.calendar import CalendarEvent
from app.shared.enums.tasks import TaskType, TaskPriority, TaskStatus
from app.shared.enums.calendar import CalendarProvider, SyncStatus
from app.shared.enums.approval import ActionType, ApprovalState
from app.tasks.schemas import TaskCreateRequest, TaskUpdateRequest, TaskScheduleRequest
from app.tasks.service import TaskService
from app.calendar.schemas import EventCreateRequest, EventUpdateRequest, FocusBlockCreateRequest
from app.calendar.service import CalendarService
from app.calendar.conflicts import ConflictEngine
from app.agents.reasoning.intent_classifier import IntentResult, AgentIntent
from app.agents.planning.planner import PlannerEngine
from app.agents.tools.tool_registry import ToolRegistry
from app.agents.tools.task_tool import TaskTool
from app.agents.tools.calendar_tool import CalendarTool
from app.workflows.execution.runner import WorkflowRunner
from app.database.models.approval import Approval

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.commit = AsyncMock()
    db.flush = AsyncMock()
    db.rollback = AsyncMock()
    db.add = MagicMock()
    return db

@pytest.fixture
def tool_registry():
    registry = ToolRegistry()
    registry.register(TaskTool())
    registry.register(CalendarTool())
    return registry

# ==============================================================================
# 1. TASK SERVICE TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_task_creation(mock_db):
    service = TaskService(mock_db)
    user_id = uuid.uuid4()
    
    # Mock task repo
    mock_task = Task(
        id=uuid.uuid4(),
        user_id=user_id,
        title="Prepare Q3 Review Deck",
        description="Include sales and retention graphs",
        task_type=TaskType.PROJECT,
        priority=TaskPriority.HIGH,
        status=TaskStatus.PENDING,
    )
    service.get_task = AsyncMock(return_value=mock_task)
    service.activity_repo.append_log = AsyncMock()

    req = TaskCreateRequest(
        title="Prepare Q3 Review Deck",
        description="Include sales and retention graphs",
        task_type=TaskType.PROJECT,
        priority=TaskPriority.HIGH,
        subtask_titles=["Pull Q3 numbers", "Format presentation slides"],
    )

    created = await service.create_task(user_id, req)
    assert created.title == "Prepare Q3 Review Deck"
    assert created.priority == TaskPriority.HIGH
    service.activity_repo.append_log.assert_called_once()
    assert service.activity_repo.append_log.call_args[1]["action_type"] == "TASK_CREATED"

@pytest.mark.asyncio
async def test_task_prioritize_and_schedule(mock_db):
    service = TaskService(mock_db)
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()

    mock_task = Task(
        id=task_id,
        user_id=user_id,
        title="Review Budget",
        priority=TaskPriority.LOW,
        status=TaskStatus.PENDING,
    )
    service.get_task = AsyncMock(return_value=mock_task)
    service.activity_repo.append_log = AsyncMock()

    # Prioritize
    updated = await service.prioritize(user_id, task_id, TaskPriority.URGENT)
    assert updated.priority == TaskPriority.URGENT

    # Schedule
    now = datetime.now(timezone.utc)
    slot_start = now + timedelta(hours=2)
    slot_end = now + timedelta(hours=3)
    scheduled = await service.schedule(user_id, task_id, slot_start, slot_end)
    assert scheduled.scheduled_slot_start == slot_start
    assert scheduled.scheduled_slot_end == slot_end
    assert service.activity_repo.append_log.call_count == 2

@pytest.mark.asyncio
async def test_task_deletion(mock_db):
    service = TaskService(mock_db)
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()

    mock_task = Task(id=task_id, user_id=user_id, title="Temporary Task")
    service.get_task = AsyncMock(return_value=mock_task)
    service.task_repo.delete = AsyncMock(return_value=True)
    service.activity_repo.append_log = AsyncMock()

    deleted = await service.delete_task(user_id, task_id)
    assert deleted is True
    service.task_repo.delete.assert_called_once_with(task_id)
    assert service.activity_repo.append_log.call_args[1]["action_type"] == "TASK_DELETED"

# ==============================================================================
# 2. CALENDAR SERVICE & FOCUS BLOCK TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_calendar_event_creation(mock_db):
    service = CalendarService(mock_db)
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    service.activity_repo.append_log = AsyncMock()

    req = EventCreateRequest(
        title="Sprint Retrospective",
        description="End of sprint review with engineering team",
        start_time=now + timedelta(days=1),
        end_time=now + timedelta(days=1, hours=1),
        is_focus_block=False,
    )

    event = await service.create_event(user_id, req)
    assert event.title == "Sprint Retrospective"
    assert event.is_focus_block is False
    assert event.user_id == user_id
    service.activity_repo.append_log.assert_called_once()
    assert service.activity_repo.append_log.call_args[1]["action_type"] == "EVENT_CREATED"

@pytest.mark.asyncio
async def test_focus_block_creation(mock_db):
    service = CalendarService(mock_db)
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    service.activity_repo.append_log = AsyncMock()

    req = FocusBlockCreateRequest(
        title="Deep Architecture Focus",
        description="Zero distractions flow state",
        start_time=now + timedelta(hours=3),
        end_time=now + timedelta(hours=5),
    )

    block = await service.create_focus_block(user_id, req)
    assert block.title == "Deep Architecture Focus"
    assert block.is_focus_block is True
    service.activity_repo.append_log.assert_called_once()
    assert service.activity_repo.append_log.call_args[1]["action_type"] == "FOCUS_BLOCK_CREATED"

# ==============================================================================
# 3. CONFLICT ENGINE TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_conflict_detection_meeting_overlap(mock_db):
    engine = ConflictEngine(mock_db)
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    # Mock existing meeting from 14:00 to 15:00
    existing_meeting = CalendarEvent(
        id=uuid.uuid4(),
        user_id=user_id,
        title="Product Roadmap Review",
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=3),
        is_focus_block=False,
    )

    # Mock execute result
    mock_event_res = MagicMock()
    mock_event_res.scalars.return_value.all.return_value = [existing_meeting]

    mock_task_res = MagicMock()
    mock_task_res.scalars.return_value.all.return_value = []

    mock_db.execute = AsyncMock(side_effect=[mock_event_res, mock_task_res])

    # Target slot overlapping from 14:30 to 15:30
    report = await engine.evaluate_conflicts(
        user_id=user_id,
        start_time=now + timedelta(hours=2, minutes=30),
        end_time=now + timedelta(hours=3, minutes=30),
    )

    assert report.has_conflict is True
    assert len(report.meeting_overlaps) == 1
    assert report.meeting_overlaps[0].type == "MEETING_OVERLAP"
    assert "Product Roadmap Review" in report.meeting_overlaps[0].description

@pytest.mark.asyncio
async def test_conflict_detection_focus_block_violation(mock_db):
    engine = ConflictEngine(mock_db)
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    # Existing protected focus block from 10:00 to 12:00
    focus_block = CalendarEvent(
        id=uuid.uuid4(),
        user_id=user_id,
        title="Morning Deep Work",
        start_time=now + timedelta(hours=1),
        end_time=now + timedelta(hours=3),
        is_focus_block=True,
    )

    mock_event_res = MagicMock()
    mock_event_res.scalars.return_value.all.return_value = [focus_block]

    mock_task_res = MagicMock()
    mock_task_res.scalars.return_value.all.return_value = []

    mock_db.execute = AsyncMock(side_effect=[mock_event_res, mock_task_res])

    # User attempts to schedule a meeting at 11:00
    report = await engine.evaluate_conflicts(
        user_id=user_id,
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=2, minutes=30),
        is_target_focus_block=False,
    )

    assert report.has_conflict is True
    assert len(report.focus_block_violations) == 1
    assert report.focus_block_violations[0].type == "FOCUS_BLOCK_VIOLATION"
    assert report.focus_block_violations[0].severity == "HIGH"

@pytest.mark.asyncio
async def test_conflict_detection_task_overlap(mock_db):
    engine = ConflictEngine(mock_db)
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    # No event overlap
    mock_event_res = MagicMock()
    mock_event_res.scalars.return_value.all.return_value = []

    # Scheduled task work block from 16:00 to 17:00
    scheduled_task = Task(
        id=uuid.uuid4(),
        user_id=user_id,
        title="Draft Investor Memo",
        scheduled_slot_start=now + timedelta(hours=4),
        scheduled_slot_end=now + timedelta(hours=5),
        status=TaskStatus.IN_PROGRESS,
    )
    mock_task_res = MagicMock()
    mock_task_res.scalars.return_value.all.return_value = [scheduled_task]

    mock_db.execute = AsyncMock(side_effect=[mock_event_res, mock_task_res])

    report = await engine.evaluate_conflicts(
        user_id=user_id,
        start_time=now + timedelta(hours=4, minutes=15),
        end_time=now + timedelta(hours=4, minutes=45),
    )

    assert report.has_conflict is True
    assert len(report.task_overlaps) == 1
    assert report.task_overlaps[0].type == "TASK_OVERLAP"
    assert "Draft Investor Memo" in report.task_overlaps[0].description

# ==============================================================================
# 4. AGENT PLANNER INTEGRATION TESTS
# ==============================================================================

def test_planner_create_task(tool_registry):
    planner = PlannerEngine(tool_registry)
    intent_res = IntentResult(
        intent=AgentIntent.CREATE_TASK,
        confidence=0.95,
        explanation="Create task intent",
        extracted_entities={"task_title": "Audit AWS Expenses"},
    )
    plan = planner.generate_plan(intent_res, memory_context={})
    assert plan.intent == "CREATE_TASK"
    assert len(plan.steps) == 1
    assert plan.steps[0].tool == "task_tool"
    assert plan.steps[0].action == "create_task"
    assert plan.steps[0].parameters["title"] == "Audit AWS Expenses"
    assert plan.requires_approval is False

def test_planner_create_event_requires_approval(tool_registry):
    planner = PlannerEngine(tool_registry)
    intent_res = IntentResult(
        intent=AgentIntent.CREATE_EVENT,
        confidence=0.92,
        explanation="Schedule meeting intent",
        extracted_entities={"attendee": "Sarah Connor", "time_hint": "Tomorrow 3pm"},
    )
    plan = planner.generate_plan(intent_res, memory_context={})
    assert plan.intent == "CREATE_EVENT"
    assert len(plan.steps) >= 2
    assert plan.steps[0].action == "detect_conflicts"
    assert plan.steps[0].requires_approval is False
    assert plan.steps[1].action == "create_event"
    assert plan.steps[1].requires_approval is True  # Calendar event creation requires approval!
    assert plan.requires_approval is True

def test_planner_check_conflicts(tool_registry):
    planner = PlannerEngine(tool_registry)
    intent_res = IntentResult(
        intent=AgentIntent.CHECK_CONFLICTS,
        confidence=0.94,
        explanation="Check conflict intent",
        extracted_entities={},
    )
    plan = planner.generate_plan(intent_res, memory_context={})
    assert plan.intent == "CHECK_CONFLICTS"
    assert len(plan.steps) == 1
    assert plan.steps[0].tool == "calendar_tool"
    assert plan.steps[0].action == "detect_conflicts"
    assert plan.requires_approval is False

# ==============================================================================
# 5. TRUST LAYER & EXECUTION PATH TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_workflow_runner_calendar_execution(mock_db, tool_registry):
    runner = WorkflowRunner(mock_db, registry=tool_registry)
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.CREATE_EVENT,
        target_service="CALENDAR",
        proposed_payload={
            "title": "Strategy Sync",
            "start_time": "2026-11-01T14:00:00Z",
            "end_time": "2026-11-01T15:00:00Z",
        },
        status=ApprovalState.APPROVED,
        idempotency_key=f"cal_idemp_{uuid.uuid4()}",
    )

    runner.idempotency_guard.validate_for_execution = AsyncMock(return_value=(mock_approval, None))
    runner.approval_repo.resolve = AsyncMock(return_value=mock_approval)
    runner.approval_repo.get_by_id = AsyncMock(return_value=mock_approval)
    runner.verification_engine.approval_repo.get_by_id = AsyncMock(return_value=mock_approval)
    runner.verification_engine.approval_repo.resolve = AsyncMock(return_value=mock_approval)
    runner.activity_repo.append_log = AsyncMock()

    result = await runner.execute_approved_action(approval_id, user_id)

    assert result.status == "VERIFIED"
    assert result.action_type == "CREATE_EVENT"
    assert result.target_service == "calendar_tool"
    assert result.proof_hash is not None
    assert result.proof_hash.startswith("sha256:")
    assert len(result.proof_hash.replace("sha256:", "")) == 64  # 64 hex characters

@pytest.mark.asyncio
async def test_workflow_runner_task_deletion_execution(mock_db, tool_registry):
    runner = WorkflowRunner(mock_db, registry=tool_registry)
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    target_task_id = str(uuid.uuid4())

    mock_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.DELETE_TASK,
        target_service="TASK",
        proposed_payload={"task_id": target_task_id},
        status=ApprovalState.APPROVED,
        idempotency_key=f"task_del_idemp_{uuid.uuid4()}",
    )

    runner.idempotency_guard.validate_for_execution = AsyncMock(return_value=(mock_approval, None))
    runner.approval_repo.resolve = AsyncMock(return_value=mock_approval)
    runner.approval_repo.get_by_id = AsyncMock(return_value=mock_approval)
    runner.verification_engine.approval_repo.get_by_id = AsyncMock(return_value=mock_approval)
    runner.verification_engine.approval_repo.resolve = AsyncMock(return_value=mock_approval)
    runner.activity_repo.append_log = AsyncMock()

    result = await runner.execute_approved_action(approval_id, user_id)

    assert result.status == "VERIFIED"
    assert result.action_type == "DELETE_TASK"
    assert result.target_service == "task_tool"
    assert result.proof_hash is not None
    assert result.proof_hash.startswith("sha256:")
    assert len(result.proof_hash.replace("sha256:", "")) == 64
