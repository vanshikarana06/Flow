import json
import logging
import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.agents.reasoning.intent_classifier import IntentResult, AgentIntent
from app.agents.tools.tool_registry import ToolRegistry, get_tool_registry
from app.ai.providers.litellm_provider import LiteLLMProvider

logger = logging.getLogger("flow.agents.planner")

class PlanStep(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    step_id: str
    tool: str
    action: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    requires_approval: bool = False
    description: str

class PlanSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    goal: str
    intent: str
    steps: List[PlanStep]
    required_tools: List[str]
    requires_approval: bool
    context_used: Dict[str, Any] = Field(default_factory=dict)

class PlannerEngine:
    """
    LLM-powered Agent Planner utilizing LiteLLM with deterministic fallback.
    Assembles execution steps, verifies tool availability, and enforces Trust Domain
    approval invariants.
    """

    def __init__(
        self,
        registry: Optional[ToolRegistry] = None,
        provider: Optional[LiteLLMProvider] = None,
    ):
        self.registry = registry or get_tool_registry()
        self.provider = provider or LiteLLMProvider()

    def generate_plan(
        self,
        intent_res: IntentResult,
        memory_context: Dict[str, Any],
    ) -> PlanSchema:
        """
        Deterministic planning rules (also acts as fallback for LLM planner).
        """
        intent = intent_res.intent
        entities = intent_res.extracted_entities
        resolved_contact = memory_context.get("resolved_contact")
        preferences = memory_context.get("preferences", {})

        steps: List[PlanStep] = []
        goal_text: str = ""

        if intent == AgentIntent.SEND_EMAIL:
            recipient_email = None
            recipient_name = None
            if resolved_contact:
                recipient_email = resolved_contact.get("email")
                recipient_name = resolved_contact.get("name")
            elif entities.get("target_recipient") and "@" in entities.get("target_recipient", ""):
                recipient_email = entities["target_recipient"]
                recipient_name = recipient_email.split("@")[0].capitalize()
            else:
                recipient_name = entities.get("target_recipient", "Contact")
                recipient_email = f"{recipient_name.lower().replace(' ', '')}@flow.dev"

            subject = entities.get("subject_hint") or "Update from FLOW"
            goal_text = f"Draft and dispatch approved email to {recipient_name} ({recipient_email})"

            # Step 1: Memory resolution (if contact needed resolving)
            if self.registry.has_tool("memory_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="memory_tool",
                        action="resolve_contact",
                        parameters={"query": entities.get("target_recipient", recipient_name)},
                        requires_approval=False,
                        description=f"Resolve contact information and communication preferences for {recipient_name}",
                    )
                )

            # Step 2: Compose Draft
            if self.registry.has_tool("email_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-2",
                        tool="email_tool",
                        action="create_draft",
                        parameters={
                            "recipient_to": [recipient_email],
                            "subject": subject,
                            "body": f"Hi {recipient_name},\n\nHope this message finds you well.\n\nBest regards,\nFLOW",
                        },
                        requires_approval=False,
                        description=f"Stage new email draft to {recipient_email}",
                    )
                )

            # Step 3: Send Approved Draft (Human in the Loop Gate)
            if self.registry.has_tool("email_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-3",
                        tool="email_tool",
                        action="send_approved_draft",
                        parameters={"recipient_to": [recipient_email], "subject": subject},
                        requires_approval=True,
                        description=f"Submit email to Trust Approval Center before Google Apps Script dispatch",
                    )
                )

        elif intent == AgentIntent.READ_EMAIL:
            goal_text = "Retrieve and summarize unread email threads"
            if self.registry.has_tool("email_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="email_tool",
                        action="read_threads",
                        parameters={"limit": 10},
                        requires_approval=False,
                        description="Fetch recent email conversation threads from Inbox",
                    )
                )

        elif intent == AgentIntent.CREATE_TASK:
            title = entities.get("task_title", "New Task")
            goal_text = f"Create new task: '{title}'"
            if self.registry.has_tool("task_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="task_tool",
                        action="create_task",
                        parameters={"title": title, "priority": "MEDIUM"},
                        requires_approval=False,
                        description=f"Persist new task '{title}' in Task Repository",
                    )
                )

        elif intent == AgentIntent.DELETE_TASK:
            title = entities.get("task_title", "Task")
            goal_text = f"Delete task '{title}'"
            if self.registry.has_tool("task_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="task_tool",
                        action="delete_task",
                        parameters={"task_id": entities.get("task_id", str(uuid.uuid4()))},
                        requires_approval=True,
                        description=f"Request human approval before permanent deletion of task",
                    )
                )

        elif intent == AgentIntent.CREATE_EVENT:
            attendee = resolved_contact.get("name") if resolved_contact else entities.get("attendee", "Participant")
            goal_text = f"Schedule meeting with {attendee}"
            if self.registry.has_tool("calendar_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="calendar_tool",
                        action="detect_conflicts",
                        parameters={"time_hint": entities.get("time_hint")},
                        requires_approval=False,
                        description=f"Check calendar availability according to buffer minutes ({preferences.get('meeting_buffer_minutes', 15)}m)",
                    )
                )
                steps.append(
                    PlanStep(
                        step_id="step-2",
                        tool="calendar_tool",
                        action="create_event",
                        parameters={"title": f"Meeting with {attendee}", "time_hint": entities.get("time_hint")},
                        requires_approval=True,
                        description="Request human approval before creating calendar event",
                    )
                )

        elif intent == AgentIntent.CHECK_CONFLICTS:
            goal_text = "Analyze schedule conflicts and available focus blocks"
            if self.registry.has_tool("calendar_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="calendar_tool",
                        action="detect_conflicts",
                        parameters={},
                        requires_approval=False,
                        description="Detect scheduling overlaps and buffer violations in calendar",
                    )
                )

        elif intent == AgentIntent.SAVE_MEMORY:
            content = entities.get("memory_content", entities.get("raw_prompt"))
            goal_text = f"Store knowledge memory: '{content[:50]}...'"
            if self.registry.has_tool("memory_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="memory_tool",
                        action="create_memory",
                        parameters={"content": content, "category": "PREFERENCE"},
                        requires_approval=False,
                        description="Index memory into pgvector semantic storage",
                    )
                )

        else:  # GENERAL_ASSISTANCE or default
            goal_text = "Provide synthesized response using contextual memory"
            if self.registry.has_tool("memory_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="memory_tool",
                        action="query_memories",
                        parameters={"query": entities.get("raw_prompt", "")},
                        requires_approval=False,
                        description="Retrieve relevant user preferences and past activity",
                    )
                )

        required_tools = list({s.tool for s in steps})
        requires_approval = any(s.requires_approval for s in steps)

        return PlanSchema(
            goal=goal_text,
            intent=intent.value,
            steps=steps,
            required_tools=required_tools,
            requires_approval=requires_approval,
            context_used={
                "resolved_contact": resolved_contact,
                "preferences_applied": bool(preferences),
            },
        )

    async def generate_plan_llm(
        self,
        prompt: str,
        intent_res: IntentResult,
        memory_context: Dict[str, Any],
    ) -> PlanSchema:
        """
        Generates an intelligent execution plan using LiteLLM.
        Enforces Trust-First security invariants on sensitive actions.
        """
        available_tools = [
            {"name": t.name, "description": t.description}
            for t in self.registry.list_tools()
        ]

        system_prompt = (
            "You are the FLOW Agentic AI Planner. Convert the user request and intent into a series of "
            "ordered plan steps (PlanStep[]) using ONLY the available tools.\n"
            f"Available Tools: {json.dumps(available_tools)}\n\n"
            "SECURITY INVARIANTS:\n"
            "1. Outbound email dispatch ('send_approved_draft') MUST have requires_approval=True.\n"
            "2. Calendar event creation ('create_event') or rescheduling MUST have requires_approval=True.\n"
            "3. Task deletion ('delete_task') MUST have requires_approval=True.\n"
            "4. Read-only operations ('read_threads', 'query_memories', 'detect_conflicts') MUST have requires_approval=False.\n"
            "Output strictly valid JSON matching PlanSchema."
        )

        user_content = (
            f"User Prompt: '{prompt}'\n"
            f"Classified Intent: {intent_res.intent.value}\n"
            f"Extracted Entities: {json.dumps(intent_res.extracted_entities)}\n"
            f"Memory Context: {json.dumps(memory_context)}"
        )

        try:
            plan = await self.provider.generate_structured(
                prompt=user_content,
                schema_cls=PlanSchema,
                system_prompt=system_prompt,
            )

            # Enforce security invariants on all generated steps
            for step in plan.steps:
                if step.action in ("send_approved_draft", "create_event", "reschedule_event", "delete_task"):
                    step.requires_approval = True

            # Recalculate derived fields
            plan.required_tools = list({s.tool for s in plan.steps})
            plan.requires_approval = any(s.requires_approval for s in plan.steps)
            plan.context_used = {
                "resolved_contact": memory_context.get("resolved_contact"),
                "preferences_applied": bool(memory_context.get("preferences")),
            }
            return plan

        except Exception as e:
            logger.warning(f"LiteLLM planning failed ({e}); falling back to deterministic planner.")
            return self.generate_plan(intent_res, memory_context)
