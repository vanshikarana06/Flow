import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.models.user import User
from app.database.models.preference import Preference
from app.database.repositories.base_repo import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_with_preferences(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.session.execute(
            select(User).options(selectinload(User.preference)).where(User.id == user_id)
        )
        return result.scalars().first()

    async def get_or_create(self, user_id: uuid.UUID, email: str, full_name: str) -> User:
        user = await self.get_by_id(user_id)
        if not user:
            user = User(id=user_id, email=email, full_name=full_name)
            self.session.add(user)
            pref = Preference(user_id=user_id)
            self.session.add(pref)
            await self.session.flush()
        return user
