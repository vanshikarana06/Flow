import uuid
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.database.models.approval import Approval
from app.database.models.execution import ExecutionLog
from app.database.repositories.approval_repo import ApprovalRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.approval import ApprovalState, ActionType
from app.trust.approvals.state_machine import ApprovalStateMachine
from app.trust.verification.service import VerificationEngine
from app.trust.receipts.schemas.receipt_schema import ExecutionReceipt
from app.agents.tools.tool_registry import ToolRegistry, get_tool_registry
from app.workflows.retry.idempotency import IdempotencyGuard

class WorkflowExecutionResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    approval_id: str
    action_type: str
    target_service: str
    status: str
    execution_log_id: str
    proof_hash: str
    receipt: ExecutionReceipt
    output: Dict[str, Any]

class WorkflowRunner:
    """
    Workflow Runner strictly executing approved actions.
    Separates planning from execution and guarantees:
    - Only APPROVED actions execute
    - Idempotent and retry-safe execution
    - Automatic verification and receipt generation
    - Comprehensive Activity Ledger logging
    """

    def __init__(self, db: AsyncSession, registry: Optional[ToolRegistry] = None):
        self.db = db
        self.registry = registry or get_tool_registry()
        self.idempotency_guard = IdempotencyGuard(db)
        self.approval_repo = ApprovalRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.verification_engine = VerificationEngine(db)
        self.verification_engine.activity_repo = self.activity_repo

    def _resolve_tool_name(self, approval: Approval) -> str:
        action_type = approval.action_type
        target = approval.target_service.upper()

        if action_type == ActionType.SEND_EMAIL or "EMAIL" in target:
            return "email_tool"
        elif action_type == ActionType.DELETE_TASK or "TASK" in target:
            return "task_tool"
        elif action_type in (ActionType.CREATE_EVENT, ActionType.RESCHEDULE_EVENT) or "CALENDAR" in target:
            return "calendar_tool"

        # Lookup directly in registry
        for name in self.registry.list_tool_names():
            if name.lower() in target.lower():
                return name

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to resolve registered tool for action '{action_type}' and service '{approval.target_service}'.",
        )

    async def execute_approved_action(
        self,
        approval_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> WorkflowExecutionResult:
        # 1. Idempotency & Approval Status Validation
        approval, _ = await self.idempotency_guard.validate_for_execution(approval_id, user_id)

        # 2. Tool Resolution via ToolRegistry
        tool_name = self._resolve_tool_name(approval)
        tool = self.registry.get_tool(tool_name)
        if not tool:
            await self.activity_repo.append_log(
                user_id=user_id,
                action_type="ACTION_FAILED",
                entity_type="APPROVAL",
                entity_id=approval.id,
                details={"error": f"Tool '{tool_name}' not found in registry"},
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Resolved tool '{tool_name}' is not registered.",
            )

        # 3. Payload Preparation
        payload = dict(approval.modified_payload or approval.proposed_payload)
        payload["is_approved"] = True

        # Assign action key if not set
        if "action" not in payload:
            if approval.action_type == ActionType.SEND_EMAIL:
                payload["action"] = "send_approved_draft"
            elif approval.action_type == ActionType.CREATE_EVENT:
                payload["action"] = "create_event"
            elif approval.action_type == ActionType.RESCHEDULE_EVENT:
                payload["action"] = "reschedule_event"
            elif approval.action_type == ActionType.DELETE_TASK:
                payload["action"] = "delete_task"

        # 4. Tool Execution
        tool_result = await tool.execute(payload, user_id)

        if not tool_result.success:
            # Create failed ExecutionLog
            failed_log = ExecutionLog(
                user_id=user_id,
                approval_id=approval.id,
                action_name=approval.action_type.value,
                target_service=tool_name,
                payload=payload,
                status_code=500,
                raw_response={"error": tool_result.error},
            )
            self.db.add(failed_log)
            await self.db.flush()

            # Log ACTION_FAILED in Activity Ledger
            await self.activity_repo.append_log(
                user_id=user_id,
                action_type="ACTION_FAILED",
                entity_type="EXECUTION_LOG",
                entity_id=failed_log.id,
                details={
                    "approval_id": str(approval.id),
                    "action_type": approval.action_type.value,
                    "error": tool_result.error,
                },
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Tool execution failed: {tool_result.error}",
            )

        # 5. Transition State to EXECUTED
        next_state = ApprovalStateMachine.transition(ApprovalState.APPROVED, ApprovalState.EXECUTED)
        await self.approval_repo.resolve(approval.id, new_status=next_state)

        # 6. Persist ExecutionLog
        exec_log = ExecutionLog(
            user_id=user_id,
            approval_id=approval.id,
            action_name=approval.action_type.value,
            target_service=tool_name,
            payload=payload,
            status_code=200,
            raw_response=tool_result.data or {},
        )
        self.db.add(exec_log)
        await self.db.flush()

        # 7. Log ACTION_EXECUTED in Activity Ledger
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="ACTION_EXECUTED",
            entity_type="EXECUTION_LOG",
            entity_id=exec_log.id,
            details={
                "approval_id": str(approval.id),
                "action_type": approval.action_type.value,
                "tool": tool_name,
            },
        )

        # 8. Automated Verification & Receipt Generation
        evidence = tool_result.data or payload
        receipt: ExecutionReceipt = await self.verification_engine.verify_action(
            approval_id=approval.id,
            user_id=user_id,
            evidence=evidence,
        )

        return WorkflowExecutionResult(
            approval_id=str(approval.id),
            action_type=approval.action_type.value,
            target_service=tool_name,
            status="VERIFIED",
            execution_log_id=str(exec_log.id),
            proof_hash=receipt.proof_hash,
            receipt=receipt,
            output=tool_result.data or {},
        )
