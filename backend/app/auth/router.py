from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any

from app.database.session import get_db
from app.auth.dependencies import get_current_user, UserContext
from app.auth.schemas import (
    UserLoginRequest,
    UserSignupRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserProfileResponse,
    SupabaseWebhookPayload,
)
from app.auth.service import AuthService
from app.shared.schemas.responses import StandardResponse
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["Authentication & User Context"])
settings = get_settings()

@router.post("/login", response_model=StandardResponse[TokenResponse])
async def login(
    req: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    token_resp = await service.login(req)
    return StandardResponse(data=token_resp)

@router.post("/signup", response_model=StandardResponse[TokenResponse])
async def signup(
    req: UserSignupRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    token_resp = await service.signup(req)
    return StandardResponse(data=token_resp)

@router.post("/refresh", response_model=StandardResponse[TokenResponse])
async def refresh_token(
    req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    token_resp = await service.refresh_tokens(req.refresh_token)
    return StandardResponse(data=token_resp)

@router.get("/me", response_model=StandardResponse[UserProfileResponse])
async def get_me(
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user = await service.user_repo.get_with_preferences(current_user.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        preferences=current_user.preferences,
    )
    return StandardResponse(data=profile)

@router.post("/webhook/supabase", response_model=StandardResponse[Dict[str, Any]])
async def supabase_auth_webhook(
    payload: SupabaseWebhookPayload,
    x_supabase_webhook_secret: Optional[str] = Header(None, alias="x-supabase-webhook-secret"),
    db: AsyncSession = Depends(get_db),
):
    expected_secret = settings.SUPABASE_WEBHOOK_SECRET
    # Validate secret if configured
    if expected_secret and expected_secret != "whsec_default":
        if x_supabase_webhook_secret != expected_secret:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Supabase webhook secret",
            )

    service = AuthService(db)
    result = await service.handle_supabase_webhook(payload)
    return StandardResponse(data=result)
