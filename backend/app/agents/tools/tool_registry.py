import logging
from typing import Dict, List, Optional, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

logger = logging.getLogger("flow.agents.tools")

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool
        logger.debug(f"Registered tool in registry: {tool.name}")

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def has_tool(self, name: str) -> bool:
        return name in self._tools

    def list_tools(self) -> List[BaseTool]:
        return list(self._tools.values())

    def list_tool_names(self) -> List[str]:
        return list(self._tools.keys())

    def get_mcp_definitions(self) -> List[Dict[str, Any]]:
        return [tool.to_mcp_tool_definition() for tool in self._tools.values()]

    async def execute_tool(self, name: str, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        tool = self.get_tool(name)
        if not tool:
            return ToolResult(success=False, error=f"Tool '{name}' not found in registry")
        logger.debug(f"Executing tool: {name} for user: {user_id}")
        return await tool.execute(input_data, user_id)

_global_tool_registry = ToolRegistry()

def init_default_tools(registry: ToolRegistry) -> None:
    from app.agents.tools.calendar_tool import CalendarTool
    from app.agents.tools.email_tool import EmailTool
    from app.agents.tools.task_tool import TaskTool
    from app.agents.tools.memory_tool import MemoryTool
    from app.agents.tools.approval_tool import ApprovalTool

    tools = [CalendarTool(), EmailTool(), TaskTool(), MemoryTool(), ApprovalTool()]
    for t in tools:
        if not registry.has_tool(t.name):
            registry.register(t)

def get_tool_registry() -> ToolRegistry:
    if len(_global_tool_registry.list_tools()) == 0:
        init_default_tools(_global_tool_registry)
    return _global_tool_registry
