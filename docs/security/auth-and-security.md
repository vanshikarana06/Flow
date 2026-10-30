# FLOW Security Documentation

**Document type:** Security Architecture & Threat Model\
**Project:** FLOW\
**Version:** 1.0\
**Status:** Initial security baseline\
**Last updated:** 2026-10-30

------------------------------------------------------------------------

## 1. Purpose and Scope

This document defines the security baseline for FLOW, an AI-assisted
application that can access Microsoft 365 resources through Microsoft
Graph and may perform actions on a user's behalf.

The primary security objective is to ensure that **AI-generated
decisions never become privileged actions by default**. FLOW must
operate with least privilege, enforce user- and server-side
authorization, and require explicit approval for sensitive or
consequential actions.

This document covers:

-   Authentication and session security
-   Authorization and access control
-   OAuth 2.0 and token handling
-   Microsoft Graph permissions
-   User consent and revocation
-   Data protection and privacy
-   Threats, risks, and mitigations
-   Safe AI execution and approval-based action workflows

This is a design baseline, not a claim that a particular implementation
has already passed a security assessment. Controls must be verified in
code, configuration, and testing before production release.

## 2. Security Principles

FLOW must follow these principles:

1.  **Least privilege:** Request only the permissions required for a
    clearly defined feature.
2.  **Explicit authorization:** Every operation must be authorized by
    the backend, regardless of what the AI requests.
3.  **Human approval for consequential actions:** Sending messages,
    modifying or deleting data, changing access, and other sensitive
    actions require confirmation.
4.  **Deny by default:** Unknown actions, missing permissions, invalid
    states, and failed policy checks must be denied.
5.  **Separation of planning and execution:** AI may propose an action;
    a trusted execution service decides whether it can run.
6.  **No trust in model output:** Treat model output, retrieved
    documents, emails, web pages, and tool arguments as untrusted input.
7.  **Data minimization:** Retrieve, retain, and expose only the data
    needed for the requested task.
8.  **Auditability:** Record security-relevant decisions and action
    outcomes without unnecessarily logging sensitive content.
9.  **Secure failure:** Errors must not expose tokens, secrets, personal
    data, or internal implementation details.
10. **Revocability:** Users and administrators must be able to
    disconnect FLOW and revoke access.

## 3. System Security Architecture

A recommended high-level architecture is:

``` text
User
 |
 | Sign-in
 v
Identity Provider (Microsoft Entra ID)
 |
 | Authentication result / authorization code
 v
FLOW Frontend
 |
 | Authenticated API request
 v
FLOW Backend / API
 |                 \
 |                  \--> Policy & Authorization Engine
 |                              |
 |                              v
 |                       Approval Service
 |                              |
 |                       User confirmation
 |                              |
 v                              v
AI Orchestrator ------------> Action Executor
 |                              |
 |                              | delegated Graph token
 |                              v
 |                       Microsoft Graph API
 |
 +--> Retrieval / Context Layer
 |
 +--> Audit & Security Logs
```

### 3.1 Trust boundaries

  -----------------------------------------------------------------------
  Boundary                Untrusted input or risk Required control
  ----------------------- ----------------------- -----------------------
  Browser to backend      Forged requests, stolen Secure session
                          sessions, CSRF          handling, CSRF
                                                  protection where
                                                  applicable, server-side
                                                  validation

  Backend to AI model     Prompt injection,       Input isolation,
                          malformed output        structured output
                                                  validation, tool
                                                  allowlists

  AI to action executor   Unauthorized or unsafe  Independent policy
                          tool calls              checks and approval
                                                  enforcement

  FLOW to Microsoft Graph Token theft, excessive  Least-privilege OAuth
                          permissions             scopes, secure token
                                                  storage, TLS

  Retrieved content to AI Malicious instructions  Treat retrieved content
                          in emails or files      as data, not authority

  Backend to storage      Data exposure or        Encryption, access
                          tampering               controls, retention
                                                  limits
  -----------------------------------------------------------------------

## 4. Authentication

Authentication establishes the identity of the user interacting with
FLOW. Authentication must be performed by a trusted identity provider
rather than by the AI model.

### 4.1 Recommended approach

For a Microsoft 365-integrated application, use **Microsoft Entra ID**
with the OAuth 2.0 authorization code flow and OpenID Connect (OIDC).

The backend must validate the identity token or establish a secure
application session based on a validated authentication response. The AI
model must never authenticate users or decide whether a user is signed
in.

### 4.2 Authentication controls

-   Use a supported Microsoft identity platform library rather than
    implementing OAuth protocol handling manually.
-   Validate token signature, issuer, audience, expiry, and relevant
    tenant claims.
-   Validate the `state` parameter to protect the authorization flow
    against request forgery.
-   Use PKCE for authorization code flows, including public clients.
-   Use exact, pre-registered redirect URIs; do not accept arbitrary
    redirect destinations.
-   Use HTTPS for all production traffic.
-   Apply secure session cookies: `HttpOnly`, `Secure`, and an
    appropriate `SameSite` setting.
-   Rotate session identifiers after authentication and privilege
    changes.
-   Enforce reasonable session expiry and re-authentication for
    high-risk operations.
-   Support multifactor authentication through the identity provider and
    honor applicable Conditional Access policies.
-   Provide secure logout and account-disconnection behavior.

### 4.3 Authentication threats and mitigations

  -----------------------------------------------------------------------
  Threat                  Risk                    Mitigation
  ----------------------- ----------------------- -----------------------
  Credential phishing     An attacker gains       Entra ID
                          access to a user's      authentication, MFA,
                          account                 Conditional Access,
                                                  phishing-resistant
                                                  authentication where
                                                  available

  Session hijacking       An attacker reuses a    Secure cookies, TLS,
                          stolen session          short-lived sessions,
                                                  session rotation,
                                                  anomaly detection

  Token replay            A captured token is     Use supported token
                          reused                  flows, short token
                                                  lifetimes where
                                                  configurable, secure
                                                  storage, revoke
                                                  sessions when
                                                  compromise is suspected

  OAuth redirect          Authorization code or   Exact redirect URI
  manipulation            token is sent to an     allowlist, `state`,
                          attacker-controlled URI PKCE

  Account enumeration     Login behavior reveals  Generic authentication
                          whether an account      errors and rate
                          exists                  limiting
  -----------------------------------------------------------------------

## 5. Authorization

Authentication answers **who the user is**. Authorization determines
**what that user is allowed to do**.

Authorization must be enforced by trusted backend services. The frontend
and AI model may display or propose actions, but neither is an authority
for granting access.

### 5.1 Authorization model

Use a combination of:

-   **User identity:** The authenticated subject and tenant.
-   **Application roles:** FLOW roles such as `User`, `Administrator`,
    or `SecurityAuditor`, if required.
-   **Resource ownership and sharing:** Whether the user is permitted to
    access the specific Microsoft 365 resource.
-   **Operation policy:** Whether the requested operation is allowed and
    whether approval is required.
-   **Microsoft Graph authorization:** Whether the delegated token
    contains the required scope and the user is allowed to access the
    resource.

A role in FLOW must not bypass Microsoft Graph permissions or
resource-level access checks.

### 5.2 Example action policy

  -----------------------------------------------------------------------
  Action                  Default policy          Approval
  ----------------------- ----------------------- -----------------------
  Read a user-authorized  Allow if the user and   Usually not required
  email                   Graph token are         
                          authorized              

  Summarize an email or   Allow only on data the  Usually not required
  document                user may access         

  Create an email draft   Allow within configured Not required to create;
                          limits                  required to send

  Send an email           Deny until policy       Required
                          checks pass             

  Create a calendar event Allow draft or preview  Required before
                                                  creating or inviting
                                                  attendees, according to
                                                  policy

  Modify or delete files  Deny until policy       Required
                          checks pass             

  Share a file or change  High-risk; deny by      Explicit approval and
  permissions             default                 additional checks

  Grant application       Prohibited for ordinary Administrative process
  permissions or change   user workflows          outside normal AI
  tenant settings                                 execution
  -----------------------------------------------------------------------

The final policy must be adapted to the product's actual feature set and
organizational requirements.

### 5.3 Authorization enforcement requirements

-   Check authorization on every backend request and every tool
    invocation.
-   Never rely on hidden buttons or frontend route protection as the
    only control.
-   Bind each operation to the authenticated user and tenant.
-   Verify resource identifiers and access rights server-side.
-   Use an allowlist of supported actions and parameters.
-   Validate input types, lengths, formats, and permitted destinations.
-   Prevent users from changing another user's identifiers in request
    payloads to access their resources (IDOR).
-   Re-check authorization immediately before execution, not only when
    the AI creates a proposal.
-   Fail closed when authorization services or policy data are
    unavailable.

## 6. OAuth 2.0 and Token Security

OAuth 2.0 enables FLOW to obtain delegated authorization to call
Microsoft Graph. OpenID Connect provides authentication information
about the signed-in user.

### 6.1 Recommended flow

Use the authorization code flow with PKCE where supported by the client
type.

1.  The user selects **Connect Microsoft 365**.
2.  FLOW redirects the user to Microsoft Entra ID.
3.  The user authenticates and reviews the requested permissions.
4.  Microsoft Entra ID returns an authorization code to the registered
    redirect URI.
5.  The application securely exchanges the code for tokens.
6.  FLOW stores tokens using an approved secure token cache.
7.  The backend requests Microsoft Graph access only when a permitted
    operation requires it.
8.  FLOW refreshes tokens using the supported library and handles
    revoked or expired grants safely.

### 6.2 Token handling requirements

-   Never place access tokens, refresh tokens, client secrets, or
    authorization codes in frontend local storage.
-   Do not expose tokens to the AI model, prompts, tool descriptions,
    logs, analytics, or error messages.
-   Store refresh tokens and token caches encrypted at rest with access
    restricted to the backend service.
-   Prefer a managed secret store or platform key management service for
    client credentials and encryption keys.
-   Use separate secrets and app registrations for development, test,
    and production.
-   Rotate client secrets or certificates according to a documented
    schedule and immediately after suspected exposure.
-   Do not hard-code credentials in source code or commit them to
    version control.
-   Request tokens for the intended resource and audience only.
-   Handle `401`, `403`, expired-token, and revoked-consent responses
    without retry loops or permission escalation.
-   Delete or invalidate stored token material when a user disconnects,
    subject to the identity platform's revocation behavior.

### 6.3 OAuth threats and mitigations

  -----------------------------------------------------------------------
  Threat                  Risk                    Mitigation
  ----------------------- ----------------------- -----------------------
  Authorization code      Attacker obtains a code PKCE, HTTPS,
  interception                                    short-lived codes,
                                                  exact redirect URI

  CSRF in authorization   Attacker links a victim Validate `state`; bind
  flow                    session to an           it to the initiating
                          attacker-controlled     session
                          authorization response  

  Token leakage           Unauthorized access to  Encrypted server-side
                          Microsoft 365 data      token cache, secret
                                                  redaction, no tokens in
                                                  prompts or browser
                                                  storage

  Excessive token scope   A compromised           Minimal delegated
                          application can access  scopes and periodic
                          too much data           permission review

  Refresh-token           Long-lived unauthorized Secure token cache,
  compromise              access                  restricted service
                                                  access, revocation and
                                                  incident response

  Secret exposure         Attacker impersonates   Managed identity or
                          the application         certificate credentials
                                                  where appropriate,
                                                  secret vault, rotation
  -----------------------------------------------------------------------

## 7. Microsoft Graph Permissions

Microsoft Graph permissions define what FLOW can do through Microsoft
365 APIs. Permissions must be selected per feature and reviewed before
release.

### 7.1 Delegated permissions by default

Prefer **delegated permissions** when FLOW acts on behalf of a signed-in
user. Delegated permissions preserve the user's context and are
generally more appropriate for user-driven assistant workflows.

Application permissions allow an application to act without a signed-in
user and can provide broad tenant access. Do not request application
permissions unless a documented service requirement makes them necessary
and an administrator has approved the design.

### 7.2 Permission selection

The following are examples for design planning only. The exact
permissions depend on the Graph endpoints and product behavior.

  -----------------------------------------------------------------------
  Feature                 Example delegated       Security notes
                          permission              
  ----------------------- ----------------------- -----------------------
  Sign-in and basic       `openid`, `profile`,    Request only what is
  profile                 `User.Read`             needed for sign-in and
                                                  display

  Read the signed-in      `Mail.Read`             Avoid mailbox-wide
  user's mail                                     application access for
                                                  a user-driven feature

  Create and send mail    `Mail.Send`             Sending must still
                                                  require FLOW approval
                                                  policy

  Create or update        `Calendars.ReadWrite`   Require approval before
  calendar events                                 committing
                                                  consequential changes

  Read files the user can `Files.Read` or an      Select the narrowest
  access                  appropriate             permission compatible
                          `Files.Read.*`          with the feature
                          permission              

  Modify files            An appropriate          Treat writes, sharing,
                          `Files.ReadWrite.*`     and deletion as
                          permission              sensitive operations
  -----------------------------------------------------------------------

Permission names and availability can vary by endpoint, account type,
and Microsoft platform changes. Verify each permission against the
current Microsoft Graph permission reference before implementation.

### 7.3 Permission governance

-   Maintain a permission inventory mapping each Graph endpoint to its
    required scope.
-   Request permissions incrementally as users enable features, rather
    than requesting every possible scope at initial sign-in.
-   Avoid broad permissions such as `Mail.ReadWrite`,
    `Files.ReadWrite.All`, or tenant-wide application permissions unless
    strictly necessary.
-   Separate read-only and write capabilities where possible.
-   Do not treat a granted Graph scope as user approval for a particular
    action.
-   Review permissions at every release and during periodic security
    reviews.
-   Monitor Microsoft Graph permission changes and remove scopes that
    are no longer used.
-   Require administrator review for permissions that require admin
    consent.
-   Document the business purpose, data accessed, and risk for every
    requested permission.

## 8. User Consent

User consent is the user's authorization for FLOW to request access
within the permission model presented by Microsoft Entra ID. Consent is
not a blanket approval for every future AI-generated action.

### 8.1 Consent principles

-   Explain why each permission is needed in plain language.
-   Request only permissions necessary for the feature the user is
    enabling.
-   Do not misrepresent read permissions as write permissions or vice
    versa.
-   Do not bundle unrelated permissions into a single consent request.
-   Respect tenant consent policies and administrator restrictions.
-   Provide a clear disconnect option and explain that users or
    administrators may also revoke consent through Microsoft account or
    tenant controls.
-   Re-check effective authorization after consent changes.

### 8.2 Consent versus action approval

These are separate decisions:

-   **OAuth consent:** Allows FLOW to request access under specified
    Microsoft Graph permissions.
-   **Action approval:** Confirms that FLOW may perform one specific
    operation with defined parameters.

For example, a user may consent to `Mail.Send` so the feature is
technically available. FLOW must still ask the user to approve a
particular email before sending it.

### 8.3 Consent threats and mitigations

  -----------------------------------------------------------------------
  Threat                  Risk                    Mitigation
  ----------------------- ----------------------- -----------------------
  Consent phishing        User grants permissions Clear publisher and
                          to a malicious          permission information,
                          application             trusted app
                                                  registration, user
                                                  education

  Consent fatigue         Users approve           Incremental consent,
                          permissions without     concise purpose
                          understanding them      statements, avoid
                                                  unnecessary scopes

  Excessive admin consent Tenant-wide data        Admin review,
                          exposure                documented
                                                  justification, least
                                                  privilege

  Consent persists after  Unused access remains   Permission inventory,
  feature removal         available               disconnect flow,
                                                  consent revocation
                                                  guidance
  -----------------------------------------------------------------------

## 9. Safe AI Execution

The AI component is an untrusted decision-support component. It can
interpret requests, retrieve authorized context, and propose actions. It
must not be trusted to grant permissions, approve its own actions, or
directly access secrets.

### 9.1 Plan--validate--approve--execute model

Every consequential action must follow this sequence:

1.  **Understand:** Interpret the user's request and identify the
    intended outcome.
2.  **Retrieve:** Fetch only the context the user is authorized to
    access.
3.  **Propose:** Generate a structured action proposal.
4.  **Validate:** Validate the proposal against a strict schema and
    action allowlist.
5.  **Authorize:** Check user identity, tenant, resource access, Graph
    scopes, and application policy.
6.  **Assess risk:** Classify the operation by impact and reversibility.
7.  **Preview:** Show the exact action and material parameters to the
    user.
8.  **Approve:** Obtain an explicit user confirmation for actions
    requiring approval.
9.  **Revalidate:** Confirm that the approval is still valid and the
    operation has not changed.
10. **Execute:** A trusted backend executor performs the action using
    the user's delegated authorization.
11. **Verify:** Confirm the result with the target service where
    possible.
12. **Audit:** Record the proposal, policy decision, approval reference,
    execution result, and correlation ID.

### 9.2 Approval requirements

An approval must be:

-   **Explicit:** A clear user action such as selecting a confirmation
    control.
-   **Informed:** The user sees what will happen and to which resource
    or recipient.
-   **Specific:** Bound to one action and its exact material parameters.
-   **Time-limited:** Expire after a short, configured period.
-   **Single-use:** Cannot be replayed for another action.
-   **Tamper-resistant:** Bound to a server-generated action identifier
    and integrity-protected action payload.
-   **Revocable before execution:** The user can cancel while the action
    is pending.

Approval must not be inferred from silence, prior consent, a general
instruction, or the AI's confidence.

### 9.3 Approval payload

A server-side approval record should include:

-   Unique action ID
-   Authenticated user and tenant ID
-   Action type
-   Target resource identifier
-   Exact recipients, content, file path, or event details as applicable
-   Hash of the canonical action payload
-   Risk classification
-   Creation and expiry timestamps
-   Approval status
-   Approval timestamp and approver identity
-   Execution status and result reference

Do not rely on a client-provided `approved: true` flag. The backend must
verify the approval record and payload hash before execution.

### 9.4 AI tool restrictions

-   Expose only explicitly registered tools.
-   Use strict JSON schemas and reject unknown fields.
-   Validate all tool arguments on the backend.
-   Apply per-tool authorization and risk policies.
-   Do not expose arbitrary shell, SQL, filesystem, or unrestricted HTTP
    execution to the model.
-   Do not allow the model to select arbitrary Graph endpoints or add
    scopes.
-   Enforce timeouts, request-size limits, rate limits, and execution
    quotas.
-   Make operations idempotent where possible to prevent duplicate
    effects.
-   Require confirmation before sending, deleting, sharing, purchasing,
    or changing access.
-   Keep the model separate from token storage and privileged execution
    credentials.

### 9.5 Prompt injection and untrusted content

Emails, documents, calendar invitations, web pages, and other retrieved
content may contain malicious instructions. Treat this content as data,
not as trusted instructions.

Mitigations:

-   Clearly separate system policy, user instructions, and retrieved
    content.
-   Label retrieved content as untrusted in the AI context.
-   Never follow instructions found inside retrieved content that
    request secrets, permission changes, policy overrides, or unrelated
    actions.
-   Do not let retrieved content approve an action.
-   Require independent backend policy checks and user approval.
-   Restrict the AI to the minimum context required.
-   Test with indirect prompt-injection examples in emails and
    documents.

### 9.6 AI execution threats and mitigations

  -----------------------------------------------------------------------
  Threat                  Risk                    Mitigation
  ----------------------- ----------------------- -----------------------
  Direct prompt injection User attempts to        Fixed policy layer,
                          override safety         tool allowlists, schema
                          instructions            validation, backend
                                                  authorization

  Indirect prompt         Malicious email or      Treat retrieved content
  injection               document manipulates    as untrusted data;
                          the AI                  never accept it as
                                                  approval

  Hallucinated action     Wrong recipient, file,  Show exact preview;
  parameters              or event is modified    validate resource
                                                  identifiers; require
                                                  approval

  Unauthorized tool       AI attempts an action   Server-side
  invocation              outside the user's      authorization on every
                          rights                  invocation

  Approval bypass         Action runs without     Approval state machine
                          user confirmation       enforced by backend;
                                                  deny by default

  Approval replay         Old approval is reused  Single-use approval
                                                  IDs, expiry, payload
                                                  hash, atomic state
                                                  transition

  Tool chaining abuse     Multiple individually   End-to-end policy
                          valid tools create a    evaluation, limits,
                          harmful outcome         approval for
                                                  consequential steps

  Excessive autonomy      AI performs unexpected  Separate proposal from
                          actions                 execution; bounded
                                                  tools; explicit
                                                  confirmation

  Data exfiltration       AI sends sensitive      Data classification,
                          content to an           destination allowlists,
                          unauthorized            DLP controls, approval
                          destination             and logging
  -----------------------------------------------------------------------

## 10. Data Protection

FLOW may process personal, business, communication, and document data.
Data protection controls must apply throughout collection, processing,
transmission, storage, logging, and deletion.

### 10.1 Data classification

Use a classification model such as:

  -----------------------------------------------------------------------
  Classification          Examples                Handling
  ----------------------- ----------------------- -----------------------
  Public                  Public product          Standard controls
                          information             

  Internal                Non-public operational  Authenticated access
                          information             and approved storage

  Confidential            Business emails,        Least privilege,
                          internal documents,     encryption, restricted
                          personal information    logs

  Highly sensitive        Credentials, access     Do not send to the AI
                          tokens, regulated or    model unless explicitly
                          specially protected     required and approved;
                          data                    use strict access and
                                                  retention controls
  -----------------------------------------------------------------------

The organization must define its actual classification labels and
regulatory obligations.

### 10.2 Encryption

-   Enforce TLS for all network communication.
-   Encrypt databases, backups, and token caches at rest.
-   Use a managed key service or key vault.
-   Restrict key access to the services that require it.
-   Rotate keys according to policy and maintain a tested recovery
    process.
-   Do not store secrets in application configuration files or source
    control.

### 10.3 Data minimization and AI processing

-   Retrieve only the messages, files, or calendar details required for
    the task.
-   Avoid sending entire mailboxes or large document collections when a
    small excerpt is sufficient.
-   Redact or omit secrets and unrelated personal data before model
    processing.
-   Define which data classes may be sent to the configured AI provider.
-   Review provider retention, training, residency, and contractual
    terms before production use.
-   Do not use customer content for model training unless there is a
    lawful basis, transparent disclosure, and the required user or
    organizational authorization.
-   Keep AI prompts and responses out of general application logs by
    default.

### 10.4 Retention and deletion

-   Define retention periods for prompts, generated content, audit
    events, and cached Microsoft 365 data.
-   Retain only what is required for product operation, security, and
    legal obligations.
-   Provide a documented process for account disconnection and data
    deletion.
-   Remove cached content and token material when no longer needed.
-   Ensure backup retention and deletion behavior is documented.
-   Do not promise immediate deletion from third-party systems unless
    that behavior is verified.

### 10.5 Logging and monitoring

Log security-relevant metadata, including:

-   Authentication and session events
-   Consent and permission changes
-   Authorization denials
-   Action proposals and risk decisions
-   Approval creation, approval, rejection, and expiry
-   Tool execution start, completion, and failure
-   Microsoft Graph status codes and correlation IDs
-   Administrative configuration changes

Do not log:

-   Access or refresh tokens
-   Client secrets or private keys
-   Passwords or authentication codes
-   Full email or document content by default
-   Sensitive prompt content unless specifically justified and protected

Protect logs from tampering, restrict access, define retention, and
monitor suspicious patterns.

## 11. Threat and Risk Register

Risk ratings below are initial design estimates. Reassess them using the
actual deployment architecture, data sensitivity, likelihood, and
business impact.

  ------------------------------------------------------------------------------------------
  ID         Threat              Likelihood         Impact Initial    Key mitigations
                                                           risk       
  ---------- --------------- -------------- -------------- ---------- ----------------------
  T-01       Account or              Medium           High High       Entra ID, MFA, secure
             session                                                  sessions, monitoring
             compromise                                               

  T-02       Excessive Graph         Medium           High High       Least privilege,
             permissions                                              permission inventory,
                                                                      admin review

  T-03       OAuth token             Medium           High High       Encrypted token cache,
             theft                                                    secret vault,
                                                                      redaction, revocation

  T-04       Prompt                    High           High Critical   Untrusted-content
             injection from                                           isolation, tool
             user or                                                  allowlists, approval
             retrieved                                                gates
             content                                                  

  T-05       AI executes an          Medium           High High       Plan/approve/execute
             unintended                                               separation, previews,
             action                                                   policy checks

  T-06       Approval bypass         Medium           High High       Server-side approval
             or replay                                                state, expiry,
                                                                      one-time IDs, payload
                                                                      hash

  T-07       Cross-user or           Medium           High High       Tenant binding,
             cross-tenant                                             resource
             data access                                              authorization,
                                                                      isolation tests

  T-08       Sensitive data          Medium           High High       Data minimization,
             leakage through                                          redaction, retention
             logs or prompts                                          controls

  T-09       Malicious or            Medium           High High       Dependency scanning,
             compromised                                              pinning, patching,
             dependency                                               software inventory

  T-10       Denial of               Medium         Medium Medium     Rate limits, quotas,
             service or tool                                          timeouts, abuse
             abuse                                                    monitoring

  T-11       Misconfigured      Low--Medium           High High       Secure defaults,
             cloud storage                                            access reviews,
             or database                                              configuration scanning

  T-12       Insufficient            Medium         Medium Medium     Centralized
             audit evidence                                           tamper-resistant audit
                                                                      events and alerting
  ------------------------------------------------------------------------------------------

### 11.1 Risk treatment priorities

**Critical / High**

-   Block unapproved consequential actions.
-   Protect tokens and application secrets.
-   Enforce tenant and resource authorization.
-   Mitigate prompt injection and tool misuse.
-   Prevent approval replay and payload substitution.

**Medium**

-   Apply rate limits and abuse detection.
-   Improve dependency and configuration management.
-   Strengthen audit coverage and operational alerting.

**Low**

-   Track low-impact issues through the normal security backlog and
    reassess when the architecture changes.

## 12. Secure Action State Machine

The backend should manage consequential actions through a controlled
state machine.

``` text
PROPOSED
   |
   v
VALIDATING -----> REJECTED
   |
   v
PENDING_APPROVAL
   |          \
   |           \--> EXPIRED
   |
   +--> CANCELLED
   |
   v
APPROVED
   |
   v
REVALIDATING ----> REJECTED
   |
   v
EXECUTING
   |        \
   |         \--> FAILED
   v
COMPLETED
```

Rules:

-   Only the backend may change action state.
-   Only a valid authenticated approver may approve an action.
-   Approval is bound to the exact canonical payload.
-   Any material payload change invalidates the approval and requires a
    new approval.
-   Expired, cancelled, rejected, or completed actions cannot be
    executed again.
-   State transitions must be atomic to prevent race conditions.
-   The executor must verify the state immediately before performing the
    external operation.

## 13. Secure Development and Operations

### 13.1 Application security

-   Validate and normalize all inputs.
-   Use parameterized database queries.
-   Apply output encoding and content security controls.
-   Protect against CSRF where cookie-based authentication is used.
-   Configure CORS with explicit trusted origins.
-   Apply security headers and a restrictive Content Security Policy.
-   Keep dependencies patched and scan them for known vulnerabilities.
-   Run static analysis, dependency scanning, secret scanning, and
    dynamic testing.
-   Separate development, staging, and production environments.
-   Restrict production access and require strong administrative
    authentication.

### 13.2 Infrastructure security

-   Use managed identities or workload identity where supported.
-   Restrict network access to databases, caches, and internal services.
-   Keep administrative interfaces off public networks where possible.
-   Use infrastructure as code and review security-sensitive changes.
-   Enable cloud audit logs and security monitoring.
-   Back up critical data and test restoration.
-   Apply least privilege to service identities and deployment
    pipelines.

### 13.3 Incident response

Maintain a documented response process for:

1.  Detecting and triaging suspected compromise.
2.  Disabling affected tools or high-risk actions.
3.  Revoking sessions, OAuth grants, or exposed credentials as
    appropriate.
4.  Preserving relevant audit evidence.
5.  Determining affected users, tenants, resources, and data.
6.  Notifying stakeholders and affected users as legally required.
7.  Rotating credentials and restoring service safely.
8.  Completing a post-incident review and tracking corrective actions.

## 14. Security Testing Requirements

Before production, verify at minimum:

  -----------------------------------------------------------------------
  Test                                Expected result
  ----------------------------------- -----------------------------------
  Unauthenticated API request         Denied

  User accesses another user's        Denied
  resource                            

  User accesses another tenant's      Denied
  resource                            

  AI requests an unregistered tool    Rejected

  Tool arguments contain unknown or   Rejected
  malformed fields                    

  Graph scope is missing              Operation denied; no automatic
                                      scope escalation

  User has not approved a sensitive   No external side effect occurs
  action                              

  Approval payload changes after      Approval invalidated
  approval                            

  Approval is replayed                Second execution denied

  Approval expires                    Execution denied

  Retrieved email contains prompt     Content cannot override system
  injection                           policy or approve actions

  Token appears in logs               Test fails; token must be redacted

  User disconnects Microsoft 365      FLOW stops using the grant and
                                      clears local token material as
                                      designed

  Graph returns `403`                 FLOW does not bypass the denial

  External API times out              Safe retry behavior; no duplicate
                                      side effect

  Audit event is generated            Event contains required metadata
                                      and no prohibited secrets
  -----------------------------------------------------------------------

Conduct threat modeling and penetration testing before launch and after
material changes to authentication, authorization, Graph permissions, or
AI tool execution.

## 15. Production Readiness Checklist

### Identity and access

-   [ ] Microsoft Entra ID authentication is configured and validated.
-   [ ] MFA and applicable Conditional Access policies are supported.
-   [ ] Sessions are secure, rotated, and time-limited.
-   [ ] Backend authorization is enforced on every protected operation.
-   [ ] Tenant and resource isolation tests pass.

### OAuth and Microsoft Graph

-   [ ] Authorization code flow and PKCE are implemented where
    applicable.
-   [ ] Redirect URIs are exact and allowlisted.
-   [ ] Graph permissions are documented and least-privileged.
-   [ ] Admin-consent requirements are documented.
-   [ ] Tokens are stored securely and never exposed to the model or
    frontend.
-   [ ] Disconnect and revocation behavior is tested.

### AI safety and approvals

-   [ ] AI output is treated as untrusted.
-   [ ] Tools are allowlisted and strictly schema-validated.
-   [ ] AI cannot grant itself permissions or approve actions.
-   [ ] Sensitive actions require explicit, informed approval.
-   [ ] Approval is single-use, time-limited, and payload-bound.
-   [ ] Authorization is rechecked immediately before execution.
-   [ ] Prompt-injection and approval-bypass tests pass.

### Data protection and operations

-   [ ] Data classification and retention policies are defined.
-   [ ] Encryption in transit and at rest is enabled.
-   [ ] Sensitive data is minimized and redacted from logs.
-   [ ] AI provider data handling has been reviewed.
-   [ ] Monitoring, incident response, and backup restoration are
    tested.
-   [ ] Security testing is completed and findings are tracked.

## 16. Standards and Reference Material

Use current official documentation during implementation and review:

-   [Microsoft identity platform
    documentation](https://learn.microsoft.com/en-us/entra/identity-platform/)
-   [Microsoft identity platform OAuth 2.0 authorization code
    flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
-   [Microsoft Graph permissions
    reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
-   [Microsoft Graph security and authorization
    concepts](https://learn.microsoft.com/en-us/graph/auth/auth-concepts)
-   [OWASP Top 10](https://owasp.org/www-project-top-ten/)
-   [OWASP Top 10 for LLM
    Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
-   [OWASP
    ASVS](https://owasp.org/www-project-application-security-verification-standard/)

## 17. Final Security Position

FLOW must treat AI as an assistant that proposes work, not as a trusted
principal with unrestricted authority.

The security boundary is enforced by the backend:

-   Microsoft Entra ID establishes user identity.
-   OAuth and Microsoft Graph scopes define the delegated access
    available to the application.
-   FLOW authorization policies determine whether the authenticated user
    may request an operation.
-   The approval service confirms whether the user explicitly authorizes
    a specific consequential action.
-   The action executor performs only validated, authorized, approved
    operations.
-   Audit and monitoring services provide evidence of decisions and
    outcomes.

**Non-negotiable rule:** No AI-generated action may cause a sensitive
external side effect unless the backend independently validates the
request, confirms the user's authorization, and verifies the required
approval for that exact action.
