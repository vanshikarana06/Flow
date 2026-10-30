import pytest
from unittest.mock import AsyncMock
from app.ai.services.task_extractor import TaskExtractor, TaskExtractionResult
from app.ai.services.memory_extractor import MemoryExtractor, MemoryExtractionResult
from app.ai.providers.litellm_provider import LiteLLMProvider
from app.ai.providers.embedding_provider import EmbeddingProvider

@pytest.mark.asyncio
async def test_task_extraction_structured():
    provider = LiteLLMProvider()
    expected = TaskExtractionResult(
        task="Submit revised budget proposal",
        deadline="2026-11-05T17:00:00Z",
        priority="HIGH",
    )
    provider.generate_structured = AsyncMock(return_value=expected)

    extractor = TaskExtractor(provider=provider)
    email_body = "Please make sure to submit the revised budget proposal by November 5th at 5 PM. It is critical."
    result = await extractor.extract_task(email_body)

    assert result.task == "Submit revised budget proposal"
    assert result.deadline == "2026-11-05T17:00:00Z"
    assert result.priority == "HIGH"

@pytest.mark.asyncio
async def test_memory_extraction_relationship():
    provider = LiteLLMProvider()
    expected = MemoryExtractionResult(
        category="RELATIONSHIP",
        content="Aditya is the user's co-lead.",
        entities={"name": "Aditya", "role": "co-lead"},
        importance_score=0.9,
    )
    provider.generate_structured = AsyncMock(return_value=expected)

    extractor = MemoryExtractor(provider=provider)
    result = await extractor.extract_memory("Aditya is my co-lead")

    assert result.category == "RELATIONSHIP"
    assert result.entities.get("name") == "Aditya"
    assert result.entities.get("role") == "co-lead"
    assert result.importance_score == 0.9

@pytest.mark.asyncio
async def test_embedding_provider_dimension_normalization():
    embedder = EmbeddingProvider()
    # Test normalization of arbitrary vector to 1536
    raw_vector_768 = [0.1] * 768
    normalized = embedder._normalize_dimension(raw_vector_768, 1536)
    assert len(normalized) == 1536
    assert normalized[0] == 0.1
    assert normalized[768] == 0.0

    # Test deterministic fallback
    vec = await embedder.get_embedding("Aditya is my co-lead")
    assert len(vec) == 1536
    assert isinstance(vec[0], float)
