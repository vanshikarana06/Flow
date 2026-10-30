from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.ai.providers.litellm_provider import LiteLLMProvider

class MemoryExtractionResult(BaseModel):
    category: str = Field(description="RELATIONSHIP, PREFERENCE, FACT, or GOAL")
    content: str = Field(description="Normalized memory proposition or statement")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Identified entities, roles, and relationships")
    importance_score: float = Field(default=0.8, ge=0.0, le=1.0)

class MemoryExtractor:
    def __init__(self, provider: Optional[LiteLLMProvider] = None):
        self.provider = provider or LiteLLMProvider()

    async def extract_memory(self, text: str) -> MemoryExtractionResult:
        """
        Extracts structured memory records (e.g. relationships, preferences, contact facts) from text.
        """
        system_prompt = (
            "You are FLOW Personal Memory Extraction Engine. Extract structured personal context from user input. "
            "Determine the category (RELATIONSHIP, PREFERENCE, FACT, GOAL), normalize the content, extract "
            "relevant entities (name, role, relation), and assign an importance score between 0.0 and 1.0."
        )

        try:
            return await self.provider.generate_structured(
                prompt=text,
                schema_cls=MemoryExtractionResult,
                system_prompt=system_prompt,
            )
        except Exception:
            # Resilient heuristic fallback
            category = "RELATIONSHIP" if any(w in text.lower() for w in ["co-lead", "boss", "friend", "colleague", "wife", "husband"]) else "PREFERENCE"
            return MemoryExtractionResult(
                category=category,
                content=text.strip(),
                entities={"raw": text.strip()},
                importance_score=0.85,
            )

