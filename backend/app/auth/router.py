from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user, AuthenticatedUser
from app.auth.schemas import UserProfileResponse
from app.shared.schemas.responses import StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/me", response_model=StandardResponse[UserProfileResponse])
async def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name="FLOW User",
    )
    return StandardResponse(data=profile)
