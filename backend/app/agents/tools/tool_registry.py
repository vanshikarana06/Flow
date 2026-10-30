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
        logger.info(f"Registered tool in registry: {tool.name}")

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[BaseTool]:
        return list(self._tools.values())

    def get_mcp_definitions(self) -> List[Dict[str, Any]]:
        return [tool.to_mcp_tool_definition() for tool in self._tools.values()]

    async def execute_tool(self, name: str, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        tool = self.get_tool(name)
        if not tool:
            return ToolResult(success=False, error=f"Tool '{name}' not found in registry")
        logger.debug(f"Executing tool: {name} for user: {user_id}")
        return await tool.execute(input_data, user_id)

_global_tool_registry = ToolRegistry()

def get_tool_registry() -> ToolRegistry:
    return _global_tool_registry

