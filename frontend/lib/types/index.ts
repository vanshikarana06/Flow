// Domain Types for FLOW OS

export type RiskLevel = "low" | "medium" | "high";

export type ApprovalStatus = 
  | "proposed"
  | "pending"
  | "approved"
  | "executing"
  | "completed"
  | "failed"
  | "unknown"
  | "rejected"
  | "modified";

export interface ActionDiff {
  entityType: "email" | "calendar" | "task";
  action: "create" | "update" | "delete" | "send";
  title: string;
  before?: Record<string, any>;
  after: Record<string, any>;
}

export interface VerificationReceipt {
  receiptHash: string;
  timestamp: string;
  signature: string;
  verifiedBy: string;
  latencyMs: number;
  httpStatus: number;
}

export interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  originPrompt: string;
  agentName: string;
  risk: RiskLevel;
  status: ApprovalStatus;
  createdAt: string;
  diff: ActionDiff;
  idempotencyKey: string;
  targetService: string;
  verificationReceipt?: VerificationReceipt;
  executionError?: string;
}

export interface ThreadMessage {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  isStagedDraft?: boolean;
}

export interface EmailThread {
  id: string;
  subject: string;
  snippet: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  unread: boolean;
  priority: "urgent" | "normal" | "low";
  timestamp: string;
  tags: string[];
  messages: ThreadMessage[];
  aiSummary?: string;
  actionRequired?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO
  endTime: string; // ISO
  category: "meeting" | "focus" | "personal" | "ai_block";
  attendees: { name: string; email: string; avatar?: string }[];
  isConflict?: boolean;
  conflictDetails?: string;
  suggestedSlot?: {
    startTime: string;
    endTime: string;
    reason: string;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "in_review" | "completed";
  priority: "urgent" | "high" | "medium" | "low";
  dueDate: string;
  category: "Backend" | "Security" | "Product" | "Research";
  aiBreakdown?: string[];
  subtasks?: Array<{ id?: string; title: string; is_completed?: boolean; completed?: boolean }>;
  progress: number; // 0 - 100
  estimatedDuration?: string;
  scheduledTime?: string;
}

export interface LedgerEntry {
  id: string;
  title: string;
  category: "calendar" | "email" | "task" | "security";
  status: "staged" | "approved" | "executed" | "verified";
  timestamp: string;
  initiator: string;
  service: string;
  receipt?: VerificationReceipt;
}

export interface ContactDossier {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  relationship: string;
  interactionCount: number;
  preferences: string[];
  learnedContext: string[];
}

export interface UserPreference {
  id: string;
  category: string;
  label: string;
  value: string;
  isLearned: boolean;
}

export interface PlanStep {
  id: string;
  description: string;
  tool: string;
  status: "completed" | "in_progress" | "pending" | "waiting_approval";
  output?: string;
}

export interface AgentPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  currentStepIndex: number;
  linkedApprovalId?: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "flow";
  text: string;
  timestamp: string;
  plan?: AgentPlan;
  reasoningSteps?: string[];
}

// Automation Domain Types (Lindy + Zapier Integration)
export interface AgentItem {
  id: string;
  name: string;
  description: string;
  category: "calendar" | "email" | "task" | "security";
  status: "active" | "paused" | "evaluating";
  connectedServices: string[];
  hitlPolicy: "strict" | "moderate" | "autonomous";
  lastActive: string;
  actionsExecutedToday: number;
  permissions: string[];
}

export interface WorkflowStep {
  id: string;
  order: number;
  type: "trigger" | "condition" | "hitl_gate" | "action";
  label: string;
  detail: string;
  status: "active" | "waiting" | "passed";
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  status: "active" | "draft" | "paused";
  lastRun: string;
  totalRuns: number;
  hitlRequired: boolean;
}

export interface IntegrationItem {
  id: string;
  name: string;
  provider: "microsoft" | "google" | "supabase" | "slack" | "resend";
  category: "Calendar & Email" | "Database & Vector" | "Communications" | "Webhooks";
  status: "connected" | "disconnected" | "action_required";
  connectedAccount: string;
  lastSynced: string;
  authType: "OAuth 2.0 PKCE" | "API Key" | "Service Principal";
  scopes: string[];
}
