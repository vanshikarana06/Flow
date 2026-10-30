from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class CalendarTool(BaseTool):
    name = "calendar_tool"
    description = "Checks schedule availability, schedules events, and resolves meeting conflicts."
    parameters_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["check_availability", "create_event", "reschedule_event"]},
            "start_time": {"type": "string", "format": "date-time"},
            "end_time": {"type": "string", "format": "date-time"},
            "title": {"type": "string"},
            "event_id": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        action = input_data.get("action")
        if action in ["create_event", "reschedule_event"]:
            return ToolResult(
                success=True,
                requires_approval=True,
                approval_payload={
                    "action_type": "CREATE_EVENT" if action == "create_event" else "RESCHEDULE_EVENT",
                    "target_service": "CALENDAR",
                    "payload": input_data,
                },
            )
        return ToolResult(success=True, data={"status": "AVAILABLE", "slots": []})

