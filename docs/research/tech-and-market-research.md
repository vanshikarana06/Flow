# FLOW — Technology and Market Research

**Version:** 1.0  
**Status:** Draft — research baseline  
**Research date:** 30 October 2026  
**Related document:** `docs/project-overview/overview.md`

---

## 1. Purpose of This Document

This document evaluates the market and technical environment for FLOW, an agentic productivity assistant intended to coordinate email, calendar, and task workflows.

It is designed to help the team make evidence-based decisions about:

- The problem and market FLOW is entering.
- Existing products and the capabilities they already provide.
- The application APIs that could support the first implementation.
- Authentication, permissions, quotas, and integration risks.
- The technical requirements for safe multi-step execution.
- A realistic MVP direction for a hackathon project.

This is a research baseline, not proof of product-market fit. Market claims and competitor capabilities must be validated with users and updated as products change.

## 2. Executive Summary

The productivity software market already contains mature products for scheduling, task management, email assistance, and workflow automation. FLOW should not position itself as the first product to combine AI with productivity or as a product whose competitors cannot perform automated actions.

The opportunity worth investigating is a focused coordination experience: a user describes an outcome, FLOW gathers relevant context from connected applications, proposes a multi-step plan, requests approval for consequential actions, executes approved steps, verifies results, and reports partial failures clearly.

Two integration ecosystems are plausible:

- **Google Workspace:** Gmail API, Google Calendar API, and Google Tasks API.
- **Microsoft ecosystem:** Microsoft Graph for Outlook mail and calendar, with Microsoft To Do / Outlook task capabilities requiring careful validation of current API support and maturity.

Both ecosystems use OAuth-based authorization and provide APIs for reading and changing user data. Neither should be treated as frictionless. Gmail access scopes can trigger sensitive or restricted-scope verification requirements. Microsoft Graph uses delegated permissions and service-specific throttling. Task API coverage and maturity differ between ecosystems.

**Initial research recommendation:** choose one ecosystem for the first working MVP, build a reliable end-to-end workflow, and defer multi-provider support until the core workflow is proven.

## 3. Market Context

### 3.1 The problem space

FLOW sits at the intersection of several established software categories:

- Personal productivity and task management.
- Calendar and meeting scheduling.
- Email productivity and inbox assistance.
- AI assistants and copilots.
- Workflow automation and integration platforms.

Users already have tools for each individual category. The research question is therefore not whether people need another task manager or calendar. It is whether a focused assistant can reduce the effort of coordinating information and actions that are currently spread across those tools.

Examples of coordination problems to validate with users:

1. An email contains a meeting request, but the user must manually check availability and create the event.
2. An email contains an action item, but the user must manually create a task and remember its deadline.
3. A calendar change affects other commitments, requiring the user to review and reorganize their schedule.
4. A deadline is approaching, but the relevant task and source email are stored in different applications.
5. An automation partially succeeds, leaving the user unsure which actions were completed.

These are hypotheses for customer discovery, not measured findings about all users.

### 3.2 Market signals

Third-party market research indicates continued growth in AI productivity software. For example, Grand View Research estimates the global AI productivity tools market at approximately USD 11.1 billion in 2025 and USD 14.1 billion in 2026, with a forecast of USD 36.4 billion by 2033.

These figures should be treated as directional estimates, not as FLOW's addressable market. The category definition, methodology, assumptions, and paid research inputs affect the estimate. FLOW should not use this number as its TAM without defining a specific customer segment, geography, pricing model, and serviceable market.

Source: [Grand View Research — AI Productivity Tools Market](https://www.grandviewresearch.com/industry-analysis/ai-productivity-tools-market-report)

### 3.3 Initial customer hypotheses

| Segment | Possible coordination problem | Potential user / buyer | Research priority |
|---|---|---|---|
| Working professionals | Email follow-ups, meeting coordination, daily tasks | Individual professional; team lead | High |
| Students and academics | Academic email, deadlines, classes, meetings | Student; institution or department | Medium |
| Startup founders and small teams | Many responsibilities across communication and planning tools | Founder; operations lead | High |
| Freelancers and consultants | Client email, appointments, follow-ups, deliverables | Individual freelancer | Medium |
| Project coordinators | Meeting outcomes, action items, deadlines, status updates | Project or operations manager | Medium |

The team should interview people in these groups and identify one segment with a frequent, painful, and clearly described coordination workflow. Do not treat all segments as equally important in the first release.

### 3.4 Questions for customer discovery

The following questions should be tested through interviews or observed workflow studies:

- Which email, calendar, and task applications do people actually use?
- How often do they move information manually between those applications?
- Which coordination task is repeated most frequently?
- What happens when a task or follow-up is missed?
- Which actions would they allow an assistant to perform automatically?
- Which actions must always require confirmation?
- What information would they need to see before approving an action?
- Would they prefer a single provider ecosystem or a tool that connects different providers?
- What would make them stop using an assistant after one failed action?
- Would they pay for this workflow, and who would approve the purchase?

Avoid asking only whether users like the idea. Ask them to describe the last real occasion when the problem occurred and how they solved it.

## 4. Existing Product Landscape

The following comparison is based on publicly available product documentation and feature pages reviewed for this research. It is not a hands-on product test, and feature availability can vary by plan, region, rollout, and integration.

### 4.1 Competitor and alternative overview

| Product | Main focus | Relevant capabilities | Implication for FLOW |
|---|---|---|---|
| [Motion](https://www.usemotion.com/) | AI work planning and scheduling | Automatic task scheduling, calendar planning, deadline prioritization, schedule adjustment, AI chat | FLOW cannot claim that AI task planning or automatic scheduling is unique |
| [Reclaim.ai](https://reclaim.ai/) | Calendar and time management | AI scheduling, task scheduling, calendar conflict handling, natural-language chat, preview and approval of proposed calendar changes | Approval previews and proactive calendar assistance already exist |
| [Lindy](https://www.lindy.ai/) | Configurable AI agents and assistants | Agent workflows and integrations for automating business and personal tasks | FLOW competes with configurable agents as well as productivity apps |
| [Microsoft 365 Copilot](https://www.microsoft.com/microsoft-365/copilot) | AI assistance inside Microsoft 365 | Assistance across Microsoft apps and workflows; Microsoft is also rolling out natural-language workflow creation through Workflows | A native ecosystem assistant is a major competitor for Microsoft users |
| [Zapier](https://zapier.com/) | Cross-application workflow automation | Trigger/action workflows, AI steps, agents, and a large app integration library | FLOW must offer a simpler, more focused experience than a general automation builder |

### 4.2 Competitor observations

**Motion**

Motion's product documentation describes automatic scheduling based on tasks, deadlines, priorities, and available time. It can adjust schedules when plans change and offers AI chat and other work-management features.

Research implication: automatic scheduling and AI task management are established capabilities. FLOW should differentiate through the full coordination and execution lifecycle rather than claiming scheduling automation as a unique feature.

Sources:
- [Motion — AI Calendar](https://www.usemotion.com/features/ai-calendar)
- [Motion — AI Task Manager](https://www.usemotion.com/features/ai-task-manager)
- [Motion Help Center](https://www.usemotion.com/help)

**Reclaim.ai**

Reclaim documents natural-language scheduling and a Preview Mode in which proposed calendar changes are staged before being applied. Its task features include task scheduling, deadline-aware planning, and integrations with other task tools.

Research implication: user review before applying calendar changes is already present in the market. FLOW's approval model must be evaluated across different action types, not presented as an entirely new idea.

Sources:
- [Reclaim — Chat overview](https://help.reclaim.ai/en/articles/17124965-reclaim-chat-overview-ai-assistant-for-your-calendar)
- [Reclaim — 2.0 FAQ and Preview Mode](https://help.reclaim.ai/en/articles/15280604-reclaim-2-0-faq)
- [Reclaim — AI task features](https://reclaim.ai/features/tasks)

**Lindy**

Lindy is positioned around configurable AI agents and automations. It is a relevant alternative for users who want to automate work across applications rather than use a dedicated calendar or task manager.

Research implication: FLOW needs to test whether users value a ready-made, productivity-specific experience more than a flexible agent builder. A hands-on review of Lindy's current plans, integrations, and approval controls is still required.

Source: [Lindy](https://www.lindy.ai/)

**Microsoft 365 Copilot**

Microsoft documents AI assistance across Microsoft 365. Its Workflows agent is described as allowing users to create workflows using natural language across supported Microsoft 365 services. The April 2026 support page says access is part of a Frontier early-access rollout and has eligibility and regional limitations.

Research implication: the Microsoft ecosystem is moving toward natural-language workflow automation. FLOW should not assume that Microsoft users lack native automation.

Source: [Microsoft Support — Get started with Workflows in Microsoft Copilot](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-workflows-in-microsoft-365-copilot)

**Zapier**

Zapier describes a platform connecting thousands of applications through trigger/action workflows, with AI steps and agent capabilities.

Research implication: broad app connectivity is not a defensible differentiator by itself. FLOW may instead focus on a narrower set of productivity workflows, understandable approval, action verification, and retry safety.

Source: [Zapier Help — What is Zapier?](https://help.zapier.com/hc/en-us/articles/37518970271245-What-is-Zapier)

### 4.3 Possible positioning gap to validate

A possible positioning direction is:

> A focused assistant for coordinating everyday email, calendar, and task work, with explicit approval for consequential actions and clear proof of what actually happened.

This is a hypothesis, not a proven competitor gap. Reclaim already has preview-and-approve calendar changes, and automation platforms provide cross-app actions. FLOW must demonstrate that its combination of planning, approval, verification, and failure handling is materially easier or more trustworthy for a clearly defined user group.

## 5. Integration Ecosystem Research

### 5.1 Google Workspace APIs

A Google-based implementation could use three APIs:

| Product area | API | Potential operations |
|---|---|---|
| Email | Gmail API | Search and read messages; create drafts; send messages with appropriate scopes |
| Calendar | Google Calendar API | List calendars and events; create, update, and delete events |
| Tasks | Google Tasks API | List task lists and tasks; create, update, move, and delete tasks |

Official documentation:
- [Gmail API](https://developers.google.com/workspace/gmail/api)
- [Google Calendar API overview](https://developers.google.com/workspace/calendar/api/guides/overview)
- [Google Tasks API](https://developers.google.com/workspace/tasks/reference/rest)

**Advantages**

- Separate APIs exist for email, calendar, and tasks.
- Google provides official quickstarts, client libraries, and OAuth documentation.
- Google Calendar supports event IDs supplied by the client, which can help prevent duplicate event creation when an operation is retried after an uncertain response.
- Google Tasks has REST methods for creating, listing, updating, and deleting tasks.

**Constraints and risks**

- Gmail permissions vary by scope. Some read and modify scopes are classified as restricted, while sending can require a sensitive scope. Public applications requesting certain scopes may need OAuth verification. If restricted-scope data is stored or transmitted through servers, additional security assessment requirements can apply.
- An OAuth consent screen in external Testing mode generally issues refresh tokens that expire after seven days when the app requests scopes beyond basic identity scopes. This can interrupt longer-running tests.
- API quota limits and policies can change. The team must check the current quota page for the actual Google Cloud project rather than copying old quota numbers from tutorials.
- Gmail, Calendar, and Tasks require separate API enablement and scope planning.

Important sources:
- [Gmail API — Choose scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API — Usage limits](https://developers.google.com/workspace/gmail/api/reference/quota)
- [Google Calendar — Create events](https://developers.google.com/workspace/calendar/api/guides/create-events)

### 5.2 Microsoft ecosystem and Microsoft Graph

Microsoft Graph provides a unified API surface for many Microsoft 365 services. Outlook mail and calendar operations are available through Graph.

| Product area | Microsoft API surface | Potential operations |
|---|---|---|
| Email | Microsoft Graph Mail API | Read, create, update, move, and send messages, subject to permissions |
| Calendar | Microsoft Graph Calendar API | Read calendars and events; create, update, and delete events |
| Tasks | Microsoft To Do / Outlook task APIs | Work with supported task resources; verify current endpoint and support status before committing |

Official documentation:
- [Microsoft Graph — Mail, calendars, and contacts](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/office-365-rest-apis-for-mail-calendars-and-contacts)
- [Microsoft Graph permissions overview](https://learn.microsoft.com/en-us/graph/permissions-overview)
- [Microsoft Graph throttling limits](https://learn.microsoft.com/en-us/graph/throttling-limits)

**Advantages**

- One API platform covers many Microsoft 365 resources.
- OAuth permissions can be scoped to the required user data and actions.
- Outlook mail and calendar have production-ready Graph APIs.
- Microsoft provides official documentation, SDKs, and developer tools.

**Constraints and risks**

- Permissions and consent requirements vary by account type, tenant configuration, and requested operation.
- The app should request only the permissions needed for the selected workflow.
- Microsoft Graph applies service-specific throttling. Outlook service limits include per-mailbox request and concurrency limits; clients should handle `429 Too Many Requests` and respect `Retry-After` when provided.
- The Outlook task API has had a different maturity and preview status from mail and calendar APIs. The current support status must be checked before choosing Microsoft To Do / Outlook tasks as a core MVP dependency.
- A developer tenant or test account may have eligibility and availability limitations. Confirm access before making the ecosystem choice.

### 5.3 Google versus Microsoft: initial comparison

| Decision factor | Google Workspace | Microsoft ecosystem |
|---|---|---|
| Email integration | Gmail API | Microsoft Graph Mail API |
| Calendar integration | Google Calendar API | Microsoft Graph Calendar API |
| Task integration | Google Tasks API | Microsoft To Do / Outlook task API support must be checked |
| API model | Separate Workspace APIs | Unified Graph API for many services |
| Authentication | Google OAuth 2.0 | Microsoft identity platform / OAuth 2.0 |
| Permission model | OAuth scopes; some Gmail scopes are sensitive or restricted | Delegated/application permissions and consent |
| Rate limits | API-specific quotas | Global and service-specific throttling |
| Main integration risk | Gmail scope verification and test-mode token expiry | Tenant/account configuration and task API maturity |
| Best fit | Users already using Gmail, Google Calendar, and Google Tasks | Users already using Outlook, Microsoft 365, and Microsoft To Do |

**No provider is selected in this document.** The final choice should be made after testing authentication and one complete workflow with the actual accounts available to the team.

### 5.4 Integration decision checklist

Before selecting a provider, test the following with a real development account:

- Can every team member who needs to test obtain a suitable account?
- Can the app complete OAuth sign-in and refresh access tokens?
- Can it read the required email data?
- Can it create a draft without sending it?
- Can it send an email only after an explicit approval step?
- Can it read calendar events and create or update a test event?
- Can it create, update, and complete a task?
- Are the required scopes permitted for the intended account type?
- Are verification, tenant, or developer-program requirements manageable?
- Can the app reliably identify an operation after a timeout?
- Can the app be demonstrated without exposing real personal data?

## 6. Technical Requirements Implied by the Research

The integration APIs are only one part of the product. FLOW also needs an execution layer that manages plans, approvals, and results.

### 6.1 OAuth and token management

- Use the official OAuth flow for the selected provider.
- Store tokens securely; do not place access tokens or refresh tokens in source control.
- Request the narrowest practical permissions.
- Separate read permissions from write permissions where the provider supports it.
- Handle token expiry, revocation, and reauthorization.
- Never ask users to share their account passwords with FLOW.

### 6.2 Permission and approval model

The system should distinguish between:

- **Read operations:** retrieving relevant messages, events, and tasks.
- **Low-impact write operations:** creating or updating a task, depending on product policy.
- **Consequential operations:** sending an email, cancelling an event, or performing another action with meaningful external impact.

The exact action classification must be specified in the feature and approval documents. The problem statement requires explicit approval before consequential actions.

Approval should be tied to a specific proposed action and its parameters. If the action changes after approval, FLOW should request approval again.

### 6.3 Reliable multi-step execution

A workflow may contain several operations. Some can succeed while a later operation fails.

FLOW should therefore:

1. Assign a unique workflow and operation identifier.
2. Persist the planned steps and their current statuses.
3. Execute steps in a controlled order when dependencies exist.
4. Record the provider response and resulting resource identifier.
5. Verify the result using a follow-up read where practical.
6. Mark uncertain outcomes as unknown or requiring reconciliation, not as successful.
7. Retry only when it is safe to do so.
8. Prevent a completed operation from being repeated.

A timeout does not prove that an operation failed. The provider may have completed the action even though FLOW did not receive the response. The system should check for the resulting resource or operation state before retrying.

### 6.4 Idempotency and duplicate prevention

Idempotency means that repeating the same logical operation does not create an unintended duplicate effect.

Possible controls include:

- A unique internal operation ID.
- A database uniqueness constraint for a workflow step.
- Provider-supported idempotency keys, where available.
- A deterministic resource identifier when the API supports it.
- A post-timeout reconciliation check.
- Persisted completion status and provider resource IDs.

Google Calendar's event creation documentation allows a client-supplied event ID, which can help avoid duplicate event creation in retry scenarios. This is useful but does not mean every API operation across every provider is automatically idempotent.

Source: [Google Calendar — Create events](https://developers.google.com/workspace/calendar/api/guides/create-events)

### 6.5 Proactive monitoring

Proactive alerts require more than an LLM prompt. The implementation needs a reliable way to detect changes or time-based conditions.

Possible approaches include:

- Scheduled polling for approaching deadlines.
- Provider notifications or change subscriptions, if supported and configured.
- Periodic synchronization with stored resource identifiers.
- Rules for determining whether a detected event is relevant.
- Deduplication so the same alert is not repeatedly generated.

For a hackathon MVP, scheduled polling may be simpler to demonstrate than a complete real-time notification system. The trade-off is freshness and API usage.

### 6.6 Observability and audit history

The system should record enough information to explain what happened:

- Workflow ID and operation ID.
- User request and normalized plan.
- Proposed action and approval status.
- Execution attempt and timestamp.
- Provider resource ID, where available.
- Verification result.
- Error category and retry status.

Sensitive email content and tokens should not be copied into ordinary application logs. Store only the minimum information required for debugging and audit.

## 7. Main Technical Risks

| Risk | Why it matters | Mitigation direction |
|---|---|---|
| OAuth verification or consent friction | Users may be unable to connect accounts during a demo or pilot | Test account setup early; minimize scopes; document reauthorization |
| Expired or revoked tokens | Background work can stop unexpectedly | Secure token refresh and clear reconnect flow |
| Broad permissions | Increases privacy and security exposure | Apply least privilege and separate read/write access |
| API throttling | Requests can fail under quota or service limits | Respect retry headers, use backoff, reduce unnecessary polling |
| Partial workflow failure | Some actions may succeed while others fail | Persist per-step state and report partial completion |
| Duplicate writes | Retries may create duplicate emails, events, or tasks | Idempotency controls and reconciliation |
| Incorrect AI interpretation | A wrong plan can cause harmful actions | Validate required fields and show action previews |
| Stale calendar or task data | The plan may use outdated availability or status | Re-read critical data immediately before execution |
| Sensitive data exposure | Email and calendar data can contain private information | Minimize collection, redact logs, restrict access |
| Overly broad MVP | Too many integrations can prevent a reliable demo | Select one provider and one end-to-end workflow |

## 8. Recommended MVP Research Direction

The goal should be to demonstrate one complete workflow reliably, not to connect every application or implement every feature in the problem statement at once.

### 8.1 Candidate MVP workflow

**Example:** Turn an email request into a calendar event and a follow-up task.

1. User asks FLOW to find an email about a meeting request.
2. FLOW searches the connected inbox and identifies the relevant message.
3. FLOW extracts the proposed date, time, participants, and requested follow-up.
4. FLOW checks the calendar for availability.
5. FLOW prepares a plan showing the event and task it proposes to create.
6. User reviews and approves the consequential action or actions.
7. FLOW creates the approved event and task.
8. FLOW verifies both records and stores their provider IDs.
9. FLOW displays the final result and any failures in the activity history.

This workflow is a candidate for evaluation, not a confirmed final MVP. The team should choose the exact workflow based on the available API account and the strongest user problem found during discovery.

### 8.2 Suggested implementation stages

| Stage | Research or implementation outcome |
|---|---|
| 1. Provider validation | Confirm account access, OAuth, scopes, and API operations |
| 2. Read-only integration | Read relevant email, calendar, and task data |
| 3. Structured planning | Convert user intent into a validated action plan |
| 4. Approval flow | Display proposed actions and record explicit approval |
| 5. Controlled execution | Execute approved writes through the provider API |
| 6. Verification | Re-read or otherwise confirm created/updated resources |
| 7. Retry safety | Test timeout and duplicate-prevention scenarios |
| 8. Activity history | Display successful, pending, failed, and uncertain operations |

## 9. Research Gaps and Next Actions

The following work remains before the team can make final product and implementation decisions.

### 9.1 Market validation

- Interview at least a small set of users from the leading target segments.
- Observe how they currently coordinate email, meetings, and tasks.
- Identify the most frequent and costly workflow.
- Ask users to rank the importance of approval, verification, and proactive alerts.
- Test whether the proposed workflow solves a problem they already experience.

### 9.2 Competitor validation

- Create test accounts where possible.
- Test the actual onboarding and workflow experience of Motion and Reclaim.
- Review Lindy's current integrations and approval controls.
- Check Microsoft 365 Copilot availability and plan requirements for the team's target users.
- Build a simple Zapier workflow to understand the setup effort and user experience.
- Record plan restrictions, supported providers, and limitations with dates.

### 9.3 Technical validation

- Test Google OAuth and Microsoft OAuth separately before selecting a provider.
- Confirm read and write scopes for the exact MVP actions.
- Verify task API support for the selected ecosystem.
- Test token refresh and revoked-token handling.
- Simulate API timeout, throttling, and partial workflow failure.
- Test duplicate prevention after an uncertain write response.
- Confirm the demo can use synthetic or test data.

## 10. Preliminary Recommendations

Based on the research available for this document:

1. **Start with one ecosystem.** Supporting both Google and Microsoft immediately increases OAuth, testing, and integration work.
2. **Choose based on actual test access.** A provider is only a practical choice if the team can authenticate and demonstrate all required operations.
3. **Validate task support separately.** Do not assume the task API is equally mature across Google and Microsoft.
4. **Build approval and verification into the execution design.** They are core reliability requirements, not interface decorations.
5. **Treat retries as a correctness problem.** A timeout must trigger reconciliation before a potentially duplicate write.
6. **Keep the first workflow narrow.** Demonstrate a complete, verifiable outcome before adding more workflows.
7. **Validate the customer segment.** The initial audience remains a hypothesis until supported by interviews or observed behavior.
8. **Avoid unsupported differentiation claims.** Competitors already offer AI scheduling, task automation, and approval previews.

## 11. Source Register

The following primary and secondary sources were reviewed while preparing this document. Product documentation should be rechecked before implementation because APIs, plans, limits, and feature rollouts change.

### Google developer documentation

1. [Gmail API — Choose scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
2. [Gmail API — Usage limits](https://developers.google.com/workspace/gmail/api/reference/quota)
3. [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
4. [Google Calendar API overview](https://developers.google.com/workspace/calendar/api/guides/overview)
5. [Google Calendar — Create events](https://developers.google.com/workspace/calendar/api/guides/create-events)
6. [Google Calendar — Authorization scopes](https://developers.google.com/workspace/calendar/api/auth)
7. [Google Tasks API reference](https://developers.google.com/workspace/tasks/reference/rest)
8. [Google Tasks — List tasks](https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/list)

### Microsoft developer documentation

9. [Microsoft Graph — Mail, calendars, and contacts](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/office-365-rest-apis-for-mail-calendars-and-contacts)
10. [Microsoft Graph — Permissions overview](https://learn.microsoft.com/en-us/graph/permissions-overview)
11. [Microsoft Graph — Service-specific throttling limits](https://learn.microsoft.com/en-us/graph/throttling-limits)
12. [Microsoft Support — Workflows in Microsoft Copilot](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-workflows-in-microsoft-365-copilot)

### Competitor documentation

13. [Motion — AI Calendar](https://www.usemotion.com/features/ai-calendar)
14. [Motion — AI Task Manager](https://www.usemotion.com/features/ai-task-manager)
15. [Motion Help Center](https://www.usemotion.com/help)
16. [Reclaim — Chat overview](https://help.reclaim.ai/en/articles/17124965-reclaim-chat-overview-ai-assistant-for-your-calendar)
17. [Reclaim — 2.0 FAQ](https://help.reclaim.ai/en/articles/15280604-reclaim-2-0-faq)
18. [Reclaim — AI task features](https://reclaim.ai/features/tasks)
19. [Lindy](https://www.lindy.ai/)
20. [Zapier — What is Zapier?](https://help.zapier.com/hc/en-us/articles/37518970271245-What-is-Zapier)

### Market research

21. [Grand View Research — AI Productivity Tools Market](https://www.grandviewresearch.com/industry-analysis/ai-productivity-tools-market-report)

---

## 12. Document Status

- **Document:** `docs/research/tech-and-market-research.md`
- **Version:** 1.0
- **Status:** Draft — awaiting review and approval
- **Research date:** 30 October 2026
- **Next document:** `docs/competitor-analysis/competitor-matrix.md`

This document intentionally leaves the API provider, primary target segment, and final MVP workflow open. Those decisions should be confirmed before the architecture and integration documents are finalized.