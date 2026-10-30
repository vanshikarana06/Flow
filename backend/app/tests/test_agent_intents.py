import pytest
from app.agents.reasoning.intent_classifier import IntentClassifier, AgentIntent, IntentResult

def test_intent_send_email():
    prompt = "Email my co-lead regarding the quarterly launch status"
    result: IntentResult = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.SEND_EMAIL
    assert result.confidence >= 0.9
    assert "target_recipient" in result.extracted_entities
    assert "co-lead" in result.extracted_entities["target_recipient"].lower()
    assert "launch status" in result.extracted_entities.get("subject_hint", "").lower()

def test_intent_read_email():
    prompt = "Check my unread emails in the inbox"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.READ_EMAIL
    assert result.confidence >= 0.9

def test_intent_create_task():
    prompt = "Add a task to finalize the system architecture review"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.CREATE_TASK
    assert "finalize" in result.extracted_entities.get("task_title", "").lower()

def test_intent_update_task():
    prompt = "Mark task review code as done"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.UPDATE_TASK

def test_intent_delete_task():
    prompt = "Delete task old backlog item"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.DELETE_TASK

def test_intent_create_event():
    prompt = "Schedule a meeting with Alex tomorrow at 3pm"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.CREATE_EVENT
    assert "alex" in result.extracted_entities.get("attendee", "").lower()
    assert "time_hint" in result.extracted_entities

def test_intent_reschedule_event():
    prompt = "Reschedule the team sync to Friday"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.RESCHEDULE_EVENT

def test_intent_check_conflicts():
    prompt = "Check if I have any schedule conflicts tomorrow"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.CHECK_CONFLICTS

def test_intent_save_memory():
    prompt = "Remember that John prefers communication via email in the mornings"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.SAVE_MEMORY
    assert "communication" in result.extracted_entities.get("memory_content", "").lower()

def test_intent_recall_memory():
    prompt = "What is the preference note for John?"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.RECALL_MEMORY

def test_intent_general_assistance():
    prompt = "What is the recommended design pattern for distributed workflows?"
    result = IntentClassifier.classify(prompt)
    assert result.intent == AgentIntent.GENERAL_ASSISTANCE
    assert result.confidence == 0.70

