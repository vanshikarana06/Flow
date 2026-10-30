# FLOW — Approval & Verification System

**Version:** 1.0  
**Document Type:** Agent Design Specification  
**Status:** Approved Architecture  
**Module:** Approval Center & Verification Engine  

---

## 1. Overview

The Approval Center and Verification Engine represent the core safety and trust guarantees of FLOW. Together, they ensure that:
1. No consequential or irreversible action occurs without explicit human consent.
2. Users can adjust proposed actions using inline editing before executing them.
3. Every operation executed against external APIs (Microsoft Graph, Gmail, Google Calendar) is actively verified before being marked complete.
4. Retry attempts never duplicate operations.
5. All approvals, execution attempts, and verification receipts are immutably logged in the Activity Ledger.

---

## 2. Approval Center Architecture & Flow

The Approval Center intercepts all agent-planned actions marked as consequential:
- **Email Actions:** Sending an email, sending a reply, modifying drafts.
- **Calendar Actions:** Creating new events, rescheduling existing meetings, deleting appointments, adding attendees.
- **Task Actions:** Deleting tasks, shifting project milestones, altering priorities.

### Approval Flow Diagram

```mermaid
flowchart TD
    AgentPlan[Agent Generated Plan] --> ActionClassifier{Classify Action Risk}
    ActionClassifier -->|Non-Consequential: Read / Search| AutoExecute[Direct Backend Execution]
    ActionClassifier -->|Consequential: Send / Delete / Mutate| CreateApproval[Create Pending Approval Record in Supabase]
    
    CreateApproval --> NotifyUI[Push Real-Time Notification to Next.js UI]
    NotifyUI --> DisplayModal[Display Approval Card in Dashboard]
    
    DisplayModal --> UserAction{User Decision}
    
    UserAction -->|Approve| ApprovePath[Set Status: APPROVED]
    UserAction -->|Reject| RejectPath[Set Status: REJECTED]
    UserAction -->|Modify| ModifyPath[Open Inline Editor Modal]
    
    ModifyPath --> EditDetails[User Adjusts Subject, Body, Attendees, or Time]
    EditDetails --> SaveDiff[Update Approval Payload & Set Status: MODIFIED_AND_APPROVED]
    
    ApprovePath --> DispatchExecution[Trigger Backend Execution Engine]
    SaveDiff --> DispatchExecution
    
    RejectPath --> LogRejection[Log Decision in Activity Ledger & Terminate Plan]
    LogRejection --> UserNotice([Feedback: Action Cancelled])
```

---

## 3. Verification Engine & State Confirmation Flow

The Verification Engine validates that an external system's actual state matches the expected outcome of an action.

### Verification Targets & Checks
1. **Email Verification:**
   - Provider HTTP acknowledgment received (e.g., Microsoft Graph `202 Accepted` or Gmail API `200 OK`).
   - Querying the user's `Sent Items` folder to confirm the message exists with the allocated `message_id`.
   - Matching recipient address and timestamp within acceptable drift window.
2. **Calendar Verification:**
   - Confirming event creation or update by querying the calendar event by `event_id` or `iCalUId`.
   - Verifying that start time, end time, and attendee list reflect the approved values.
   - Confirming that no duplicate event was created.
3. **Task Verification:**
   - Confirming task record insertion or mutation in Supabase and external sync targets (Microsoft To Do).
   - Verifying subtask associations and parent project linking.

### Verification Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Execution as Execution Engine
    participant Provider as External Service (Graph / Gmail)
    participant Verifier as Verification Engine
    participant DB as Supabase PostgreSQL
    participant Ledger as Activity Ledger

    Execution->>Provider: Invoke API Call (e.g., POST /me/sendMail or /events)
    Provider-->>Execution: Return HTTP Status (200 / 202) + External ID
    Execution->>Verifier: Dispatch Verification Request (Action, Payload, External ID)
    
    Verifier->>Verifier: Wait for Provider State Propagation (backoff: 500ms)
    
    rect rgb(240, 248, 255)
        note over Verifier, Provider: Verification Query Loop
        Verifier->>Provider: GET /resource/:id (Query Sent Message or Calendar Event)
        Provider-->>Verifier: Return State Representation
        Verifier->>Verifier: Compare Expected State vs Actual State
    end

    alt State Matches Expected Payload
        Verifier->>DB: Update Action Status: VERIFIED
        Verifier->>Ledger: Append Verification Receipt (Proof Hash, Timestamp, Entity ID)
        Verifier-->>Execution: Verification Confirmed
    else State Does Not Match or Resource Missing
        Verifier->>DB: Update Action Status: VERIFICATION_FAILED
        Verifier->>Ledger: Append Verification Failure Notice & Details
        Verifier-->>Execution: Raise Verification Alert to User
    end
```

---

## 4. Retry Protection & Idempotency Flow

To prevent duplicate emails, double-booked meetings, or multiple task copies during network dropouts or backend retries, FLOW implements strict idempotency safeguards.

### Retry Protection Rules:
1. **Idempotency Token:** Every approved action receives a unique cryptographic `idempotency_key` (UUID v4 + SHA-256 hash of the approved payload).
2. **Pre-Execution Check:** Before calling an external API, FLOW checks if the `idempotency_key` is already associated with an `EXECUTED` or `VERIFIED` record in the database.
3. **State Probing Prior to Retry:** If a network timeout occurs, FLOW does not immediately retry. Instead, it queries the provider using the expected attributes (e.g., search Sent Items by subject and timestamp) to verify whether the previous attempt actually succeeded before retrying.

### Retry Protection Flow Diagram

```mermaid
flowchart TD
    TriggerRetry([Execution Attempt / Retry Initiated]) --> CheckIdempotency{Idempotency Key in Database?}
    
    CheckIdempotency -->|Key in Status: VERIFIED| SkipRetry[Action Already Completed: Skip Execution & Return Cached Receipt]
    CheckIdempotency -->|Key in Status: EXECUTING| ProbeProvider[State Probe: Query External API for Probable Duplicate]
    CheckIdempotency -->|Key New / Not Started| PerformCall[Execute API Call with Client Request Token]
    
    ProbeProvider --> StateExists{Did Prior Attempt Actually Succeeded?}
    StateExists -->|Yes, Resource Exists| AdoptResource[Adopt Existing Resource ID & Advance to VERIFIED]
    StateExists -->|No, Not Found| PerformCall
    
    PerformCall --> CallResult{API Call Result}
    CallResult -->|Success| VerifyCall[Trigger Verification Engine]
    CallResult -->|Transient Network Error| CheckRetryLimit{Retry Limit Reached?}
    CallResult -->|Permanent Auth / Client Error| AbortFail[Mark FAILED & Alert User]
    
    CheckRetryLimit -->|No| BackoffWait[Exponential Backoff Wait] --> TriggerRetry
    CheckRetryLimit -->|Yes| AbortFail
    
    VerifyCall --> Complete([Action Completed Safely])
    SkipRetry --> Complete
    AdoptResource --> Complete
```

---

## 5. Activity Ledger Integration

The Activity Ledger provides an append-only audit trail capturing three categories of logs:
1. **Execution Logs:** Exact timestamps, actor, parameters, target service, and raw HTTP response codes.
2. **Verification Logs:** Verification checks performed, retrieved state proof, diff analysis, and validation timestamps.
3. **Approval Logs:** Reviewer ID, decision (Approve, Reject, Modify), modified field diffs, and decision timestamp.

This ensures complete operational transparency, post-incident debugging capability, and judge-verifiable auditability.
