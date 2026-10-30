from fastapi import APIRouter
from app.trust.approvals.router import router as approvals_router
from app.trust.verification.router import router as verification_router
from app.trust.activities.router import router as activities_router

trust_router = APIRouter(prefix="/trust", tags=["Trust & Governance Layer"])

trust_router.include_router(approvals_router)
trust_router.include_router(verification_router)
trust_router.include_router(activities_router)
