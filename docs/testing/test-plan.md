# FLOW — Test Plan

**File:** `docs/testing/test-plan.md`  
**Project:** FLOW  
**Document Type:** Software Test Plan  
**Status:** Draft — update according to actual implementation.

---

## 1. Purpose

This document defines the testing strategy for FLOW, an agentic productivity assistant designed to coordinate email, calendar, and task management activities.

The purpose of testing is to verify that FLOW:

- Understands natural-language instructions correctly.
- Generates appropriate action plans.
- Retrieves relevant information from connected applications.
- Requires approval before consequential actions.
- Executes approved actions correctly.
- Verifies action results.
- Handles failures without misleading users.
- Prevents duplicate actions during retries.
- Protects user data and application permissions.
- Provides a consistent user experience.

Testing should cover individual components as well as complete end-to-end workflows.

**Important:** Test cases in this document are proposed. They must not be marked as passed until they have actually been executed.

---

## 2. Testing Objectives

The main testing objectives are:

1. Verify functional correctness.
2. Validate agent planning and orchestration.
3. Test application integrations.
4. Verify human approval enforcement.
5. Test execution verification and retry safety.
6. Identify security and privacy vulnerabilities.
7. Validate frontend and backend communication.
8. Evaluate failure handling.
9. Measure response time and resource usage.
10. Confirm demo readiness.

---

## 3. Scope of Testing

### In Scope

- User authentication.
- User preferences.
- Natural-language request processing.
- Context retrieval.
- Agent orchestration.
- Action planning.
- Approval workflows.
- Email operations.
- Calendar operations.
- Task operations.
- Proactive alerts.
- Execution verification.
- Retry and idempotency handling.
- Activity history.
- API integrations.
- Frontend usability.
- Security and authorization.
- Error handling.

### Out of Scope for Initial MVP

These areas may be considered in future versions:

- Large-scale enterprise load testing.
- Advanced multi-tenant isolation testing.
- Complex team collaboration.
- Support for every third-party productivity provider.
- Long-term predictive behavior evaluation.
- Extensive cross-region disaster recovery testing.

---

## 4. Testing Levels

| Testing level | Purpose |
|---|---|
| Unit Testing | Test individual functions and components |
| Integration Testing | Verify communication between modules |
| API Testing | Validate backend endpoints and responses |
| Agent Testing | Evaluate request understanding and action planning |
| System Testing | Test the complete application |
| End-to-End Testing | Validate complete user workflows |
| Security Testing | Identify authentication, authorization, and data protection issues |
| Performance Testing | Measure response times and resource usage |
| User Acceptance Testing | Confirm that workflows meet user expectations |

---

## 5. Functional Testing

### 5.1 Authentication

| Test ID | Test scenario | Expected result |
|---|---|---|
| AUTH-001 | Register a new user | Account is created successfully |
| AUTH-002 | Login with valid credentials | User is authenticated |
| AUTH-003 | Login with invalid credentials | Access is denied |
| AUTH-004 | Access a protected endpoint without authentication | Request is rejected |
| AUTH-005 | Use an expired session or token | Reauthentication is required |
| AUTH-006 | Logout | Session or token is invalidated as designed |

### 5.2 Natural-Language Processing

| Test ID | Test scenario | Expected result |
|---|---|---|
| NLP-001 | Submit a clear task request | Intent is identified correctly |
| NLP-002 | Submit a request involving multiple applications | Required application domains are identified |
| NLP-003 | Submit an ambiguous request | System asks for clarification |
| NLP-004 | Submit an incomplete request | Missing information is identified |
| NLP-005 | Submit an unsupported request | System explains the limitation |
| NLP-006 | Submit a request with conflicting instructions | Conflict is identified instead of silently ignored |

### 5.3 Action Planning

| Test ID | Test scenario | Expected result |
|---|---|---|
| PLAN-001 | Request a multi-step workflow | A structured action plan is generated |
| PLAN-002 | Request a calendar event | Calendar-related actions are identified |
| PLAN-003 | Request a follow-up task | Task creation is included in the plan |
| PLAN-004 | Request an unsupported operation | Unsupported action is not executed |
| PLAN-005 | Submit a request with dependencies | Actions are ordered correctly |
| PLAN-006 | Submit a request requiring clarification | Execution waits for the missing information |

### 5.4 Email Integration

| Test ID | Test scenario | Expected result |
|---|---|---|
| EMAIL-001 | Retrieve emails | Relevant messages are returned |
| EMAIL-002 | Search using a keyword | Matching messages are identified |
| EMAIL-003 | Retrieve a specific email | Correct email information is displayed |
| EMAIL-004 | Prepare an email draft | Draft content is generated |
| EMAIL-005 | Attempt to send without approval | Sending is blocked |
| EMAIL-006 | Approve and send an email | Approved operation is executed |
| EMAIL-007 | Email provider returns an error | Failure is reported clearly |

### 5.5 Calendar Integration

| Test ID | Test scenario | Expected result |
|---|---|---|
| CAL-001 | Retrieve upcoming events | Events are displayed |
| CAL-002 | Check availability | Existing calendar events are considered |
| CAL-003 | Detect overlapping events | Conflict is identified |
| CAL-004 | Prepare a new event | Event details are generated |
| CAL-005 | Attempt event creation without approval | Creation is blocked |
| CAL-006 | Approve event creation | Event is created |
| CAL-007 | Update an existing event | Approved changes are applied |
| CAL-008 | Cancel an event without approval | Cancellation is blocked |

### 5.6 Task Management

| Test ID | Test scenario | Expected result |
|---|---|---|
| TASK-001 | Retrieve pending tasks | Tasks are displayed |
| TASK-002 | Create a task proposal | Task details are generated |
| TASK-003 | Create an approved task | Task is created |
| TASK-004 | Update task details | Approved changes are applied |
| TASK-005 | Complete a task | Correct task status is updated |
| TASK-006 | Delete a task without approval | Deletion is blocked |

### 5.7 Approval Workflow

| Test ID | Test scenario | Expected result |
|---|---|---|
| APPROVE-001 | Submit a consequential action | Approval is required |
| APPROVE-002 | Approve a proposed action | Execution is permitted |
| APPROVE-003 | Reject a proposed action | Action is not executed |
| APPROVE-004 | Attempt execution with expired approval | Execution is blocked |
| APPROVE-005 | Modify an action after approval | Fresh approval is required |
| APPROVE-006 | Approve an action as an unauthorized user | Approval is rejected |
| APPROVE-007 | Attempt to execute through a direct API call without approval | Backend blocks execution |

**Critical requirement:** Approval must be enforced by backend authorization logic. Hiding a frontend button or instructing the AI model not to execute an action is not sufficient.

### 5.8 User Preferences

| Test ID | Test scenario | Expected result |
|---|---|---|
| PREF-001 | Create a preference | Preference is saved |
| PREF-002 | Retrieve saved preferences | Correct preferences are displayed |
| PREF-003 | Update a preference | Updated value is stored |
| PREF-004 | Delete an individual preference | Only the selected preference is removed |
| PREF-005 | Apply a scheduling preference | Relevant recommendations respect it |
| PREF-006 | Submit conflicting preferences | Conflict is identified or resolved using an explicit policy |

### 5.9 Proactive Notifications

| Test ID | Test scenario | Expected result |
|---|---|---|
| ALERT-001 | Detect an upcoming deadline | Relevant alert is generated |
| ALERT-002 | Detect a scheduling conflict | Conflict notification is generated |
| ALERT-003 | Detect an irrelevant event | No unnecessary alert is generated |
| ALERT-004 | Process the same event repeatedly | Duplicate alerts are controlled |
| ALERT-005 | Disable a notification category | Disabled alerts are not delivered |

---

## 6. Agent and AI Evaluation

Agent testing must evaluate more than whether the model generates a convincing response.

It must evaluate whether the complete workflow is correct and safe.

### Evaluation dimensions

| Dimension | What to evaluate |
|---|---|
| Intent Accuracy | Does the system understand the user's goal? |
| Entity Extraction | Are dates, times, people, and task details extracted correctly? |
| Planning Accuracy | Are the correct actions selected? |
| Dependency Handling | Are actions executed in the correct order? |
| Context Retrieval | Is relevant application information retrieved? |
| Tool Selection | Are appropriate tools selected? |
| Parameter Accuracy | Are tool arguments valid and complete? |
| Approval Compliance | Are consequential actions blocked until approved? |
| Execution Accuracy | Are approved operations performed correctly? |
| Verification Accuracy | Are outcomes reported truthfully? |
| Failure Recovery | Does the system handle errors safely? |

### Suggested AI test cases

1. A simple request involving one application.
2. A request involving email and calendar.
3. A request involving email, calendar, and tasks.
4. An ambiguous scheduling request.
5. A request with missing dates or times.
6. A request involving conflicting calendar events.
7. A request that requires user clarification.
8. A request for an unsupported operation.
9. A request containing contradictory instructions.
10. A request containing malicious instructions inside retrieved email content.

### Evaluation approach

- Prepare a fixed dataset of test requests.
- Define the expected intent and action plan.
- Execute each test multiple times where model nondeterminism matters.
- Compare generated plans with expected outcomes.
- Record incorrect tool calls and invalid parameters.
- Measure approval violations and unsafe execution attempts.
- Track performance across model or prompt changes.

**Important:** AI evaluation results must be based on recorded test executions, not subjective impressions.

---

## 7. Safety and Security Testing

### 7.1 Authorization Testing

- Verify that users can access only their own data.
- Verify that protected APIs reject unauthenticated requests.
- Verify that approval cannot be bypassed through direct API requests.
- Verify that users cannot approve another user's actions.
- Verify that revoked permissions are respected.

### 7.2 Prompt Injection Testing

Test malicious instructions embedded in:

- Emails.
- Calendar descriptions.
- Task descriptions.
- External documents.
- Retrieved application content.

Expected behavior:

- Treat external content as untrusted data.
- Do not allow retrieved content to override system policies.
- Do not execute unauthorized actions.
- Require approval for consequential operations.

### 7.3 Sensitive Data Protection

- Do not expose access tokens in frontend responses.
- Do not store secrets in source control.
- Protect sensitive user information in logs.
- Validate access to stored preferences and activity records.
- Use secure communication for external integrations.
- Follow the selected provider's OAuth and token-storage requirements.

### 7.4 Input Validation

Test:

- Missing fields.
- Invalid dates and times.
- Unexpected data types.
- Excessively long inputs.
- Malformed API payloads.
- Invalid identifiers.
- Duplicate requests.

---

## 8. Reliability, Retries, and Idempotency Testing

This is a critical testing area because FLOW may perform actions that modify external applications.

### Test scenarios

| Test ID | Scenario | Expected result |
|---|---|---|
| REL-001 | API request times out before execution | System reports an uncertain or failed state appropriately |
| REL-002 | External action succeeds but response is lost | System reconciles the external state before retrying |
| REL-003 | Same action is submitted twice | Duplicate execution is prevented where supported |
| REL-004 | User retries a completed operation | Existing result is recognized |
| REL-005 | External API is temporarily unavailable | Failure is handled gracefully |
| REL-006 | Workflow fails halfway through | Completed and incomplete steps are distinguished |
| REL-007 | User rejects an action | Rejected action is not executed |
| REL-008 | Approval expires before execution | Execution is blocked |

### Important retry rule

A timeout does not necessarily mean an action failed.

For example, if a calendar event creation request times out, the event may still have been created by the external provider.

Before retrying:

1. Check the previous execution record.
2. Reconcile with the external application's state where possible.
3. Determine whether the operation already succeeded.
4. Retry only when safe.
5. Record the final outcome.

Do not assume that every failed HTTP response means no external side effect occurred.

---

## 9. API Integration Testing

Test each external integration independently.

### API test categories

- Authentication and token refresh.
- Permission and scope validation.
- Request and response validation.
- Rate limiting.
- Timeout handling.
- Pagination.
- Error responses.
- Token revocation.
- Provider unavailability.
- Data consistency.

### Suggested test scenarios

1. Valid API request.
2. Invalid access token.
3. Expired access token.
4. Insufficient permissions.
5. Missing required parameters.
6. Rate-limit response.
7. Network timeout.
8. Provider server error.
9. Malformed response.
10. Duplicate operation request.

---

## 10. Performance Testing

Performance testing should measure:

- Initial dashboard loading time.
- Chat response time.
- Request planning time.
- External API response time.
- Approval-to-execution delay.
- End-to-end workflow duration.
- Database query performance.
- Memory and CPU usage.

### Suggested performance metrics

| Metric | Description |
|---|---|
| Response Time | Time taken to respond to a request |
| P50 Latency | Median response time |
| P95 Latency | Response time below which 95% of requests complete |
| Error Rate | Percentage of failed requests |
| Throughput | Requests processed per unit of time |
| Resource Usage | CPU and memory consumption |
| Workflow Completion Rate | Percentage of workflows completed successfully |

Do not define arbitrary performance targets as achieved results. Set targets based on the actual deployment environment and measure them.

---

## 11. Frontend and User Experience Testing

Test the following:

- Dashboard rendering.
- Navigation between sections.
- AI chat interaction.
- Loading states.
- Approval and rejection controls.
- Calendar display.
- Task display.
- Activity history.
- Error messages.
- Empty states.
- Responsive layout.
- Keyboard navigation.
- Form validation.

### Important UI scenarios

- User sees a clear explanation before approving an action.
- User can distinguish pending, approved, completed, failed, and uncertain actions.
- User can identify which actions were performed.
- User receives clear feedback after rejection.
- User is not shown a success message before execution is verified.

---

## 12. End-to-End Testing

The following scenarios should be tested using the complete application.

### Scenario 1 — Meeting Coordination

**Input:**

"Find the email about tomorrow's project meeting, check my calendar, suggest a suitable time, and create a follow-up task."

**Expected result:**

- Relevant email is retrieved.
- Meeting details are extracted.
- Calendar availability is checked.
- A suitable time is suggested.
- Calendar and task actions are prepared.
- Required approvals are obtained.
- Approved actions are executed.
- Results are verified.
- Activity history is updated.

### Scenario 2 — Scheduling Conflict

**Input:**

"Schedule a meeting at 11 AM tomorrow."

**Expected result:**

- Calendar is checked.
- Existing conflict is identified.
- The system informs the user.
- An alternative may be suggested.
- No conflicting event is silently created.

### Scenario 3 — Approval Rejection

**Input:**

"Prepare and send an email confirming the meeting."

**Expected result:**

- Email content is prepared.
- User reviews the proposed email.
- User rejects the action.
- Email is not sent.
- Rejection is recorded.

### Scenario 4 — External API Failure

**Input:**

A request that requires calendar event creation while the provider is unavailable.

**Expected result:**

- Failure is detected.
- The user receives an accurate status.
- No false success message is displayed.
- Retry is offered only when safe.
- Activity history records the failure.

### Scenario 5 — Duplicate Retry

**Input:**

A calendar creation request is repeated after an uncertain timeout.

**Expected result:**

- Previous execution is reconciled.
- Existing event is recognized if already created.
- Duplicate event creation is avoided.
- Final status is recorded accurately.

---

## 13. Test Environment and Tools

The following are candidate tools. Confirm the final selection based on the actual technology stack.

| Purpose | Candidate tools |
|---|---|
| Backend unit testing | Pytest |
| API testing | HTTPX / FastAPI TestClient |
| Frontend end-to-end testing | Playwright |
| Manual API testing | Postman |
| Code coverage | Coverage.py |
| Load testing | Locust |
| CI automation | GitHub Actions |
| Error monitoring | Sentry or equivalent |

### Test environments

**Local development**

- Test individual modules.
- Use mock integrations where possible.
- Validate API behavior.

**Testing / staging**

- Test real integration behavior with test accounts.
- Verify OAuth permissions.
- Run end-to-end workflows.
- Test failure and retry behavior.

**Demo environment**

- Use synthetic data.
- Verify all demonstrated integrations.
- Confirm approval and execution behavior.
- Prepare fallback scenarios.

Never use real user credentials or private emails as test fixtures.

---

## 14. Test Data Management

Test data should cover:

- Sample emails.
- Calendar events.
- Pending tasks.
- User preferences.
- Approval requests.
- Completed workflows.
- Failed workflows.
- Duplicate requests.
- Ambiguous instructions.
- Malicious retrieved content.

### Data handling rules

- Use synthetic accounts where possible.
- Remove personal information from test logs.
- Keep API credentials outside source control.
- Avoid exposing tokens in screenshots.
- Reset test data between repeatable test runs where appropriate.

---

## 15. Bug and Defect Management

Every defect should be documented with:

| Field | Description |
|---|---|
| Bug ID | Unique identifier |
| Title | Short description |
| Severity | Critical / High / Medium / Low |
| Component | Affected module |
| Steps to reproduce | Exact reproduction steps |
| Expected result | Correct behavior |
| Actual result | Observed behavior |
| Evidence | Screenshot, log, or response |
| Assigned to | Responsible team member |
| Status | Open / In Progress / Fixed / Verified |

### Severity guidelines

- **Critical:** Unauthorized external action, serious data exposure, or major system failure.
- **High:** Core workflow cannot be completed.
- **Medium:** Important feature behaves incorrectly but a workaround exists.
- **Low:** Minor visual or usability issue.

---

## 16. Continuous Testing and Quality Gates

Recommended development workflow:

1. Run unit tests after code changes.
2. Run integration tests after module integration.
3. Run API tests after backend changes.
4. Run security checks before releases.
5. Run end-to-end tests before demo preparation.
6. Review failures before merging code.

### Proposed quality gates

- No unresolved critical security issues.
- Approval enforcement tests pass.
- No known duplicate-action issue in supported retry scenarios.
- Core workflow completes in the test environment.
- Failures are reported accurately.
- No secrets are committed.
- Demonstrated functionality has reproducible test evidence.

---

## 17. Hackathon Demo Testing Checklist

Before the final demonstration:

### Application readiness

- [ ] Application starts successfully.
- [ ] Frontend connects to backend.
- [ ] Database is accessible.
- [ ] Required environment variables are configured.
- [ ] Test accounts are available.

### Workflow readiness

- [ ] Natural-language request is processed.
- [ ] Relevant information is retrieved.
- [ ] Action plan is generated.
- [ ] Approval is required where appropriate.
- [ ] Approved actions execute correctly.
- [ ] Results are verified.
- [ ] Activity history is updated.

### Failure readiness

- [ ] Invalid input is handled.
- [ ] External API errors are handled.
- [ ] Timeouts do not create unsafe retries.
- [ ] Rejected actions are not executed.
- [ ] Duplicate actions are prevented or detected.

### Presentation readiness

- [ ] Synthetic demo data is prepared.
- [ ] Screenshots are updated.
- [ ] Demo script matches the actual application.
- [ ] Fallback recording or screenshots are ready.
- [ ] No unimplemented feature is presented as working.

---

## 18. Test Execution Report

Complete this section after running the test suite.

| Metric | Result |
|---|---|
| Total test cases | Not yet measured |
| Executed test cases | Not yet measured |
| Passed test cases | Not yet measured |
| Failed test cases | Not yet measured |
| Blocked test cases | Not yet measured |
| Critical defects | Not yet measured |
| High-severity defects | Not yet measured |
| Code coverage | Not yet measured |

### Test execution summary

**Testing date:** To be filled in.  
**Build/version:** To be filled in.  
**Environment:** To be filled in.  
**Tested by:** To be filled in.  
**Overall result:** Not yet evaluated.

Do not replace these placeholders with estimated or fabricated results.

---

## 19. Future Testing Improvements

Potential improvements include:

- Automated regression testing.
- Larger AI evaluation datasets.
- Adversarial prompt-injection testing.
- Provider-specific failure simulation.
- Workflow-level observability.
- Automated duplicate-action detection.
- Performance benchmarking.
- Accessibility testing.
- More extensive user acceptance testing.

---

## 20. Final Testing Principles

FLOW should be considered ready for demonstration only when the demonstrated workflow has been tested.

The most important principles are:

1. Correctness before speed.
2. Approval before consequential execution.
3. Backend enforcement instead of prompt-only safety.
4. Verification before reporting success.
5. Reconciliation before retrying uncertain operations.
6. Transparent reporting of failures.
7. Protection of user data and credentials.
8. Evidence-based implementation claims.

**Document status:** Draft test plan.  
**Next action:** Map these test cases to the actual implemented modules and begin recording execution results.

---

## 15. System Architecture & Core Module Test Matrix

The following test suites validate the 10 major backend modules and external integrations against the approved Source of Truth:

### 15.1 Integration Test Suites
| Test ID | Module Under Test | Target Integration | Scenario | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **INT-01** | EmailModule | Microsoft Graph API | User approves sending email draft | Message sent via Graph /me/sendMail, HTTP 202 received, Sent Items verified |
| **INT-02** | EmailModule | Gmail API | User converts email to task | Action items extracted, task inserted with source_email_id |
| **INT-03** | CalendarModule | Microsoft Graph API | User reschedules conflicting event | Patch executed on /me/events/{id}, new start/end times verified |
| **INT-04** | CalendarModule | Google Calendar API | Sync FLOW native calendar to Google | Event mirrored, external ID saved, conflict flags cleared |
| **INT-05** | TasksModule | Microsoft To Do API | AI task breakdown of project | Parent task and subtasks created, order indices verified |
| **INT-06** | AgentModule | LiteLLM / Qwen 2.5 | Multi-step prompt over Cloudflare Tunnel | Intent parsed, memory context injected, valid plan JSON returned |
| **INT-07** | MemoryModule | Supabase + pgvector | Semantic behavioral search | Cosine similarity query returns closest behavioral pattern |

### 15.2 Approval Center & Verification Engine Test Suites
| Test ID | Component | Action | Test Case | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **APPR-01** | ApprovalsModule | Approve | User clicks 'Approve' on pending meeting | Action status transitions to APPROVED; execution proceeds |
| **APPR-02** | ApprovalsModule | Reject | User clicks 'Reject' on pending email | Action status transitions to REJECTED; execution aborted, logged |
| **APPR-03** | ApprovalsModule | Modify | User edits subject line and clicks 'Approve' | Action payload updated, re-hashed, status set to MODIFIED_AND_APPROVED |
| **VERIF-01** | VerificationModule | Email Sent Check | Check sent email existence | Verifier locates message in SentItems folder; status set to VERIFIED |
| **VERIF-02** | VerificationModule | Duplicate Retry | Network timeout simulated on send | Idempotency key blocks duplicate call; prior state probed and adopted |
