import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi import HTTPException

from app.workflows.execution.runner import WorkflowRunner, WorkflowExecutionResult
from app.database.models.approval import Approval
from app.database.models.execution import ExecutionLog
from app.shared.enums.approval import ApprovalState, ActionType
from app.agents.tools.tool_registry import get_tool_registry

@pytest.mark.asyncio
async def test_workflow_runner_executes_approved_email():
    """Verify execution of approved email action with logging, verification, and receipt."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    runner = WorkflowRunner(mock_db, get_tool_registry())

    # Mock Idempotency check to return valid approved approval
    approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"recipient_to": ["alice@example.com"], "subject": "Launch Prep"},
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_email_1",
    )
    runner.idempotency_guard.validate_for_execution = AsyncMock(return_value=(approval, None))
    runner.approval_repo.resolve = AsyncMock()
    runner.approval_repo.get_by_id = AsyncMock(return_value=approval)
    runner.activity_repo.append_log = AsyncMock()
    runner.verification_engine.approval_repo.get_by_id = AsyncMock(return_value=approval)
    runner.verification_engine.approval_repo.resolve = AsyncMock()

    result: WorkflowExecutionResult = await runner.execute_approved_action(approval_id, user_id)

    # 1. Verification assertions
    assert result.status == "VERIFIED"
    assert result.action_type == "SEND_EMAIL"
    assert result.target_service == "email_tool"
    assert result.proof_hash.startswith("sha256:")
    assert result.receipt.verified is True

    # 2. State transition assertions
    runner.approval_repo.resolve.assert_awaited()

    # 3. Execution Log persisted in DB
    mock_db.add.assert_called()

    # 4. Activity Ledger assertions
    activity_actions = [call.kwargs["action_type"] for call in runner.activity_repo.append_log.call_args_list]
    assert "ACTION_EXECUTED" in activity_actions
    assert "ACTION_VERIFIED" in activity_actions

@pytest.mark.asyncio
async def test_workflow_runner_executes_approved_calendar():
    """Verify execution of approved calendar event creation."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    runner = WorkflowRunner(mock_db, get_tool_registry())

    approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.CREATE_EVENT,
        target_service="CALENDAR",
        proposed_payload={
            "title": "Architecture Sync",
            "start_time": "2026-10-31T14:00:00Z",
            "end_time": "2026-10-31T15:00:00Z",
        },
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_cal_1",
    )
    runner.idempotency_guard.validate_for_execution = AsyncMock(return_value=(approval, None))
    runner.approval_repo.resolve = AsyncMock()
    runner.approval_repo.get_by_id = AsyncMock(return_value=approval)
    runner.activity_repo.append_log = AsyncMock()
    runner.verification_engine.approval_repo.get_by_id = AsyncMock(return_value=approval)
    runner.verification_engine.approval_repo.resolve = AsyncMock()

    result = await runner.execute_approved_action(approval_id, user_id)

    assert result.status == "VERIFIED"
    assert result.target_service == "calendar_tool"
    assert result.receipt.verified is True
    assert result.proof_hash.startswith("sha256:")

@pytest.mark.asyncio
async def test_workflow_runner_executes_approved_task_deletion():
    """Verify execution of approved task deletion."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    runner = WorkflowRunner(mock_db, get_tool_registry())

    approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.DELETE_TASK,
        target_service="FLOW_TASKS",
        proposed_payload={"task_id": "tsk_888"},
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_tsk_1",
    )
    runner.idempotency_guard.validate_for_execution = AsyncMock(return_value=(approval, None))
    runner.approval_repo.resolve = AsyncMock()
    runner.approval_repo.get_by_id = AsyncMock(return_value=approval)
    runner.activity_repo.append_log = AsyncMock()
    runner.verification_engine.approval_repo.get_by_id = AsyncMock(return_value=approval)
    runner.verification_engine.approval_repo.resolve = AsyncMock()

    result = await runner.execute_approved_action(approval_id, user_id)

    assert result.status == "VERIFIED"
    assert result.target_service == "task_tool"
    assert result.receipt.verified is True
