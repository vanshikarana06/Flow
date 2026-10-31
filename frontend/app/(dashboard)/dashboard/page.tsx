"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  ShieldAlert, 
  Mail, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  History, 
  RefreshCw,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Flow3DCore } from "@/components/ui/flow-3d-core";
import { NumberTicker } from "@/components/ui/number-ticker";
import { FadeIn } from "@/components/ui/motion-primitives";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { PromptInput } from "@/components/ui/prompt-input";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api-client";

interface AgendaEvent {
  time: string;
  title: string;
  type: "meeting" | "focus" | "conflict" | "proposed";
  badge: string;
  badgeVariant: "verified" | "outline" | "destructive" | "warning";
  attendees?: string;
  details?: string;
}

interface DashboardSummaryData {
  unread_emails_count: number;
  active_tasks_count: number;
  todays_events_count: number;
  pending_approvals_count: number;
  recent_activities_count: number;
  alerts_count: number;
  emails: any[];
  tasks: any[];
  calendar: any[];
  approvals: any[];
  activities: any[];
  alerts: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { submitPrompt, isGenerating, activePlan } = useCopilotStore();
  const { approvals, approveAction, rejectAction } = useApprovalStore();

  const [cockpitInput, setCockpitInput] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Live backend dashboard summary state
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "Workspace User";
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  // Fetch unified dashboard summary from GET /api/v1/dashboard/summary
  const fetchDashboardSummary = useCallback(async () => {
    try {
      const data = await apiClient.get<DashboardSummaryData>("/dashboard/summary");
      if (data) {
        setSummary(data);
        setIsLiveConnected(true);
      }
    } catch (err) {
      console.warn("Backend dashboard summary not reachable:", err);
      setIsLiveConnected(false);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardSummary();
    // Auto-refresh summary every 8 seconds
    const interval = setInterval(fetchDashboardSummary, 8000);
    return () => clearInterval(interval);
  }, [fetchDashboardSummary]);

  const handleCockpitSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cockpitInput.trim() || isGenerating) return;
    submitPrompt(cockpitInput);
    setCockpitInput("");
  };

  const quickPrompts = [
    { label: "Summarize Unread Emails", prompt: "Summarize all unread emails in my inbox and extract action items" },
    { label: "Schedule 2-Hour Focus Block", prompt: "Find an open slot on my calendar today and schedule a 2-hour Deep Work focus block" },
    { label: "Decompose Project Goal", prompt: "Decompose the goal 'Ship FLOW Production Milestone' into prioritized subtasks" },
  ];

  // Map live backend calendar events
  const agendaEvents: AgendaEvent[] = (summary?.calendar || []).map((evt: any) => {
    const startTime = evt.start_time
      ? new Date(evt.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "TBD";
    return {
      time: startTime,
      title: evt.title,
      type: evt.is_focus_block ? "focus" : "meeting",
      badge: evt.is_focus_block ? "Focus Block" : "Verified Event",
      badgeVariant: evt.is_focus_block ? "outline" : "verified",
      details: evt.description || undefined,
    };
  });

  // Resolved dynamic counts (strictly live API counts)
  const approvalsCount = summary?.pending_approvals_count ?? pendingApprovals.length;
  const emailsCount = summary?.unread_emails_count ?? 0;
  const tasksCount = summary?.active_tasks_count ?? 0;
  const eventsCount = summary?.todays_events_count ?? 0;

  return (
    <FadeIn className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Greeting & Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#29251F]">
              Good morning, {firstName} 👋
            </h1>
            {isLiveConnected && (
              <Badge variant="verified" className="text-[10px] py-0.5 px-2 bg-[#EDF5F0] text-[#477A58] border-[#CDE3D5]">
                ● Live API Connected
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-1">
            FLOW Agentic Runtime is active. Monitoring your inbox, schedule commitments, and approval gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchDashboardSummary()}
            className="text-xs border-[#E8DFD1] hover:bg-[#F1EADF] gap-1.5"
          >
            <RefreshCw size={13} className={isLoadingSummary ? "animate-spin" : ""} />
            <span>Refresh State</span>
          </Button>

          <Link href="/approvals">
            <Button
              size="sm"
              className="relative text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-soft gap-1.5"
            >
              <ShieldAlert size={14} />
              <span>Review Approvals</span>
              {approvalsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-primary text-[10px] font-bold">
                  {approvalsCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATS PULSE ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Link href="/inbox">
          <Card className="border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D0C4B2] transition-colors shadow-2xs hover:shadow-soft">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#777064]">Unread Emails</span>
                <div className="text-2xl font-bold text-[#29251F] mt-0.5">
                  <NumberTicker value={emailsCount} />
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#FCEEE5] text-primary flex items-center justify-center border border-[#F7D2BC]">
                <Mail size={16} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D0C4B2] transition-colors shadow-2xs hover:shadow-soft">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#777064]">Active Tasks</span>
                <div className="text-2xl font-bold text-[#29251F] mt-0.5">
                  <NumberTicker value={tasksCount} />
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#EDF5F0] text-[#477A58] flex items-center justify-center border border-[#CDE3D5]">
                <CheckSquare size={16} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D0C4B2] transition-colors shadow-2xs hover:shadow-soft">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#777064]">Today&apos;s Events</span>
                <div className="text-2xl font-bold text-[#29251F] mt-0.5">
                  <NumberTicker value={eventsCount} />
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#FEF8ED] text-[#C58A32] flex items-center justify-center border border-[#F9E2BE]">
                <CalendarIcon size={16} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/approvals">
          <Card className="border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D0C4B2] transition-colors shadow-2xs hover:shadow-soft">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#777064]">Pending Approvals</span>
                <div className="text-2xl font-bold text-primary mt-0.5">
                  <NumberTicker value={approvalsCount} />
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#FCEEE5] text-primary flex items-center justify-center border border-[#F7D2BC]">
                <ShieldCheck size={16} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. HERO AI COCKPIT */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E8DFD1] bg-gradient-to-br from-[#FFFCF6] via-[#FDFBF7] to-[#F8F4EC] p-6 shadow-soft">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="shrink-0 flex items-center justify-center">
            <Flow3DCore size={140} />
          </div>

          <div className="flex-1 w-full space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-[#FFFCF6] border-[#D0C4B2] text-[#29251F]">
                  <Sparkles size={11} className="mr-1 text-primary" /> Autonomous Agent Engine
                </Badge>
                {activePlan && (
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    View Active Execution Plan →
                  </button>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#29251F] mt-1">
                FLOW Intelligence Cockpit
              </h3>
              <p className="text-xs text-[#777064]">
                Instruct FLOW in natural language. Plans are staged with explicit approval gates before any data mutation.
              </p>
            </div>

            <PromptInput
              value={cockpitInput}
              onChange={setCockpitInput}
              onSubmit={handleCockpitSubmit}
              isGenerating={isGenerating}
              suggestions={quickPrompts}
              onSelectSuggestion={(prompt) => submitPrompt(prompt)}
              placeholder="Ask FLOW to summarize inbox, schedule a focus block, or plan an objective..."
            />
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Chronological Agenda */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">
              Today&apos;s Chronological Agenda
            </h2>
            <Link href="/calendar" className="text-xs font-semibold text-[#D97736] hover:text-[#B95727] flex items-center gap-1">
              <span>Full Calendar</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {agendaEvents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E8DFD1] rounded-xl text-xs text-[#777064] space-y-2 bg-[#FFFCF6]">
                <CalendarIcon size={28} className="text-[#A39B8E] mx-auto opacity-70" />
                <p className="font-semibold text-[#29251F]">No Events Scheduled Today</p>
                <p>Your calendar is clear. Ask the agent in the prompt bar above to schedule focus blocks or meetings.</p>
              </div>
            ) : (
              agendaEvents.map((evt, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedEvent(evt)}
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] hover:bg-[#FDFBFA] transition-all cursor-pointer shadow-2xs hover:shadow-soft"
                >
                  <span className="font-mono text-xs font-semibold w-18 shrink-0 mt-0.5 text-[#777064]">
                    {evt.time}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate text-[#29251F]">
                        {evt.title}
                      </h4>
                      <Badge variant={evt.badgeVariant} className="text-[10px] shrink-0">
                        {evt.badge}
                      </Badge>
                    </div>
                    {evt.details && (
                      <p className="text-xs text-[#81766B] mt-0.5 line-clamp-1">{evt.details}</p>
                    )}
                  </div>

                  <ChevronRight size={14} className="text-[#A39B8E] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Pending Decision Gates & Verified Proofs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#29251F]">
              Pending Decision Gates
            </h2>
            <Badge variant="warning" className="text-[10px] font-mono">
              <NumberTicker value={approvalsCount} /> PENDING
            </Badge>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <Card key={item.id} className="border-[#F9E2BE] bg-[#FFFCF6] shadow-soft p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#777064] font-mono">Decision #{item.id}</span>
                    <h3 className="font-semibold text-sm text-[#29251F]">{item.title}</h3>
                  </div>
                  <Badge
                    variant={item.risk === "high" ? "destructive" : "warning"}
                    className="text-[9px] uppercase font-mono"
                  >
                    Risk: {item.risk}
                  </Badge>
                </div>

                <p className="text-xs text-[#777064] line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD1]/60">
                  <span className="text-[10px] font-mono text-[#777064]">
                    Idempotency: {item.idempotencyKey.slice(0, 14)}...
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rejectAction(item.id)}
                      className="h-7 text-xs text-[#C65345] hover:bg-[#FDEDEB]"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveAction(item.id)}
                      className="h-7 text-xs font-semibold bg-[#477A58] hover:bg-[#3D6A4C] text-white"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="p-6 text-center border border-dashed border-[#E8DFD1] rounded-xl text-xs text-[#777064] space-y-1 bg-[#FFFCF6]">
                <CheckCircle2 size={18} className="text-[#477A58] mx-auto" />
                <p className="font-semibold text-[#29251F]">All Decision Gates Clear</p>
                <p>No actions are waiting for human authorization.</p>
              </div>
            )}
          </div>

          {/* Recent Verified Activity Summary */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#777064] uppercase tracking-wider flex items-center gap-1.5">
                <History size={13} className="text-[#477A58]" /> Recently Verified Executions
              </span>
              <Link href="/activity" className="text-[11px] text-[#D97736] hover:underline">
                View Ledger
              </Link>
            </div>

            <div className="space-y-2">
              {summary?.activities && summary.activities.length > 0 ? (
                summary.activities.slice(0, 3).map((a: any) => ({
                  id: a.id,
                  title: `${(a.log_type || "ACTION").replace(/_/g, " ")}: ${a.action_name || "Executed"}`,
                  timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                })).map((entry: any) => (
                  <div key={entry.id} className="p-3 rounded-lg border border-[#E8DFD1] bg-[#FFFCF6] text-xs flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#477A58] shrink-0" />
                      <span className="font-medium text-[#29251F] truncate">{entry.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#777064] shrink-0">{entry.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center border border-dashed border-[#E8DFD1] rounded-lg text-[11px] text-[#777064] bg-[#FFFCF6]">
                  No execution activities recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Preview Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-lg bg-[#FFFCF6] border-[#E8DFD1] text-[#29251F] p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
                <Sparkles size={16} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#29251F]">
                  Agent Execution Plan
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  Active multi-step execution DAG staged by FLOW Agent Runtime.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {activePlan ? (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]">
                <span className="text-[10px] uppercase font-mono font-bold text-[#777064]">Plan Goal</span>
                <h4 className="font-semibold text-[#29251F] text-sm mt-0.5">{activePlan.goal}</h4>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-[#777064]">Execution Sequence</span>
                {activePlan.steps.map((step, idx) => (
                  <div key={step.id} className="p-2.5 rounded-lg border border-[#E8DFD1] bg-[#FFFCF6] flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#777064]">Step {idx + 1}</span>
                      <span className="font-medium text-[#29251F]">{step.description}</span>
                    </div>
                    <Badge variant={step.status === "completed" ? "verified" : "warning"} className="text-[9px] font-mono">
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[#E8DFD1] rounded-xl text-xs text-[#777064] space-y-1 my-3">
              <Sparkles size={24} className="text-primary mx-auto opacity-70" />
              <p className="font-semibold text-[#29251F]">No Active Agent Plan</p>
              <p>Ask FLOW in the prompt bar to generate an execution plan.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlanModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
