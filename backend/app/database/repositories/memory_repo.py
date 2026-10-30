import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models.memory import MemoryRecord
from app.database.models.contact import Contact
from app.database.models.relationship import Relationship
from app.database.repositories.base_repo import BaseRepository

class MemoryRepository(BaseRepository[MemoryRecord]):
    def __init__(self, session: AsyncSession):
        super().__init__(MemoryRecord, session)

    async def create_memory(
        self,
        user_id: uuid.UUID,
        category: str,
        content: str,
        embedding: Optional[List[float]] = None,
        confidence_score: float = 1.0,
    ) -> MemoryRecord:
        record = MemoryRecord(
            user_id=user_id,
            category=category,
            content=content,
            embedding=embedding,
            confidence_score=confidence_score,
        )
        return await self.create(record)

    async def search_semantic(
        self,
        user_id: uuid.UUID,
        query_embedding: List[float],
        limit: int = 5,
    ) -> List[MemoryRecord]:
        stmt = (
            select(MemoryRecord)
            .where(MemoryRecord.user_id == user_id)
            .order_by(MemoryRecord.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_contacts(self, user_id: uuid.UUID) -> List[Contact]:
        result = await self.session.execute(
            select(Contact).where(Contact.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_relationships(self, user_id: uuid.UUID) -> List[Relationship]:
        result = await self.session.execute(
            select(Relationship).where(Relationship.user_id == user_id)
        )
        return list(result.scalars().all())
