import pytest
from unittest.mock import AsyncMock
from app.agents.reasoning.intent_classifier import IntentClassifier, AgentIntent, IntentResult
from app.ai.providers.litellm_provider import LiteLLMProvider

@pytest.fixture
def mock_llm_provider():
    provider = LiteLLMProvider()
    return provider

@pytest.mark.asyncio
async def test_llm_intent_classification_email():
    provider = LiteLLMProvider()
    # Mock LLM structured response
    expected = IntentResult(
        intent=AgentIntent.SEND_EMAIL,
        confidence=0.98,
        extracted_entities={"target_recipient": "Aditya", "subject_hint": "launch status"},
        explanation="User requested to send an email to their co-lead Aditya regarding launch status",
    )
    provider.generate_structured = AsyncMock(return_value=expected)

    classifier = IntentClassifier(provider=provider)
    result = await classifier.classify_llm("Email my co-lead Aditya about launch status")

    assert result.intent == AgentIntent.SEND_EMAIL
    assert result.extracted_entities["target_recipient"] == "Aditya"
    assert result.confidence == 0.98
    provider.generate_structured.assert_called_once()

@pytest.mark.asyncio
async def test_llm_intent_classification_create_task():
    provider = LiteLLMProvider()
    expected = IntentResult(
        intent=AgentIntent.CREATE_TASK,
        confidence=0.95,
        extracted_entities={"task_title": "Fix OAuth token refresh bug"},
        explanation="User wants to add a new task",
    )
    provider.generate_structured = AsyncMock(return_value=expected)

    classifier = IntentClassifier(provider=provider)
    result = await classifier.classify_llm("Add task: Fix OAuth token refresh bug")

    assert result.intent == AgentIntent.CREATE_TASK
    assert result.extracted_entities["task_title"] == "Fix OAuth token refresh bug"

@pytest.mark.asyncio
async def test_llm_intent_fallback_on_unreachable():
    provider = LiteLLMProvider()
    provider.generate_structured = AsyncMock(side_effect=RuntimeError("LiteLLM Proxy Unreachable"))

    classifier = IntentClassifier(provider=provider)
    # Heuristic fallback should gracefully classify
    result = await classifier.classify_llm("Schedule a meeting with Sarah tomorrow at 3pm")

    assert result.intent == AgentIntent.CREATE_EVENT
    assert "attendee" in result.extracted_entities
    assert result.extracted_entities["attendee"] == "Sarah"
