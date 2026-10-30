from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.ai.providers.litellm_provider import LiteLLMProvider

class TaskExtractionResult(BaseModel):
    task: str = Field(description="Actionable task title or description")
    deadline: Optional[str] = Field(None, description="Extracted ISO deadline or natural date/time if present")
    priority: str = Field(default="MEDIUM", description="URGENT, HIGH, MEDIUM, or LOW")

class TaskExtractor:
    def __init__(self, provider: Optional[LiteLLMProvider] = None):
        self.provider = provider or LiteLLMProvider()

    async def extract_task(self, text: str) -> TaskExtractionResult:
        """
        Extracts actionable tasks, deadlines, and priorities from raw text or emails.
        """
        system_prompt = (
            "You are FLOW Task Extraction Engine. Analyze the input text to extract an actionable "
            "task title, any specified deadline, and assign an appropriate priority (URGENT, HIGH, MEDIUM, LOW)."
        )

        try:
            return await self.provider.generate_structured(
                prompt=text,
                schema_cls=TaskExtractionResult,
                system_prompt=system_prompt,
            )
        except Exception:
            # Resilient heuristic fallback
            priority = "MEDIUM"
            text_lower = text.lower()
            if any(w in text_lower for w in ["urgent", "asap", "immediately"]):
                priority = "URGENT"
            elif any(w in text_lower for w in ["important", "critical", "high priority"]):
                priority = "HIGH"

            return TaskExtractionResult(
                task=text.strip()[:100],
                deadline=None,
                priority=priority,
            )
