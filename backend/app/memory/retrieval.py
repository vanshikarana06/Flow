from typing import List, Dict, Any, Optional
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models.memory import MemoryRecord
from app.database.models.contact import Contact
from app.database.models.relationship import Relationship
from app.database.models.preference import Preference

logger = logging.getLogger("flow.memory.retrieval")

class MemoryRetrievalEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def retrieve_context(
        self,
        user_id: uuid.UUID,
        query: str,
        embedding: Optional[List[float]] = None,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Executes hybrid memory retrieval:
        1. Exact & relational resolution for contacts & relationships
        2. Preference constraints loading
        3. Semantic vector search over behavioral and event memory
        4. Context ranking and assembly
        """
        # 1. Fetch Preferences
        pref_result = await self.db.execute(select(Preference).where(Preference.user_id == user_id))
        preferences = pref_result.scalars().first()

        # 2. Fetch Relevant Contacts & Relationships
        contact_result = await self.db.execute(select(Contact).where(Contact.user_id == user_id).limit(10))
        contacts = contact_result.scalars().all()

        # 3. Semantic Search via pgvector (if embedding provided)
        semantic_memories = []
        if embedding:
            # SQLAlchemy pgvector distance operator: MemoryRecord.embedding.cosine_distance(embedding)
            stmt = (
                select(MemoryRecord)
                .where(MemoryRecord.user_id == user_id)
                .order_by(MemoryRecord.embedding.cosine_distance(embedding))
                .limit(top_k)
            )
            vec_res = await self.db.execute(stmt)
            semantic_memories = vec_res.scalars().all()

        logger.debug(f"Assembled memory context for user {user_id} with {len(contacts)} contacts, {len(semantic_memories)} vector hits")

        return {
            "preferences": {
                "work_start_time": preferences.work_start_time if preferences else "09:00:00",
                "work_end_time": preferences.work_end_time if preferences else "18:00:00",
                "max_daily_meetings": preferences.max_daily_meetings if preferences else 4,
                "meeting_buffer_minutes": preferences.meeting_buffer_minutes if preferences else 15,
                "communication_tone": preferences.communication_tone if preferences else "friendly_formal",
            },
            "contacts": [{"name": c.name, "email": c.email, "role": c.role} for c in contacts],
            "relevant_memories": [m.content for m in semantic_memories],
        }

