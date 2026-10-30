import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi import HTTPException

from app.workflows.retry.idempotency import (
    IdempotencyGuard,
    DuplicateExecutionException,
    InvalidExecutionStateException,
)
from app.database.models.approval import Approval
from app.database.models.execution import ExecutionLog
from app.shared.enums.approval import ApprovalState, ActionType

@pytest.mark.asyncio
async def test_idempotency_guard_valid_approved_action():
    """Verify that an APPROVED action with no prior execution passes validation."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()

    # 1. First query returns the approval
    approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"subject": "Test"},
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_100",
    )
    mock_res_approval = MagicMock()
    mock_res_approval.scalar_one_or_none.return_value = approval

    # 2. Second query checks existing execution (None)
    mock_res_exec = MagicMock()
    mock_res_exec.scalar_one_or_none.return_value = None

    mock_db.execute = AsyncMock(side_effect=[mock_res_approval, mock_res_exec])

    guard = IdempotencyGuard(mock_db)
    appr, ex = await guard.validate_for_execution(approval_id, user_id)

    assert appr.id == approval_id
    assert appr.status == ApprovalState.APPROVED
    assert ex is None

@pytest.mark.asyncio
async def test_idempotency_guard_rejects_non_approved_status():
    """Verify that pending or rejected status is rejected with InvalidExecutionStateException."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()
    pending_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={},
        status=ApprovalState.PENDING,
        idempotency_key="idemp_101",
    )
    mock_res_approval = MagicMock()
    mock_res_approval.scalar_one_or_none.return_value = pending_approval

    mock_res_exec = MagicMock()
    mock_res_exec.scalar_one_or_none.return_value = None

    mock_db.execute = AsyncMock(side_effect=[mock_res_approval, mock_res_exec])

    guard = IdempotencyGuard(mock_db)
    with pytest.raises(InvalidExecutionStateException) as exc:
        await guard.validate_for_execution(approval_id, user_id)
    assert exc.value.status_code == 400
    assert "Only APPROVED actions may execute" in exc.value.detail

@pytest.mark.asyncio
async def test_idempotency_guard_prevents_duplicate_execution():
    """Verify that if an ExecutionLog already exists, DuplicateExecutionException is raised."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()
    approved = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={},
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_102",
    )
    existing_exec = ExecutionLog(
        id=uuid.uuid4(),
        user_id=user_id,
        approval_id=approval_id,
        action_name="SEND_EMAIL",
        target_service="FLOW_EMAIL_OUTBOUND",
        payload={},
        status_code=200,
        raw_response={},
    )
    mock_res_approval = MagicMock()
    mock_res_approval.scalar_one_or_none.return_value = approved

    mock_res_exec = MagicMock()
    mock_res_exec.scalar_one_or_none.return_value = existing_exec

    mock_db.execute = AsyncMock(side_effect=[mock_res_approval, mock_res_exec])

    guard = IdempotencyGuard(mock_db)
    with pytest.raises(DuplicateExecutionException) as exc:
        await guard.validate_for_execution(approval_id, user_id)
    assert exc.value.status_code == 409
    assert "already been executed" in exc.value.detail
