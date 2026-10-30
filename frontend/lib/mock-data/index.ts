import { 
  ApprovalItem, 
  EmailThread, 
  CalendarEvent, 
  TaskItem, 
  LedgerEntry, 
  ContactDossier, 
  UserPreference,
  AgentPlan 
} from "../types";

export const mockApprovals: ApprovalItem[] = [
  {
    id: "appr_101",
    title: "Reschedule 1:1 Sync with Aditya & Send Notice",
    description: "Move 1:1 meeting by 2 hours to resolve calendar conflict and email confirmation.",
    originPrompt: "Reschedule my sync with Aditya because of the sprint demo conflict",
    agentName: "FLOW Scheduling Agent",
    risk: "medium",
    status: "pending",
    createdAt: "2026-10-31T09:30:00Z",
    targetService: "Microsoft Graph (Calendar & Mail)",
    idempotencyKey: "idemp_ev_9921_mod",
    diff: {
      entityType: "calendar",
      action: "update",
      title: "1:1 Aditya Review",
      before: {
        startTime: "Friday, Oct 31, 02:00 PM",
        endTime: "Friday, Oct 31, 02:30 PM",
      },
      after: {
        startTime: "Friday, Oct 31, 04:00 PM",
        endTime: "Friday, Oct 31, 04:30 PM",
        recipientNotification: "Sent to aditya@flow.ai",
      },
    },
  },
  {
    id: "appr_102",
    title: "Send Architecture RFC Reply to Nikhil",
    description: "Dispatch security review summary drafted from audited docs.",
    originPrompt: "Reply to Nikhil's email approving the auth PKCE documentation",
    agentName: "FLOW Email Agent",
    risk: "high",
    status: "pending",
    createdAt: "2026-10-31T09:15:00Z",
    targetService: "Resend / Apps Script Outbound",
    idempotencyKey: "idemp_msg_4482_snd",
    diff: {
      entityType: "email",
      action: "send",
      title: "Re: Security Architecture RFC Review",
      after: {
        to: "nikhil@flow.ai",
        subject: "Re: Security Architecture RFC Review",
        body: "Hey Nikhil, reviewed the auth documentation. OAuth 2.0 PKCE and token encryption models look verified and ready for Phase 2 implementation.",
      },
    },
  },
  {
    id: "appr_103",
    title: "Mark High-Priority Task 'FastAPI Phase 3' as Completed",
    description: "Update task board and attach verification proof hash.",
    originPrompt: "Update my task board: trust domain implementation is finished",
    agentName: "FLOW Task Manager",
    risk: "low",
    status: "pending",
    createdAt: "2026-10-31T08:45:00Z",
    targetService: "FLOW Task Ledger",
    idempotencyKey: "idemp_tsk_1109_upd",
    diff: {
      entityType: "task",
      action: "update",
      title: "FastAPI Phase 3: Trust Domain",
      before: { status: "in_progress", progress: 65 },
      after: { status: "completed", progress: 100, proofHash: "0x89f...b21" },
    },
  },
];

export const mockThreads: EmailThread[] = [
  {
    id: "thr_1",
    subject: "Sprint Planning & Database Migration Validation",
    snippet: "Can we review the database schema and ensure pgvector models match our audit report before 3 PM?",
    sender: { name: "Aditya Sharma", email: "aditya@flow.ai", avatar: "AS" },
    unread: true,
    priority: "urgent",
    timestamp: "2026-10-31T09:20:00Z",
    tags: ["Engineering", "Priority"],
    aiSummary: "Aditya requests database schema sign-off and alignment on pgvector before 3:00 PM today.",
    actionRequired: true,
    messages: [
      {
        id: "m1",
        sender: { name: "Aditya Sharma", email: "aditya@flow.ai" },
        content: "Hey Vanshika,\n\nCan we review the database schema and ensure pgvector models match our audit report? I want to make sure Phase 1 migrations run cleanly in Supabase before 3:00 PM.\n\nLet me know if we can sync briefly.",
        timestamp: "09:20 AM",
      },
      {
        id: "m2",
        sender: { name: "FLOW AI Draft", email: "assistant@flow.ai" },
        content: "Hey Aditya, reviewed the pgvector models and Alembic setup. Everything is aligned with the documentation audit report. I have scheduled a focus slot to run the validation at 1:15 PM.",
        timestamp: "Staged Draft (Pending Approval)",
        isStagedDraft: true,
      },
    ],
  },
  {
    id: "thr_2",
    subject: "Security Architecture RFC — Final Sign-off",
    snippet: "Attached the revised auth spec with Supabase RLS and token encryption policies.",
    sender: { name: "Nikhil Bhardwaj", email: "nikhil@flow.ai", avatar: "NB" },
    unread: false,
    priority: "normal",
    timestamp: "2026-10-31T08:45:00Z",
    tags: ["Security", "RFC"],
    aiSummary: "Nikhil submitted the final OAuth 2.0 PKCE and RLS policies for review.",
    actionRequired: false,
    messages: [
      {
        id: "m3",
        sender: { name: "Nikhil Bhardwaj", email: "nikhil@flow.ai" },
        content: "Hi team,\n\nThe security specification is complete. OAuth PKCE, refresh rotation, and AES-256 GCM token encryption have been documented and reviewed.",
        timestamp: "08:45 AM",
      },
    ],
  },
  {
    id: "thr_3",
    subject: "Resend Inbound Webhook Health Alert",
    snippet: "Domain verification succeeded for api.flow-agent.internal.",
    sender: { name: "Resend Inbound", email: "notifications@resend.com", avatar: "RS" },
    unread: false,
    priority: "low",
    timestamp: "2026-10-30T22:15:00Z",
    tags: ["System", "Integrations"],
    aiSummary: "Resend verified domain DNS records. Inbound email processing operational.",
    actionRequired: false,
    messages: [
      {
        id: "m4",
        sender: { name: "Resend Inbound", email: "notifications@resend.com" },
        content: "Your domain verification is complete. MX and DKIM records are active.",
        timestamp: "Yesterday",
      },
    ],
  },
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "evt_1",
    title: "Team Standup & Daily Alignment",
    startTime: "2026-10-31T09:00:00Z",
    endTime: "2026-10-31T09:30:00Z",
    category: "meeting",
    attendees: [
      { name: "Vanshika Rana", email: "vanshika@flow.ai" },
      { name: "Aditya Sharma", email: "aditya@flow.ai" },
      { name: "Nikhil Bhardwaj", email: "nikhil@flow.ai" },
    ],
  },
  {
    id: "evt_2",
    title: "Deep Work: Frontend Architecture & Shadcn Shell",
    startTime: "2026-10-31T10:00:00Z",
    endTime: "2026-10-31T12:00:00Z",
    category: "focus",
    attendees: [{ name: "Vanshika Rana", email: "vanshika@flow.ai" }],
  },
  {
    id: "evt_3",
    title: "Sprint Demo Review (Partner Sync)",
    startTime: "2026-10-31T14:00:00Z",
    endTime: "2026-10-31T15:00:00Z",
    category: "meeting",
    attendees: [
      { name: "Vanshika Rana", email: "vanshika@flow.ai" },
      { name: "External Partner", email: "partner@techdemo.com" },
    ],
    isConflict: true,
    conflictDetails: "Overlaps with 1:1 Aditya Review originally scheduled at 2:00 PM.",
  },
  {
    id: "evt_4",
    title: "1:1 Aditya Review (Proposed Reschedule)",
    startTime: "2026-10-31T16:00:00Z",
    endTime: "2026-10-31T16:30:00Z",
    category: "ai_block",
    attendees: [
      { name: "Vanshika Rana", email: "vanshika@flow.ai" },
      { name: "Aditya Sharma", email: "aditya@flow.ai" },
    ],
  },
];

export const mockTasks: TaskItem[] = [
  {
    id: "tsk_1",
    title: "Implement Shadcn UI Workspace Shell",
    status: "in_progress",
    priority: "urgent",
    dueDate: "Today",
    category: "Product",
    progress: 75,
    aiBreakdown: [
      "Setup Next.js 15 & Tailwind token system",
      "Build Raycast command menu (⌘K)",
      "Assemble 3-pane email inbox and approval cards",
    ],
  },
  {
    id: "tsk_2",
    title: "Verify Supabase pgvector Embedding Migrations",
    status: "todo",
    priority: "high",
    dueDate: "Today, 3:00 PM",
    category: "Backend",
    progress: 30,
    aiBreakdown: [
      "Run Alembic migration head",
      "Test vector distance retrieval for memory context",
    ],
  },
  {
    id: "tsk_3",
    title: "Auth PKCE Flow & OAuth Callback Handlers",
    status: "in_review",
    priority: "medium",
    dueDate: "Nov 01",
    category: "Security",
    progress: 90,
    aiBreakdown: ["Verify token exchange", "Configure secure cookie storage"],
  },
  {
    id: "tsk_4",
    title: "Hackathon Pitch Deck & Judges Summary Audit",
    status: "completed",
    priority: "medium",
    dueDate: "Yesterday",
    category: "Research",
    progress: 100,
    aiBreakdown: ["Validate value proposition", "Sync architecture diagrams"],
  },
];

export const mockLedger: LedgerEntry[] = [
  {
    id: "act_9021",
    title: "Calendar Event Rescheduling & Notification Dispatch",
    category: "calendar",
    status: "verified",
    timestamp: "10:14 AM",
    initiator: "Vanshika Rana (Approved #APPR-401)",
    service: "Microsoft Graph API v1.0",
    receipt: {
      receiptHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      timestamp: "2026-10-31T10:14:21Z",
      signature: "sig_ed25519_88a91c",
      verifiedBy: "FLOW Verification Engine",
      latencyMs: 184,
      httpStatus: 200,
    },
  },
  {
    id: "act_9020",
    title: "Inbound Email Webhook Ingestion & Context Extraction",
    category: "email",
    status: "verified",
    timestamp: "09:20 AM",
    initiator: "Resend Inbound Webhook",
    service: "FLOW Email Parser & pgvector",
    receipt: {
      receiptHash: "7d1b329f63e695d115e45a5538e146ef9fc988f615372332be247b9ef8975949",
      timestamp: "2026-10-31T09:20:04Z",
      signature: "sig_ed25519_23f11d",
      verifiedBy: "PostgreSQL Append-Only Ledger",
      latencyMs: 42,
      httpStatus: 201,
    },
  },
  {
    id: "act_9019",
    title: "Task Priority Escalation from Email Context",
    category: "task",
    status: "executed",
    timestamp: "09:21 AM",
    initiator: "FLOW Reasoning Agent",
    service: "FLOW Task Manager",
  },
];

export const mockContacts: ContactDossier[] = [
  {
    id: "cnt_1",
    name: "Aditya Sharma",
    role: "Co-Lead & System Architect",
    email: "aditya@flow.ai",
    avatar: "AS",
    relationship: "Core Collaborator",
    interactionCount: 142,
    preferences: [
      "Prefers concise morning syncs (under 30 mins)",
      "Focuses on Database, FastAPI, and SQLAlchemy models",
      "Unavailable Thursdays 3:00 - 4:00 PM",
    ],
    learnedContext: [
      "Typically responds to architecture RFCs within 1 hour",
      "Prefers code diffs over text explanations",
    ],
  },
  {
    id: "cnt_2",
    name: "Nikhil Bhardwaj",
    role: "Security & Auth Lead",
    email: "nikhil@flow.ai",
    avatar: "NB",
    relationship: "Core Collaborator",
    interactionCount: 98,
    preferences: [
      "Values strict zero-trust guardrails & cryptographic proofs",
      "Prefers asynchronous status reports",
    ],
    learnedContext: [
      "Author of the OAuth 2.0 PKCE and AES-256 encryption RFC",
    ],
  },
];

export const mockPreferences: UserPreference[] = [
  { id: "p1", category: "General", label: "Working Hours", value: "09:00 AM - 06:30 PM (IST)", isLearned: false },
  { id: "p2", category: "Calendar", label: "Focus Protection", value: "Block Wednesday afternoons for deep work", isLearned: false },
  { id: "p3", category: "Agent Guardrails", label: "HITL Threshold", value: "Consequential actions (Send / Delete) require approval", isLearned: false },
  { id: "p4", category: "AI Behavioral", label: "Meeting Duration", value: "Auto-default invitations to 30 mins", isLearned: true },
  { id: "p5", category: "AI Behavioral", label: "Task Decomposition", value: "Deconstruct multi-clause email requests into checklists", isLearned: true },
];

export const mockInitialPlan: AgentPlan = {
  id: "plan_401",
  goal: "Resolve 2:00 PM Calendar Conflict with Aditya",
  currentStepIndex: 3,
  linkedApprovalId: "appr_101",
  steps: [
    {
      id: "s1",
      description: "Query Microsoft Graph for shared availability",
      tool: "calendar.get_availability",
      status: "completed",
      output: "Aditya free 04:00 - 05:00 PM",
    },
    {
      id: "s2",
      description: "Generate candidate rescheduling slot",
      tool: "planner.reschedule",
      status: "completed",
      output: "Selected 04:00 PM (Zero conflict score)",
    },
    {
      id: "s3",
      description: "Stage calendar event update & draft notification",
      tool: "calendar.stage_update",
      status: "completed",
      output: "Draft generated with idempotency key #idemp_ev_9921_mod",
    },
    {
      id: "s4",
      description: "Awaiting human approval before dispatch",
      tool: "approval.request",
      status: "waiting_approval",
      output: "Action staged in Approval Center (#APPR-101)",
    },
  ],
};

