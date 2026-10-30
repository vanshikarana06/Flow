# FLOW — Microsoft Graph Integration Specification

**Version:** 1.0  
**Document Type:** External API Integration Specification  
**Status:** Approved Architecture  
**Provider:** Microsoft Graph REST API v1.0  

---

## 1. Overview

Microsoft Graph provides unified programmatic access to Microsoft 365 services. In FLOW, Microsoft Graph serves as an external synchronization provider and execution engine for:
- **Outlook Mail:** Reading threads, creating drafts, and sending approved messages.
- **Outlook Calendar:** Reading user schedules, detecting conflicts, synchronizing FLOW native calendar events, and updating meetings.
- **Microsoft To Do:** Reading task lists, creating synchronized tasks, and marking items complete.

FLOW maintains its own independent calendar and task models; Microsoft Graph is leveraged for external synchronization, automated execution, and state verification.

---

## 2. Integration Architecture

### Graph Integration Architecture Diagram

```mermaid
flowchart TD
    subgraph FLOWPlatform ["FLOW Core Platform (Render)"]
        NestBackend["NestJS Core Backend"]
        TokenVault["Encrypted Token Manager (Supabase Vault)"]
        GraphClient["Microsoft Graph SDK Client"]
        VerifEngine["Verification Engine"]
    end

    subgraph AzureAD ["Microsoft Identity Platform (Entra ID)"]
        OAuthEndpoint["OAuth2 Authorization & Token Endpoints\n(/common/oauth2/v2.0/token)"]
    end

    subgraph MicrosoftGraph ["Microsoft Graph REST API (graph.microsoft.com/v1.0)"]
        MailAPI["/me/messages\n/me/sendMail"]
        CalAPI["/me/events\n/me/calendar/getSchedule"]
        TodoAPI["/me/todo/lists\n/me/todo/lists/{id}/tasks"]
        UserAPI["/me (Profile)"]
    end

    subgraph M365Services ["Microsoft 365 Cloud"]
        ExchangeMail[("Exchange Online Mailbox")]
        ExchangeCal[("Exchange Online Calendar")]
        TodoStorage[("To Do / Substrate Storage")]
    end

    NestBackend --> TokenVault
    TokenVault <--> OAuthEndpoint
    NestBackend --> GraphClient
    GraphClient --> MailAPI
    GraphClient --> CalAPI
    GraphClient --> TodoAPI
    GraphClient --> UserAPI

    MailAPI --> ExchangeMail
    CalAPI --> ExchangeCal
    TodoAPI --> TodoStorage

    VerifEngine -.->|State Verification Query| MailAPI
    VerifEngine -.->|State Verification Query| CalAPI
```

---

## 3. Email Execution Flow

All outgoing emails are planned by the Agent, authorized in the Approval Center (Approve / Reject / Modify), and executed via Microsoft Graph before being verified.

### Email Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Approval Center (Next.js)
    participant Backend as Email Module (NestJS)
    participant Graph as Microsoft Graph API
    participant Verif as Verification Engine

    UI->>User: Display Approval Card (Recipient, Subject, Body)
    User->>UI: Click "Approve" (or "Modify" then "Approve")
    UI->>Backend: POST /api/approvals/:id/approve
    
    Backend->>Graph: POST /v1.0/me/sendMail { message, saveToSentItems: true }
    Graph-->>Backend: HTTP 202 Accepted
    
    Backend->>Verif: Initiate Email Verification (Subject, Recipient, SentTimestamp)
    
    rect rgb(240, 248, 255)
        note over Verif, Graph: Verification Phase
        Verif->>Graph: GET /v1.0/me/mailFolders/SentItems/messages?$filter=subject eq '...'&$top=1
        Graph-->>Verif: Return Sent Message (id, sentDateTime, internetMessageId)
    end

    Verif-->>Backend: Status: VERIFIED (InternetMessageId Stored)
    Backend-->>UI: Real-Time Event: Action Verified & Completed
```

---

## 4. Calendar Synchronization & Scheduling Flow

FLOW operates an independent calendar engine. When a meeting is scheduled or rescheduled, the event is written locally, pushed to Microsoft Graph, and verified.

### Calendar Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Agent as Agent Orchestrator
    participant Appr as Approval Center
    participant CalMod as Calendar Module
    participant Graph as Microsoft Graph API
    participant Verif as Verification Engine

    User->>Agent: "Reschedule project review to Monday 10:30 AM"
    Agent->>Graph: POST /v1.0/me/calendar/getSchedule (Check attendee busy slots)
    Graph-->>Agent: Free / Busy status confirmed
    Agent->>Appr: Create Reschedule Approval Request
    Appr-->>User: Display Reschedule Approval Card
    User->>Appr: Click "Approve"
    
    Appr->>CalMod: Execute Reschedule
    CalMod->>Graph: PATCH /v1.0/me/events/{eventId} { start, end }
    Graph-->>CalMod: HTTP 200 OK + Updated Event Object
    
    CalMod->>Verif: Trigger Calendar Verification (eventId, newStartTime)
    Verif->>Graph: GET /v1.0/me/events/{eventId}
    Graph-->>Verif: Event details with matching start/end timestamps
    Verif-->>CalMod: Status: VERIFIED
    CalMod-->>Appr: Updated FLOW Calendar & Completed
```

---

## 5. Verification Flow

To guarantee that actions are real and verifiable, FLOW executes structured checks against Graph endpoints before recording an action as complete.

### Verification Flow Diagram

```mermaid
flowchart TD
    StartVerif([Initiate Verification]) --> CheckType{Action Type}
    
    CheckType -->|Email Sent| VerifyMail[Query /me/mailFolders/SentItems/messages]
    CheckType -->|Event Created / Rescheduled| VerifyCal[Query /me/events/{id}]
    CheckType -->|Task Created / Completed| VerifyTask[Query /me/todo/lists/{id}/tasks/{id}]
    
    VerifyMail --> EvalMail{Sent message found with matching recipient?}
    VerifyCal --> EvalCal{Event exists with approved start/end times?}
    VerifyTask --> EvalTask{Task status matches approved mutation?}
    
    EvalMail -->|Yes| ConfirmSuccess[Generate SHA-256 Proof Hash & Mark VERIFIED]
    EvalCal -->|Yes| ConfirmSuccess
    EvalTask -->|Yes| ConfirmSuccess
    
    EvalMail -->|No| BackoffProbe{Retry Window Active? (up to 3 attempts)}
    EvalCal -->|No| BackoffProbe
    EvalTask -->|No| BackoffProbe
    
    BackoffProbe -->|Yes| SleepWait[Wait 1000ms] --> CheckType
    BackoffProbe -->|No| FlagFailed[Mark VERIFICATION_FAILED & Notify User in Alert Bar]
    
    ConfirmSuccess --> RecordLedger[Append Verification Record to Activity Ledger]
    FlagFailed --> RecordLedger
```

---

## 6. Microsoft Graph Permissions & Scopes

FLOW requests the minimum necessary OAuth2 scopes using incremental consent:
- `User.Read` — Read user profile and email.
- `Mail.ReadWrite` — Read mailbox messages and compose drafts.
- `Mail.Send` — Send approved emails.
- `Calendars.ReadWrite` — Read calendar schedules and create/modify events.
- `Tasks.ReadWrite` — Read and update Microsoft To Do tasks.
- `offline_access` — Maintain long-term access via refresh tokens.
