import pytest
import uuid
from app.agents.tools.tool_registry import ToolRegistry, get_tool_registry
from app.agents.tools.email_tool import EmailTool
from app.agents.tools.task_tool import TaskTool
from app.agents.tools.calendar_tool import CalendarTool
from app.agents.tools.memory_tool import MemoryTool
from app.agents.tools.approval_tool import ApprovalTool

def test_tool_registry_registration():
    registry = ToolRegistry()
    assert len(registry.list_tools()) == 0

    registry.register(EmailTool())
    assert registry.has_tool("email_tool")
    assert registry.get_tool("email_tool") is not None
    assert "email_tool" in registry.list_tool_names()

def test_default_tool_registry_contents():
    registry = get_tool_registry()
    names = registry.list_tool_names()

    assert "email_tool" in names
    assert "task_tool" in names
    assert "calendar_tool" in names
    assert "memory_tool" in names
    assert "approval_tool" in names
    assert len(names) >= 5

def test_mcp_definitions_format():
    registry = get_tool_registry()
    mcp_defs = registry.get_mcp_definitions()

    assert len(mcp_defs) >= 5
    for mcp in mcp_defs:
        assert "name" in mcp
        assert "description" in mcp
        assert "inputSchema" in mcp
        assert "properties" in mcp["inputSchema"]

@pytest.mark.asyncio
async def test_tool_execution_dispatch():
    registry = get_tool_registry()
    uid = uuid.uuid4()

    # Successful call to staged action
    result = await registry.execute_tool(
        name="email_tool",
        input_data={"action": "create_draft", "recipient_to": ["test@flow.dev"], "subject": "Test"},
        user_id=uid,
    )
    assert result.success is True
    assert result.data["status"] == "DRAFT_STAGED"

    # Non-existent tool execution returns error
    bad_result = await registry.execute_tool(
        name="non_existent_tool",
        input_data={},
        user_id=uid,
    )
    assert bad_result.success is False
    assert "not found" in bad_result.error.lower()
