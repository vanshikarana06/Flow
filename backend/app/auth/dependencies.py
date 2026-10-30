from typing import Optional
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_supabase_jwt
from app.database.session import get_db
from app.database.repositories.user_repo import UserRepository
from app.auth.schemas import UserContext, UserPreferencesSchema
from app.auth.service import AuthService

security_scheme = HTTPBearer(auto_error=True)

# Backward compatibility alias
AuthenticatedUser = UserContext

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> UserContext:
    """
    Extracts Bearer token, validates Supabase JWT (exp, aud, iss, sub),
    retrieves user with preferences, and auto-provisions if needed.
    Returns complete UserContext.
    """
    token = credentials.credentials
    payload = decode_supabase_jwt(token)
    
    sub = payload.get("sub")
    email = payload.get("email") or f"{sub}@flow.dev"
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT claims: missing 'sub'",
        )

    user_id = uuid.UUID(str(sub))
    user_repo = UserRepository(db)
    user = await user_repo.get_with_preferences(user_id)

    if not user:
        # Auto-provision on first token arrival
        auth_service = AuthService(db)
        user = await auth_service.auto_provision_user(
            user_id=user_id,
            email=email,
            full_name=email.split("@")[0].capitalize(),
        )

    pref_schema = (
        UserPreferencesSchema.model_validate(user.preference)
        if user.preference
        else UserPreferencesSchema()
    )

    return UserContext(
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferences=pref_schema,
    )

async def require_auth(
    current_user: UserContext = Depends(get_current_user),
) -> UserContext:
    """
    Protected route dependency for endpoints requiring verified user context.
    """
    return current_user
