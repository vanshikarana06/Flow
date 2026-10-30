import uuid
import inspect
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, ConfigDict

from app.agents.reasoning.intent_classifier import IntentClassifier, IntentResult
from app.memory.retrieval import MemoryRetrievalEngine
from app.agents.planning.planner import PlannerEngine, PlanSchema
from app.agents.tools.tool_registry import ToolRegistry, get_tool_registry
from app.database.repositories.agent_plan_repo import AgentPlanRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.database.models.plan import AgentPlan

class OrchestratorDispatchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    plan_id: str
    status: str
    intent: str
    goal: str
    steps: List[Dict[str, Any]]
    required_tools: List[str]
    requires_approval: bool
    context_used: Dict[str, Any]

class AgentOrchestrator:
    """
    Central Agent Orchestrator coordinating Intent Detection, Memory Context Assembly,
    Plan Generation, and Plan Persistence without executing domain actions.
    Flow:
    User Prompt -> Memory Retrieval -> LiteLLM Intent -> LiteLLM Plan -> AgentPlan Record -> Trust Layer
    """

    def __init__(self, db: AsyncSession, registry: Optional[ToolRegistry] = None):
        self.db = db
        self.registry = registry or get_tool_registry()
        self.intent_classifier = IntentClassifier()
        self.memory_engine = MemoryRetrievalEngine(db)
        self.planner = PlannerEngine(self.registry)
        self.plan_repo = AgentPlanRepository(db)
        self.activity_repo = ActivityRepository(db)

    async def dispatch(self, prompt: str, user_id: uuid.UUID) -> OrchestratorDispatchResult:
        # 1. LiteLLM Intent Classification
        intent_res: IntentResult = await self.intent_classifier.classify_llm(prompt)

        # 2. Context Assembly from Personal Memory
        target_hint = (
            intent_res.extracted_entities.get("target_recipient")
            or intent_res.extracted_entities.get("attendee")
        )
        memory_ctx = await self.memory_engine.retrieve_context(
            user_id=user_id,
            query=prompt,
            target_entity_hint=target_hint,
        )

        # 3. LiteLLM Plan Generation & Tool Selection
        plan: PlanSchema = await self.planner.generate_plan_llm(
            prompt=prompt,
            intent_res=intent_res,
            memory_context=memory_ctx,
        )

        # 4. Determine Plan Status
        initial_status = "PENDING_APPROVAL" if plan.requires_approval else "DRAFT"

        # 5. Persist AgentPlan Record
        saved_plan: AgentPlan = await self.plan_repo.create_plan(
            user_id=user_id,
            intent=plan.intent,
            plan_json=plan.model_dump(),
            status=initial_status,
        )

        # 6. Audit in Activity Ledger
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="PLAN_GENERATED",
            entity_type="AGENT_PLAN",
            entity_id=saved_plan.id,
            details={
                "intent": plan.intent,
                "goal": plan.goal,
                "step_count": len(plan.steps),
                "requires_approval": plan.requires_approval,
                "required_tools": plan.required_tools,
            },
        )
        if hasattr(self.db, "commit"):
            commit_res = self.db.commit()
            if inspect.isawaitable(commit_res):
                await commit_res

        # 7. Return Dispatch Result (Strictly NO Execution)
        return OrchestratorDispatchResult(
            plan_id=str(saved_plan.id),
            status=saved_plan.status,
            intent=plan.intent,
            goal=plan.goal,
            steps=[s.model_dump() for s in plan.steps],
            required_tools=plan.required_tools,
            requires_approval=plan.requires_approval,
            context_used=plan.context_used,
        )
