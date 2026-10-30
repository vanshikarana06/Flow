# FLOW — System Architecture Specification

**Version:** 1.0  
**Document Type:** System Architecture Specification  
**Status:** Approved Architecture  
**Product Category:** Agentic AI Personal Productivity Operating System  

---

## 1. Architecture Overview

FLOW is an Agentic AI Personal Productivity Operating System designed to coordinate email, calendar, and task management across modern productivity environments. The architecture bridges conversational agent planning with deterministic, verified execution pipelines.

FLOW adheres strictly to seven core architectural principles:
1. **Human Approval Required:** Consequential external actions (sending emails, deleting tasks, scheduling meetings) require explicit approval before execution.
2. **Verification Before Success:** External API responses are actively verified to ensure the intended state change has truly occurred.
3. **Activity Logging:** Every planning decision, user approval, execution attempt, and verification outcome is written to an append-only audit ledger.
4. **Retry-Safe Execution:** Idempotency keys and state reconciliation protect against duplicate actions during network retries or process restarts.
5. **Persistent User Memory:** Long-term memory stores contacts, relationships, preferences, personal events, and behavioral patterns using relational and vector databases.
6. **Proactive Assistance:** Continuous monitoring detects scheduling conflicts, approaching deadlines, missing email responses, and schedule health risks.
7. **Explainable Actions:** Every proposed action contains explicit reasoning, data references, and expected consequences.

---

## 2. High-Level Architecture

The system is structured across distinct presentation, application, agent reasoning, local AI, persistence, and external integration layers.

### High-Level Architecture Diagram

```mermaid
flowchart TD
    User([User])

    subgraph PresentationLayer ["Presentation Layer (Vercel)"]
        UI["Next.js Web Application\n(React, Tailwind, Shadcn UI)"]
        WSClient["WebSocket / SSE Client"]
    end

    subgraph ApplicationLayer ["Application Layer (Render)"]
        APIGateway["NestJS API Gateway & Router"]
        
        subgraph CoreModules ["Core NestJS Backend Modules"]
            AuthMod["Auth Module"]
            AgentMod["Agent Module"]
            MemMod["Memory Module"]
            TaskMod["Tasks Module"]
            CalMod["Calendar Module"]
            MailMod["Email Module"]
            ApprMod["Approvals Module"]
            VerifMod["Verification Module"]
            ActMod["Activities Module"]
            DashMod["Dashboard Module"]
        end
    end

    subgraph LocalAILayer ["Local AI Layer (Self-Hosted / Edge)"]
        CFTunnel["Cloudflare Tunnel (Secure HTTPS)"]
        LiteLLM["LiteLLM Proxy & Router"]
        Ollama["Ollama Runtime Engine"]
        Qwen["Qwen 2.5 LLM"]
    end

    subgraph DataLayer ["Data Layer (Supabase)"]
        PGDB[("Supabase PostgreSQL Database")]
        PGVector[("pgvector Embeddings Extension")]
    end

    subgraph IntegrationLayer ["External Integrations"]
        MSGraph["Microsoft Graph API\n(Outlook Mail, Calendar, To Do)"]
        GoogleAPI["Google Workspace APIs\n(Gmail API, Google Calendar API)"]
    end

    User <--> UI
    UI <--> WSClient
    UI -- "HTTPS REST" --> APIGateway
    WSClient -- "WSS Realtime" --> APIGateway
    APIGateway --> CoreModules

    CoreModules -- "Internal Service Calls" --> MemMod
    AgentMod -- "Inference Requests" --> CFTunnel
    CFTunnel --> LiteLLM
    LiteLLM --> Ollama
    Ollama --> Qwen

    CoreModules -- "SQL & ORM" --> PGDB
    MemMod -- "Vector Similarity Search" --> PGVector

    MailMod -- "OAuth2 / REST" --> MSGraph
    MailMod -- "OAuth2 / REST" --> GoogleAPI
    CalMod -- "OAuth2 / REST" --> MSGraph
    CalMod -- "OAuth2 / REST" --> GoogleAPI
    TaskMod -- "OAuth2 / REST" --> MSGraph
    VerifMod -- "Verification Queries" --> MSGraph
    VerifMod -- "Verification Queries" --> GoogleAPI
```

---

## 3. Layered Architecture

FLOW strictly isolates concerns across six horizontal layers to guarantee modularity, maintainability, and clean boundaries.

### Layered Architecture Diagram

```mermaid
flowchart TD
    subgraph L1 ["1. User Layer"]
        U1["Students & Academics"]
        U2["Working Professionals"]
        U3["Freelancers & Consultants"]
        U4["Project Leads & Small Teams"]
    end

    subgraph L2 ["2. Presentation Layer (Next.js / Vercel)"]
        P1["Unified Dashboard"]
        P2["AI Assistant Chat Interface"]
        P3["Smart Email Center"]
        P4["Smart Calendar & Conflict Visualizer"]
        P5["Intelligent Task Manager"]
        P6["Approval Center (Approve / Reject / Modify)"]
        P7["Verification & Activity Ledger"]
        P8["Personal Memory Manager"]
    end

    subgraph L3 ["3. Application & Service Layer (NestJS / Render)"]
        S_Auth["Auth Module (OAuth2 PKCE, JWT)"]
        S_Agent["Agent Module (Planner, Orchestrator)"]
        S_Mem["Memory Module (5 Memory Types)"]
        S_Mail["Email Module (Summarize, Draft, Send)"]
        S_Cal["Calendar Module (FLOW Calendar & Sync)"]
        S_Task["Task Module (Breakdown, Priority Engine)"]
        S_Appr["Approvals Module (State Machine)"]
        S_Verif["Verification Module (Evidence Verification)"]
        S_Act["Activities Module (Audit Ledger)"]
        S_Dash["Dashboard Module (Data Aggregation)"]
    end

    subgraph L4 ["4. Local AI & Reasoning Layer"]
        A1["Cloudflare Tunnel (Secure Ingress)"]
        A2["LiteLLM Abstraction Proxy"]
        A3["Ollama Engine (Local Inference)"]
        A4["Qwen 2.5 Model (Intent, Planning, Generation)"]
    end

    subgraph L5 ["5. Persistence & Vector Layer (Supabase)"]
        D1["PostgreSQL Relational Tables (Users, Tasks, Events, Approvals, Logs)"]
        D2["pgvector Extension (Semantic Memory & Contact Resolution)"]
    end

    subgraph L6 ["6. External Integration Layer"]
        I1["Microsoft Graph API (M365 Mail, Outlook Calendar, Microsoft To Do)"]
        I2["Google Workspace (Gmail API, Google Calendar API)"]
    end

    L1 --> L2
    L2 --> L3
    L3 <--> L4
    L3 <--> L5
    L3 <--> L6
```

### Detailed Layer Responsibilities

#### 3.1 User Layer
Represents the target personas interacting with FLOW via conversational prompts or dashboard controls.

#### 3.2 Presentation Layer
- Built with **Next.js**, **React**, **Tailwind CSS**, and **Shadcn UI**, hosted on **Vercel**.
- Interacts with backend REST endpoints for transactional mutations and WebSockets for real-time progress streaming and verification alerts.
- Enforces Human-in-the-Loop workflows by displaying pending approvals with Approve, Reject, and Modify controls.

#### 3.3 Application Layer
- Built with **NestJS** and **Node.js**, deployed on **Render**.
- Implements the 10 major backend modules:
  1. `Auth`: Token lifecycle, OAuth2 refresh flows, and session management.
  2. `Agent`: Multi-step workflow planner, tool execution, and prompt construction.
  3. `Memory`: Ingestion, retrieval, and vector search for contacts, relationships, preferences, events, and behavioral patterns.
  4. `Email`: Email reading, drafting, sending, follow-up detection, and email-to-task extraction.
  5. `Calendar`: Native FLOW calendar operations, external vendor synchronization, conflict detection, and focus block creation.
  6. `Tasks`: Quick tasks, project tasks, study plans, event tasks, priority scoring, and AI breakdowns.
  7. `Approvals`: Lifecycle governance for pending approvals (Approve, Reject, Modify).
  8. `Verification`: Verification checks against external APIs to confirm real-world state mutations.
  9. `Activities`: Immutable execution logs, approval logs, and verification receipts.
  10. `Dashboard`: Unified feed aggregation across emails, tasks, calendar events, and proactive alerts.

#### 3.4 Local AI Layer
- Self-hosted local AI stack using **Ollama** running **Qwen 2.5**.
- **LiteLLM** exposes an OpenAI-compatible API interface.
- **Cloudflare Tunnel** securely bridges requests from the Render backend to the local AI inference host without exposing open firewall ports.

#### 3.5 Persistence Layer
- Hosted on **Supabase** leveraging **PostgreSQL**.
- Relational schemas enforce transactional integrity across users, approvals, tasks, events, and audit logs.
- The **pgvector** extension enables semantic similarity search across user memory entries, email threads, and task descriptions.

#### 3.6 External Integration Layer
- **Microsoft Graph API:** Full access to Outlook Mail, Outlook Calendar, and Microsoft To Do.
- **Google Workspace APIs:** Gmail API and Google Calendar API for cross-platform synchronization.

---

## 4. Deployment Architecture

FLOW's deployment topology separates client-facing edge delivery, scalable cloud application hosting, managed serverless database persistence, and local accelerated AI compute.

### Deployment Architecture Diagram

```mermaid
flowchart LR
    subgraph VercelEdge ["Vercel Edge Cloud"]
        NextApp["Next.js Application\n(Serverless Functions & Static Assets)\nDomain: app.flow.dev"]
    end

    subgraph RenderPlatform ["Render Cloud Platform"]
        NestApp["NestJS Containerized Backend Service\n(Web Service: Node.js 20)\nDomain: api.flow.dev"]
        RedisQueue["Redis Cache / Job Queue\n(Background Workers)"]
    end

    subgraph SupabaseCloud ["Supabase Managed Cloud"]
        PostgresInstance[("Managed PostgreSQL 15+\n+ pgvector Extension\nRLS Enabled")]
    end

    subgraph LocalMachine ["Local AI Host (Workstation / GPU Server)"]
        TunnelDaemon["cloudflared Daemon\n(Outbound TLS Tunnel)"]
        LiteLLMHost["LiteLLM Proxy Container\n(Port 4000)"]
        OllamaHost["Ollama Service (Port 11434)\nModel: Qwen 2.5 7B / 14B"]
    end

    subgraph ExternalSaaS ["External SaaS APIs"]
        GraphAPI["Microsoft Graph API\n(graph.microsoft.com)"]
        GoogleAPI["Google Cloud APIs\n(googleapis.com)"]
    end

    NextApp -- "HTTPS / WSS" --> NestApp
    NestApp -- "TLS Database Connection" --> PostgresInstance
    NestApp -- "HTTPS via Tunnel URL" --> TunnelDaemon
    TunnelDaemon --> LiteLLMHost
    LiteLLMHost --> OllamaHost
    NestApp -- "OAuth2 HTTPS" --> GraphAPI
    NestApp -- "OAuth2 HTTPS" --> GoogleAPI
    NestApp <--> RedisQueue
```

---

## 5. End-to-End Request & Execution Flow

This sequence illustrates how a user request traverses intent classification, memory retrieval, human approval, external execution, state verification, and audit logging.

### Request Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Web as Next.js Dashboard
    participant API as NestJS Gateway
    participant Agent as Agent & Memory Engine
    participant LLM as LiteLLM (Qwen 2.5)
    participant Approvals as Approval Center
    participant Provider as External API (Graph / Gmail)
    participant Verif as Verification Engine
    participant Ledger as Activity Ledger

    User->>Web: "Send project status update to my co-lead"
    Web->>API: POST /api/agent/dispatch { prompt }
    API->>Agent: Initialize workflow session
    
    rect rgb(240, 248, 255)
        note over Agent, LLM: Intent Detection & Memory Resolution
        Agent->>Agent: Query Memory Module (Relationship: 'co-lead')
        Agent-->>Agent: Resolved: Aditya (aditya@example.com)
        Agent->>LLM: Synthesize Email Draft & Action Plan
        LLM-->>Agent: Action: SEND_EMAIL, Plan: [Draft, Approve, Send, Verify]
    end

    rect rgb(255, 250, 240)
        note over Agent, Approvals: Human-in-the-Loop Approval Interception
        Agent->>Approvals: Create Pending Request (Diff, Recipient, Body)
        Approvals-->>Web: Push Pending Approval Notification
        Web-->>User: Display Approval Modal (Approve / Reject / Modify)
        User->>Web: Click "Approve" (or "Modify" then "Approve")
        Web->>API: POST /api/approvals/:id/approve
        API->>Approvals: Update status to APPROVED
    end

    rect rgb(240, 255, 240)
        note over API, Provider: Execution Phase
        Approvals->>Provider: Execute Send Email (Microsoft Graph / Gmail)
        Provider-->>Approvals: Return HTTP 202/200 & Message ID
    end

    rect rgb(255, 245, 245)
        note over Approvals, Verif: Verification Phase
        Approvals->>Verif: Verify Action (Message ID, Sent Items Check)
        Verif->>Provider: GET /messages/:id
        Provider-->>Verif: Message verified in Sent Items
        Verif-->>Approvals: Verification Status: VERIFIED
    end

    rect rgb(245, 245, 245)
        note over Approvals, Ledger: Audit & Ledger Logging
        Approvals->>Ledger: Append Record (Plan, Approval, Execution, Proof)
        Ledger-->>Web: Real-time update via WebSocket
        Web-->>User: Show verified status & update dashboard timeline
    end
```

---

## 6. Architectural Consistency Matrix

| Core Architectural Principle | System Implementation Component | Supporting Documents |
| :--- | :--- | :--- |
| **Human Approval Required** | NestJS Approvals Module & Frontend Approval Center Modal (Approve, Reject, Modify) | `agent-design/approval-and-verification.md` |
| **Verification Before Success** | Verification Module polling and checking external API state before finalizing action | `agent-design/approval-and-verification.md`, `microsoft-graph-research/graph-integration.md` |
| **Activity Logging** | Activities Module writing immutable records to Supabase PostgreSQL ledger table | `backend/backend-setup-and-apis.md`, `database/schema-and-models.md` |
| **Retry-Safe Execution** | Idempotency tokens, client request hashes, and state re-verification prior to retry | `agent-design/approval-and-verification.md` |
| **Persistent User Memory** | Memory Module (Contact, Relationship, Preference, Event, Behavioral) backed by PostgreSQL & pgvector | `agent-design/agent-orchestration.md`, `database/schema-and-models.md` |
| **Proactive Assistance** | Background cron / event evaluators detecting deadlines, missing replies, and schedule conflicts | `features/feature-specifications.md`, `backend/backend-setup-and-apis.md` |
| **Explainable Actions** | Reasoning chain stored with action plans, viewable in the UI plan inspector | `frontend/frontend-and-dashboard.md`, `agent-design/agent-orchestration.md` |
