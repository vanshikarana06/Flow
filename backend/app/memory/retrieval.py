from typing import List, Dict, Any, Optional
import uuid
import re
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.database.models.memory import MemoryRecord
from app.database.models.contact import Contact
from app.database.models.relationship import Relationship
from app.database.models.preference import Preference

logger = logging.getLogger("flow.memory.retrieval")

class MemoryRetrievalEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def resolve_contact(self, user_id: uuid.UUID, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Resolves a contact by name, email, role, or relationship.
        Example: 'co-lead' -> Aditya (Role: Co Lead)
        """
        if not identifier:
            return None

        clean_id = re.sub(r"^(my|the)\s+", "", identifier.strip(), flags=re.IGNORECASE).strip().lower()
        clean_id_normalized = clean_id.replace("-", " ")

        # 1. Direct query on Contact name, email, or role
        stmt = (
            select(Contact)
            .where(
                Contact.user_id == user_id,
                or_(
                    func.lower(Contact.name).contains(clean_id),
                    func.lower(Contact.name).contains(clean_id_normalized),
                    func.lower(Contact.email) == clean_id,
                    func.lower(Contact.role).contains(clean_id),
                    func.lower(Contact.role).contains(clean_id_normalized),
                ),
            )
            .limit(1)
        )
        res = await self.db.execute(stmt)
        contact = res.scalar_one_or_none()
        if contact:
            return {
                "id": str(contact.id),
                "name": contact.name,
                "email": contact.email,
                "role": contact.role,
                "organization": contact.organization,
            }

        # 2. Check Relationships table
        rel_stmt = (
            select(Contact)
            .join(Relationship, Relationship.contact_id == Contact.id)
            .where(
                Contact.user_id == user_id,
                or_(
                    func.lower(Relationship.relation_type).contains(clean_id),
                    func.lower(Relationship.relation_type).contains(clean_id_normalized),
                ),
            )
            .limit(1)
        )
        rel_res = await self.db.execute(rel_stmt)
        rel_contact = rel_res.scalar_one_or_none()
        if rel_contact:
            return {
                "id": str(rel_contact.id),
                "name": rel_contact.name,
                "email": rel_contact.email,
                "role": rel_contact.role,
                "organization": rel_contact.organization,
            }

        return None

    async def retrieve_context(
        self,
        user_id: uuid.UUID,
        query: str,
        embedding: Optional[List[float]] = None,
        top_k: int = 5,
        target_entity_hint: Optional[str] = None,
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

        # 2. Fetch Relevant Contacts
        contact_result = await self.db.execute(select(Contact).where(Contact.user_id == user_id).limit(10))
        contacts = contact_result.scalars().all()

        # 3. Resolve target entity if hint given
        resolved_contact = None
        if target_entity_hint:
            resolved_contact = await self.resolve_contact(user_id, target_entity_hint)
        elif query:
            # Try to resolve potential role mentions in query (e.g., "co-lead", "manager", etc.)
            for token in ["co-lead", "manager", "lead", "boss", "partner", "assistant"]:
                if token in query.lower():
                    resolved_contact = await self.resolve_contact(user_id, token)
                    if resolved_contact:
                        break

        # 4. Semantic Search via pgvector (if embedding provided)
        semantic_memories = []
        if embedding:
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
            "resolved_contact": resolved_contact,
            "relevant_memories": [m.content for m in semantic_memories],
        }
