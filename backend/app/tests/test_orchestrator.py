import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import AsyncClient, ASGITransport

from app.agents.orchestrator.orchestrator import AgentOrchestrator
from app.database.models.plan import AgentPlan
from app.database.models.user import User
from app.database.models.preference import Preference
from app.database.models.contact import Contact
from app.database.session import get_db
from app.core.security import create_supabase_jwt
from app.main import app

@pytest.mark.asyncio
async def test_orchestrator_dispatch_flow_without_execution():
    """
    Verify complete Orchestrator lifecycle:
    Prompt -> Intent -> Memory Context -> Planner -> AgentPlan Persisted -> No Actions Executed.
    """
    user_id = uuid.uuid4()
    plan_id = uuid.uuid4()

    mock_db = MagicMock()
    mock_res = MagicMock()
    mock_res.scalars.return_value.first.return_value = None
    mock_res.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=mock_res)

    orchestrator = AgentOrchestrator(mock_db)

    # 1. Mock memory context
    orchestrator.memory_engine.retrieve_context = AsyncMock(
        return_value={
            "resolved_contact": {"name": "Aditya", "email": "aditya@flow.dev", "role": "Co Lead"},
            "preferences": {"meeting_buffer_minutes": 15},
            "contacts": [],
            "relevant_memories": [],
        }
    )

    # 2. Mock AgentPlan persistence
    created_db_plan = AgentPlan(
        id=plan_id,
        user_id=user_id,
        intent="SEND_EMAIL",
        plan_json={"steps": []},
        status="PENDING_APPROVAL",
    )
    orchestrator.plan_repo.create_plan = AsyncMock(return_value=created_db_plan)
    orchestrator.activity_repo.append_log = AsyncMock()

    # 3. Dispatch prompt
    prompt = "Email my co-lead about the hackathon architecture submission"
    result = await orchestrator.dispatch(prompt=prompt, user_id=user_id)

    # Assertions
    assert result.plan_id == str(plan_id)
    assert result.status == "PENDING_APPROVAL"
    assert result.intent == "SEND_EMAIL"
    assert result.requires_approval is True
    assert "email_tool" in result.required_tools
    assert len(result.steps) >= 2

    # Verify AgentPlan was persisted
    orchestrator.plan_repo.create_plan.assert_awaited_once()
    plan_call = orchestrator.plan_repo.create_plan.call_args
    assert plan_call.kwargs["user_id"] == user_id
    assert plan_call.kwargs["intent"] == "SEND_EMAIL"
    assert plan_call.kwargs["status"] == "PENDING_APPROVAL"

    # Verify Activity Ledger logged
    orchestrator.activity_repo.append_log.assert_awaited_once()
    act_call = orchestrator.activity_repo.append_log.call_args.kwargs
    assert act_call["action_type"] == "PLAN_GENERATED"
    assert act_call["entity_id"] == plan_id

@pytest.mark.asyncio
async def test_agent_api_endpoints():
    """Verify HTTP API access to /agents/dispatch, /agents/plans/{id}, and /agents/tools."""
    uid = uuid.uuid4()
    test_user = User(id=uid, email="agenttester@flow.dev", full_name="Agent Tester")
    test_user.preference = Preference(user_id=uid)

    mock_db = MagicMock()
    mock_res = MagicMock()
    mock_res.scalars.return_value.first.return_value = None
    mock_res.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=mock_res)

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    valid_token = create_supabase_jwt(user_id=uid, email="agenttester@flow.dev")

    # Mocks
    from app.database.repositories.user_repo import UserRepository
    original_get_with_pref = UserRepository.get_with_preferences
    UserRepository.get_with_preferences = AsyncMock(return_value=test_user)

    from app.database.repositories.agent_plan_repo import AgentPlanRepository
    original_create_plan = AgentPlanRepository.create_plan
    original_get_plan = AgentPlanRepository.get_plan

    sample_plan_id = uuid.uuid4()
    stored_plan = AgentPlan(
        id=sample_plan_id,
        user_id=uid,
        intent="CREATE_TASK",
        plan_json={"goal": "Create task review PR", "steps": []},
        status="DRAFT",
    )
    AgentPlanRepository.create_plan = AsyncMock(return_value=stored_plan)
    AgentPlanRepository.get_plan = AsyncMock(return_value=stored_plan)

    from app.database.repositories.activity_repo import ActivityRepository
    original_append_log = ActivityRepository.append_log
    ActivityRepository.append_log = AsyncMock()

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. GET /api/v1/agents/tools (Public / Authenticated tool discovery)
            resp_tools = await ac.get("/api/v1/agents/tools")
            assert resp_tools.status_code == 200
            tools_data = resp_tools.json()["data"]
            assert len(tools_data) >= 5
            tool_names = [t["name"] for t in tools_data]
            assert "email_tool" in tool_names
            assert "calendar_tool" in tool_names

            # 2. POST /api/v1/agents/dispatch
            resp_dispatch = await ac.post(
                "/api/v1/agents/dispatch",
                headers={"Authorization": f"Bearer {valid_token}"},
                json={"prompt": "Add a task to check email"},
            )
            assert resp_dispatch.status_code == 200
            disp_data = resp_dispatch.json()["data"]
            assert disp_data["plan_id"] == str(sample_plan_id)
            assert disp_data["status"] == "DRAFT"

            # 3. GET /api/v1/agents/plans/{plan_id}
            resp_plan = await ac.get(
                f"/api/v1/agents/plans/{sample_plan_id}",
                headers={"Authorization": f"Bearer {valid_token}"},
            )
            assert resp_plan.status_code == 200
            plan_data = resp_plan.json()["data"]
            assert plan_data["id"] == str(sample_plan_id)
            assert plan_data["intent"] == "CREATE_TASK"

    finally:
        app.dependency_overrides.pop(get_db, None)
        UserRepository.get_with_preferences = original_get_with_pref
        AgentPlanRepository.create_plan = original_create_plan
        AgentPlanRepository.get_plan = original_get_plan
        ActivityRepository.append_log = original_append_log
