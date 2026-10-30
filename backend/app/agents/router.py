from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.agents.tools.tool_registry import get_tool_registry

router = APIRouter(prefix="/agents", tags=["Agent Orchestration"])

class DispatchPromptRequest(BaseModel):
    prompt: str

class PlanStepResponse(BaseModel):
    step_id: str
    tool: str
    action: str
    parameters: Dict[str, Any]
    requires_approval: bool

class DispatchResponse(BaseModel):
    plan_id: str
    intent: str
    steps: List[PlanStepResponse]

@router.post("/dispatch", response_model=StandardResponse[DispatchResponse])
async def dispatch_prompt(
    request: DispatchPromptRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    import uuid
    mock_plan = DispatchResponse(
        plan_id=str(uuid.uuid4()),
        intent="SEND_EMAIL",
        steps=[
            PlanStepResponse(
                step_id="step-1",
                tool="memory_tool",
                action="resolve_contact",
                parameters={"query": "co-lead"},
                requires_approval=False,
            ),
            PlanStepResponse(
                step_id="step-2",
                tool="email_tool",
                action="send_email",
                parameters={"recipient": "aditya@example.com", "subject": "Project Status Update"},
                requires_approval=True,
            ),
        ],
    )
    return StandardResponse(data=mock_plan)

@router.get("/tools", response_model=StandardResponse[List[Dict[str, Any]]])
async def list_available_mcp_tools(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    registry = get_tool_registry()
    return StandardResponse(data=registry.get_mcp_definitions())
