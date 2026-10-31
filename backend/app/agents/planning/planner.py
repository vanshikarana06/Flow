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
            recipient_email = entities.get("recipient_email")
            if not recipient_email and entities.get("target_recipient") and "@" in str(entities.get("target_recipient", "")):
                recipient_email = entities["target_recipient"]

            if recipient_email:
                recipient_name = entities.get("attendee") or recipient_email.split("@")[0].capitalize()
            elif resolved_contact:
                recipient_email = resolved_contact.get("email")
                recipient_name = resolved_contact.get("name")
            else:
                recipient_name = entities.get("target_recipient", "Contact")
                recipient_email = f"{recipient_name.lower().replace(' ', '')}@flow.dev"

            topic = entities.get("topic")
            subject = entities.get("subject_hint") or (f"Meeting: {topic.capitalize()}" if topic else "Update from FLOW")
            
            if topic:
                body = f"Hi {recipient_name},\n\nI am reaching out regarding {topic}.\n\nPlease let me know if this works for you.\n\nBest regards,\nFLOW"
            else:
                body = f"Hi {recipient_name},\n\nHope this message finds you well.\n\nBest regards,\nFLOW"

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
                            "body": body,
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
                        parameters={"recipient_to": [recipient_email], "subject": subject, "body": body},
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
            recip_email = entities.get("recipient_email") or entities.get("target_recipient")
            if not recip_email or "@" not in str(recip_email):
                recip_email = resolved_contact.get("email") if resolved_contact else None

            attendee = resolved_contact.get("name") if resolved_contact else entities.get("attendee")
            if not attendee:
                if recip_email and "@" in recip_email:
                    attendee = recip_email.split("@")[0].capitalize()
                else:
                    attendee = "Team"
            
            if not recip_email:
                recip_email = f"{attendee.lower().replace(' ', '')}@flow.dev"

            time_hint = entities.get("time_hint") or "tomorrow morning"
            topic = entities.get("topic")
            
            event_title = f"Meeting: {topic.capitalize()}" if topic else f"Meeting with {attendee}"
            meet_subject = entities.get("subject_hint") or f"Meeting Invitation: {topic.capitalize() if topic else 'Sync'} ({time_hint})"
            meet_body = (
                f"Hi {attendee},\n\nI've scheduled a meeting on our calendar for {time_hint}"
                + (f" regarding {topic}" if topic else "")
                + f".\n\nPlease let me know if this slot works well for you.\n\nBest regards,\nFLOW"
            )
            prep_title = f"Prepare agenda and notes for {topic}" if topic else f"Prepare agenda and notes for {attendee} meeting"

            goal_text = f"Coordinate {time_hint} meeting with {attendee} ({recip_email}): staged calendar event, workspace prep task, and invitation draft"
            
            # 1. Calendar Conflict Detection
            if self.registry.has_tool("calendar_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-1",
                        tool="calendar_tool",
                        action="detect_conflicts",
                        parameters={"time_hint": time_hint, "attendee": attendee},
                        requires_approval=False,
                        description=f"Verify calendar availability and buffer minutes ({preferences.get('meeting_buffer_minutes', 15)}m)",
                    )
                )
                steps.append(
                    PlanStep(
                        step_id="step-2",
                        tool="calendar_tool",
                        action="create_event",
                        parameters={"title": event_title, "time_hint": time_hint, "attendee": attendee, "recipient_email": recip_email},
                        requires_approval=True,
                        description=f"Stage calendar event: '{event_title}' ({time_hint})",
                    )
                )

            # 2. Workspace Prep Task
            if self.registry.has_tool("task_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-3",
                        tool="task_tool",
                        action="create_task",
                        parameters={
                            "title": prep_title,
                            "priority": "MEDIUM",
                            "time_hint": time_hint,
                        },
                        requires_approval=False,
                        description=f"Create preparation task in workspace: '{prep_title}'",
                    )
                )

            # 3. Notification Draft & Outbound Approval
            if self.registry.has_tool("email_tool"):
                steps.append(
                    PlanStep(
                        step_id="step-4",
                        tool="email_tool",
                        action="create_draft",
                        parameters={
                            "recipient_to": [recip_email],
                            "subject": meet_subject,
                            "body": meet_body,
                        },
                        requires_approval=False,
                        description=f"Stage notification draft to {attendee} ({recip_email})",
                    )
                )
                steps.append(
                    PlanStep(
                        step_id="step-5",
                        tool="email_tool",
                        action="send_approved_draft",
                        parameters={"recipient_to": [recip_email], "subject": meet_subject, "body": meet_body},
                        requires_approval=True,
                        description=f"Submit email invitation to Trust Approval Center before dispatch",
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
            "5. If an email address is provided in Extracted Entities (recipient_email or target_recipient), use that address in the parameters (recipient_to=[address]).\n"
            "NEVER return an error JSON object. You MUST ALWAYS generate a valid PlanSchema containing populated goal, intent, and steps."
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
