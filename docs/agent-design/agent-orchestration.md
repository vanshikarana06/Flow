# FLOW — Agent Orchestration Design

**Version:** 1.0  
**Document Type:** Agent Architecture Specification  
**Status:** Approved Architecture  
**Product Category:** Agentic AI Personal Productivity Operating System  

---

## 1. Overview

The Agent Orchestration Layer serves as the intelligence and planning core of FLOW. It bridges natural-language user intentions with structured, deterministic execution workflows while maintaining:
- **Persistent Personal Memory** across contacts, relationships, preferences, events, and behavioral patterns.
- **Human-in-the-Loop Governance** where consequential actions require approval (Approve, Reject, Modify).
- **Post-Execution State Verification** confirming that external services (Microsoft Graph, Gmail, Google Calendar) successfully applied changes.
- **Audit Logging** tracking every prompt, reasoning step, approval decision, and outcome in the Activity Ledger.

The agent never executes consequential operations unilaterally. It creates structured plans, coordinates memory lookups, dispatches approval requests, verifies execution receipts, and updates the user.

---

## 2. Core Agent Pipeline

The agent pipeline processes instructions through seven discrete stages.

### Agent Pipeline Diagram

```mermaid
flowchart TD
    UserPrompt([User Natural Language Prompt]) --> Ingestion[1. Ingestion & Input Sanitization]
    Ingestion --> IntentClassification[2. Intent Classification & Entity Extraction]
    IntentClassification --> MemoryAugmentation[3. Personal Memory Retrieval & Context Augmentation]
    MemoryAugmentation --> PlanningEngine[4. Multi-Step Workflow Planning]
    PlanningEngine --> RiskAssessment{5. Requires Human Approval?}
    
    RiskAssessment -->|Yes| ApprovalCenter[Submit to Approval Center: Approve / Reject / Modify]
    RiskAssessment -->|No| SafeExecution[Direct Non-Consequential Execution]
    
    ApprovalCenter --> DecisionGate{User Decision}
    DecisionGate -->|Approved / Modified| ExecutionEngine[6. Multi-Step Execution Engine]
    DecisionGate -->|Rejected| AbortWorkflow[Abort Plan & Log Cancellation]
    
    SafeExecution --> ExecutionEngine
    ExecutionEngine --> VerificationEngine[7. Verification Engine & Activity Ledger]
    VerificationEngine --> UserFeedback([UI Feedback & State Sync])
```

---

## 3. Planning Workflow

The Planning Engine transforms unstructured prompts into a directed sequence of actionable steps.

### Planning Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Orchestrator as Agent Orchestrator
    participant Intent as Intent Classifier
    participant Memory as Memory Module (PostgreSQL + pgvector)
    participant Planner as Workflow Planner (LiteLLM / Qwen 2.5)
    participant Approvals as Approval Center

    User->>Orchestrator: "Move my Friday 3 PM review to Monday morning and inform Aditya"
    Orchestrator->>Intent: Extract Intent & Entities
    Intent-->>Orchestrator: Intent: RESCHEDULE_MEETING & SEND_NOTIFICATION, Entities: [Friday 3 PM, Monday morning, Aditya]
    
    Orchestrator->>Memory: Query Contacts & Preferences
    Memory-->>Orchestrator: Aditya = aditya@example.com, Working Hours: Mon-Fri 09:00-18:00, No meetings before 10 AM
    
    Orchestrator->>Planner: Generate Execution Plan with Context & Constraints
    Planner-->>Orchestrator: Plan: [1. Locate Event, 2. Check Mon Availability (>= 10 AM), 3. Propose Slot: Mon 10:30 AM, 4. Update Calendar, 5. Send Notification]
    
    Orchestrator->>Approvals: Create Pending Approval with complete Plan & Diff
    Approvals-->>User: Present Plan for Review (Approve / Reject / Modify)
```

---

## 4. Personal Memory System & Retrieval Flow

FLOW maintains five distinct types of persistent personal memory:
1. **Contact Memory:** Name, email, primary role, department, notes.
2. **Relationship Memory:** Interpersonal and professional associations (e.g., "Aditya = Co-Lead", "Rahul = Client").
3. **Preference Memory:** Work patterns, scheduling rules, preferred communication tone, meeting buffers.
4. **Event Memory:** Milestones, birthdays, anniversaries, project deadlines, exam dates.
5. **Behavioral Memory:** Learned habits, common meeting durations, recurring study times.

### Memory Retrieval Flow Diagram

```mermaid
flowchart TD
    UserQuery[User Input / Plan Request] --> QueryParser[Extract Query Terms & Semantic Intent]
    QueryParser --> SplitSearch{Search Strategy}
    
    SplitSearch -->|Exact Match| RelationalQuery[SQL Relational Query in PostgreSQL]
    SplitSearch -->|Semantic / Fuzzy| VectorQuery[Vector Embedding Generation via LiteLLM]
    
    VectorQuery --> SimilaritySearch[Cosine Similarity Search in pgvector]
    
    RelationalQuery --> ContactStore[(contacts & relationships)]
    RelationalQuery --> PrefStore[(user_preferences & personal_events)]
    SimilaritySearch --> BehavioralStore[(behavioral_memory & interaction_embeddings)]
    
    ContactStore --> Aggregator[Context Aggregator & Conflict Resolver]
    PrefStore --> Aggregator
    BehavioralStore --> Aggregator
    
    Aggregator --> RankedContext[Ranked Context Injected into Prompt Context]
    RankedContext --> AgentLLM[LiteLLM / Ollama Qwen 2.5]
```

---

## 5. Multi-Step Execution Flow

Execution involves step-by-step progress, parameter binding, external API invocation, and error isolation.

### Multi-Step Execution Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> PLAN_INITIALIZED
    PLAN_INITIALIZED --> STEP_EVALUATION
    
    STEP_EVALUATION --> STEP_APPROVAL_REQUIRED: Consequential Action
    STEP_EVALUATION --> STEP_EXECUTING: Read-only or Pre-Approved Action
    
    STEP_APPROVAL_REQUIRED --> STEP_APPROVED: User Clicks Approve
    STEP_APPROVAL_REQUIRED --> STEP_MODIFIED: User Modifies Details
    STEP_APPROVAL_REQUIRED --> PLAN_CANCELLED: User Clicks Reject
    
    STEP_MODIFIED --> STEP_EXECUTING
    STEP_APPROVED --> STEP_EXECUTING
    
    STEP_EXECUTING --> STEP_VERIFYING: Provider Call Completed
    STEP_EXECUTING --> STEP_RETRYING: Transient Network Error
    
    STEP_RETRYING --> STEP_EXECUTING: Retry Token Checked
    STEP_RETRYING --> STEP_FAILED: Max Retries Exceeded
    
    STEP_VERIFYING --> STEP_COMPLETED: State Proof Confirmed
    STEP_VERIFYING --> STEP_FAILED: State Verification Failed
    
    STEP_COMPLETED --> STEP_EVALUATION: More Steps in Plan
    STEP_COMPLETED --> PLAN_FINISHED: All Steps Verified
    
    STEP_FAILED --> PLAN_PAUSED_FOR_USER: Alert Raised
    PLAN_PAUSED_FOR_USER --> [*]
    PLAN_FINISHED --> [*]
    PLAN_CANCELLED --> [*]
```

---

## 6. Proactive Intelligence Integration

The agent does not simply wait for user commands. A background Proactive Intelligence Layer evaluates productivity health and triggers agent plans:
- **Deadline Risk Detection:** Scans task deadlines against current time and scheduled calendar blocks.
- **Missing Reply Detection:** Tracks sent emails to key contacts that have had no reply after a designated duration.
- **Schedule Health Analysis:** Flags meeting overload, missing lunch buffers, or lack of focus blocks.
- **Conflict Alerting:** Identifies concurrent meetings or overlapping task blocks and prepares rescheduling proposals.

When a proactive condition is identified, the agent creates a proactive recommendation in the Dashboard and queues an approval action for the user to review.
