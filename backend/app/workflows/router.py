import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, UserContext
from app.shared.schemas.responses import StandardResponse
from app.workflows.execution.runner import WorkflowRunner, WorkflowExecutionResult

router = APIRouter(prefix="/workflows", tags=["Workflows & Execution"])

@router.post("/execute/{approval_id}", response_model=StandardResponse[WorkflowExecutionResult])
async def execute_approved_action(
    approval_id: uuid.UUID,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    runner = WorkflowRunner(db)
    result = await runner.execute_approved_action(
        approval_id=approval_id,
        user_id=current_user.user_id,
    )
    return StandardResponse(data=result)
