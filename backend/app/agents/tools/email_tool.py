from typing import Dict, Any, List, Optional
import uuid
from app.agents.tools.base_tool import BaseTool, ToolResult
from app.shared.enums.approval import ActionType

class EmailTool(BaseTool):
    name = "email_tool"
    description = (
        "FLOW Self-Owned Email OS tool: creates drafts, reads conversation threads, searches emails, "
        "converts messages into actionable tasks, summarizes threads, generates follow-ups, and triggers "
        "human-verified outbound delivery."
    )
    parameters_schema = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": [
                    "create_draft",
                    "read_email",
                    "read_threads",
                    "search_email",
                    "convert_to_task",
                    "summarize_email",
                    "generate_follow_up",
                    "send_approved_draft",
                ],
            },
            "recipient_to": {"type": "array", "items": {"type": "string"}},
            "subject": {"type": "string"},
            "body": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "draft_id": {"type": "string"},
            "query": {"type": "string"},
            "task_title": {"type": "string"},
            "due_date": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, input_data: Dict[str, Any], user_id: uuid.UUID) -> ToolResult:
        action = input_data.get("action")

        # 1. Outbound Send requires Human Approval Gate
        if action == "send_approved_draft":
            draft_id = input_data.get("draft_id")
            return ToolResult(
                success=True,
                requires_approval=True,
                approval_payload={
                    "action_type": ActionType.SEND_EMAIL.value,
                    "target_service": "FLOW_EMAIL_OUTBOUND",
                    "draft_id": draft_id,
                    "payload": input_data,
                },
            )

        # 2. Compose / Create Draft
        if action == "create_draft":
            return ToolResult(
                success=True,
                data={
                    "status": "DRAFT_STAGED",
                    "draft": {
                        "recipient_to": input_data.get("recipient_to"),
                        "subject": input_data.get("subject"),
                        "body": input_data.get("body"),
                        "thread_id": input_data.get("thread_id"),
                    },
                },
            )

        # 3. Read Threads
        if action == "read_threads":
            return ToolResult(
                success=True,
                data={
                    "status": "THREADS_RETRIEVED",
                    "limit": input_data.get("limit", 20),
                },
            )

        # 4. Read Email
        if action == "read_email":
            return ToolResult(
                success=True,
                data={
                    "status": "EMAIL_RETRIEVED",
                    "message_id": input_data.get("message_id"),
                },
            )

        # 5. Search Email
        if action == "search_email":
            return ToolResult(
                success=True,
                data={
                    "status": "SEARCH_RESULTS",
                    "query": input_data.get("query"),
                },
            )

        # 6. Convert Email To Task
        if action == "convert_to_task":
            return ToolResult(
                success=True,
                data={
                    "status": "TASK_EXTRACTED",
                    "task_title": input_data.get("task_title"),
                    "source_message_id": input_data.get("message_id"),
                },
            )

        # 7. Summarize Email
        if action == "summarize_email":
            return ToolResult(
                success=True,
                data={
                    "status": "EMAIL_SUMMARIZED",
                    "thread_id": input_data.get("thread_id"),
                },
            )

        # 8. Generate Follow-Up
        if action == "generate_follow_up":
            return ToolResult(
                success=True,
                data={
                    "status": "FOLLOW_UP_GENERATED",
                    "thread_id": input_data.get("thread_id"),
                },
            )

        return ToolResult(success=False, error=f"Unsupported email tool action: {action}")
