from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.shared.schemas.responses import StandardResponse
from app.memory.retrieval import MemoryRetrievalEngine

router = APIRouter(prefix="/memory", tags=["Personal Memory"])

class SemanticSearchRequest(BaseModel):
    query: str

@router.post("/search/semantic", response_model=StandardResponse[Dict[str, Any]])
async def semantic_search(
    request: SemanticSearchRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    engine = MemoryRetrievalEngine(db)
    context = await engine.retrieve_context(user_id=current_user.id, query=request.query)
    return StandardResponse(data=context)
