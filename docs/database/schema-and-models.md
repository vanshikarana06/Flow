# FLOW - Database Schema & Models

Version: 1.0
Document Type: Database Design
Status: Draft

---

# 1. Database Overview

The FLOW database is the foundation of the platform.

It stores:

- User Information
- Authentication Data
- Personal Memory
- Relationships
- Tasks
- Calendar Events
- Email Metadata
- Approvals
- Execution Logs
- Verification Results
- Activity History

The database is designed around FLOW's core principles:

- Human Approval
- Persistent Memory
- Verification
- Activity Tracking
- Proactive Assistance
- Reliability

---

# 2. Database Technology

## Primary Database

```text
PostgreSQL
```

## Managed Service

```text
Supabase
```

---

# 3. Entity Relationship Overview

```text
User
 │
 ├── Preferences
 │
 ├── Contacts
 │
 ├── Relationships
 │
 ├── Important Events
 │
 ├── Tasks
 │
 ├── Calendar Events
 │
 ├── Emails
 │
 ├── Approvals
 │
 ├── Activity Logs
 │
 └── Execution Logs
```

---

# 4. Core Tables

---

# Users

Stores user accounts.

## Purpose

Identity and account management.

---

## Table

```sql
users
```

---

## Fields

```sql
id UUID PRIMARY KEY

email VARCHAR(255) UNIQUE

full_name VARCHAR(255)

avatar_url TEXT

provider VARCHAR(50)

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Example

```json
{
  "id":"u1",
  "email":"john@example.com",
  "full_name":"John Doe"
}
```

---

# Preferences

Stores user preferences.

---

## Purpose

Personalize FLOW's behavior.

---

## Table

```sql
preferences
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

key VARCHAR(100)

value JSONB

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Examples

```json
{
  "key":"meeting_start_time",
  "value":"10:00"
}
```

```json
{
  "key":"writing_style",
  "value":"formal"
}
```

---

# Contacts

Stores known people.

---

## Purpose

Relationship management.

---

## Table

```sql
contacts
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

name VARCHAR(255)

email VARCHAR(255)

phone VARCHAR(50)

organization VARCHAR(255)

notes TEXT

created_at TIMESTAMP
```

---

## Example

```json
{
  "name":"Aditya",
  "email":"aditya@gmail.com"
}
```

---

# Relationships

Stores relationship mappings.

---

## Purpose

Allows natural language references.

Example:

```text
My Co-Lead

My Manager

My Mentor

My Client
```

---

## Table

```sql
relationships
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

contact_id UUID

relationship_label VARCHAR(100)

created_at TIMESTAMP
```

---

## Example

```json
{
  "relationship_label":"Co Lead"
}
```

---

# Important Events

Stores life events.

---

## Purpose

Reminders and proactive alerts.

---

## Table

```sql
important_events
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

title VARCHAR(255)

event_type VARCHAR(100)

event_date DATE

notes TEXT

created_at TIMESTAMP
```

---

## Examples

```text
Birthday

Anniversary

Exam

Interview

Hackathon
```

---

# Tasks

Stores user tasks.

---

## Purpose

Task management.

---

## Table

```sql
tasks
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

title VARCHAR(255)

description TEXT

priority VARCHAR(50)

status VARCHAR(50)

task_type VARCHAR(100)

due_date TIMESTAMP

estimated_duration INTEGER

parent_task_id UUID

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Task Types

```text
Quick Task

Project Task

Study Task

Event Task
```

---

## Status

```text
Pending

In Progress

Completed

Cancelled
```

---

# Task Subtasks

---

## Purpose

Stores hierarchical task breakdowns.

---

## Table

```sql
task_subtasks
```

---

## Fields

```sql
id UUID PRIMARY KEY

task_id UUID

title VARCHAR(255)

status VARCHAR(50)

order_number INTEGER
```

---

# Calendar Events

Stores events managed by FLOW.

---

## Purpose

Internal calendar management.

---

## Table

```sql
calendar_events
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

title VARCHAR(255)

description TEXT

start_time TIMESTAMP

end_time TIMESTAMP

event_type VARCHAR(100)

status VARCHAR(50)

external_provider VARCHAR(100)

external_id VARCHAR(255)

created_at TIMESTAMP
```

---

## Event Types

```text
Meeting

Birthday

Exam

Interview

Reminder

Study Session

Focus Block
```

---

# Calendar Participants

---

## Purpose

Meeting attendee management.

---

## Table

```sql
calendar_participants
```

---

## Fields

```sql
id UUID PRIMARY KEY

event_id UUID

contact_id UUID

attendance_status VARCHAR(50)
```

---

# Email Metadata

Stores email references.

---

## Purpose

Email search and tracking.

---

## Table

```sql
email_metadata
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

provider VARCHAR(50)

message_id VARCHAR(255)

thread_id VARCHAR(255)

subject VARCHAR(255)

sender_email VARCHAR(255)

received_at TIMESTAMP
```

---

# Email Summaries

---

## Purpose

AI-generated email summaries.

---

## Table

```sql
email_summaries
```

---

## Fields

```sql
id UUID PRIMARY KEY

email_id UUID

summary TEXT

generated_at TIMESTAMP
```

---

# Email Action Items

---

## Purpose

Stores extracted tasks from emails.

---

## Table

```sql
email_action_items
```

---

## Fields

```sql
id UUID PRIMARY KEY

email_id UUID

task_id UUID

confidence_score NUMERIC
```

---

# Approvals

Stores pending approvals.

---

## Purpose

Human-in-the-loop workflow.

---

## Table

```sql
approvals
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

action_type VARCHAR(100)

action_payload JSONB

status VARCHAR(50)

approval_reason TEXT

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Status

```text
Pending

Approved

Rejected

Expired
```

---

# Execution Logs

Stores execution details.

---

## Purpose

Auditability and retry safety.

---

## Table

```sql
execution_logs
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

approval_id UUID

action_type VARCHAR(100)

execution_status VARCHAR(50)

provider VARCHAR(50)

provider_response JSONB

executed_at TIMESTAMP
```

---

## Status

```text
Pending

Executing

Completed

Failed
```

---

# Verification Logs

Stores verification results.

---

## Purpose

Proof that actions succeeded.

---

## Table

```sql
verification_logs
```

---

## Fields

```sql
id UUID PRIMARY KEY

execution_log_id UUID

verification_type VARCHAR(100)

verification_status VARCHAR(50)

evidence JSONB

verified_at TIMESTAMP
```

---

## Examples

```text
Email Sent

Meeting Created

Task Saved
```

---

# Activity Logs

Stores all user-visible activity.

---

## Purpose

Timeline and audit history.

---

## Table

```sql
activity_logs
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

activity_type VARCHAR(100)

title VARCHAR(255)

description TEXT

reference_id UUID

created_at TIMESTAMP
```

---

# Notifications

Stores alerts.

---

## Purpose

Proactive intelligence.

---

## Table

```sql
notifications
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

title VARCHAR(255)

message TEXT

notification_type VARCHAR(100)

read BOOLEAN

created_at TIMESTAMP
```

---

## Types

```text
Deadline Alert

Conflict Alert

Birthday Reminder

Follow-up Reminder

Approval Request
```

---

# AI Memory Records

Stores long-term memory.

---

## Purpose

Persistent AI context.

---

## Table

```sql
memory_records
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

memory_type VARCHAR(100)

memory_key VARCHAR(255)

memory_value JSONB

confidence_score NUMERIC

created_at TIMESTAMP

updated_at TIMESTAMP
```

---

## Examples

```text
Aditya is my co-lead

Prefer formal writing

No meetings before 10 AM

Dad's birthday: April 12
```

---

# Dashboard Cache

Used for quick dashboard loading.

---

## Table

```sql
dashboard_cache
```

---

## Fields

```sql
id UUID PRIMARY KEY

user_id UUID

cache_data JSONB

generated_at TIMESTAMP
```

---

# 5. Important Relationships

```text
User
 ├── Preferences
 ├── Contacts
 ├── Relationships
 ├── Important Events
 ├── Tasks
 ├── Calendar Events
 ├── Emails
 ├── Approvals
 ├── Activity Logs
 ├── Notifications
 └── Memory Records
```

---

# 6. Indexing Strategy

## High Priority Indexes

```sql
users.email

contacts.email

tasks.user_id

tasks.due_date

calendar_events.user_id

calendar_events.start_time

approvals.user_id

approvals.status

activity_logs.user_id

notifications.user_id
```

---

# 7. MVP Tables (Hackathon Scope)

Required Tables:

```text
users

preferences

contacts

relationships

tasks

calendar_events

approvals

execution_logs

verification_logs

activity_logs

memory_records
```

---

# 8. Future Tables

Planned for future versions:

```text
teams

projects

workspaces

shared_calendars

voice_transcripts

knowledge_base

custom_ai_agents
```

---

# Database Design Principles

FLOW's database is designed around:

✅ Persistent Personal Memory

✅ Human Approval Workflows

✅ Verification-Based Execution

✅ Activity Auditing

✅ Smart Scheduling

✅ Extensible Agent Architecture

The schema ensures that every action can be planned, approved, executed, verified, logged, and later explained to the user.