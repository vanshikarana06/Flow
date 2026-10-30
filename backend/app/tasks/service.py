import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.database.models.task import Task, Subtask
from app.database.repositories.task_repo import TaskRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.shared.enums.tasks import TaskType, TaskPriority, TaskStatus
from app.tasks.schemas import TaskCreateRequest, TaskUpdateRequest
from app.core.exceptions import EntityNotFoundException

class TaskService:
    """
    Task Runtime Service supporting:
    - Create (with subtask decomposition)
    - Update (title, description, status, due_date)
    - Delete (with audit trail)
    - Prioritize (LOW, MEDIUM, HIGH, URGENT)
    - Schedule (calendar time-blocking)
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.task_repo = TaskRepository(db)
        self.activity_repo = ActivityRepository(db)

    async def create_task(self, user_id: uuid.UUID, data: TaskCreateRequest) -> Task:
        task = Task(
            user_id=user_id,
            title=data.title,
            description=data.description,
            task_type=data.task_type,
            priority=data.priority,
            due_date=data.due_date,
            scheduled_slot_start=data.scheduled_slot_start,
            scheduled_slot_end=data.scheduled_slot_end,
            status=TaskStatus.PENDING,
        )
        self.db.add(task)
        await self.db.flush()

        # Add subtasks if requested
        if data.subtask_titles:
            await self.task_repo.add_subtasks(task.id, data.subtask_titles)

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="TASK_CREATED",
            entity_type="TASK",
            entity_id=task.id,
            details={
                "title": task.title,
                "priority": task.priority.value if hasattr(task.priority, "value") else str(task.priority),
                "task_type": task.task_type.value if hasattr(task.task_type, "value") else str(task.task_type),
                "due_date": task.due_date.isoformat() if task.due_date else None,
            },
        )
        await self.db.commit()
        return await self.get_task(user_id, task.id)

    async def get_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
        task = await self.task_repo.get_with_subtasks(task_id)
        if not task or task.user_id != user_id:
            raise EntityNotFoundException(entity_name="Task", entity_id=str(task_id))
        return task

    async def list_tasks(self, user_id: uuid.UUID, include_completed: bool = False) -> List[Task]:
        if include_completed:
            result = await self.db.execute(
                select(Task)
                .options(selectinload(Task.subtasks))
                .where(Task.user_id == user_id)
                .order_by(Task.due_date.asc().nulls_last())
            )
            return list(result.scalars().all())
        return await self.task_repo.list_active(user_id)

    async def update_task(self, user_id: uuid.UUID, task_id: uuid.UUID, data: TaskUpdateRequest) -> Task:
        task = await self.get_task(user_id, task_id)
        
        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(task, key, value)

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="TASK_UPDATED",
            entity_type="TASK",
            entity_id=task.id,
            details={"updated_fields": list(update_dict.keys())},
        )
        await self.db.commit()
        return await self.get_task(user_id, task.id)

    async def prioritize(self, user_id: uuid.UUID, task_id: uuid.UUID, priority: TaskPriority) -> Task:
        task = await self.get_task(user_id, task_id)
        old_priority = task.priority
        task.priority = priority

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="TASK_PRIORITIZED",
            entity_type="TASK",
            entity_id=task.id,
            details={
                "old_priority": old_priority.value if hasattr(old_priority, "value") else str(old_priority),
                "new_priority": priority.value if hasattr(priority, "value") else str(priority),
            },
        )
        await self.db.commit()
        return task

    async def schedule(
        self,
        user_id: uuid.UUID,
        task_id: uuid.UUID,
        slot_start: datetime,
        slot_end: datetime,
    ) -> Task:
        task = await self.get_task(user_id, task_id)
        task.scheduled_slot_start = slot_start
        task.scheduled_slot_end = slot_end

        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="TASK_SCHEDULED",
            entity_type="TASK",
            entity_id=task.id,
            details={
                "scheduled_slot_start": slot_start.isoformat(),
                "scheduled_slot_end": slot_end.isoformat(),
            },
        )
        await self.db.commit()
        return task

    async def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        task = await self.get_task(user_id, task_id)
        title = task.title

        await self.task_repo.delete(task_id)
        await self.activity_repo.append_log(
            user_id=user_id,
            action_type="TASK_DELETED",
            entity_type="TASK",
            entity_id=task_id,
            details={"deleted_title": title},
        )
        await self.db.commit()
        return True

