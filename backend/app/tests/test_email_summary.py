import pytest
from unittest.mock import AsyncMock
from app.ai.services.email_summarizer import EmailSummarizer, EmailSummaryResult
from app.ai.providers.litellm_provider import LiteLLMProvider

@pytest.mark.asyncio
async def test_email_summary_structured():
    provider = LiteLLMProvider()
    expected = EmailSummaryResult(
        summary="Engineering team discussion regarding Q3 database migration deadlines.",
        action_items=[
            "Review pgvector migration script by Friday.",
            "Schedule staging test run on Supabase.",
        ],
        priority="HIGH",
    )
    provider.generate_structured = AsyncMock(return_value=expected)

    summarizer = EmailSummarizer(provider=provider)
    messages = [
        {"sender": "dev@flow.dev", "body": "Hey team, we need to finalize the DB migration by Friday."},
        {"sender": "lead@flow.dev", "body": "Agreed, let us schedule a staging test run."},
    ]

    result = await summarizer.summarize_thread(
        subject="Q3 Migration Plan",
        messages=messages,
    )

    assert "database migration" in result.summary.lower()
    assert len(result.action_items) == 2
    assert result.priority == "HIGH"
    provider.generate_structured.assert_called_once()

@pytest.mark.asyncio
async def test_email_summary_fallback():
    provider = LiteLLMProvider()
    provider.generate_structured = AsyncMock(side_effect=RuntimeError("LiteLLM Unreachable"))

    summarizer = EmailSummarizer(provider=provider)
    messages = [
        {"sender": "support@vendor.com", "body": "URGENT: Your account requires review today."},
    ]

    result = await summarizer.summarize_thread(
        subject="Urgent Security Notice",
        messages=messages,
    )

    assert result.priority == "HIGH"
    assert len(result.action_items) >= 1
