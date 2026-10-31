"use client";

import React, { useState } from "react";
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
  Terminal,
  Paperclip,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  History,
  Eye,
  Check,
  X,
  Users,
  MapPin,
  CalendarCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Flow3DCore } from "@/components/ui/flow-3d-core";
import { NumberTicker } from "@/components/ui/number-ticker";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { PromptInput } from "@/components/ui/prompt-input";
import { mockCalendarEvents, mockLedger, mockApprovals, mockInitialPlan } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

interface AgendaEvent {
  time: string;
  title: string;
  type: "meeting" | "focus" | "conflict" | "proposed";
  badge: string;
  badgeVariant: "verified" | "outline" | "destructive" | "warning";
  attendees?: string;
  details?: string;
}

export default function DashboardPage() {
  const { submitPrompt, isGenerating } = useCopilotStore();
  const { approvals, approveAction, rejectAction } = useApprovalStore();

  const [cockpitInput, setCockpitInput] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const handleCockpitSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cockpitInput.trim() || isGenerating) return;
    submitPrompt(cockpitInput);
    setCockpitInput("");
  };

  const quickPrompts = [
    { label: "Auto-Resolve 2:00 PM Conflict", prompt: "Auto-resolve my 2:00 PM conflict by moving Aditya to 4:00 PM and drafting confirmation" },
    { label: "Draft pgvector Migration Reply", prompt: "Draft reply to Aditya confirming pgvector database migration models before 3 PM" },
    { label: "Decompose Project Goal", prompt: "Decompose high-level goal 'Launch FLOW Hackathon Release' into subtasks with time estimates" },
  ];

  const agendaEvents: AgendaEvent[] = [
    {
      time: "09:00 AM",
      title: "Team Standup & Daily Alignment",
      type: "meeting",
      badge: "Completed ✓",
      badgeVariant: "verified",
      attendees: "Aditya Sharma, Nikhil Bhardwaj, Vanshika Rana",
      details: "Morning synchronisation on database migrations and auth PKCE RFC approval.",
    },
    {
      time: "10:00 AM",
      title: "Deep Work: Frontend Architecture",
      type: "focus",
      badge: "Focus Block",
      badgeVariant: "outline",
      details: "2 hours uninterrupted design system refinement. Slack and email notifications muted.",
    },
    {
      time: "02:00 PM",
      title: "Sprint Demo Review (Partner Collision)",
      type: "conflict",
      badge: "Conflict ⚠️",
      badgeVariant: "destructive",
      attendees: "Executive Stakeholders, Aditya Sharma",
      details: "Overlaps with 1:1 Aditya Review. Candidate non-conflicting slot at 04:00 PM staged for sign-off.",
    },
    {
      time: "03:00 PM",
      title: "Deep Work: Database Vector Migrations",
      type: "focus",
      badge: "Focus Block",
      badgeVariant: "outline",
      details: "Protected slot for Supabase pgvector schema verification and embeddings indexing.",
    },
    {
      time: "04:00 PM",
      title: "1:1 Aditya Review (Proposed Reschedule Slot)",
      type: "proposed",
      badge: "Awaiting Sign-off",
      badgeVariant: "warning",
      attendees: "Aditya Sharma, Vanshika Rana",
      details: "Zero-collision score slot. Idempotency key #idemp_ev_9921_mod staged in Approval Center.",
    },
  ];

  return (
    <FadeIn className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Greeting & Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#29251F]">
            Good morning, Vanshika 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#777064] mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Friday, Oct 31 •</span>
            <span className="text-[#C58A32] font-semibold flex items-center gap-1">
              <NumberTicker value={pendingApprovals.length} /> decisions awaiting your authorization
            </span>
            <span>• 1 scheduling collision flagged.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPlanModal(true)}
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 border-[#E8DFD1] hover:bg-[#F1EADF] text-[#29251F]"
          >
            <Eye size={13} className="text-[#D97736]" />
            <span>Inspect Active Plan</span>
          </Button>

          <Link href="/approvals">
            <ShimmerButton
              shimmerColor="rgba(255, 255, 255, 0.45)"
              background="#D97736"
              className="h-8 gap-1.5 px-3"
            >
              <ShieldAlert size={13} />
              <span>Review Decisions (<NumberTicker value={pendingApprovals.length} />)</span>
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* 2. Priority Action Required Banner (With Magic UI BorderBeam) */}
      {pendingApprovals.length > 0 && (
        <div className="relative rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-soft transition-all overflow-hidden">
          <BorderBeam size={180} duration={10} colorFrom="#D97736" colorTo="#C58A32" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-1.5 rounded-lg bg-[#FEF8ED] border border-[#F9E2BE] text-[#C58A32] shrink-0 mt-0.5">
              <AlertTriangle size={16} />
            </div>
            <div>
              <span className="font-bold text-[#29251F] text-xs sm:text-sm">Action Required Before 11:30 AM:</span>
              <p className="text-[#777064] mt-0.5 text-xs leading-relaxed">
                A 02:00 PM calendar collision was detected between <em>Sprint Demo Review</em> and <em>1:1 Aditya</em>. An optimal reschedule to 04:00 PM and confirmation email draft have been staged.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <Button
              onClick={() => setShowConflictModal(true)}
              size="sm"
              variant="outline"
              className="h-8 text-xs border-[#F9E2BE] bg-[#FFFCF6] hover:bg-[#F1EADF]"
            >
              Preview Conflict & Resolution
            </Button>
            <Link href="/approvals">
              <Button size="sm" className="h-8 text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white gap-1.5">
                <span>Authorize Decision</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. CENTERSTAGE AGENTIC COCKPIT (Interactive 3D Living Core) */}
      <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] p-5 sm:p-6 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#D97736]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Interactive 3D Three.js Living Core */}
          <div className="shrink-0 flex flex-col items-center justify-center">
            <Flow3DCore size={110} intensity={isGenerating ? 1.4 : 1.0} interactive={true} />
            <span className="text-[10px] font-mono text-[#777064] mt-1.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#477A58] animate-pulse" />
              FLOW Living Core Active
            </span>
          </div>

          {/* Central Command Input Box */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#29251F] tracking-tight">
                What would you like FLOW to coordinate today?
              </h2>
              <p className="text-xs text-[#777064] mt-0.5">
                Instruct FLOW in natural language. Plans are staged with explicit approval gates before any data mutation.
              </p>
            </div>

            {/* 21st.dev Integrated Prompt Input */}
            <PromptInput
              value={cockpitInput}
              onChange={setCockpitInput}
              onSubmit={handleCockpitSubmit}
              isGenerating={isGenerating}
              suggestions={quickPrompts}
              onSelectSuggestion={(prompt) => submitPrompt(prompt)}
              placeholder="Ask FLOW to resolve today's schedule collision, draft an email, or decompose a task goal..."
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
              Today's Chronological Agenda
            </h2>
            <Link href="/calendar" className="text-xs font-semibold text-[#D97736] hover:text-[#B95727] flex items-center gap-1">
              <span>Full Calendar</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {agendaEvents.map((evt, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedEvent(evt)}
                className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-soft active:scale-[0.99] ${
                  evt.type === "conflict"
                    ? "border-[#F5C2BC] bg-[#FDEDEB]/70 hover:bg-[#FDEDEB]"
                    : evt.type === "proposed"
                    ? "border-dashed border-[#D0C4B2] bg-[#F8F4EC]/50 hover:bg-[#F8F4EC]"
                    : "border-[#E8DFD1] bg-[#FFFCF6] hover:bg-[#FDFBFA]"
                }`}
              >
                <span className={`font-mono text-xs font-semibold w-18 shrink-0 mt-0.5 ${
                  evt.type === "conflict" ? "text-[#C65345] font-bold" : "text-[#777064]"
                }`}>
                  {evt.time}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-semibold text-sm truncate ${
                      evt.type === "conflict" ? "text-[#C65345]" : "text-[#29251F]"
                    }`}>
                      {evt.title}
                    </h4>
                    <Badge variant={evt.badgeVariant} className="text-[10px] shrink-0">
                      {evt.badge}
                    </Badge>
                  </div>
                  {evt.attendees && (
                    <p className="text-xs text-[#777064] mt-0.5 truncate">{evt.attendees}</p>
                  )}
                  {evt.details && (
                    <p className="text-xs text-[#81766B] mt-0.5 line-clamp-1">{evt.details}</p>
                  )}
                </div>

                <ChevronRight size={14} className="text-[#A39B8E] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Pending Decision Gates & Verified Proofs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#29251F]">
              Pending Decision Gates
            </h2>
            <Badge variant="warning" className="text-[10px] font-mono">
              <NumberTicker value={pendingApprovals.length} /> PENDING
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

                <p className="text-xs text-[#777064] leading-relaxed">
                  {item.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[11px] text-[#29251F] font-mono">
                  Target Service: <span className="font-semibold text-[#D97736]">{item.targetService}</span>
                </div>

                <div className="pt-2 border-t border-[#E8DFD1] flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-[#C65345] hover:bg-[#FDEDEB] border-[#E8DFD1]"
                    onClick={() => rejectAction(item.id)}
                  >
                    <X size={12} className="mr-1" />
                    <span>Reject</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Link href="/approvals">
                      <Button size="sm" variant="outline" className="h-8 text-xs border-[#E8DFD1]">
                        Inspect
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="h-8 text-xs font-semibold bg-[#477A58] hover:bg-[#3D6A4C] text-white"
                      onClick={() => approveAction(item.id)}
                    >
                      <Check size={12} className="mr-1" />
                      <span>Authorize</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="p-6 text-center border border-dashed border-[#E8DFD1] rounded-xl text-xs text-[#777064] space-y-1">
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
              {mockLedger.slice(0, 2).map((entry) => (
                <div key={entry.id} className="p-3 rounded-lg border border-[#E8DFD1] bg-[#FFFCF6] text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#477A58] shrink-0" />
                    <span className="font-medium text-[#29251F] truncate">{entry.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#777064] shrink-0">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Comparison Modal */}
      <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
        <DialogContent className="max-w-2xl bg-[#FFFCF6] border-[#E8DFD1] text-[#29251F] p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#FDEDEB] text-[#C65345] border border-[#F5C2BC]">
                <AlertTriangle size={18} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#29251F]">
                  Dual-Slot Collision Radar & Staged Resolution
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  Inspect the conflicting schedule overlap vs. FLOW's staged zero-collision proposal.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
            {/* Left: Conflicting State */}
            <div className="p-4 rounded-xl border border-[#F5C2BC] bg-[#FDEDEB]/60 space-y-2">
              <span className="text-[10px] font-bold uppercase font-mono text-[#C65345] flex items-center gap-1">
                <X size={12} /> Detected Overlap
              </span>
              <h4 className="font-bold text-sm text-[#29251F]">Friday 02:00 PM</h4>
              <p className="text-xs text-[#777064]">
                <strong>Sprint Demo Review</strong> clashes with <strong>1:1 Aditya Review</strong>.
              </p>
              <div className="p-2 rounded bg-white/70 border border-[#F5C2BC] text-[11px] font-mono text-[#C65345]">
                Conflict Score: 100% (Direct Overlap)
              </div>
            </div>

            {/* Right: Proposed Candidate Slot */}
            <div className="p-4 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0]/60 space-y-2">
              <span className="text-[10px] font-bold uppercase font-mono text-[#477A58] flex items-center gap-1">
                <Check size={12} /> Staged Candidate Slot
              </span>
              <h4 className="font-bold text-sm text-[#29251F]">Friday 04:00 PM</h4>
              <p className="text-xs text-[#777064]">
                1:1 with Aditya moved to 4:00 PM. Confirmed free on Microsoft Graph availability.
              </p>
              <div className="p-2 rounded bg-white/70 border border-[#CDE3D5] text-[11px] font-mono text-[#477A58]">
                Conflict Score: 0% (Optimal Slot)
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD1]">
            <span className="text-xs text-[#777064] font-mono">Idempotency Key: #idemp_ev_9921_mod</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConflictModal(false)}
                className="text-xs border-[#E8DFD1]"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                className="text-xs font-semibold bg-[#477A58] hover:bg-[#3D6A4C] text-white gap-1.5"
                onClick={() => {
                  approveAction("appr_101");
                  setShowConflictModal(false);
                }}
              >
                <Check size={13} />
                <span>Authorize Reschedule (HITL)</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Agenda Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] text-[#29251F] p-5">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge variant={selectedEvent.badgeVariant} className="text-[10px]">
                  {selectedEvent.badge}
                </Badge>
                <span className="text-xs font-mono font-bold text-[#777064]">{selectedEvent.time}</span>
              </div>
              <DialogTitle className="text-base font-bold text-[#29251F] mt-1.5">
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {selectedEvent.attendees && (
                <div className="flex items-start gap-2 text-[#777064]">
                  <Users size={14} className="shrink-0 mt-0.5 text-primary" />
                  <div>
                    <span className="font-semibold text-[#29251F]">Attendees:</span>
                    <p className="mt-0.5">{selectedEvent.attendees}</p>
                  </div>
                </div>
              )}

              {selectedEvent.details && (
                <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[#29251F] leading-relaxed">
                  {selectedEvent.details}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="text-xs border-[#E8DFD1]"
              >
                Close
              </Button>
              <Link href="/calendar">
                <Button size="sm" className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1">
                  <CalendarCheck size={13} />
                  <span>Open in Calendar</span>
                </Button>
              </Link>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Execution Plan Preview Dialog */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-xl bg-[#FFFCF6] border-[#E8DFD1] text-[#29251F] p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC]">
                <Terminal size={16} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#29251F]">
                  Agent Execution Plan Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  Inspect the proposed multi-step execution DAG before granting authorization.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#777064]">Plan Goal</span>
              <h4 className="font-semibold text-[#29251F] text-sm mt-0.5">{mockInitialPlan.goal}</h4>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-[#777064]">Execution Sequence</span>
              {mockInitialPlan.steps.map((step, idx) => (
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

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlanModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Close Preview
            </Button>
            <Link href="/approvals">
              <Button
                size="sm"
                className="text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white"
                onClick={() => setShowPlanModal(false)}
              >
                Go to Decision Center
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
