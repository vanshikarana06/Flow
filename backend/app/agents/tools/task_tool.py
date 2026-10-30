from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class TaskTool(BaseTool):
    name = "task_tool"
    description = "Creates tasks, breaks down complex projects, and adjusts task priorities."
    parameters_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["create_task", "breakdown_task", "prioritize", "delete_task", "schedule"]},
            "title": {"type": "string"},
            "task_type": {"type": "string"},
            "due_date": {"type": "string"},
            "task_id": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        action = input_data.get("action")
        task_id = input_data.get("task_id") or f"tsk_{uuid.uuid4().hex[:12]}"
        
        if action == "delete_task":
            if input_data.get("is_approved"):
                return ToolResult(
                    success=True,
                    data={
                        "task_id": str(task_id),
                        "status": "DELETED",
                    },
                )
            return ToolResult(
                success=True,
                requires_approval=True,
                approval_payload={
                    "action_type": "DELETE_TASK",
                    "target_service": "TASK",
                    "payload": input_data,
                },
            )

        return ToolResult(
            success=True,
            data={
                "task_id": str(task_id),
                "status": "COMPLETED",
                "task": input_data,
            },
        )
