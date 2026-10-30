from abc import ABC, abstractmethod
from typing import Any, Dict
import uuid
from pydantic import BaseModel

class ToolResult(BaseModel):
    success: bool
    data: Any = None
    error: str | None = None
    requires_approval: bool = False
    approval_payload: Dict[str, Any] | None = None

class BaseTool(ABC):
    name: str
    description: str
    parameters_schema: Dict[str, Any]

    @abstractmethod
    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        pass

    def to_mcp_tool_definition(self) -> Dict[str, Any]:
        """Converts internal tool schema to Model Context Protocol (MCP) tool format."""
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.parameters_schema,
        }
