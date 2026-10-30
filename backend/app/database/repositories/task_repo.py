import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.database.models.task import Task, Subtask
from app.shared.enums.tasks import TaskType, TaskPriority, TaskStatus
from app.database.repositories.base_repo import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: AsyncSession):
        super().__init__(Task, session)

    async def get_with_subtasks(self, task_id: uuid.UUID) -> Optional[Task]:
        result = await self.session.execute(
            select(Task).options(selectinload(Task.subtasks)).where(Task.id == task_id)
        )
        return result.scalars().first()

    async def list_active(self, user_id: uuid.UUID) -> List[Task]:
        result = await self.session.execute(
            select(Task)
            .options(selectinload(Task.subtasks))
            .where(Task.user_id == user_id, Task.status != TaskStatus.COMPLETED, Task.status != TaskStatus.ARCHIVED)
            .order_by(Task.due_date.asc().nulls_last())
        )
        return list(result.scalars().all())

    async def update_status(self, task_id: uuid.UUID, status: TaskStatus) -> Optional[Task]:
        await self.session.execute(
            update(Task).where(Task.id == task_id).values(status=status)
        )
        return await self.get_by_id(task_id)

    async def add_subtasks(self, task_id: uuid.UUID, subtask_titles: List[str]) -> List[Subtask]:
        subtasks = [
            Subtask(task_id=task_id, title=title, order_index=idx)
            for idx, title in enumerate(subtask_titles)
        ]
        self.session.add_all(subtasks)
        await self.session.flush()
        return subtasks
