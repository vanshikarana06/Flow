# FLOW — Backend Setup & API Specifications

**Version:** 1.0  
**Document Type:** Backend Architecture & API Specification  
**Status:** Approved Architecture  
**Runtime:** Node.js 20+ / NestJS  
**Deployment Platform:** Render  

---

## 1. Overview

The FLOW backend is an enterprise-structured, modular API service built using **NestJS** and **TypeScript**, deployed on **Render**. It orchestrates the core agent reasoning pipelines, manages the Human-in-the-Loop approval workflows, executes verified mutations across external APIs (Microsoft Graph, Gmail, Google Calendar), and persists data in **Supabase (PostgreSQL + pgvector)**.

---

## 2. Backend Module Architecture

The backend implements the 10 major modules mandated by the FLOW System Architecture Source of Truth.

### Backend Module Diagram

```mermaid
flowchart TD
    subgraph NestApp ["NestJS Application Module (AppModule)"]
        AuthModule["1. AuthModule\n(OAuth2, JWT, PKCE, Tokens)"]
        AgentModule["2. AgentModule\n(Planner, Orchestration, Tool Calls)"]
        MemoryModule["3. MemoryModule\n(5 Memory Types, pgvector Search)"]
        EmailModule["4. EmailModule\n(Drafts, Summaries, Follow-ups)"]
        CalendarModule["5. CalendarModule\n(FLOW Calendar, Sync, Conflicts)"]
        TasksModule["6. TasksModule\n(Breakdown, Priorities, Study/Project)"]
        ApprovalsModule["7. ApprovalsModule\n(Approve, Reject, Modify State Machine)"]
        VerificationModule["8. VerificationModule\n(Evidence Check, Idempotency)"]
        ActivitiesModule["9. ActivitiesModule\n(Activity Ledger, Audit Logs)"]
        DashboardModule["10. DashboardModule\n(Unified Overview & Proactive Alerts)"]
    end

    subgraph DataIntegrations ["Infrastructure & Integrations"]
        SupabasePostgres[("Supabase PostgreSQL\n+ pgvector")]
        LocalAI["LiteLLM / Ollama Qwen 2.5\n(Cloudflare Tunnel)"]
        MSGraphAPI["Microsoft Graph API"]
        GoogleAPIs["Gmail & Google Calendar APIs"]
    end

    AgentModule <--> LocalAI
    AgentModule --> MemoryModule
    AgentModule --> ApprovalsModule
    ApprovalsModule --> EmailModule
    ApprovalsModule --> CalendarModule
    ApprovalsModule --> TasksModule

    EmailModule --> MSGraphAPI
    EmailModule --> GoogleAPIs
    CalendarModule --> MSGraphAPI
    CalendarModule --> GoogleAPIs
    TasksModule --> MSGraphAPI

    EmailModule --> VerificationModule
    CalendarModule --> VerificationModule
    TasksModule --> VerificationModule

    VerificationModule --> ActivitiesModule
    ApprovalsModule --> ActivitiesModule

    AllModules[All Modules] -.-> SupabasePostgres
```

---

## 3. API Layer Architecture

The API layer manages client request ingress, authentication guards, input validation pipes, and real-time WebSocket events.

### API Layer Architecture Diagram

```mermaid
flowchart LR
    subgraph Client ["Client Layer (Next.js / Vercel)"]
        RESTClient["HTTP REST Client\n(TanStack Query)"]
        WSClient["WebSocket Client\n(Socket.io / WS)"]
    end

    subgraph APILayer ["NestJS API Layer"]
        CORS["CORS & Rate Limiter Guard"]
        AuthGuard["JWT / OAuth2 AuthGuard"]
        ValidationPipe["Class-Validator Pipes"]
        Interceptors["Logging & Transform Interceptors"]
        Controllers["REST & WebSocket Controllers"]
    end

    subgraph ServiceLayer ["Service & Domain Logic Layer"]
        Services["Domain Services (Agent, Approvals, Memory, etc.)"]
    end

    RESTClient -- "HTTPS Requests" --> CORS
    WSClient -- "WSS Connections" --> CORS
    CORS --> AuthGuard
    AuthGuard --> ValidationPipe
    ValidationPipe --> Interceptors
    Interceptors --> Controllers
    Controllers --> Services
```

---

## 4. Service Communication Diagram

Illustrates the decoupled event-driven and procedural interactions between backend services during a coordinated productivity request.

### Service Communication Diagram

```mermaid
sequenceDiagram
    autonumber
    participant UI as Next.js Client
    participant Dash as DashboardController
    participant Agent as AgentService
    participant Mem as MemoryService
    participant LLM as LiteLLMClient (Qwen 2.5)
    participant Appr as ApprovalsService
    participant Mail as EmailService
    participant Verif as VerificationService
    participant Act as ActivitiesService

    UI->>Agent: POST /api/agent/dispatch (prompt)
    Agent->>Mem: Query Contact & Preferences (Aditya)
    Mem-->>Agent: Contact & Preference Context
    Agent->>LLM: Formulate Execution Plan & Email Draft
    LLM-->>Agent: Plan: [SEND_EMAIL, verify]
    
    Agent->>Appr: createPendingApproval(payload)
    Appr-->>UI: WebSocket Event: 'approval.pending'
    
    UI->>Appr: POST /api/approvals/:id/action { action: 'APPROVE' }
    Appr->>Mail: sendEmail(payload)
    Mail->>Mail: Call Microsoft Graph / Gmail
    Mail-->>Appr: Provider Response (202 Accepted, MessageID)
    
    Appr->>Verif: verifyAction(MessageID, SentFolderCheck)
    Verif-->>Appr: Verification Status: VERIFIED
    
    Appr->>Act: logActivity(Execution, Approval, Verification)
    Act-->>UI: WebSocket Event: 'activity.recorded'
    Appr-->>UI: Return HTTP 200 { status: 'COMPLETED_AND_VERIFIED' }
```

---

## 5. Comprehensive REST API Specifications

### 5.1 Authentication Module (`/api/auth`)
- `POST /api/auth/login/google` — Initiates Google OAuth2 PKCE flow.
- `GET /api/auth/callback/google` — Exchanges code for tokens and issues session JWT.
- `POST /api/auth/login/microsoft` — Initiates Microsoft 365 OAuth2 code flow.
- `GET /api/auth/callback/microsoft` — Exchanges code for Microsoft Graph tokens.
- `POST /api/auth/refresh` — Refreshes access tokens using stored refresh tokens.
- `GET /api/auth/me` — Returns current authenticated user profile and connected accounts.

### 5.2 Agent Module (`/api/agent`)
- `POST /api/agent/dispatch` — Accepts natural language prompt, resolves context, and initiates planning.
- `GET /api/agent/plans/:id` — Retrieves status, reasoning chain, and execution steps of a plan.
- `POST /api/agent/plans/:id/cancel` — Cancels an in-progress plan.
- `GET /api/agent/history` — Returns recent conversational interactions.

### 5.3 Memory Module (`/api/memory`)
- `GET /api/memory/contacts` — Lists stored contacts and associated roles.
- `POST /api/memory/contacts` — Creates or updates contact memory.
- `GET /api/memory/relationships` — Returns relationship mappings (e.g., co-lead, mentor).
- `GET /api/memory/preferences` — Returns user scheduling and communication preferences.
- `PUT /api/memory/preferences` — Updates preference attributes.
- `GET /api/memory/events` — Lists personal milestones, birthdays, anniversaries, and exams.
- `POST /api/memory/search-vector` — Performs pgvector cosine similarity search over behavioral memories.

### 5.4 Email Module (`/api/email`)
- `GET /api/email/inbox` — Fetches unified email feed from connected Microsoft Graph and Gmail accounts.
- `POST /api/email/draft` — Uses AI to compose an email draft from prompt instructions.
- `POST /api/email/send` — Triggers email dispatch (requires valid approval token).
- `POST /api/email/summarize` — Generates bullet-point summaries of an email thread.
- `POST /api/email/convert-to-task` — Extracts action items and deadline from an email into a task.
- `GET /api/email/follow-ups` — Returns sent emails awaiting responses past configured threshold.

### 5.5 Calendar Module (`/api/calendar`)
- `GET /api/calendar/events` — Fetches unified events from FLOW calendar and external sync providers.
- `POST /api/calendar/events` — Creates a new calendar event (approval gated for meetings with attendees).
- `PUT /api/calendar/events/:id/reschedule` — Reschedules an event with conflict check.
- `GET /api/calendar/conflicts` — Detects and returns overlapping events and task blocks.
- `POST /api/calendar/focus-blocks` — Generates focus blocks in available free slots.

### 5.6 Task Management Module (`/api/tasks`)
- `GET /api/tasks` — Lists tasks filterable by category (Quick, Project, Study, Event).
- `POST /api/tasks` — Creates a new task.
- `POST /api/tasks/breakdown` — Breaks a complex objective into subtasks using LiteLLM/Qwen 2.5.
- `POST /api/tasks/prioritize` — Recalculates priority scores across all active tasks.
- `PUT /api/tasks/:id/schedule` — Assigns a task to a dedicated calendar slot.
- `PATCH /api/tasks/:id/status` — Updates status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).

### 5.7 Approval Center Module (`/api/approvals`)
- `GET /api/approvals/pending` — Returns all actions awaiting human review.
- `POST /api/approvals/:id/approve` — Confirms execution of the proposed action as-is.
- `POST /api/approvals/:id/reject` — Rejects the proposed action and terminates the plan.
- `POST /api/approvals/:id/modify` — Submits modified payload attributes and approves the revised action.

### 5.8 Verification Module (`/api/verification`)
- `GET /api/verification/receipts/:actionId` — Returns cryptographic proof, external resource ID, and verification status.
- `POST /api/verification/verify-manual` — Forces a re-verification check against external APIs.

### 5.9 Activities Module (`/api/activities`)
- `GET /api/activities/ledger` — Returns chronological, immutable ledger of all system actions.
- `GET /api/activities/export` — Exports audit trail for compliance and hackathon judges review.

### 5.10 Dashboard Module (`/api/dashboard`)
- `GET /api/dashboard/summary` — Aggregates pending approvals, upcoming events, priority tasks, and urgent emails into a single fast payload.
- `GET /api/dashboard/proactive-alerts` — Returns deadline risks, missing replies, and schedule health alerts.
