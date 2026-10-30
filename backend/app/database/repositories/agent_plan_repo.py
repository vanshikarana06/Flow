import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database.models.plan import AgentPlan
from app.database.repositories.base_repo import BaseRepository

class AgentPlanRepository(BaseRepository[AgentPlan]):
    def __init__(self, session: AsyncSession):
        super().__init__(AgentPlan, session)

    async def create_plan(self, user_id: uuid.UUID, intent: str, plan_json: Dict[str, Any]) -> AgentPlan:
        plan = AgentPlan(
            user_id=user_id,
            intent=intent,
            plan_json=plan_json,
            status="DRAFT",
        )
        return await self.create(plan)

    async def update_status(self, plan_id: uuid.UUID, status: str) -> Optional[AgentPlan]:
        await self.session.execute(
            update(AgentPlan).where(AgentPlan.id == plan_id).values(status=status)
        )
        return await self.get_by_id(plan_id)

    async def get_latest_plan_for_user(self, user_id: uuid.UUID) -> Optional[AgentPlan]:
        result = await self.session.execute(
            select(AgentPlan).where(AgentPlan.user_id == user_id).order_by(AgentPlan.created_at.desc()).limit(1)
        )
        return result.scalars().first()
