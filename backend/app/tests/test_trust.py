import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi import HTTPException
from httpx import AsyncClient, ASGITransport

from app.shared.enums.approval import ApprovalState, ActionType
from app.core.exceptions import InvalidStateTransitionException, VerificationFailedException
from app.trust.approvals.state_machine import ApprovalStateMachine
from app.trust.approvals.service import ApprovalService
from app.trust.receipts.builders.receipt_builder import ReceiptBuilder
from app.trust.receipts.hashes.proof_hasher import ProofHasher
from app.trust.verification.service import VerificationEngine
from app.trust.activities.service import ActivityService
from app.database.models.approval import Approval
from app.database.models.activity import ActivityLog
from app.database.models.verification import VerificationLog
from app.database.models.user import User
from app.database.models.preference import Preference
from app.database.session import get_db
from app.core.security import create_supabase_jwt
from app.main import app

# ==============================================================================
# 1. State Machine Legal & Illegal Transition Tests
# ==============================================================================

def test_approval_state_machine_legal_transitions():
    """Verify that all documented valid transitions succeed."""
    assert ApprovalStateMachine.can_transition(ApprovalState.DRAFT, ApprovalState.PENDING)
    assert ApprovalStateMachine.can_transition(ApprovalState.DRAFT, ApprovalState.REJECTED)
    assert ApprovalStateMachine.can_transition(ApprovalState.PENDING, ApprovalState.APPROVED)
    assert ApprovalStateMachine.can_transition(ApprovalState.PENDING, ApprovalState.MODIFIED)
    assert ApprovalStateMachine.can_transition(ApprovalState.PENDING, ApprovalState.REJECTED)
    assert ApprovalStateMachine.can_transition(ApprovalState.MODIFIED, ApprovalState.APPROVED)
    assert ApprovalStateMachine.can_transition(ApprovalState.MODIFIED, ApprovalState.PENDING)
    assert ApprovalStateMachine.can_transition(ApprovalState.APPROVED, ApprovalState.EXECUTED)
    assert ApprovalStateMachine.can_transition(ApprovalState.APPROVED, ApprovalState.REJECTED)
    assert ApprovalStateMachine.can_transition(ApprovalState.EXECUTED, ApprovalState.VERIFIED)

    # Test actual transition execution
    next_st = ApprovalStateMachine.transition(ApprovalState.PENDING, ApprovalState.APPROVED)
    assert next_st == ApprovalState.APPROVED

def test_approval_state_machine_illegal_transitions():
    """Verify that illegal transitions raise InvalidStateTransitionException."""
    # Cannot jump from DRAFT to EXECUTED
    with pytest.raises(InvalidStateTransitionException) as exc1:
        ApprovalStateMachine.transition(ApprovalState.DRAFT, ApprovalState.EXECUTED)
    assert "Cannot transition from DRAFT to EXECUTED" in exc1.value.detail["message"]

    # Cannot transition out of terminal state REJECTED
    with pytest.raises(InvalidStateTransitionException):
        ApprovalStateMachine.transition(ApprovalState.REJECTED, ApprovalState.APPROVED)

    # Cannot transition out of terminal state VERIFIED
    with pytest.raises(InvalidStateTransitionException):
        ApprovalStateMachine.transition(ApprovalState.VERIFIED, ApprovalState.PENDING)

    # Cannot jump from PENDING directly to VERIFIED
    with pytest.raises(InvalidStateTransitionException):
        ApprovalStateMachine.transition(ApprovalState.PENDING, ApprovalState.VERIFIED)

# ==============================================================================
# 2. Receipt Builder & SHA-256 Proof Generation Tests
# ==============================================================================

def test_receipt_builder_and_proof_hash_generation():
    """Verify deterministic SHA-256 proof hash and complete ExecutionReceipt structure."""
    fixed_ts = datetime(2026, 10, 31, 1, 30, 0, tzinfo=timezone.utc)
    evidence = {"status_code": 200, "message_id": "msg_abc123"}

    receipt1 = (
        ReceiptBuilder()
        .set_action(action_id="act_001", action_type="SEND_EMAIL", target_service="FLOW_EMAIL_OUTBOUND")
        .set_verified(True, external_resource_id="msg_abc123")
        .set_timestamp(fixed_ts)
        .set_evidence(evidence)
        .build()
    )

    # Verify deterministic hash
    receipt2 = (
        ReceiptBuilder()
        .set_action(action_id="act_001", action_type="SEND_EMAIL", target_service="FLOW_EMAIL_OUTBOUND")
        .set_verified(True, external_resource_id="msg_abc123")
        .set_timestamp(fixed_ts)
        .set_evidence(evidence)
        .build()
    )

    assert receipt1.proof_hash == receipt2.proof_hash
    assert receipt1.proof_hash.startswith("sha256:")
    assert len(receipt1.proof_hash) == 7 + 64  # "sha256:" + 64 hex characters
    assert receipt1.status == "VERIFIED"
    assert receipt1.verified is True
    assert receipt1.external_resource_id == "msg_abc123"

def test_receipt_builder_incomplete_raises_value_error():
    """Verify that building a receipt without mandatory attributes raises ValueError."""
    builder = ReceiptBuilder()
    with pytest.raises(ValueError):
        builder.build()

# ==============================================================================
# 3. Approval Service Lifecycle Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_approval_service_lifecycle():
    """Verify create -> modify -> approve lifecycle with Activity Ledger logging."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()

    mock_db = MagicMock()
    service = ApprovalService(mock_db)

    # 1. Mock create
    dummy_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"subject": "Hello", "to": "alice@example.com"},
        status=ApprovalState.PENDING,
        idempotency_key="idemp_123",
    )
    service.approval_repo.get_by_idempotency_key = AsyncMock(return_value=None)
    service.approval_repo.create_request = AsyncMock(return_value=dummy_approval)
    service.activity_repo.append_log = AsyncMock()

    created = await service.create_approval(
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"subject": "Hello", "to": "alice@example.com"},
        idempotency_key="idemp_123",
    )
    assert created.status == ApprovalState.PENDING
    service.activity_repo.append_log.assert_awaited()

    # 2. Modify
    service.approval_repo.get_by_id = AsyncMock(return_value=dummy_approval)
    modified_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"subject": "Hello", "to": "alice@example.com"},
        modified_payload={"subject": "Updated Subject"},
        status=ApprovalState.MODIFIED,
        idempotency_key="idemp_123",
    )
    service.approval_repo.resolve = AsyncMock(return_value=modified_approval)

    modified = await service.modify(
        approval_id=approval_id,
        user_id=user_id,
        modified_payload={"subject": "Updated Subject"},
    )
    assert modified.status == ApprovalState.MODIFIED

    # 3. Approve
    approved_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"subject": "Hello", "to": "alice@example.com"},
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_123",
    )
    service.approval_repo.get_by_id = AsyncMock(return_value=modified_approval)
    service.approval_repo.resolve = AsyncMock(return_value=approved_approval)

    approved = await service.approve(approval_id=approval_id, user_id=user_id)
    assert approved.status == ApprovalState.APPROVED

# ==============================================================================
# 4. Verification Engine Domain Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_verification_engine_email():
    """Verify EMAIL domain verification: valid vs invalid."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    engine = VerificationEngine(mock_db)
    dummy_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={},
        status=ApprovalState.APPROVED,
        idempotency_key="key_1",
    )
    engine.approval_repo.get_by_id = AsyncMock(return_value=dummy_approval)
    engine.approval_repo.resolve = AsyncMock()
    engine.activity_repo.append_log = AsyncMock()

    # Valid evidence
    receipt = await engine.verify_action(
        approval_id=approval_id,
        user_id=user_id,
        evidence={"success": True, "gmail_message_id": "18e2a1b3c4d5e6f7"},
    )
    assert receipt.verified is True
    assert receipt.status == "VERIFIED"
    assert receipt.external_resource_id == "18e2a1b3c4d5e6f7"
    assert receipt.proof_hash.startswith("sha256:")

    # Invalid evidence (success=False)
    dummy_approval.status = ApprovalState.APPROVED
    with pytest.raises(VerificationFailedException):
        await engine.verify_action(
            approval_id=approval_id,
            user_id=user_id,
            evidence={"success": False, "error": "QuotaExceeded"},
        )

@pytest.mark.asyncio
async def test_verification_engine_task():
    """Verify TASK domain verification: valid vs invalid."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    engine = VerificationEngine(mock_db)
    dummy_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.DELETE_TASK,
        target_service="FLOW_TASKS",
        proposed_payload={},
        status=ApprovalState.APPROVED,
        idempotency_key="key_2",
    )
    engine.approval_repo.get_by_id = AsyncMock(return_value=dummy_approval)
    engine.approval_repo.resolve = AsyncMock()
    engine.activity_repo.append_log = AsyncMock()

    # Valid task evidence
    receipt = await engine.verify_action(
        approval_id=approval_id,
        user_id=user_id,
        evidence={"task_id": "tsk_123", "status": "COMPLETED"},
    )
    assert receipt.verified is True
    assert receipt.external_resource_id == "tsk_123"

    # Missing task_id
    dummy_approval.status = ApprovalState.APPROVED
    with pytest.raises(VerificationFailedException):
        await engine.verify_action(
            approval_id=approval_id,
            user_id=user_id,
            evidence={"status": "COMPLETED"},
        )

@pytest.mark.asyncio
async def test_verification_engine_calendar():
    """Verify CALENDAR domain verification: valid vs invalid."""
    user_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    engine = VerificationEngine(mock_db)
    dummy_approval = Approval(
        id=approval_id,
        user_id=user_id,
        action_type=ActionType.CREATE_EVENT,
        target_service="FLOW_CALENDAR",
        proposed_payload={},
        status=ApprovalState.APPROVED,
        idempotency_key="key_3",
    )
    engine.approval_repo.get_by_id = AsyncMock(return_value=dummy_approval)
    engine.approval_repo.resolve = AsyncMock()
    engine.activity_repo.append_log = AsyncMock()

    # Valid calendar evidence
    receipt = await engine.verify_action(
        approval_id=approval_id,
        user_id=user_id,
        evidence={
            "event_id": "evt_999",
            "start_time": "2026-10-31T10:00:00Z",
            "end_time": "2026-10-31T11:00:00Z",
        },
    )
    assert receipt.verified is True
    assert receipt.external_resource_id == "evt_999"

    # Missing time boundaries
    dummy_approval.status = ApprovalState.APPROVED
    with pytest.raises(VerificationFailedException):
        await engine.verify_action(
            approval_id=approval_id,
            user_id=user_id,
            evidence={"event_id": "evt_999"},
        )

# ==============================================================================
# 5. Activity Ledger Immutability Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_activity_ledger_immutability():
    """Verify that ActivityService and Repository enforce append-only immutability."""
    mock_db = MagicMock()
    service = ActivityService(mock_db)

    # Update attempt on service raises 405 Method Not Allowed
    with pytest.raises(HTTPException) as exc_up:
        service.update(uuid.uuid4())
    assert exc_up.value.status_code == 405
    assert "append-only" in exc_up.value.detail.lower()

    # Delete attempt on service raises 405 Method Not Allowed
    with pytest.raises(HTTPException) as exc_del:
        service.delete(uuid.uuid4())
    assert exc_del.value.status_code == 405
    assert "append-only" in exc_del.value.detail.lower()

    # Delete attempt on repository raises NotImplementedError
    with pytest.raises(NotImplementedError):
        await service.repo.delete(uuid.uuid4())

    # Update attempt on repository raises NotImplementedError
    with pytest.raises(NotImplementedError):
        await service.repo.update(uuid.uuid4())

# ==============================================================================
# 6. Trust Domain HTTP API Endpoint Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_trust_api_endpoints():
    """Verify HTTP access to /api/v1/trust/approvals/pending and /activities/ledger."""
    uid = uuid.uuid4()
    test_user = User(id=uid, email="trustuser@flow.dev", full_name="Trust User")
    test_pref = Preference(user_id=uid)
    test_user.preference = test_pref

    mock_db = MagicMock()
    mock_db.execute = AsyncMock()

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    valid_token = create_supabase_jwt(user_id=uid, email="trustuser@flow.dev")

    from app.database.repositories.user_repo import UserRepository
    original_get_with_pref = UserRepository.get_with_preferences
    UserRepository.get_with_preferences = AsyncMock(return_value=test_user)

    from app.database.repositories.approval_repo import ApprovalRepository
    original_list_pending = ApprovalRepository.list_pending
    ApprovalRepository.list_pending = AsyncMock(return_value=[])

    from app.database.repositories.activity_repo import ActivityRepository
    original_list_act = ActivityRepository.list_by_user_and_type
    ActivityRepository.list_by_user_and_type = AsyncMock(return_value=[])

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. GET /api/v1/trust/approvals/pending
            resp_approvals = await ac.get(
                "/api/v1/trust/approvals/pending",
                headers={"Authorization": f"Bearer {valid_token}"},
            )
            assert resp_approvals.status_code == 200
            assert resp_approvals.json()["success"] is True

            # 2. GET /api/v1/trust/activities/ledger
            resp_ledger = await ac.get(
                "/api/v1/trust/activities/ledger",
                headers={"Authorization": f"Bearer {valid_token}"},
            )
            assert resp_ledger.status_code == 200
            assert resp_ledger.json()["success"] is True

    finally:
        app.dependency_overrides.pop(get_db, None)
        UserRepository.get_with_preferences = original_get_with_pref
        ApprovalRepository.list_pending = original_list_pending
        ActivityRepository.list_by_user_and_type = original_list_act

