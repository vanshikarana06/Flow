from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.core.exceptions import FlowException
from app.jobs.scheduler import get_scheduler
from app.agents.tools.tool_registry import get_tool_registry
from app.agents.tools.calendar_tool import CalendarTool
from app.agents.tools.email_tool import EmailTool
from app.agents.tools.task_tool import TaskTool
from app.agents.tools.memory_tool import MemoryTool
from app.agents.tools.approval_tool import ApprovalTool

from app.auth.router import router as auth_router
from app.agents.router import router as agents_router
from app.trust.router import trust_router
from app.memory.router import router as memory_router
from app.tasks.router import router as tasks_router
from app.calendar.router import router as calendar_router
from app.email.router import router as email_router
from app.dashboard.router import router as dashboard_router
from app.notifications.router import router as notifications_router
from app.workflows.router import router as workflows_router
from app.websocket.router import router as websocket_router

settings = get_settings()
setup_logging()
logger = logging.getLogger("flow.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FLOW Agentic AI Personal Productivity Operating System...")

    # 1. Register Core Agent Tools in Registry (MCP-Ready)
    registry = get_tool_registry()
    registry.register(CalendarTool())
    registry.register(EmailTool())
    registry.register(TaskTool())
    registry.register(MemoryTool())
    registry.register(ApprovalTool())
    logger.info(f"Loaded {len(registry.list_tools())} MCP-ready tools into Tool Registry.")

    # 2. Start Proactive Background Jobs Scheduler (APScheduler)
    scheduler = get_scheduler()
    scheduler.start()

    yield

    # Teardown
    logger.info("Shutting down FLOW Agentic OS...")
    scheduler.shutdown()

app = FastAPI(
    title="FLOW — Agentic AI Personal Productivity Operating System",
    description="Python-first Agentic AI Platform coordinating Email, Calendar, and Tasks with Approval & Verification.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(FlowException)
async def flow_exception_handler(request: Request, exc: FlowException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
    )

# Include Routers under /api/v1
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(agents_router, prefix=api_v1_prefix)
app.include_router(trust_router, prefix=api_v1_prefix)
app.include_router(memory_router, prefix=api_v1_prefix)
app.include_router(tasks_router, prefix=api_v1_prefix)
app.include_router(calendar_router, prefix=api_v1_prefix)
app.include_router(email_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(notifications_router, prefix=api_v1_prefix)
app.include_router(workflows_router, prefix=api_v1_prefix)

# Include WebSocket Router
app.include_router(websocket_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.APP_NAME,
        "runtime": "Python 3.12 / FastAPI / SQLAlchemy 2.0 / pgvector",
        "agent_tools_count": len(get_tool_registry().list_tools()),
    }
