"""init flow core database schema

Revision ID: 20261030_000000
Revises: 
Create Date: 2026-10-30 23:59:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

revision: str = '20261030_000000'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "vector"')

    # 2. Users Table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # 3. Preferences Table
    op.create_table(
        'preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('work_start_time', sa.String(20), server_default='09:00:00', nullable=False),
        sa.Column('work_end_time', sa.String(20), server_default='18:00:00', nullable=False),
        sa.Column('max_daily_meetings', sa.Integer(), server_default='4', nullable=False),
        sa.Column('meeting_buffer_minutes', sa.Integer(), server_default='15', nullable=False),
        sa.Column('communication_tone', sa.String(50), server_default='friendly_formal', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 4. Connected Accounts Table
    op.create_table(
        'connected_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('account_email', sa.String(255), nullable=False),
        sa.Column('access_token_encrypted', sa.String(), nullable=False),
        sa.Column('refresh_token_encrypted', sa.String(), nullable=False),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('scopes', sa.ARRAY(sa.String()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.UniqueConstraint('user_id', 'provider', 'account_email', name='uq_user_provider_account')
    )
    op.create_index('idx_connected_accounts_user_id', 'connected_accounts', ['user_id'])

    # 5. Contacts Table
    op.create_table(
        'contacts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('role', sa.String(100), nullable=True),
        sa.Column('organization', sa.String(150), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_contacts_user_id', 'contacts', ['user_id'])

    # 6. Relationships Table
    op.create_table(
        'relationships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('contact_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('relation_type', sa.String(100), nullable=False),
        sa.Column('closeness_score', sa.Integer(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_relationships_user_id', 'relationships', ['user_id'])
    op.create_index('idx_relationships_contact_id', 'relationships', ['contact_id'])

    # 7. Memory Records (pgvector)
    op.create_table(
        'memory_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('embedding', Vector(1536), nullable=True),
        sa.Column('confidence_score', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('observed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_memory_records_user_id', 'memory_records', ['user_id'])
    op.create_index('idx_memory_records_category', 'memory_records', ['category'])

    # 8. Tasks Table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('task_type', sa.String(50), server_default='QUICK', nullable=False),
        sa.Column('priority', sa.String(20), server_default='MEDIUM', nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_slot_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_slot_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(50), server_default='PENDING', nullable=False),
        sa.Column('source_email_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_status', 'tasks', ['status'])

    # 9. Subtasks Table
    op.create_table(
        'subtasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('completed', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='0', nullable=False),
    )
    op.create_index('idx_subtasks_task_id', 'subtasks', ['task_id'])

    # 10. Calendar Events Table
    op.create_table(
        'calendar_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_focus_block', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('external_provider', sa.String(50), server_default='FLOW_NATIVE', nullable=False),
        sa.Column('external_event_id', sa.String(255), nullable=True),
        sa.Column('sync_status', sa.String(50), server_default='IN_SYNC', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_calendar_events_user_id', 'calendar_events', ['user_id'])
    op.create_index('idx_calendar_events_time_range', 'calendar_events', ['start_time', 'end_time'])

    # 11. Agent Plans Table
    op.create_table(
        'agent_plans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('intent', sa.String(100), nullable=False),
        sa.Column('plan_json', postgresql.JSONB(), nullable=False),
        sa.Column('status', sa.String(50), server_default='DRAFT', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_agent_plans_user_id', 'agent_plans', ['user_id'])

    # 12. Approvals Table
    op.create_table(
        'approvals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('agent_plans.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action_type', sa.String(100), nullable=False),
        sa.Column('target_service', sa.String(50), nullable=False),
        sa.Column('proposed_payload', postgresql.JSONB(), nullable=False),
        sa.Column('modified_payload', postgresql.JSONB(), nullable=True),
        sa.Column('status', sa.String(50), server_default='PENDING', nullable=False),
        sa.Column('idempotency_key', sa.String(255), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_approvals_idempotency_key', 'approvals', ['idempotency_key'], unique=True)
    op.create_index('idx_approvals_user_id', 'approvals', ['user_id'])

    # 13. Execution Logs Table
    op.create_table(
        'execution_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('approval_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('approvals.id', ondelete='SET NULL'), unique=True, nullable=True),
        sa.Column('action_name', sa.String(100), nullable=False),
        sa.Column('target_service', sa.String(50), nullable=False),
        sa.Column('payload', postgresql.JSONB(), nullable=False),
        sa.Column('status_code', sa.Integer(), nullable=False),
        sa.Column('raw_response', postgresql.JSONB(), nullable=False),
        sa.Column('executed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_execution_logs_user_id', 'execution_logs', ['user_id'])

    # 14. Verification Logs Table
    op.create_table(
        'verification_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('approval_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('approvals.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('external_resource_id', sa.String(255), nullable=True),
        sa.Column('proof_hash', sa.String(255), nullable=False),
        sa.Column('verification_evidence', postgresql.JSONB(), nullable=False),
        sa.Column('verified_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_verification_logs_approval_id', 'verification_logs', ['approval_id'])

    # 15. Activity Logs Table
    op.create_table(
        'activity_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('log_type', sa.String(50), nullable=False),
        sa.Column('action_name', sa.String(100), nullable=False),
        sa.Column('details', postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_activity_logs_user_id', 'activity_logs', ['user_id'])

def downgrade() -> None:
    op.drop_table('activity_logs')
    op.drop_table('verification_logs')
    op.drop_table('execution_logs')
    op.drop_table('approvals')
    op.drop_table('agent_plans')
    op.drop_table('calendar_events')
    op.drop_table('subtasks')
    op.drop_table('tasks')
    op.drop_table('memory_records')
    op.drop_table('relationships')
    op.drop_table('contacts')
    op.drop_table('connected_accounts')
    op.drop_table('preferences')
    op.drop_table('users')

