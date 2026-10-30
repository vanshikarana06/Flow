# FLOW — Demo Script and Walkthrough

**Document:** Demo Script and Walkthrough  
**Project:** FLOW  
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** October 2026

---

## 1. Purpose

This document defines the proposed demonstration strategy for FLOW.

The objective is to present FLOW as a productivity coordination assistant that understands natural-language instructions and coordinates actions across email, calendar, and task-management services.

The demonstration should communicate four important capabilities:

1. Natural-language understanding.
2. Multi-step workflow planning.
3. Human approval before consequential actions.
4. Execution verification and transparent reporting.

The demo should focus on demonstrating a complete, working user journey rather than presenting a large number of disconnected features.

**Important:** This is a proposed demo plan. Only implemented and tested capabilities should be presented as working features.

## 2. Demonstration Objectives

The demonstration should help judges understand:

- What problem FLOW addresses.
- Why managing multiple productivity applications creates friction.
- How FLOW interprets a natural-language request.
- How multiple operations are coordinated.
- How users retain control over consequential actions.
- How FLOW verifies whether actions succeeded.
- How failures and duplicate operations are handled.

The main objective is to establish that FLOW is not merely a chatbot that generates suggestions. Its intended value is coordinating real productivity workflows with user approval and reliable execution.

## 3. Problem Statement

People frequently manage their work across different productivity applications.

For example, arranging a meeting may require:

1. Finding the relevant email.
2. Extracting meeting details.
3. Checking calendar availability.
4. Suggesting a suitable time.
5. Creating a calendar event.
6. Creating a follow-up task.
7. Tracking whether everything was completed.

These activities require repeated switching between applications and manual coordination.

FLOW aims to reduce this friction by providing a unified interface for natural-language interaction and controlled multi-step execution.

## 4. Proposed Solution

FLOW is a productivity coordination assistant that allows users to describe their desired outcome in natural language.

Instead of manually performing every operation, users can submit a request and allow FLOW to:

- Understand the intended outcome.
- Retrieve relevant information.
- Break the request into smaller steps.
- Prepare an execution plan.
- Present proposed actions.
- Obtain approval before consequential operations.
- Execute approved operations.
- Verify results.
- Maintain an activity history.

The user remains in control of important actions.

## 5. Recommended Main Demo Scenario

<badge color="success">Recommended demo scenario</badge>

### Scenario: Intelligent Meeting Coordination

**User instruction:**

"Find the email about tomorrow's project meeting, check my calendar, suggest a suitable time, and create a follow-up task."

This scenario is useful because it demonstrates multiple parts of FLOW in one workflow.

### Capabilities Demonstrated

| Capability | Demonstration |
|---|---|
| Natural-language understanding | Understands the complete request |
| Email integration | Finds relevant meeting information |
| Context extraction | Extracts meeting details |
| Calendar integration | Checks availability |
| Workflow planning | Breaks the request into steps |
| Human approval | Requests approval before modifications |
| Task management | Prepares a follow-up task |
| Execution | Performs approved operations |
| Verification | Checks resulting resource states |
| Activity history | Records execution outcomes |

The scenario should only be used as a live integration demo if the required email, calendar, and task operations have actually been implemented.

## 6. Demo Environment Preparation

Before presenting FLOW, prepare a controlled environment.

### 6.1 Application Preparation

- Start the frontend.
- Start the backend.
- Verify the database connection.
- Verify AI model or API availability.
- Confirm required integrations are connected.
- Check that authentication is working.
- Ensure the dashboard loads correctly.

### 6.2 Test Account Preparation

Prepare a dedicated demonstration account containing:

**Sample email**

Subject: Project Discussion Meeting

Example content:

"Hi, we need to arrange a discussion about the current project progress tomorrow. Please check your availability and suggest a suitable time."

**Sample calendar events**

- 10:00 AM – Team Meeting
- 12:00 PM – Project Review

**Sample task**

- Review project documentation.
- Status: Pending.

Use synthetic demonstration data rather than exposing real personal information.

### 6.3 Backup Preparation

Prepare:

- Screenshots of important screens.
- A short screen recording.
- Sample API responses.
- A backup demo account.
- A documented fallback workflow.

If an external integration becomes unavailable during the hackathon, explain the limitation rather than pretending a simulated result is a real execution.

## 7. Live Demonstration Walkthrough

### Stage 1: Introduce the Problem

<text color="secondary" weight="medium" size="xs">Suggested time: 30–45 seconds</text>

**What to show:**

The FLOW dashboard or a simple problem illustration.

**Suggested explanation:**

"Today, managing work often means switching between email, calendar, and task-management applications. Even a simple activity like arranging a meeting can require several manual steps.

We wanted to simplify this process by creating FLOW, a productivity coordination assistant that allows users to describe what they want in natural language."

### Stage 2: Introduce FLOW

<text color="secondary" weight="medium" size="xs">Suggested time: 30 seconds</text>

**What to show:**

- FLOW dashboard.
- Navigation sidebar.
- AI assistant input.
- Daily overview.

**Suggested explanation:**

"FLOW brings these productivity activities into one unified workspace. Users can interact with the assistant, review their tasks and schedule, receive recommendations, and control proposed actions from one place."

### Stage 3: Submit a Natural-Language Request

<text color="secondary" weight="medium" size="xs">Suggested time: 45 seconds</text>

**What to show:**

The AI assistant input.

**Enter this instruction:**

"Find the email about tomorrow's project meeting, check my calendar, suggest a suitable time, and create a follow-up task."

**Suggested explanation:**

"Instead of manually opening different applications, the user describes the complete outcome they want. FLOW interprets the request and identifies the operations needed to accomplish it."

### Stage 4: Show the Execution Plan

<text color="secondary" weight="medium" size="xs">Suggested time: 45–60 seconds</text>

**What to show:**

The generated action plan.

**Expected plan:**

1. Search the connected inbox.
2. Retrieve the relevant project meeting email.
3. Extract the meeting context.
4. Check calendar availability.
5. Identify a suitable time.
6. Prepare a calendar event.
7. Prepare a follow-up task.
8. Request approval before consequential actions.

**Suggested explanation:**

"FLOW does not immediately execute the entire request. It first converts the instruction into a structured plan. This makes the intended operations visible and allows the user to understand what the system is about to do."

### Stage 5: Demonstrate Information Retrieval

<text color="secondary" weight="medium" size="xs">Suggested time: 45 seconds</text>

**What to show:**

- Relevant email.
- Extracted meeting details.
- Calendar availability.

**Suggested explanation:**

"FLOW retrieves the information needed for the workflow. It identifies the relevant email and checks the calendar before recommending a time. The recommendation is based on retrieved information rather than an unsupported assumption."

### Stage 6: Demonstrate Human Approval

<badge color="success">Important judging moment</badge>

<text color="secondary" weight="medium" size="xs">Suggested time: 60 seconds</text>

**What to show:**

The approval center.

Display:

- Calendar event title.
- Date and time.
- Participants.
- Follow-up task details.
- Proposed changes.

**Suggested explanation:**

"This is an important part of FLOW. The assistant can prepare actions, but consequential operations are not performed without explicit user approval.

The user can review the exact proposed changes, approve them, reject them, or edit the details."

Demonstrate the approval action.

### Stage 7: Demonstrate Execution

<text color="secondary" weight="medium" size="xs">Suggested time: 45 seconds</text>

**What to show:**

- Execution progress.
- Calendar event result.
- Task creation result.

**Suggested explanation:**

"After approval, FLOW executes the permitted operations through the connected services. Each operation is tracked separately so that the system can identify which steps succeeded and which require attention."

### Stage 8: Demonstrate Verification

<text color="secondary" weight="medium" size="xs">Suggested time: 45 seconds</text>

**What to show:**

- Updated calendar.
- Created task.
- Execution result.

**Suggested explanation:**

"FLOW does not consider an action successful simply because an API request was sent. It checks the resulting state where possible and reports the actual outcome."

### Stage 9: Show Activity History

<text color="secondary" weight="medium" size="xs">Suggested time: 30 seconds</text>

**What to show:**

The activity history screen.

**Suggested explanation:**

"Every important operation is recorded. Users can review what FLOW attempted, what was approved, what succeeded, and what failed. This provides transparency and makes the workflow easier to audit."

## 8. Optional Failure-Handling Demonstration

If time permits, demonstrate one controlled failure scenario.

### Scenario: Calendar API Failure

**Steps:**

1. Prepare a calendar event.
2. Approve the operation.
3. Simulate an external API failure.
4. Show the failure status.
5. Show the error information.
6. Demonstrate recovery or explain the next available action.

**Expected Behaviour:**

- FLOW must not display a false success message.
- The failed operation must be recorded.
- The user must receive an understandable explanation.
- Previously completed steps must remain identifiable.
- Retry must not create duplicate events.

**Suggested explanation:**

"External services can fail, and a reliable assistant must handle that correctly. FLOW tracks execution results, identifies failures, and avoids blindly repeating operations that may already have succeeded."

Only demonstrate this if the failure-handling behaviour has been implemented and tested.

## 9. Suggested Demo Timeline

<text color="secondary" size="xs">Proposed 5-minute demonstration</text>

| Stage | Activity | Time |
|---|---|---:|
| 1 | Problem introduction | 35 sec |
| 2 | Product overview | 25 sec |
| 3 | Natural-language request | 35 sec |
| 4 | Execution plan | 40 sec |
| 5 | Information retrieval | 40 sec |
| 6 | Human approval | 55 sec |
| 7 | Execution and verification | 55 sec |
| 8 | Activity history and conclusion | 35 sec |
| | **Total** | **5 min** |

If the hackathon allows a longer presentation, use the additional time for architecture, technical implementation, failure handling, and questions.

## 10. Complete Demo Script

The following is a consolidated presentation script.

### Opening

"Managing productivity across different applications often requires repetitive manual coordination.

For example, arranging a meeting may involve searching emails, checking calendar availability, creating an event, and preparing follow-up tasks.

We built FLOW to simplify this process."

### Product Introduction

"FLOW is a productivity coordination assistant that allows users to interact with email, calendar, and task-management workflows through natural language.

It understands the user's request, prepares a structured plan, and coordinates the required operations."

### Live Interaction

"Let's see this with a practical example.

I will ask FLOW to find an email about tomorrow's project meeting, check my calendar, suggest a suitable time, and create a follow-up task."

### Planning

"FLOW breaks this request into smaller operations and retrieves the information required to prepare the workflow."

### Approval

"Before making consequential changes, FLOW presents the proposed actions for user review. The user remains in control and must explicitly approve the operations."

### Execution

"Once approved, FLOW performs the requested operations through the connected services."

### Verification

"After execution, FLOW checks the results and updates the activity history. If an operation fails, the system reports that instead of claiming success."

### Closing

"Our goal with FLOW is to move productivity management from scattered manual actions to coordinated, transparent, and user-controlled execution."

## 11. What Makes the Demonstration Convincing?

The demo should prioritize evidence over claims.

| Demonstration Evidence | What It Proves |
|---|---|
| Real natural-language request | User-facing interaction works |
| Structured action plan | Request is decomposed into steps |
| Actual email retrieval | Email integration works |
| Actual calendar availability check | Scheduling uses real data |
| Approval screen | User control is implemented |
| Real external action | Execution is functional |
| Verified resulting resource | System checks outcomes |
| Activity history | Operations are traceable |
| Controlled failure test | Error handling is functional |

Avoid presenting an architecture diagram or an attractive dashboard as proof that the underlying integrations work.

## 12. Common Demo Risks and Mitigation

| Risk | Potential Impact | Mitigation |
|---|---|---|
| AI generates an incorrect plan | Workflow becomes unreliable | Prepare representative test instructions |
| External API becomes unavailable | Live workflow fails | Maintain a tested backup |
| OAuth token expires | Integration stops working | Verify account authorization beforehand |
| Slow AI response | Demo timing is affected | Pre-test model latency |
| Incorrect calendar data | Bad scheduling recommendation | Prepare controlled test events |
| Approval interface fails | Core safety requirement is not demonstrated | Test approval flow independently |
| Duplicate event creation | Reduces trust | Validate idempotency beforehand |
| Incomplete execution | Confusing result | Demonstrate partial completion clearly |
| Internet connectivity fails | External services become inaccessible | Prepare screenshots and a recorded walkthrough |

## 13. Features to Avoid Overclaiming

During the presentation, distinguish implemented capabilities from planned capabilities.

Do not claim that:

- Every email or calendar provider is supported.
- FLOW works autonomously without user oversight.
- All AI-generated plans are always correct.
- Every external action is guaranteed to succeed.
- All operations are fully reversible.
- Duplicate actions are impossible under every failure condition.
- Proactive monitoring is real-time unless it has been implemented.
- Every action has been verified if the integration cannot confirm its resulting state.

Instead, explain the actual implementation, its boundaries, and the safeguards used.

## 14. Judge Questions and Suggested Answers

### Q1. What problem does FLOW solve?

FLOW reduces the manual coordination required across email, calendar, and task-management applications by allowing users to describe multi-step productivity outcomes through natural language.

### Q2. How is FLOW different from a normal chatbot?

A normal chatbot may provide instructions or generate content. FLOW is designed to coordinate actual operations through connected services, with approval controls and execution verification.

### Q3. Why is human approval necessary?

AI-generated plans may contain incorrect details or unintended actions. Explicit approval ensures users review consequential changes before they are performed.

### Q4. How do you prevent duplicate actions?

FLOW should use idempotency mechanisms, persistent operation records, and external resource reconciliation. These safeguards help prevent repeated operations when requests are retried or interrupted.

### Q5. What happens if an API fails?

The system records the failure, identifies which steps were completed, and determines whether retrying is safe. It reports partial completion when appropriate.

### Q6. How does FLOW handle incorrect AI output?

The AI output is validated against structured schemas, supported operations, and approval policies. Invalid plans must not reach the execution engine.

### Q7. How does FLOW protect user data?

The intended approach includes secure authentication, least-privilege permissions, protected credentials, user-specific access controls, and careful handling of external content.

### Q8. What is the main technical challenge?

Coordinating multi-step operations across independent services while maintaining correct execution state, approval enforcement, and safe recovery from failures.

### Q9. Can FLOW work with multiple productivity providers?

That is a possible future direction. The initial implementation should prioritize one provider ecosystem before expanding integrations.

### Q10. What is the future direction?

Potential improvements include more integrations, configurable automation preferences, advanced proactive recommendations, improved workflow observability, and support for more complex productivity operations.

## 15. Final Demo Readiness Checklist

### Product

- [ ] Main dashboard works.
- [ ] AI assistant accepts instructions.
- [ ] Execution plan is displayed.
- [ ] Approval interface works.
- [ ] Activity history is available.

### Integrations

- [ ] Required accounts are connected.
- [ ] Email retrieval works.
- [ ] Calendar retrieval works.
- [ ] Required write operations work.
- [ ] Task operations work if included in the demo.

### Safety and Reliability

- [ ] Consequential actions require approval.
- [ ] Rejected actions are not executed.
- [ ] Approval changes are handled correctly.
- [ ] Duplicate execution is prevented.
- [ ] Execution results are verified.
- [ ] Failures are communicated accurately.

### Presentation

- [ ] Demo data is prepared.
- [ ] Main scenario has been rehearsed.
- [ ] Presentation fits the allocated time.
- [ ] Backup material is ready.
- [ ] Known limitations are documented.
- [ ] Every technical claim can be demonstrated or explained.

## 16. Conclusion

The FLOW demonstration should communicate one central idea:

**Users should be able to describe what they want, understand what the system plans to do, approve consequential actions, and verify what actually happened.**

The strongest demonstration is a complete, working workflow supported by real integration results, visible approval controls, and transparent execution records.

The focus should remain on demonstrating reliability and user control rather than simply showcasing AI-generated responses.