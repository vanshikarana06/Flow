import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi import HTTPException
from httpx import AsyncClient, ASGITransport

from app.core.security import create_supabase_jwt, decode_supabase_jwt
from app.auth.schemas import (
    UserContext,
    UserPreferencesSchema,
    UserLoginRequest,
    UserSignupRequest,
    SupabaseWebhookPayload,
    SupabaseWebhookRecord,
)
from app.auth.service import AuthService
from app.database.models.user import User
from app.database.models.preference import Preference
from app.database.models.contact import Contact
from app.database.models.memory import MemoryRecord
from app.database.models.activity import ActivityLog
from app.database.session import get_db
from app.main import app

# ==============================================================================
# 1. JWT Validation Tests
# ==============================================================================

def test_jwt_validation_success():
    """Verify that a valid Supabase JWT decodes and returns required claims."""
    test_user_id = uuid.uuid4()
    test_email = "architect@flow.dev"
    token = create_supabase_jwt(user_id=test_user_id, email=test_email)

    claims = decode_supabase_jwt(token)
    assert claims["sub"] == str(test_user_id)
    assert claims["email"] == test_email
    assert claims["aud"] == "authenticated"
    assert "exp" in claims
    assert "iss" in claims

def test_jwt_validation_expired():
    """Verify that an expired JWT raises 401 HTTPException."""
    test_user_id = uuid.uuid4()
    test_email = "expired@flow.dev"
    token = create_supabase_jwt(
        user_id=test_user_id,
        email=test_email,
        expires_delta=timedelta(seconds=-10),  # expired 10 seconds ago
    )

    with pytest.raises(HTTPException) as exc_info:
        decode_supabase_jwt(token)
    assert exc_info.value.status_code == 401
    assert "expired" in exc_info.value.detail.lower()

def test_jwt_validation_invalid_sub():
    """Verify that a JWT with an invalid UUID sub raises 401."""
    import jwt
    from app.core.config import get_settings

    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "not-a-valid-uuid",
        "email": "badsub@flow.dev",
        "aud": "authenticated",
        "iss": f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1",
        "exp": int((now + timedelta(hours=1)).timestamp()),
    }
    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

    with pytest.raises(HTTPException) as exc_info:
        decode_supabase_jwt(token)
    assert exc_info.value.status_code == 401
    assert "valid uuid" in exc_info.value.detail.lower()

def test_jwt_validation_invalid_aud():
    """Verify that a JWT with wrong audience raises 401."""
    test_user_id = uuid.uuid4()
    token = create_supabase_jwt(
        user_id=test_user_id,
        email="badaud@flow.dev",
        aud="wrong_audience",
    )

    with pytest.raises(HTTPException) as exc_info:
        decode_supabase_jwt(token)
    assert exc_info.value.status_code == 401
    assert "aud" in exc_info.value.detail.lower()

# ==============================================================================
# 2. User Context Object Tests
# ==============================================================================

def test_user_context_structure():
    """Verify UserContext has user_id, email, full_name, preferences, and id alias."""
    uid = uuid.uuid4()
    ctx = UserContext(
        user_id=uid,
        email="test@flow.dev",
        full_name="Flow Tester",
        preferences=UserPreferencesSchema(
            work_start_time="08:30:00",
            work_end_time="17:30:00",
            max_daily_meetings=3,
        ),
    )
    assert ctx.user_id == uid
    assert ctx.id == uid  # Check id compatibility alias
    assert ctx.email == "test@flow.dev"
    assert ctx.preferences.max_daily_meetings == 3

# ==============================================================================
# 3. User Auto-Provisioning Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_auto_provision_user_creates_all_artifacts():
    """
    Verify auto_provision_user creates:
    - User
    - Preference
    - Contact (Self)
    - MemoryRecord (Initial)
    - ActivityLog
    """
    added_entities = []

    mock_db = MagicMock()
    mock_db.add = MagicMock(side_effect=lambda obj: added_entities.append(obj))
    mock_db.flush = AsyncMock()

    service = AuthService(mock_db)
    # Mock user_repo to return None (simulating new user)
    service.user_repo.get_with_preferences = AsyncMock(return_value=None)
    service.activity_repo.append_log = AsyncMock()

    new_id = uuid.uuid4()
    user = await service.auto_provision_user(
        user_id=new_id,
        email="newuser@flow.dev",
        full_name="New Flow User",
    )

    assert user.id == new_id
    assert user.email == "newuser@flow.dev"

    # Verify types of added entities
    types_added = [type(e) for e in added_entities]
    assert User in types_added
    assert Preference in types_added
    assert Contact in types_added
    assert MemoryRecord in types_added

    # Verify ActivityLog called
    service.activity_repo.append_log.assert_awaited_once()
    call_kwargs = service.activity_repo.append_log.call_args.kwargs
    assert call_kwargs["action_type"] == "USER_PROVISIONED"
    assert call_kwargs["entity_id"] == new_id

# ==============================================================================
# 4. Protected Route & Auth API Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_auth_protected_endpoint_without_token():
    """Verify accessing GET /api/v1/auth/me without token returns 401/403."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)

@pytest.mark.asyncio
async def test_auth_protected_endpoint_with_invalid_token():
    """Verify accessing GET /api/v1/auth/me with invalid Bearer token returns 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.jwt.token"},
        )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_auth_flow_login_and_me_with_mock_db():
    """Verify full flow: login generates token, token accesses /api/v1/auth/me."""
    uid = uuid.uuid4()
    test_user = User(
        id=uid,
        email="user@flow.dev",
        full_name="Test User",
    )
    test_pref = Preference(
        user_id=uid,
        work_start_time="09:00:00",
        work_end_time="18:00:00",
    )
    test_user.preference = test_pref

    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    # Create dummy async session override
    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    # Generate valid token
    valid_token = create_supabase_jwt(user_id=uid, email="user@flow.dev")

    # Mock user query for get_current_user dependency
    from app.database.repositories.user_repo import UserRepository
    original_get_with_pref = UserRepository.get_with_preferences
    UserRepository.get_with_preferences = AsyncMock(return_value=test_user)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Call /api/v1/auth/me with valid Bearer token
            resp = await ac.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {valid_token}"},
            )
            assert resp.status_code == 200
            json_body = resp.json()
            assert json_body["success"] is True
            assert json_body["data"]["email"] == "user@flow.dev"
            assert json_body["data"]["full_name"] == "Test User"
            assert json_body["data"]["preferences"]["work_start_time"] == "09:00:00"

    finally:
        # Cleanup overrides
        app.dependency_overrides.pop(get_db, None)
        UserRepository.get_with_preferences = original_get_with_pref
