from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class MemoryTool(BaseTool):
    name = "memory_tool"
    description = "Retrieves stored contacts, relationships, preferences, and personal event memories."
    parameters_schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "category": {"type": "string", "enum": ["CONTACT", "RELATIONSHIP", "PREFERENCE", "EVENT"]},
        },
        "required": ["query"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        return ToolResult(success=True, data={"matched_entities": [{"name": "Aditya", "role": "co-lead", "email": "aditya@example.com"}]})

