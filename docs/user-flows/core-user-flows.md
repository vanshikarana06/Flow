# FLOW — Core User Flows

* **Document:** Core User Flows  
* **Project:** FLOW  
* **Version:** 1.0  
* **Status:** Draft  
* **Last Updated:** October 2026  

---

## 1. Purpose

This document describes the major user journeys and system workflows in FLOW.

It explains how users interact with the platform, how the AI assistant processes instructions, how actions are planned and approved, and how the system handles execution, verification, and failures.

The objective is to ensure that every workflow is understandable, predictable, and controlled by the user.

---

## 2. Core Workflow Principles

FLOW should follow these principles across all user journeys:
1. **Understand before acting:** Interpret the user's instruction and identify the intended outcome.
2. **Clarify ambiguity:** Ask questions when required information is missing or unclear.
3. **Plan before execution:** Convert requests into structured and understandable action plans.
4. **Obtain approval:** Require explicit approval before consequential actions.
5. **Execute safely:** Perform only the approved actions.
6. **Verify results:** Confirm whether each action was successfully completed.
7. **Prevent duplicates:** Ensure retries do not repeat already completed actions.
8. **Report transparently:** Communicate successes, failures, and partial completion.

---

## 3. Main User Journey

The primary FLOW journey consists of the following stages:
1. User connects supported productivity accounts.
2. User submits a natural-language instruction.
3. FLOW interprets the request.
4. FLOW identifies required information and checks relevant resources.
5. FLOW generates an execution plan.
6. User reviews the proposed plan.
7. User approves or rejects consequential actions.
8. FLOW executes approved actions.
9. FLOW verifies execution results.
10. FLOW displays the final outcome and records activity.

### 3.1 High-Level Workflow

```text
flowchart TD
    A([User opens FLOW]) --> B[Connect productivity accounts]
    B --> C[Submit natural-language request]
    C --> D[Interpret user intent]
    D --> E{Information sufficient?}
    E -->|No| F[Ask user for clarification]
    F --> C
    E -->|Yes| G[Retrieve relevant information]
    G --> H[Generate execution plan]
    H --> I[Display proposed actions]
    I --> J{Approval required?}
    J -->|Yes| K[Request explicit approval]
    J -->|No| L[Execute permitted action]
    K --> M{User decision}
    M -->|Reject| N[Stop proposed action]
    M -->|Approve| L
    L --> O[Execute action]
    O --> P[Verify result]
    P --> Q{Successful?}
    Q -->|Yes| R[Update activity history]
    Q -->|No| S[Handle failure safely]
    S --> T[Report failure or recovery options]
    R --> U[Show final result]
    T --> U