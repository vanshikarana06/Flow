import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc
from app.database.models.plan import AgentPlan
from app.database.repositories.base_repo import BaseRepository

VALID_PLAN_STATUSES = {
    "DRAFT",
    "PENDING_APPROVAL",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
}

class AgentPlanRepository(BaseRepository[AgentPlan]):
    def __init__(self, session: AsyncSession):
        super().__init__(AgentPlan, session)

    async def create_plan(
        self,
        user_id: uuid.UUID,
        intent: str,
        plan_json: Dict[str, Any],
        status: str = "DRAFT",
    ) -> AgentPlan:
        if status not in VALID_PLAN_STATUSES:
            raise ValueError(f"Invalid plan status '{status}'. Must be one of {VALID_PLAN_STATUSES}")

        plan = AgentPlan(
            user_id=user_id,
            intent=intent,
            plan_json=plan_json,
            status=status,
        )
        return await self.create(plan)

    async def get_plan(self, plan_id: uuid.UUID, user_id: uuid.UUID) -> Optional[AgentPlan]:
        result = await self.session.execute(
            select(AgentPlan).where(AgentPlan.id == plan_id, AgentPlan.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_status(self, plan_id: uuid.UUID, status: str) -> Optional[AgentPlan]:
        if status not in VALID_PLAN_STATUSES:
            raise ValueError(f"Invalid plan status '{status}'. Must be one of {VALID_PLAN_STATUSES}")

        await self.session.execute(
            update(AgentPlan).where(AgentPlan.id == plan_id).values(status=status)
        )
        return await self.get_by_id(plan_id)

    async def get_latest_plan_for_user(self, user_id: uuid.UUID) -> Optional[AgentPlan]:
        result = await self.session.execute(
            select(AgentPlan)
            .where(AgentPlan.user_id == user_id)
            .order_by(desc(AgentPlan.created_at))
            .limit(1)
        )
        return result.scalars().first()

    async def list_plans_for_user(
        self,
        user_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> List[AgentPlan]:
        result = await self.session.execute(
            select(AgentPlan)
            .where(AgentPlan.user_id == user_id)
            .order_by(desc(AgentPlan.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
