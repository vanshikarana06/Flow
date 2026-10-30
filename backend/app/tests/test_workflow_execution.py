import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport

from app.database.models.approval import Approval
from app.database.models.user import User
from app.database.models.preference import Preference
from app.shared.enums.approval import ApprovalState, ActionType
from app.database.session import get_db
from app.core.security import create_supabase_jwt
from app.main import app

@pytest.mark.asyncio
async def test_api_workflow_execute_approved_action():
    """Verify HTTP POST /api/v1/workflows/execute/{approval_id} executes and returns verified receipt."""
    uid = uuid.uuid4()
    approval_id = uuid.uuid4()
    test_user = User(id=uid, email="workflow@flow.dev", full_name="Workflow User")
    test_user.preference = Preference(user_id=uid)

    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    # DB queries in WorkflowRunner:
    # 1. validate_for_execution: query Approval -> returns approved
    # 2. validate_for_execution: query ExecutionLog -> returns None
    # 3. resolve: query Approval -> returns updated
    # 4. verify_action: query Approval -> returns approval
    approved = Approval(
        id=approval_id,
        user_id=uid,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={"recipient_to": ["tester@flow.dev"], "subject": "Test Workflow"},
        status=ApprovalState.APPROVED,
        idempotency_key="idemp_api_1",
    )
    mock_res_approval = MagicMock()
    mock_res_approval.scalar_one_or_none.return_value = approved

    mock_res_exec = MagicMock()
    mock_res_exec.scalar_one_or_none.return_value = None

    mock_db.execute = AsyncMock(side_effect=[
        mock_res_approval,  # 1. validate_for_execution Approval
        mock_res_exec,      # 2. validate_for_execution ExecutionLog
        MagicMock(),        # 3. update resolve
        mock_res_approval,  # 4. verify_action get_by_id
        MagicMock(),        # 5. update resolve
    ])

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    valid_token = create_supabase_jwt(user_id=uid, email="workflow@flow.dev")

    # Mock user repository for get_current_user
    from app.database.repositories.user_repo import UserRepository
    original_get_with_pref = UserRepository.get_with_preferences
    UserRepository.get_with_preferences = AsyncMock(return_value=test_user)

    from app.database.repositories.approval_repo import ApprovalRepository
    original_get_by_id = ApprovalRepository.get_by_id
    original_resolve = ApprovalRepository.resolve
    ApprovalRepository.get_by_id = AsyncMock(return_value=approved)
    ApprovalRepository.resolve = AsyncMock(return_value=approved)

    from app.database.repositories.activity_repo import ActivityRepository
    original_append_log = ActivityRepository.append_log
    ActivityRepository.append_log = AsyncMock()

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            resp = await ac.post(
                f"/api/v1/workflows/execute/{approval_id}",
                headers={"Authorization": f"Bearer {valid_token}"},
            )
            assert resp.status_code == 200
            data = resp.json()["data"]
            assert data["approval_id"] == str(approval_id)
            assert data["status"] == "VERIFIED"
            assert data["proof_hash"].startswith("sha256:")
            assert data["receipt"]["verified"] is True

    finally:
        app.dependency_overrides.pop(get_db, None)
        UserRepository.get_with_preferences = original_get_with_pref
        ApprovalRepository.get_by_id = original_get_by_id
        ApprovalRepository.resolve = original_resolve
        ActivityRepository.append_log = original_append_log

@pytest.mark.asyncio
async def test_api_workflow_rejects_pending_action():
    """Verify HTTP POST /api/v1/workflows/execute/{approval_id} rejects unapproved actions."""
    uid = uuid.uuid4()
    approval_id = uuid.uuid4()
    test_user = User(id=uid, email="workflow2@flow.dev", full_name="Workflow User 2")
    test_user.preference = Preference(user_id=uid)

    pending = Approval(
        id=approval_id,
        user_id=uid,
        action_type=ActionType.SEND_EMAIL,
        target_service="FLOW_EMAIL_OUTBOUND",
        proposed_payload={},
        status=ApprovalState.PENDING,
        idempotency_key="idemp_api_2",
    )
    mock_db = MagicMock()
    mock_res_approval = MagicMock()
    mock_res_approval.scalar_one_or_none.return_value = pending
    mock_res_exec = MagicMock()
    mock_res_exec.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(side_effect=[mock_res_approval, mock_res_exec])

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    valid_token = create_supabase_jwt(user_id=uid, email="workflow2@flow.dev")

    from app.database.repositories.user_repo import UserRepository
    original_get_with_pref = UserRepository.get_with_preferences
    UserRepository.get_with_preferences = AsyncMock(return_value=test_user)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            resp = await ac.post(
                f"/api/v1/workflows/execute/{approval_id}",
                headers={"Authorization": f"Bearer {valid_token}"},
            )
            assert resp.status_code == 400
            assert "Only APPROVED actions may execute" in resp.json()["detail"]

    finally:
        app.dependency_overrides.pop(get_db, None)
        UserRepository.get_with_preferences = original_get_with_pref

