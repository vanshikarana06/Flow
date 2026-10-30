# FLOW - Backend Setup & APIs

Version: 1.0
Document Type: Backend Architecture & API Specification
Status: Draft

---

# 1. Backend Overview

The FLOW backend serves as the central orchestration layer responsible for:

- User Authentication
- Agent Execution
- Workflow Management
- Approval Management
- Verification Operations
- Task Management
- Calendar Management
- Email Management
- Memory Management
- Activity Logging

The backend acts as the bridge between:

```text
Frontend
↓
FLOW Core Services
↓
AI Models
↓
External Providers
↓
Database
```

---

# 2. Technology Stack

## Core Backend

```text
Node.js
NestJS
TypeScript
```

Reason:

- Scalable
- Modular
- Type-safe
- Rapid hackathon development

---

## Database

```text
PostgreSQL

Supabase
```

Used for:

- User Data
- Memory Storage
- Tasks
- Calendar
- Logs
- Approvals

---

## AI Layer

```text
LiteLLM
Ollama
Qwen2.5
Llama 3
```

Purpose:

- Intent Detection
- Planning
- Reasoning
- Email Generation
- Task Breakdown

---

## External Integrations

```text
Google Gmail API

Google Calendar API

Microsoft Graph API

Microsoft To Do API
```

---

## Deployment

```text
Render
```

Responsibilities:

- API Hosting
- Workflow Engine
- Agent Orchestration
- Authentication

---

# 3. Backend Architecture

```text
src
│
├── auth
│
├── users
│
├── dashboard
│
├── agent
│
├── approvals
│
├── activities
│
├── memory
│
├── calendar
│
├── tasks
│
├── email
│
├── workflow
│
├── verification
│
├── integrations
│
├── notifications
│
├── database
│
└── shared
```

---

# 4. Core Backend Modules

---

# 4.1 Authentication Module

Purpose:

Manage user access and connected accounts.

---

## Responsibilities

- Login
- Registration
- OAuth Authentication
- Session Management
- Token Refresh

---

## Supported Providers

```text
Google OAuth

Microsoft OAuth
```

---

# 4.2 User Module

Purpose:

Manage users.

---

## Stores

```text
Profile

Settings

Preferences

Subscription
```

---

# 4.3 Agent Module

Purpose:

The intelligence layer.

---

## Components

### Intent Detector

Converts:

```text
Send a project update to Aditya.
```

into

```json
{
  "intent": "SEND_EMAIL"
}
```

---

### Planner

Converts intent into action plans.

Example:

```text
Find recipient

Generate email

Request approval

Send email

Verify result

Save activity
```

---

### Context Manager

Provides:

```text
Memory

Tasks

Calendar

Contacts

Preferences
```

to the AI.

---

# 4.4 Memory Module

Purpose:

Provides persistent memory.

---

## Memory Types

### Contact Memory

```text
Name

Email

Role
```

---

### Relationship Memory

```text
Co Lead

Manager

Friend

Client
```

---

### Preference Memory

```text
Work Hours

Meeting Preferences

Communication Style
```

---

### Event Memory

```text
Birthdays

Anniversaries

Exams

Interviews
```

---

# 4.5 Email Module

Purpose:

Manages all email actions.

---

## Features

### Read Emails

### Draft Emails

### Send Emails

### Search Emails

### Summarize Emails

### Follow-Up Analysis

---

## Integrations

```text
Gmail API

Microsoft Graph
```

---

# 4.6 Task Module

Purpose:

Task creation and management.

---

## Supported Task Types

### Quick Task

```text
Buy Milk
```

---

### Project Task

```text
Build FLOW
```

---

### Study Plan

```text
Learn React
```

---

### Event Task

```text
Hackathon Planning
```

---

## Capabilities

- Create Task
- Update Task
- Complete Task
- Delete Task
- Schedule Task
- Prioritize Task

---

# 4.7 Calendar Module

Purpose:

FLOW Calendar Management.

---

## Features

### Create Event

### Update Event

### Delete Event

### Reschedule Event

### Detect Conflict

### Create Focus Session

### Reminder Creation

---

## Event Types

```text
Meeting

Birthday

Exam

Interview

Deadline

Personal Event
```

---

# 4.8 Approval Module

Purpose:

Human-in-the-loop control.

---

## Approval Required For

### Send Email

### Create Meeting

### Reschedule Meeting

### Delete Task

### Bulk Operations

---

## Approval States

```text
Draft

Pending

Approved

Rejected

Expired
```

---

# 4.9 Verification Module

Purpose:

Verify external actions.

---

## Email Verification

Checks:

```text
Email Sent

Message ID Exists

Provider Accepted
```

---

## Calendar Verification

Checks:

```text
Event Exists

Attendees Added

Time Updated
```

---

## Task Verification

Checks:

```text
Task Stored

Changes Persisted
```

---

# 4.10 Activity Module

Purpose:

Audit trail.

---

## Stores

```text
Action

Status

Timestamp

Verification Result

User
```

---

# 5. API Architecture

```text
/v1/auth

/v1/users

/v1/dashboard

/v1/agent

/v1/tasks

/v1/calendar

/v1/emails

/v1/memory

/v1/approvals

/v1/activities
```

---

# 6. Authentication APIs

---

## Login

```http
POST /v1/auth/login
```

---

### Response

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## Logout

```http
POST /v1/auth/logout
```

---

## Current User

```http
GET /v1/auth/me
```

---

# 7. Agent APIs

---

## Chat With FLOW

```http
POST /v1/agent/chat
```

### Request

```json
{
  "message": "Send project update to Aditya"
}
```

---

### Response

```json
{
  "planId": "123",
  "intent": "SEND_EMAIL",
  "requiresApproval": true
}
```

---

## Generate Plan

```http
POST /v1/agent/plan
```

---

## Execute Plan

```http
POST /v1/agent/execute
```

---

# 8. Email APIs

---

## Get Emails

```http
GET /v1/emails
```

---

## Search Emails

```http
GET /v1/emails/search
```

---

## Draft Email

```http
POST /v1/emails/draft
```

---

## Send Email

```http
POST /v1/emails/send
```

Approval required.

---

## Summarize Thread

```http
POST /v1/emails/summarize
```

---

# 9. Task APIs

---

## Get Tasks

```http
GET /v1/tasks
```

---

## Create Task

```http
POST /v1/tasks
```

---

## Update Task

```http
PATCH /v1/tasks/:id
```

---

## Complete Task

```http
PATCH /v1/tasks/:id/complete
```

---

## Delete Task

```http
DELETE /v1/tasks/:id
```

---

# 10. Calendar APIs

---

## Get Events

```http
GET /v1/calendar/events
```

---

## Create Event

```http
POST /v1/calendar/event
```

---

## Update Event

```http
PATCH /v1/calendar/event/:id
```

---

## Delete Event

```http
DELETE /v1/calendar/event/:id
```

---

## Detect Conflicts

```http
POST /v1/calendar/conflicts
```

---

## Generate Schedule

```http
POST /v1/calendar/optimize
```

---

# 11. Memory APIs

---

## Get Memory

```http
GET /v1/memory
```

---

## Add Contact

```http
POST /v1/memory/contact
```

---

## Add Relationship

```http
POST /v1/memory/relationship
```

---

## Save Preference

```http
POST /v1/memory/preference
```

---

## Add Important Date

```http
POST /v1/memory/event
```

---

# 12. Approval APIs

---

## Get Pending Approvals

```http
GET /v1/approvals
```

---

## Approve Action

```http
POST /v1/approvals/:id/approve
```

---

## Reject Action

```http
POST /v1/approvals/:id/reject
```

---

## Modify Action

```http
POST /v1/approvals/:id/modify
```

---

# 13. Dashboard APIs

---

## Dashboard Summary

```http
GET /v1/dashboard
```

Response includes:

- Tasks
- Events
- Emails
- Alerts
- Approvals

---

## Dashboard Notifications

```http
GET /v1/dashboard/notifications
```

---

## Dashboard Activity Feed

```http
GET /v1/dashboard/activity
```

---

# 14. Activity APIs

---

## Get Activity Logs

```http
GET /v1/activities
```

---

## Action Details

```http
GET /v1/activities/:id
```

---

## Verification Details

```http
GET /v1/activities/:id/verification
```

---

# 15. Realtime Events (WebSockets)

Purpose:

Push live updates to frontend.

---

## Channel Types

```text
approvals

activities

tasks

calendar

notifications
```

---

## Events

```text
approval.created

approval.updated

task.created

task.updated

calendar.conflict

verification.completed

email.sent
```

---

# 16. Future APIs

Planned:

```text
Slack Integration

Discord Integration

Telegram Integration

WhatsApp Integration

Voice Agent API

External Plugin System

MCP Tool Integration
```

---

# Backend Summary

The FLOW backend is responsible for orchestration, execution, approval, verification, memory management, and integration with external providers.

It follows a modular architecture where:

- Agent Module makes decisions.
- Workflow Module controls execution.
- Approval Module protects users.
- Verification Module confirms results.
- Integration Modules connect external services.
- Activity Module maintains complete auditability.

This design provides scalability, transparency, reliability, and maintainability while remaining suitable for rapid hackathon development.