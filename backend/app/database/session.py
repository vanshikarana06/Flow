from typing import AsyncGenerator
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import get_settings

def clean_async_db_url(raw_url: str) -> str:
    if raw_url.startswith("postgresql://"):
        raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    url = make_url(raw_url)
    query = dict(url.query)
    # Strip parameters unsupported by asyncpg driver (e.g. schema=public from Supabase/Prisma)
    query.pop("schema", None)
    if "sslmode" in query:
        query["ssl"] = query.pop("sslmode")
    return url.set(query=query).render_as_string(hide_password=False)

settings = get_settings()
db_url = clean_async_db_url(settings.DATABASE_URL)

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

