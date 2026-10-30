// Domain Types for FLOW OS

export type RiskLevel = "low" | "medium" | "high";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "modified";

export interface ActionDiff {
  entityType: "email" | "calendar" | "task";
  action: "create" | "update" | "delete" | "send";
  title: string;
  before?: Record<string, any>;
  after: Record<string, any>;
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
}

export interface TaskItem {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "in_review" | "completed";
  priority: "urgent" | "high" | "medium" | "low";
  dueDate: string;
  category: "Backend" | "Security" | "Product" | "Research";
  aiBreakdown?: string[];
  progress: number; // 0 - 100
}

export interface VerificationReceipt {
  receiptHash: string;
  timestamp: string;
  signature: string;
  verifiedBy: string;
  latencyMs: number;
  httpStatus: number;
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
}

