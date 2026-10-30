import pytest
from unittest.mock import AsyncMock
from app.agents.planning.planner import PlannerEngine, PlanSchema, PlanStep
from app.agents.reasoning.intent_classifier import IntentResult, AgentIntent
from app.agents.tools.tool_registry import ToolRegistry
from app.agents.tools.email_tool import EmailTool
from app.agents.tools.calendar_tool import CalendarTool
from app.agents.tools.task_tool import TaskTool
from app.agents.tools.memory_tool import MemoryTool
from app.ai.providers.litellm_provider import LiteLLMProvider

@pytest.fixture
def registry():
    reg = ToolRegistry()
    reg.register(EmailTool())
    reg.register(CalendarTool())
    reg.register(TaskTool())
    reg.register(MemoryTool())
    return reg

@pytest.mark.asyncio
async def test_llm_planner_email_flow_with_memory_context(registry):
    provider = LiteLLMProvider()

    llm_plan = PlanSchema(
        goal="Draft and send launch status email to Aditya",
        intent="SEND_EMAIL",
        steps=[
            PlanStep(
                step_id="step-1",
                tool="memory_tool",
                action="resolve_contact",
                parameters={"query": "Aditya"},
                requires_approval=False,
                description="Resolve Aditya contact details",
            ),
            PlanStep(
                step_id="step-2",
                tool="email_tool",
                action="create_draft",
                parameters={"recipient_to": ["aditya@flow.dev"], "subject": "Launch Status"},
                requires_approval=False,
                description="Stage email draft",
            ),
            PlanStep(
                step_id="step-3",
                tool="email_tool",
                action="send_approved_draft",
                parameters={"recipient_to": ["aditya@flow.dev"], "subject": "Launch Status"},
                requires_approval=True,
                description="Dispatch email via gateway",
            ),
        ],
        required_tools=["memory_tool", "email_tool"],
        requires_approval=True,
    )
    provider.generate_structured = AsyncMock(return_value=llm_plan)

    planner = PlannerEngine(registry=registry, provider=provider)
    intent_res = IntentResult(
        intent=AgentIntent.SEND_EMAIL,
        confidence=0.98,
        explanation="Send email to co-lead",
        extracted_entities={"target_recipient": "Aditya", "subject_hint": "launch status"},
    )
    memory_context = {
        "resolved_contact": {
            "name": "Aditya",
            "email": "aditya@flow.dev",
            "relationship": "co-lead",
        },
        "preferences": {"communication_tone": "friendly_formal"},
    }

    plan = await planner.generate_plan_llm(
        prompt="Email my co-lead about launch status",
        intent_res=intent_res,
        memory_context=memory_context,
    )

    assert plan.intent == "SEND_EMAIL"
    assert len(plan.steps) == 3
    assert plan.requires_approval is True
    assert "email_tool" in plan.required_tools
    assert plan.context_used["resolved_contact"]["name"] == "Aditya"
    # Invariant enforcement check: send_approved_draft MUST require approval
    assert any(s.action == "send_approved_draft" and s.requires_approval for s in plan.steps)

@pytest.mark.asyncio
async def test_llm_planner_fallback_on_unreachable(registry):
    provider = LiteLLMProvider()
    provider.generate_structured = AsyncMock(side_effect=RuntimeError("LiteLLM Proxy Unreachable"))

    planner = PlannerEngine(registry=registry, provider=provider)
    intent_res = IntentResult(
        intent=AgentIntent.CREATE_TASK,
        confidence=0.95,
        explanation="Create task",
        extracted_entities={"task_title": "Update Documentation"},
    )

    # Should fallback gracefully to deterministic planner
    plan = await planner.generate_plan_llm(
        prompt="Add task Update Documentation",
        intent_res=intent_res,
        memory_context={},
    )

    assert plan.intent == "CREATE_TASK"
    assert len(plan.steps) == 1
    assert plan.steps[0].tool == "task_tool"
    assert plan.steps[0].action == "create_task"

