from typing import Optional
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_supabase_jwt
from app.database.session import get_db
from app.database.models.user import User
from pydantic import BaseModel

security_scheme = HTTPBearer(auto_error=True)

class AuthenticatedUser(BaseModel):
    id: uuid.UUID
    email: str

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> AuthenticatedUser:
    token = credentials.credentials
    payload = decode_supabase_jwt(token)
    
    sub = payload.get("sub")
    email = payload.get("email")
    if not sub or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT claims: missing sub or email",
        )

    return AuthenticatedUser(id=uuid.UUID(sub), email=email)

