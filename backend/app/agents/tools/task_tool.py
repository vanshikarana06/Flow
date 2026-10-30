from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class TaskTool(BaseTool):
    name = "task_tool"
    description = "Creates tasks, breaks down complex projects, and adjusts task priorities."
    parameters_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["create_task", "breakdown_task", "prioritize", "delete_task"]},
            "title": {"type": "string"},
            "task_type": {"type": "string"},
            "due_date": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        action = input_data.get("action")
        if action == "delete_task":
            return ToolResult(
                success=True,
                data={
                    "task_id": input_data.get("task_id") or f"tsk_{uuid.uuid4().hex[:12]}",
                    "status": "DELETED",
                },
            )
        return ToolResult(
            success=True,
            data={
                "task_id": input_data.get("task_id") or f"tsk_{uuid.uuid4().hex[:12]}",
                "status": "TASK_PROCESSED",
                "task": input_data,
            },
        )

