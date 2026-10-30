from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.ai.providers.litellm_provider import LiteLLMProvider

class EmailSummaryResult(BaseModel):
    summary: str = Field(description="Short, executive summary of the email thread")
    action_items: List[str] = Field(default_factory=list, description="Extracted actionable items")
    priority: str = Field(default="MEDIUM", description="URGENT, HIGH, MEDIUM, or LOW")

class EmailSummarizer:
    def __init__(self, provider: Optional[LiteLLMProvider] = None):
        self.provider = provider or LiteLLMProvider()

    async def summarize_thread(
        self,
        subject: str,
        messages: List[Dict[str, str]],
    ) -> EmailSummaryResult:
        """
        Summarizes an email thread and extracts action items and priority.
        """
        thread_text = f"Subject: {subject}\n\n"
        for idx, msg in enumerate(messages, 1):
            sender = msg.get("sender", "Unknown")
            body = msg.get("body", "").strip()
            thread_text += f"--- Message {idx} from {sender} ---\n{body}\n\n"

        system_prompt = (
            "You are the FLOW Email Intelligence Assistant. Analyze the provided email conversation "
            "and output a structured summary, a list of concrete action items, and an overall priority "
            "(URGENT, HIGH, MEDIUM, LOW)."
        )

        try:
            return await self.provider.generate_structured(
                prompt=thread_text,
                schema_cls=EmailSummaryResult,
                system_prompt=system_prompt,
            )
        except Exception:
            # Resilient heuristic fallback
            is_urgent = any(kw in thread_text.lower() for kw in ["urgent", "asap", "deadline", "today", "emergency"])
            return EmailSummaryResult(
                summary=f"Discussion regarding '{subject}' with {len(messages)} message(s).",
                action_items=[f"Review email conversation regarding {subject}."],
                priority="HIGH" if is_urgent else "MEDIUM",
            )
