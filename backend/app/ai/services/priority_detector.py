import logging
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from app.ai.providers.litellm_provider import LiteLLMProvider

logger = logging.getLogger("flow.ai.priority")

class PriorityLevel(str, Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class PriorityDetectionResult(BaseModel):
    priority: PriorityLevel = Field(description="Detected priority level: URGENT, HIGH, MEDIUM, or LOW")
    urgency_score: float = Field(ge=0.0, le=1.0, description="Score 0.0 to 1.0 indicating time sensitivity")
    impact_score: float = Field(ge=0.0, le=1.0, description="Score 0.0 to 1.0 indicating operational or personal impact")
    reasoning: str = Field(description="Concise rationale explaining why this priority was determined")
    recommended_action: Optional[str] = Field(None, description="Recommended next step or deadline window")

class PriorityDetector:
    """
    LiteLLM-powered Priority Detection Service.
    Determines priority, urgency score, and impact score using ollama/qwen3:8b
    with strict Pydantic validation and resilient fallback.
    """

    def __init__(self, provider: Optional[LiteLLMProvider] = None):
        self.provider = provider or LiteLLMProvider()

    async def detect_priority(
        self,
        content: str,
        context_type: str = "task",  # "email", "task", "event", "general"
        metadata: Optional[Dict[str, Any]] = None,
    ) -> PriorityDetectionResult:
        """
        Analyzes content and returns a validated PriorityDetectionResult.
        """
        system_prompt = (
            "You are the FLOW Priority Intelligence Engine. Analyze the input content to assess its urgency, "
            "stakeholder impact, and priority level (URGENT, HIGH, MEDIUM, LOW).\n"
            f"Context Type: {context_type}\n"
            "Evaluate factors like imminent deadlines, VIP senders, blocking dependencies, and financial/operational risks.\n"
            "Output ONLY valid JSON matching PriorityDetectionResult."
        )

        user_prompt = f"Content:\n{content.strip()}\n"
        if metadata:
            user_prompt += f"\nMetadata:\n{metadata}"

        try:
            return await self.provider.generate_structured(
                prompt=user_prompt,
                schema_cls=PriorityDetectionResult,
                system_prompt=system_prompt,
            )
        except Exception as e:
            logger.warning(f"Priority detection LLM failed ({e}); using safe heuristic fallback.")
            
            # Heuristic calculation fallback
            content_lower = content.lower()
            if any(w in content_lower for w in ["emergency", "immediately", "asap", "blocker", "critical bug"]):
                return PriorityDetectionResult(
                    priority=PriorityLevel.URGENT,
                    urgency_score=0.95,
                    impact_score=0.90,
                    reasoning="Contains critical urgency signals (asap/emergency/blocker)",
                    recommended_action="Take immediate action within 1 hour",
                )
            elif any(w in content_lower for w in ["urgent", "today", "deadline", "important", "high priority"]):
                return PriorityDetectionResult(
                    priority=PriorityLevel.HIGH,
                    urgency_score=0.80,
                    impact_score=0.75,
                    reasoning="Contains high priority signals or upcoming deadline",
                    recommended_action="Address today during focus block",
                )
            elif any(w in content_lower for w in ["fyi", "low priority", "whenever", "no rush"]):
                return PriorityDetectionResult(
                    priority=PriorityLevel.LOW,
                    urgency_score=0.20,
                    impact_score=0.20,
                    reasoning="Marked as informational or low urgency",
                    recommended_action="Review at leisure or weekly batch",
                )
            else:
                return PriorityDetectionResult(
                    priority=PriorityLevel.MEDIUM,
                    urgency_score=0.50,
                    impact_score=0.50,
                    reasoning="Standard priority item with routine operational requirements",
                    recommended_action="Schedule in standard backlog",
                )
