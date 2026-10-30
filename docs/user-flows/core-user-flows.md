# FLOW — Core User Flows

**Version:** 1.0  
**Document Type:** Product User Experience & Workflow Specification  
**Status:** Approved  
**Product Category:** Agentic AI Personal Productivity Operating System  

---

## 1. Overview

This document specifies the primary user journeys and operational flows in FLOW. Every flow adheres to FLOW's core principles:
- Understand before acting
- Human approval required (Approve, Reject, Modify)
- State verification before marking actions complete
- Transparent activity logging
- Retry-safe execution

---

## 2. Primary End-to-End User Journey

### High-Level User Journey Diagram

```mermaid
flowchart TD
    A([User Submits Prompt in Next.js UI]) --> B[NestJS Ingestion & Intent Parsing]
    B --> C[Memory Lookup: Contacts, Relationships, Preferences]
    C --> D[Planner Formulates Execution Steps & Drafts]
    D --> E{Consequential Action?}
    
    E -->|No| F[Direct Read Execution]
    E -->|Yes| G[Approval Center Interception]
    
    G --> H{User Action}
    H -->|Approve| I[Execute via Microsoft Graph / Gmail]
    H -->|Modify| J[Inline Field Adjustment] --> I
    H -->|Reject| K[Abort Plan & Log Decision]
    
    I --> L[Verification Engine Probes Provider State]
    L --> M{State Verified?}
    
    M -->|Yes| N[Record Immutable Entry in Activity Ledger]
    M -->|No| O[Raise Verification Alert & Mark Failed]
    
    N --> P([Real-Time UI Update & Confirmation])
    O --> P
    K --> P
    F --> P
```

---

## 3. Email-to-Task Conversion Flow

Users can convert action items mentioned in emails into structured tasks with auto-detected deadlines and priority scores.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Email Center (Next.js)
    participant Backend as Email Module (NestJS)
    participant Agent as Agent & Memory Engine
    participant TaskMod as Tasks Module
    participant DB as Supabase PostgreSQL

    User->>UI: Select Email & Click "Convert to Task"
    UI->>Backend: POST /api/email/convert-to-task { threadId }
    Backend->>Agent: Extract Actionable Items, Due Dates, and Assignees
    Agent-->>Backend: Extracted Task: { title: "Submit Financial Report", due_date: "Friday 5 PM", priority: "high" }
    Backend->>TaskMod: Create Task with source_email_id reference
    TaskMod->>DB: INSERT into tasks
    TaskMod-->>UI: Return New Task
    UI-->>User: Display Task in Today's Priority Board
```

---

## 4. Smart Meeting Rescheduling & Conflict Resolution Flow

When a meeting conflict arises, FLOW detects it, computes an alternative slot honoring working hours and buffer preferences, and requests user approval.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Dashboard & Calendar
    participant Agent as Agent Orchestration Layer
    participant Memory as Personal Memory (Preferences)
    participant Cal as Calendar Module (Microsoft Graph / Google)
    participant Appr as Approval Center

    UI->>Agent: "Reschedule my review with Aditya to avoid clash"
    Agent->>Memory: Retrieve Preferences (No meetings before 10 AM, 15m buffer)
    Agent->>Cal: Query Free / Busy schedules for all attendees
    Cal-->>Agent: Identified conflict-free slot: Tuesday 10:30 AM - 11:30 AM
    Agent->>Appr: Create Reschedule Approval Request (Original vs Proposed)
    Appr-->>UI: Display Reschedule Approval Card
    
    alt User Approves
        User->>UI: Click "Approve"
        UI->>Cal: Execute Reschedule on Microsoft Graph / Google Calendar
        Cal-->>UI: Verified & Calendar Updated
    else User Modifies
        User->>UI: Click "Modify" (Adjust time to 11:00 AM)
        UI->>Cal: Execute Reschedule with Modified Timestamp
        Cal-->>UI: Verified & Calendar Updated
    else User Rejects
        User->>UI: Click "Reject"
        UI-->>User: Conflict marked as acknowledged without changes
    end
```

---

## 5. Proactive Alerting & Health Analysis Flow

FLOW continuously analyzes schedule density, overdue responses, and deadline risks in the background.

```mermaid
flowchart LR
    CronWorker[Background Intelligence Worker] --> MonitorDeadlines[Scan Approaching Deadlines]
    CronWorker --> MonitorReplies[Scan Unanswered Critical Emails]
    CronWorker --> MonitorHealth[Evaluate Daily Meeting Load]
    
    MonitorDeadlines --> EvaluateAlert{Threshold Breached?}
    MonitorReplies --> EvaluateAlert
    MonitorHealth --> EvaluateAlert
    
    EvaluateAlert -->|Yes| PushAlert[Insert proactive_alerts & Send WebSocket Event]
    PushAlert --> DashboardBar[Display in Proactive Alert Bar]
    DashboardBar --> OneClickAction[User Triggers Suggested Action / Approval]
```
