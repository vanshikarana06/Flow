import re
import json
import logging
from typing import Dict, Any, Optional, List
from enum import Enum
from pydantic import BaseModel, Field
from app.ai.providers.litellm_provider import LiteLLMProvider

logger = logging.getLogger("flow.agents.intent")

class AgentIntent(str, Enum):
    SEND_EMAIL = "SEND_EMAIL"
    READ_EMAIL = "READ_EMAIL"
    CREATE_TASK = "CREATE_TASK"
    UPDATE_TASK = "UPDATE_TASK"
    DELETE_TASK = "DELETE_TASK"
    CREATE_EVENT = "CREATE_EVENT"
    RESCHEDULE_EVENT = "RESCHEDULE_EVENT"
    CHECK_CONFLICTS = "CHECK_CONFLICTS"
    SAVE_MEMORY = "SAVE_MEMORY"
    RECALL_MEMORY = "RECALL_MEMORY"
    GENERAL_ASSISTANCE = "GENERAL_ASSISTANCE"

class IntentResult(BaseModel):
    intent: AgentIntent
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    extracted_entities: Dict[str, Any] = Field(default_factory=dict)
    explanation: str

class IntentClassifier:
    """
    LiteLLM-powered Agent Intent Classifier with resilient heuristic fallback.
    Supported Intents:
    - SEND_EMAIL, READ_EMAIL
    - CREATE_TASK, UPDATE_TASK, DELETE_TASK
    - CREATE_EVENT, RESCHEDULE_EVENT, CHECK_CONFLICTS
    - SAVE_MEMORY, RECALL_MEMORY
    - GENERAL_ASSISTANCE
    """

    PATTERNS = [
        # Explicit Memory commands first to prevent sentence keywords hijacking
        (
            AgentIntent.SAVE_MEMORY,
            r"^\s*(?:please\s+)?(remember|save|note that|keep in mind|memorize)\b",
        ),
        (
            AgentIntent.RECALL_MEMORY,
            r"\b(what did|who is|do you recall|what is the preference|tell me about|what do you know about)\b.*\b(preference|contact|person|notes?)\b",
        ),

        # Calendar Scheduling
        (
            AgentIntent.CHECK_CONFLICTS,
            r"\b(check|detect|find|any)\b.*\b(conflicts?|overlaps?|busy|free time|availability)\b",
        ),
        (
            AgentIntent.RESCHEDULE_EVENT,
            r"\b(reschedule|move|postpone|delay|shift|change time)\b.*\b(meeting|event|call|sync)?\b",
        ),
        (
            AgentIntent.CREATE_EVENT,
            r"\b(schedule|book|set up|plan)\b.*\b(meeting|event|call|appointment|sync|calendar)\b",
        ),

        # Tasks
        (
            AgentIntent.DELETE_TASK,
            r"\b(delete|remove|cancel|discard|drop)\b.*\b(task|todo|to-do|item)\b",
        ),
        (
            AgentIntent.UPDATE_TASK,
            r"\b(update|complete|finish|check off|edit)\b.*\b(task|todo|to-do)\b|\bmark\b.*\b(task|todo|to-do)\b.*\b(done|complete|finished)\b",
        ),
        (
            AgentIntent.CREATE_TASK,
            r"\b(create|add|new|remind me to|make a)\b.*\b(task|todo|to-do|action item)\b",
        ),

        # Email
        (
            AgentIntent.READ_EMAIL,
            r"\b(check|read|get|fetch|list|show)\b.*\b(emails?|inbox|messages?|threads?)\b",
        ),
        (
            AgentIntent.SEND_EMAIL,
            r"^\s*email\s+([a-zA-Z0-9_\s-]+)|\b(send|write|draft|shoot|compose)\b(?:\s+an?)?\s+(?:email|mail|message)\b",
        ),
    ]

    def __init__(self, provider: Optional[LiteLLMProvider] = None):
        self.provider = provider or LiteLLMProvider()

    @classmethod
    def classify_heuristics(cls, prompt: str) -> IntentResult:
        normalized = prompt.strip()
        lower_prompt = normalized.lower()

        for intent, pattern in cls.PATTERNS:
            match = re.search(pattern, lower_prompt, re.IGNORECASE)
            if match:
                entities = cls._extract_entities(intent, normalized)
                return IntentResult(
                    intent=intent,
                    confidence=0.95,
                    extracted_entities=entities,
                    explanation=f"Matched heuristic pattern for '{intent.value}' with confidence 0.95",
                )

        return IntentResult(
            intent=AgentIntent.GENERAL_ASSISTANCE,
            confidence=0.70,
            extracted_entities={"raw_prompt": normalized},
            explanation="No deterministic domain pattern matched; routed to GENERAL_ASSISTANCE",
        )

    async def classify_llm(self, prompt: str) -> IntentResult:
        """
        Classifies user intent using LiteLLM and returns structured JSON output.
        """
        intents_list = [i.value for i in AgentIntent]
        system_prompt = (
            f"You are the FLOW OS Intent Classification Engine. Classify the user prompt into exactly ONE of "
            f"these valid intents: {json.dumps(intents_list)}.\n"
            f"Extract all semantic entities (e.g. target_recipient, subject_hint, task_title, attendee, time_hint, memory_content).\n"
            f"Return a structured JSON object strictly matching the schema."
        )

        try:
            return await self.provider.generate_structured(
                prompt=f"User Prompt: '{prompt}'",
                schema_cls=IntentResult,
                system_prompt=system_prompt,
            )
        except Exception as e:
            logger.warning(f"LiteLLM intent classification fallback due to: {e}")
            return self.classify_heuristics(prompt)

    @classmethod
    def classify(cls, prompt: str) -> IntentResult:
        """
        Synchronous classification interface with heuristics fallback.
        """
        return cls.classify_heuristics(prompt)

    @classmethod
    def _extract_entities(cls, intent: AgentIntent, prompt: str) -> Dict[str, Any]:
        entities: Dict[str, Any] = {"raw_prompt": prompt}

        if intent == AgentIntent.SEND_EMAIL:
            recip_match = re.search(
                r"(?:(?:to|email|mail)\s+)((?:my\s+)?[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+|my\s+[a-zA-Z-]+|[a-zA-Z-]+(?:\s+[a-zA-Z-]+)?)(?:\s+(?:regarding|about|saying|\.|$)|$)",
                prompt,
                re.IGNORECASE,
            )
            if recip_match:
                entities["target_recipient"] = recip_match.group(1).strip()

            subj_match = re.search(r"\b(?:about|regarding|subject|saying)\s+(.*)$", prompt, re.IGNORECASE)
            if subj_match:
                entities["subject_hint"] = subj_match.group(1).strip()

        elif intent in (AgentIntent.CREATE_EVENT, AgentIntent.RESCHEDULE_EVENT):
            time_match = re.search(r"\b(?:at|for|on|tomorrow|next\s+\w+|today|\d{1,2}(?::\d{2})?\s*(?:am|pm))\b.*", prompt, re.IGNORECASE)
            if time_match:
                entities["time_hint"] = time_match.group(0).strip()
            with_match = re.search(r"\bwith\s+([a-zA-Z\s]+?)(?:\s+(?:at|for|on|tomorrow)|\.|$)", prompt, re.IGNORECASE)
            if with_match:
                entities["attendee"] = with_match.group(1).strip()

        elif intent in (AgentIntent.CREATE_TASK, AgentIntent.DELETE_TASK, AgentIntent.UPDATE_TASK):
            task_match = re.search(r"\b(?:task|todo|to-do|to)\s+(.*)$", prompt, re.IGNORECASE)
            if task_match:
                entities["task_title"] = task_match.group(1).strip()

        elif intent == AgentIntent.SAVE_MEMORY:
            rem_match = re.search(r"\b(?:remember|save|note that|keep in mind)\s+(?:that\s+)?(.*)$", prompt, re.IGNORECASE)
            if rem_match:
                entities["memory_content"] = rem_match.group(1).strip()

        return entities
