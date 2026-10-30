import pytest
from unittest.mock import AsyncMock, patch
from app.ai.services.priority_detector import PriorityDetector, PriorityDetectionResult, PriorityLevel

@pytest.mark.asyncio
async def test_priority_detector_success():
    detector = PriorityDetector()
    mock_result = PriorityDetectionResult(
        priority=PriorityLevel.URGENT,
        urgency_score=0.95,
        impact_score=0.90,
        reasoning="Critical server outage reported by leadership",
        recommended_action="Resolve immediately",
    )

    with patch.object(detector.provider, "generate_structured", new=AsyncMock(return_value=mock_result)):
        result = await detector.detect_priority(
            content="Production database is down, customers cannot authenticate!",
            context_type="email",
        )
        assert result.priority == PriorityLevel.URGENT
        assert result.urgency_score >= 0.9
        assert "outage" in result.reasoning

@pytest.mark.asyncio
async def test_priority_detector_fallback():
    detector = PriorityDetector()

    with patch.object(detector.provider, "generate_structured", side_effect=RuntimeError("Ollama timeout")):
        result = await detector.detect_priority(
            content="Please review this whenever you have time, no rush at all",
            context_type="task",
        )
        assert result.priority == PriorityLevel.LOW
        assert result.urgency_score <= 0.3
