import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models.user import User
from app.database.models.preference import Preference
from app.auth.schemas import UserSignupRequest, UserProfileResponse

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_user(self, user_id: uuid.UUID, email: str, full_name: str) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            user = User(id=user_id, email=email, full_name=full_name)
            self.db.add(user)
            pref = Preference(user_id=user_id)
            self.db.add(pref)
            await self.db.flush()
        return user
