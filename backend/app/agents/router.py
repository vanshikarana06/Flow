from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, UserContext
from app.shared.schemas.responses import StandardResponse
from app.agents.tools.tool_registry import get_tool_registry
from app.agents.orchestrator.orchestrator import AgentOrchestrator, OrchestratorDispatchResult
from app.database.repositories.agent_plan_repo import AgentPlanRepository
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/agents", tags=["Agent Orchestration"])

class DispatchPromptRequest(BaseModel):
    prompt: str

class ToolInfoResponse(BaseModel):
    name: str
    description: str
    parameters_schema: Dict[str, Any]

class AgentPlanDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    intent: str
    status: str
    plan_json: Dict[str, Any]

@router.post("/dispatch", response_model=StandardResponse[OrchestratorDispatchResult])
async def dispatch_prompt(
    request: DispatchPromptRequest,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orchestrator = AgentOrchestrator(db)
    result = await orchestrator.dispatch(
        prompt=request.prompt,
        user_id=current_user.user_id,
    )
    return StandardResponse(data=result)

@router.get("/plans/{plan_id}", response_model=StandardResponse[AgentPlanDetailResponse])
async def get_agent_plan(
    plan_id: uuid.UUID,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = AgentPlanRepository(db)
    plan = await repo.get_plan(plan_id, current_user.user_id)
    if not plan:
        raise EntityNotFoundException(entity_name="AgentPlan", entity_id=str(plan_id))
    return StandardResponse(data=AgentPlanDetailResponse.model_validate(plan))

@router.get("/tools", response_model=StandardResponse[List[ToolInfoResponse]])
async def list_tools():
    registry = get_tool_registry()
    tools = [
        ToolInfoResponse(
            name=t.name,
            description=t.description,
            parameters_schema=t.parameters_schema,
        )
        for t in registry.list_tools()
    ]
    return StandardResponse(data=tools)
