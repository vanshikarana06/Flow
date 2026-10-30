import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.tasks.service import TaskService
from app.tasks.schemas import (
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskPrioritizeRequest,
    TaskScheduleRequest,
    TaskResponse,
)

router = APIRouter(prefix="/tasks", tags=["Task Management"])

@router.post("/", response_model=StandardResponse[TaskResponse], status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    task = await service.create_task(current_user.id, payload)
    return StandardResponse(data=TaskResponse.model_validate(task))

@router.get("/", response_model=StandardResponse[List[TaskResponse]])
async def list_tasks(
    include_completed: bool = False,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    tasks = await service.list_tasks(current_user.id, include_completed=include_completed)
    return StandardResponse(data=[TaskResponse.model_validate(t) for t in tasks])

@router.get("/{task_id}", response_model=StandardResponse[TaskResponse])
async def get_task(
    task_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    task = await service.get_task(current_user.id, task_id)
    return StandardResponse(data=TaskResponse.model_validate(task))

@router.patch("/{task_id}", response_model=StandardResponse[TaskResponse])
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    task = await service.update_task(current_user.id, task_id, payload)
    return StandardResponse(data=TaskResponse.model_validate(task))

@router.post("/{task_id}/prioritize", response_model=StandardResponse[TaskResponse])
async def prioritize_task(
    task_id: uuid.UUID,
    payload: TaskPrioritizeRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    task = await service.prioritize(current_user.id, task_id, payload.priority)
    return StandardResponse(data=TaskResponse.model_validate(task))

@router.post("/{task_id}/schedule", response_model=StandardResponse[TaskResponse])
async def schedule_task(
    task_id: uuid.UUID,
    payload: TaskScheduleRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    task = await service.schedule(
        current_user.id,
        task_id,
        payload.scheduled_slot_start,
        payload.scheduled_slot_end,
    )
    return StandardResponse(data=TaskResponse.model_validate(task))

@router.delete("/{task_id}", response_model=StandardResponse[Dict[str, Any]])
async def delete_task(
    task_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TaskService(db)
    await service.delete_task(current_user.id, task_id)
    return StandardResponse(data={"deleted": True, "task_id": str(task_id)})
