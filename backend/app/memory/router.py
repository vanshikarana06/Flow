import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.memory.retrieval import MemoryRetrievalEngine
from app.database.repositories.memory_repo import MemoryRepository
from app.database.models.memory import MemoryRecord

router = APIRouter(prefix="/memory", tags=["Personal Memory"])

class SemanticSearchRequest(BaseModel):
    query: str

class MemoryCreateRequest(BaseModel):
    category: str = "PREFERENCE"
    content: str
    confidence_score: float = 1.0

class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    category: str
    content: str
    confidence_score: float
    observed_at: datetime

@router.get("/", response_model=StandardResponse[List[MemoryResponse]])
async def list_memories(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = MemoryRepository(db)
    records = await repo.list_by_user(current_user.id, limit=limit, offset=offset)
    return StandardResponse(data=[MemoryResponse.model_validate(r) for r in records])

@router.post("/", response_model=StandardResponse[MemoryResponse], status_code=status.HTTP_201_CREATED)
async def create_memory(
    request: MemoryCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = MemoryRepository(db)
    record = await repo.create_memory(
        user_id=current_user.id,
        category=request.category,
        content=request.content,
        confidence_score=request.confidence_score,
    )
    await db.commit()
    await db.refresh(record)
    return StandardResponse(data=MemoryResponse.model_validate(record))

@router.get("/search", response_model=StandardResponse[Dict[str, Any]])
async def search_memory(
    query: str = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = MemoryRetrievalEngine(db)
    context = await engine.retrieve_context(user_id=current_user.id, query=query)
    return StandardResponse(data=context)

@router.post("/search/semantic", response_model=StandardResponse[Dict[str, Any]])
async def semantic_search(
    request: SemanticSearchRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = MemoryRetrievalEngine(db)
    context = await engine.retrieve_context(user_id=current_user.id, query=request.query)
    return StandardResponse(data=context)
