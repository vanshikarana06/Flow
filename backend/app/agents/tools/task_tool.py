from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class TaskTool(BaseTool):
    name = "task_tool"
    description = "Creates tasks, breaks down complex projects, and adjusts task priorities."
    parameters_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["create_task", "breakdown_task", "prioritize"]},
            "title": {"type": "string"},
            "task_type": {"type": "string"},
            "due_date": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        return ToolResult(success=True, data={"status": "TASK_PROCESSED", "task": input_data})
