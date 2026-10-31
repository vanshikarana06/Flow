import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.core.config import get_settings
from app.database.base import Base
from app.database.session import clean_async_db_url
import app.database.models  # Ensure all models are registered in Base.metadata

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()

# Prefer DIRECT_URL (port 5432) for DDL / migrations if provided and non-default, otherwise DATABASE_URL (port 6543)
target_raw_url = (
    settings.DIRECT_URL
    if (settings.DIRECT_URL and "localhost" not in settings.DIRECT_URL and "example" not in settings.DIRECT_URL)
    else settings.DATABASE_URL
)
db_url = clean_async_db_url(target_raw_url)

# Escape '%' for configparser interpolation to support percent-encoded passwords
config.set_main_option("sqlalchemy.url", db_url.replace("%", "%%"))

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    # Use create_async_engine directly to guarantee statement_cache_size=0 on PgBouncer pooler (port 6543)
    connectable = create_async_engine(
        db_url,
        poolclass=pool.NullPool,
        connect_args={
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
            "prepared_statement_name_func": lambda: "",
        },
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
