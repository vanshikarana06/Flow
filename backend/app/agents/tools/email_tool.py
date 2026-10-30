from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class EmailTool(BaseTool):
    name = "email_tool"
    description = "Drafts and sends emails, reads unread messages, and extracts tasks from emails."
    parameters_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["read_inbox", "compose_draft", "send_email", "convert_to_task"]},
            "recipient": {"type": "string"},
            "subject": {"type": "string"},
            "body": {"type": "string"},
            "thread_id": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        action = input_data.get("action")
        if action == "send_email":
            return ToolResult(
                success=True,
                requires_approval=True,
                approval_payload={
                    "action_type": "SEND_EMAIL",
                    "target_service": "MICROSOFT_GRAPH",
                    "payload": input_data,
                },
            )
        return ToolResult(success=True, data={"status": "DRAFTED", "draft": input_data})

