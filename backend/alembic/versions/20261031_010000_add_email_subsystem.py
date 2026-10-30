"""add email subsystem tables

Revision ID: 20261031_010000
Revises: 20261030_000000
Create Date: 2026-10-31 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20261031_010000"
down_revision = "20261030_000000"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create Enums idempotently if they don't exist
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE emaildirection AS ENUM ('INBOUND', 'OUTBOUND');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE draftstatus AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE deliverystatus AS ENUM ('PENDING', 'DELIVERED', 'FAILED');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # 2. Table: email_threads
    op.create_table(
        "email_threads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("subject", sa.String(500), nullable=False),
        sa.Column("snippet", sa.String(500), nullable=True),
        sa.Column("message_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("has_attachments", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_email_threads_user_id", "email_threads", ["user_id"])
    op.create_index("idx_email_threads_last_message", "email_threads", ["user_id", "last_message_at"])

    # 3. Table: email_messages
    op.create_table(
        "email_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("thread_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("email_threads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("direction", postgresql.ENUM("INBOUND", "OUTBOUND", name="emaildirection", create_type=False), nullable=False),
        sa.Column("message_id_header", sa.String(255), nullable=True),
        sa.Column("in_reply_to_header", sa.String(255), nullable=True),
        sa.Column("references_header", sa.Text(), nullable=True),
        sa.Column("sender_email", sa.String(255), nullable=False),
        sa.Column("sender_name", sa.String(255), nullable=True),
        sa.Column("recipient_to", postgresql.JSONB(), nullable=False),
        sa.Column("recipient_cc", postgresql.JSONB(), nullable=True),
        sa.Column("recipient_bcc", postgresql.JSONB(), nullable=True),
        sa.Column("subject", sa.String(500), nullable=False),
        sa.Column("body_plain", sa.Text(), nullable=False),
        sa.Column("body_html", sa.Text(), nullable=True),
        sa.Column("raw_headers", postgresql.JSONB(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_email_messages_thread_id", "email_messages", ["thread_id"])
    op.create_index("idx_email_messages_user_id", "email_messages", ["user_id"])
    op.create_index("idx_email_messages_message_id_header", "email_messages", ["message_id_header"])
    op.create_index("idx_email_messages_received_at", "email_messages", ["received_at"])

    # 4. Table: email_drafts
    op.create_table(
        "email_drafts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("thread_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("email_threads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_plan_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agent_plans.id", ondelete="SET NULL"), nullable=True),
        sa.Column("recipient_to", postgresql.JSONB(), nullable=False),
        sa.Column("recipient_cc", postgresql.JSONB(), nullable=True),
        sa.Column("recipient_bcc", postgresql.JSONB(), nullable=True),
        sa.Column("subject", sa.String(500), nullable=False),
        sa.Column("body_plain", sa.Text(), nullable=False),
        sa.Column("body_html", sa.Text(), nullable=True),
        sa.Column("status", postgresql.ENUM("DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "SENT", name="draftstatus", create_type=False), nullable=False, server_default="DRAFT"),
        sa.Column("idempotency_key", sa.String(64), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_email_drafts_user_id", "email_drafts", ["user_id"])
    op.create_index("idx_email_drafts_thread_id", "email_drafts", ["thread_id"])
    op.create_index("idx_email_drafts_status", "email_drafts", ["status"])
    op.create_index("idx_email_drafts_idempotency", "email_drafts", ["idempotency_key"])

    # 5. Table: email_attachments
    op.create_table(
        "email_attachments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("message_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("email_messages.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("content_type", sa.String(128), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("storage_path", sa.String(1024), nullable=False),
        sa.Column("content_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_email_attachments_message_id", "email_attachments", ["message_id"])

    # 6. Table: email_delivery_logs
    op.create_table(
        "email_delivery_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("draft_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("email_drafts.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("message_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("email_messages.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("endpoint_url", sa.String(1024), nullable=False),
        sa.Column("http_status", sa.Integer(), nullable=False),
        sa.Column("delivery_status", postgresql.ENUM("PENDING", "DELIVERED", "FAILED", name="deliverystatus", create_type=False), nullable=False, server_default="PENDING"),
        sa.Column("gmail_message_id", sa.String(255), nullable=True),
        sa.Column("gmail_thread_id", sa.String(255), nullable=True),
        sa.Column("response_payload", postgresql.JSONB(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_email_delivery_logs_user_id", "email_delivery_logs", ["user_id"])
    op.create_index("idx_email_delivery_logs_draft_id", "email_delivery_logs", ["draft_id"])

def downgrade() -> None:
    op.drop_table("email_delivery_logs")
    op.drop_table("email_attachments")
    op.drop_table("email_drafts")
    op.drop_table("email_messages")
    op.drop_table("email_threads")
    op.execute("DROP TYPE IF EXISTS deliverystatus")
    op.execute("DROP TYPE IF EXISTS draftstatus")
    op.execute("DROP TYPE IF EXISTS emaildirection")

