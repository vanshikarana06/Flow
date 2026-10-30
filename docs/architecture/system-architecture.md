# FLOW - System Architecture

Version: 1.0
Document Type: System Architecture
Status: Draft

---

# 1. Architecture Overview

FLOW is a Personal Productivity Operating System powered by Agentic AI.

The system combines:

- AI Assistant
- Personal Memory
- Smart Calendar
- Intelligent Task Management
- Email Automation
- Approval Workflows
- Verification Engine
- Activity Logging
- Proactive Intelligence

FLOW is designed using a layered architecture to minimize coupling, improve scalability, and simplify future integration with additional tools and services.

---

# 2. High-Level Architecture

```text
┌──────────────────────────────┐
│         User Layer           │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│     Presentation Layer       │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│       Application Layer      │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│          Agent Layer         │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│        Workflow Layer        │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│      Integration Layer       │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│         Data Layer           │
└──────────────────────────────┘
```

---

# 3. Layered Architecture

---

# 3.1 User Layer

Represents users interacting with FLOW.

Supported User Types:

- Students
- Professionals
- Freelancers
- Team Leads
- Event Organizers
- Personal Users

Users communicate through natural language and graphical interfaces.

Examples:

```text
Schedule a meeting with Aditya.

Send project updates.

Create a study plan.

Organize my hackathon tasks.
```

---

# 3.2 Presentation Layer

Provides all UI functionality.

Technology:

```text
Next.js
React
TailwindCSS
ShadCN UI
```

Modules:

### Dashboard

Displays:

- Tasks
- Calendar Events
- Emails
- Alerts
- Notifications

---

### AI Chat

Natural language communication with FLOW.

Examples:

```text
Move tomorrow's tasks.

Send an update email.

Show pending deadlines.
```

---

### Calendar View

Displays:

- Meetings
- Personal Events
- Tasks
- Focus Sessions

---

### Task Manager

Displays:

- Pending Tasks
- Completed Tasks
- Project Tasks
- Study Plans

---

### Approval Center

Displays:

- Email approvals
- Schedule approvals
- Task approvals

---

### Activity Timeline

Displays:

- Executed Actions
- Verification Results
- Approval History

---

### Memory Manager

Allows users to review:

- Stored Contacts
- Preferences
- Relationships
- Important Dates

---

# 3.3 Application Layer

Acts as the entry point for all requests.

Technology:

```text
NestJS
Express
REST APIs
WebSockets
```

Responsibilities:

- Authentication
- Authorization
- Request Validation
- Session Management
- API Routing

---

### API Gateway

Receives:

```text
Frontend Requests

Agent Requests

Dashboard Requests
```

Routes requests to appropriate modules.

---

### Authentication Service

Supports:

```text
Google OAuth

Microsoft OAuth

Magic Links
```

Stores:

```text
Access Tokens

Refresh Tokens

User Sessions
```

---

### Dashboard Service

Aggregates data from:

- Email Module
- Calendar Module
- Task Module

Returns unified dashboard data.

---

# 3.4 Agent Layer

The intelligence layer of FLOW.

Responsible for understanding user requests.

---

## Intent Detection Engine

Converts natural language into structured commands.

Example:

Input:

```text
Send project update to Aditya.
```

Output:

```json
{
  "intent":"SEND_EMAIL",
  "recipient":"Aditya",
  "action":"project update"
}
```

---

## Planning Engine

Builds execution plans.

Example:

```text
Find recipient

Generate email

Request approval

Send email

Verify delivery

Log action
```

---

## Context Engine

Provides context using:

- Historical actions
- User memory
- Active tasks
- Active schedules

---

## Personal Memory Engine

Stores and retrieves:

### People

```text
Aditya
Role: Co-Lead
Email: aditya@example.com
```

---

### Preferences

```text
No meetings before 10 AM

Formal writing style

Maximum 4 meetings per day
```

---

### Life Events

```text
Birthdays

Anniversaries

Exams

Interviews
```

---

## Recommendation Engine

Suggests:

- Schedule improvements
- Deadline warnings
- Follow-up emails
- Task prioritization

---

# 3.5 Workflow Layer

Handles execution governance.

This is FLOW's most important layer.

---

## Approval Engine

Responsible for:

- Creating approval requests
- Managing approval states
- Tracking approval history

Approval States:

```text
Draft

Pending

Approved

Rejected

Expired
```

---

## Execution Engine

Executes approved actions.

Examples:

```text
Send Email

Create Event

Create Task

Update Calendar
```

---

## Verification Engine

Validates action completion.

Examples:

### Email Verification

Check:

```text
Email Exists

Message ID Exists

Provider Accepted Delivery
```

---

### Calendar Verification

Check:

```text
Event Exists

Participants Added

Time Updated
```

---

### Task Verification

Check:

```text
Task Saved

Priority Applied

Status Updated
```

---

## Retry Safety Manager

Prevents duplicate execution.

Scenario:

```text
Email Sent

Network Failure Occurs

Retry Triggered
```

FLOW:

```text
Checks Previous Result

If Already Completed:
Skip Retry

Else:
Retry Safely
```

---

## Activity Logger

Captures:

```text
Action

Timestamp

Parameters

Result

Verification Status
```

---

# 3.6 Integration Layer

Connects FLOW to external services.

---

## LLM Integration Layer

Technology:

```text
LiteLLM
```

Provides abstraction over:

- Ollama
- OpenAI
- Gemini
- Local Models

---

## Local AI Layer

Technology:

```text
Ollama
```

Models:

```text
Qwen 2.5

Llama 3

Mistral

Phi
```

---

## Gmail Integration

Capabilities:

```text
Read Emails

Send Emails

Draft Emails

Search Conversations
```

---

## Google Calendar Integration

Capabilities:

```text
Read Events

Create Events

Modify Events
```

Used for synchronization only.

FLOW maintains its own calendar experience.

---

## Microsoft Graph Integration

Capabilities:

```text
Outlook Mail

Outlook Calendar

Microsoft To Do
```

---

## Notification Integration

Future Support:

```text
Discord

Slack

Microsoft Teams

Telegram
```

---

# 3.7 Data Layer

Responsible for persistence.

Technology:

```text
PostgreSQL

Supabase
```

---

## User Database

Stores:

```text
Users

Profiles

Settings
```

---

## Memory Database

Stores:

```text
Contacts

Relationships

Preferences

Important Dates
```

---

## Task Database

Stores:

```text
Tasks

Projects

Subtasks

Deadlines
```

---

## Calendar Database

Stores:

```text
Events

Schedules

Conflicts

Availability
```

---

## Approval Database

Stores:

```text
Approval Requests

Approval History
```

---

## Activity Database

Stores:

```text
System Actions

Execution Results

Verification Evidence
```

---

# 4. Deployment Architecture

## Frontend

Platform:

```text
Vercel
```

Responsibilities:

```text
User Interface

Dashboard

AI Chat

Calendar

Tasks
```

---

## Backend

Platform:

```text
Render
```

Responsibilities:

```text
Agent Logic

Workflow Management

API Endpoints

Verification Engine
```

---

## AI Server

Platform:

```text
Personal Laptop
```

Components:

```text
LiteLLM

Ollama

Qwen 2.5
```

---

## Tunnel Layer

Technology:

```text
Cloudflare Tunnel
or
Nginx Reverse Proxy
```

Provides secure external access to local AI models.

---

# 5. Complete Request Flow

Example:

User:

```text
Send project status update to my co-lead.
```

FLOW:

### Step 1

Intent Detection

```text
SEND_EMAIL
```

---

### Step 2

Memory Resolution

```text
Co-Lead = Aditya
```

---

### Step 3

Email Generation

```text
Create Draft
```

---

### Step 4

Approval Request

```text
Pending Approval
```

---

### Step 5

User Approves

```text
Status:
Approved
```

---

### Step 6

Execute Gmail API

```text
Send Email
```

---

### Step 7

Verify Result

```text
Email Exists

Message ID Exists
```

---

### Step 8

Write Activity Log

```text
Email Sent

Verified

Timestamp
```

---

# 6. Key Architectural Differentiators

FLOW differs from traditional productivity tools through:

### Human-In-The-Loop Control

All sensitive actions require approval.

---

### Persistent Personal Memory

Remembers people, preferences, and relationships.

---

### Independent Calendar System

Own calendar experience with external synchronization.

---

### Verification-Based Execution

Every action must be verified.

---

### Retry-Safe Operations

Prevents duplicate actions.

---

### Unified Productivity Layer

Combines:

- Email
- Calendar
- Tasks
- Memory
- AI Assistant

within a single platform.

---

# Architecture Summary

FLOW is designed as a layered Agentic AI platform where:

- The Presentation Layer handles user experience.
- The Agent Layer understands intent and plans actions.
- The Workflow Layer governs execution and trust.
- The Integration Layer connects external systems.
- The Data Layer stores long-term knowledge and activity history.

This architecture prioritizes reliability, transparency, modularity, and future extensibility while remaining suitable for a hackathon MVP and scalable toward a production-grade productivity operating system.