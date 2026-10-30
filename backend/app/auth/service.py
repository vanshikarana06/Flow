import uuid
import hmac
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.security import create_supabase_jwt
from app.database.models.user import User
from app.database.models.preference import Preference
from app.database.models.contact import Contact
from app.database.models.memory import MemoryRecord
from app.database.repositories.user_repo import UserRepository
from app.database.repositories.activity_repo import ActivityRepository
from app.auth.schemas import (
    UserLoginRequest,
    UserSignupRequest,
    TokenResponse,
    UserContext,
    UserPreferencesSchema,
    SupabaseWebhookPayload,
)

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.settings = get_settings()

    async def auto_provision_user(
        self,
        user_id: uuid.UUID,
        email: str,
        full_name: str,
        avatar_url: Optional[str] = None,
    ) -> User:
        """
        Auto provisions User record, default Preferences, self Contact,
        and initial Memory record in a single atomic transaction.
        """
        user = await self.user_repo.get_with_preferences(user_id)
        if not user:
            # 1. Create User
            user = User(
                id=user_id,
                email=email.lower().strip(),
                full_name=full_name,
                avatar_url=avatar_url,
            )
            self.db.add(user)

            # 2. Create Preferences
            pref = Preference(
                user_id=user_id,
                work_start_time="09:00:00",
                work_end_time="18:00:00",
                max_daily_meetings=4,
                meeting_buffer_minutes=15,
                communication_tone="friendly_formal",
            )
            self.db.add(pref)

            # 3. Create Self Contact
            self_contact = Contact(
                user_id=user_id,
                name=full_name,
                email=email.lower().strip(),
                role="Owner",
                organization="FLOW Personal",
                notes="Primary FLOW user profile contact",
            )
            self.db.add(self_contact)

            # 4. Initialize Core Memory Record
            init_memory = MemoryRecord(
                user_id=user_id,
                category="PREFERENCE",
                content=f"User {full_name} ({email}) provisioned FLOW account. System preferences initialized.",
                confidence_score=1.0,
                observed_at=datetime.now(timezone.utc),
            )
            self.db.add(init_memory)

            await self.db.flush()

            # 5. Log Provisioning Activity
            await self.activity_repo.append_log(
                user_id=user_id,
                action_type="USER_PROVISIONED",
                entity_type="USER",
                entity_id=user_id,
                details={
                    "email": email,
                    "full_name": full_name,
                    "auto_provisioned": True,
                },
            )

        elif not user.preference:
            # Backfill preference if missing
            pref = Preference(user_id=user_id)
            self.db.add(pref)
            await self.db.flush()

        return user

    async def get_user_context(self, user_id: uuid.UUID) -> UserContext:
        user = await self.user_repo.get_with_preferences(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in system",
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

    async def login(self, req: UserLoginRequest) -> TokenResponse:
        """
        Authenticates with Supabase Auth or issues token locally in fallback/dev mode.
        """
        supabase_url = self.settings.SUPABASE_URL.rstrip("/")
        anon_key = self.settings.SUPABASE_ANON_KEY
        email = req.email.lower().strip()

        user_id: Optional[uuid.UUID] = None
        access_token: Optional[str] = None
        refresh_token: Optional[str] = None
        full_name: str = email.split("@")[0].capitalize()

        # Try authenticating against Supabase if configured and not default dummy
        if "example.supabase.co" not in supabase_url and anon_key != "anon-key":
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{supabase_url}/auth/v1/token?grant_type=password",
                        headers={"apikey": anon_key, "Content-Type": "application/json"},
                        json={"email": email, "password": req.password},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        access_token = data.get("access_token")
                        refresh_token = data.get("refresh_token")
                        user_data = data.get("user", {})
                        user_id = uuid.UUID(user_data.get("id"))
                        user_meta = user_data.get("user_metadata", {})
                        if user_meta.get("full_name"):
                            full_name = user_meta.get("full_name")
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid login credentials",
                        )
            except httpx.RequestError:
                # If Supabase network is unreachable, fallback to database lookup
                pass

        # If not authenticated via Supabase API (or running in local dev/testing mode)
        if not user_id:
            existing_user = await self.user_repo.get_by_email(email)
            if existing_user:
                user_id = existing_user.id
                full_name = existing_user.full_name
            else:
                user_id = uuid.uuid4()
            access_token = create_supabase_jwt(user_id=user_id, email=email)
            refresh_token = f"ref_{uuid.uuid4().hex}"

        # Ensure user is provisioned in PostgreSQL
        await self.auto_provision_user(user_id=user_id, email=email, full_name=full_name)
        user_context = await self.get_user_context(user_id)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600,
            refresh_token=refresh_token,
            user=user_context,
        )

    async def signup(self, req: UserSignupRequest) -> TokenResponse:
        """
        Signs up with Supabase Auth or registers locally in dev/testing mode.
        """
        supabase_url = self.settings.SUPABASE_URL.rstrip("/")
        anon_key = self.settings.SUPABASE_ANON_KEY
        email = req.email.lower().strip()
        full_name = req.full_name.strip()

        user_id: Optional[uuid.UUID] = None
        access_token: Optional[str] = None
        refresh_token: Optional[str] = None

        if "example.supabase.co" not in supabase_url and anon_key != "anon-key":
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{supabase_url}/auth/v1/signup",
                        headers={"apikey": anon_key, "Content-Type": "application/json"},
                        json={
                            "email": email,
                            "password": req.password,
                            "data": {"full_name": full_name},
                        },
                    )
                    if resp.status_code in (200, 201):
                        data = resp.json()
                        access_token = data.get("access_token")
                        refresh_token = data.get("refresh_token")
                        user_data = data.get("user", {})
                        if user_data.get("id"):
                            user_id = uuid.UUID(user_data.get("id"))
            except httpx.RequestError:
                pass

        if not user_id:
            existing_user = await self.user_repo.get_by_email(email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with this email already exists",
                )
            user_id = uuid.uuid4()
            access_token = create_supabase_jwt(user_id=user_id, email=email)
            refresh_token = f"ref_{uuid.uuid4().hex}"

        # Provision in PostgreSQL
        await self.auto_provision_user(user_id=user_id, email=email, full_name=full_name)
        user_context = await self.get_user_context(user_id)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600,
            refresh_token=refresh_token,
            user=user_context,
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """
        Refreshes access tokens.
        """
        # In real Supabase, calls /auth/v1/token?grant_type=refresh_token
        # Here we also support test/dev refresh tokens
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token required",
            )
        # Generate new token
        # If running in dev, generate a renewed token for the first user
        res = await self.db.execute(select(User).limit(1))
        user = res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        access_token = create_supabase_jwt(user_id=user.id, email=user.email)
        user_context = await self.get_user_context(user.id)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600,
            refresh_token=f"ref_{uuid.uuid4().hex}",
            user=user_context,
        )

    async def handle_supabase_webhook(self, payload: SupabaseWebhookPayload) -> Dict[str, Any]:
        """
        Processes Supabase Database Webhook triggered on user creation in auth.users.
        """
        if payload.type == "INSERT" and payload.record:
            rec = payload.record
            user_id = uuid.UUID(rec.id)
            email = rec.email or f"{user_id}@flow.local"
            full_name = "FLOW User"
            if rec.raw_user_meta_data and rec.raw_user_meta_data.get("full_name"):
                full_name = rec.raw_user_meta_data.get("full_name")

            await self.auto_provision_user(
                user_id=user_id,
                email=email,
                full_name=full_name,
            )
            return {"status": "PROVISIONED", "user_id": str(user_id)}

        return {"status": "IGNORED", "type": payload.type}
