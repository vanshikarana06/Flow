from typing import Dict, Any
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult

class ApprovalTool(BaseTool):
    name = "approval_tool"
    description = "Submits an action to the Approval Center for explicit human approval."
    parameters_schema = {
        "type": "object",
        "properties": {
            "action_type": {"type": "string"},
            "target_service": {"type": "string"},
            "proposed_payload": {"type": "object"},
        },
        "required": ["action_type", "target_service", "proposed_payload"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        return ToolResult(
            success=True,
            requires_approval=True,
            approval_payload=input_data,
        )

