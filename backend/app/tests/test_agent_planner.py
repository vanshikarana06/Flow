import pytest
from app.agents.planning.planner import PlannerEngine, PlanSchema
from app.agents.reasoning.intent_classifier import IntentResult, AgentIntent
from app.agents.tools.tool_registry import get_tool_registry

def test_planner_generates_email_plan_with_approval():
    planner = PlannerEngine(get_tool_registry())
    intent_res = IntentResult(
        intent=AgentIntent.SEND_EMAIL,
        confidence=0.95,
        extracted_entities={
            "target_recipient": "co-lead",
            "subject_hint": "Sprint Retrospective",
        },
        explanation="Detected SEND_EMAIL intent",
    )
    memory_ctx = {
        "resolved_contact": {
            "name": "Aditya Sharma",
            "email": "aditya@flow.dev",
            "role": "Co Lead",
        },
        "preferences": {"communication_tone": "friendly_formal"},
    }

    plan: PlanSchema = planner.generate_plan(intent_res, memory_ctx)

    assert plan.intent == "SEND_EMAIL"
    assert "Aditya Sharma" in plan.goal
    assert plan.requires_approval is True
    assert "email_tool" in plan.required_tools
    assert len(plan.steps) == 3

    # Check step sequence
    step_actions = [s.action for s in plan.steps]
    assert step_actions == ["resolve_contact", "create_draft", "send_approved_draft"]

    # Step 3 must require human approval
    assert plan.steps[2].requires_approval is True
    assert plan.steps[2].parameters["recipient_to"] == ["aditya@flow.dev"]

def test_planner_generates_read_email_plan_without_approval():
    planner = PlannerEngine(get_tool_registry())
    intent_res = IntentResult(
        intent=AgentIntent.READ_EMAIL,
        confidence=0.95,
        extracted_entities={},
        explanation="Detected READ_EMAIL intent",
    )
    plan = planner.generate_plan(intent_res, {})

    assert plan.intent == "READ_EMAIL"
    assert plan.requires_approval is False
    assert len(plan.steps) == 1
    assert plan.steps[0].action == "read_threads"

def test_planner_generates_calendar_event_plan():
    planner = PlannerEngine(get_tool_registry())
    intent_res = IntentResult(
        intent=AgentIntent.CREATE_EVENT,
        confidence=0.95,
        extracted_entities={"attendee": "Elena", "time_hint": "tomorrow at 10am"},
        explanation="Detected CREATE_EVENT intent",
    )
    memory_ctx = {
        "preferences": {"meeting_buffer_minutes": 20},
    }

    plan = planner.generate_plan(intent_res, memory_ctx)
    assert plan.intent == "CREATE_EVENT"
    assert plan.requires_approval is True
    assert "calendar_tool" in plan.required_tools

    step_actions = [s.action for s in plan.steps]
    assert "detect_conflicts" in step_actions
    assert "create_event" in step_actions

def test_planner_generates_task_deletion_with_approval():
    planner = PlannerEngine(get_tool_registry())
    intent_res = IntentResult(
        intent=AgentIntent.DELETE_TASK,
        confidence=0.95,
        extracted_entities={"task_title": "Old sprint plan"},
        explanation="Detected DELETE_TASK intent",
    )
    plan = planner.generate_plan(intent_res, {})
    assert plan.intent == "DELETE_TASK"
    assert plan.requires_approval is True
    assert plan.steps[0].tool == "task_tool"
    assert plan.steps[0].action == "delete_task"

