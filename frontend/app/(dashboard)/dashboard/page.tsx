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
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FlowAgentOrb } from "@/components/ui/flow-agent-orb";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";
import { mockCalendarEvents, mockLedger, mockApprovals, mockInitialPlan } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function DashboardPage() {
  const { submitPrompt, isGenerating } = useCopilotStore();
  const { approvals, approveAction, rejectAction } = useApprovalStore();

  const [cockpitInput, setCockpitInput] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const handleCockpitSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cockpitInput.trim() || isGenerating) return;
    submitPrompt(cockpitInput);
    setCockpitInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCockpitSubmit();
    }
  };

  const quickPrompts = [
    { label: "Auto-Resolve 2:00 PM Conflict", prompt: "Auto-resolve my 2:00 PM conflict by moving Aditya to 4:00 PM and drafting confirmation" },
    { label: "Draft pgvector Migration Reply", prompt: "Draft reply to Aditya confirming pgvector database migration models before 3 PM" },
    { label: "Decompose Project Goal", prompt: "Decompose high-level goal 'Launch FLOW Hackathon Release' into subtasks with time estimates" },
  ];

  return (
    <FadeIn className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Greeting & Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#29251F]">
            Good morning, Vanshika 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#777064] mt-1">
            Friday, Oct 31 • <span className="text-[#C58A32] font-semibold">{pendingApprovals.length} decisions awaiting your authorization</span> • 1 scheduling collision flagged.
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
            <Button
              size="sm"
              className="text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] text-white shadow-xs"
            >
              <ShieldAlert size={13} />
              <span>Review Decisions ({pendingApprovals.length})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Priority Action Required Banner (When Collision/Decisions Exist) */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-soft transition-all">
          <div className="flex items-start gap-3">
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
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPlanModal(true)}
              size="sm"
              variant="outline"
              className="h-8 text-xs border-[#F9E2BE] bg-[#FFFCF6] hover:bg-[#F1EADF]"
            >
              Preview Plan
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

      {/* 3. CENTERSTAGE AGENTIC COCKPIT (Primary Hub of the Dashboard) */}
      <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] p-5 sm:p-6 shadow-soft relative overflow-hidden">
        {/* Subtle decorative warm gradient glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#D97736]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Interactive 3D Coordination Gyroscope Core */}
          <div className="shrink-0 flex flex-col items-center justify-center">
            <FlowAgentOrb size={108} isProcessing={isGenerating} />
            <span className="text-[10px] font-mono text-[#777064] mt-2">FLOW Core Active</span>
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

            {/* Input Composer Field */}
            <form onSubmit={handleCockpitSubmit} className="relative rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-card focus-within:border-[#D97736] focus-within:ring-2 focus-within:ring-[#D97736]/20 transition-all p-2.5">
              <textarea
                rows={2}
                value={cockpitInput}
                onChange={(e) => setCockpitInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FLOW to resolve today's schedule collision, draft an email, or decompose a task goal..."
                className="w-full bg-transparent text-xs text-[#29251F] placeholder:text-[#A39B8E] focus:outline-none resize-none leading-relaxed px-1 min-h-[44px]"
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD1]/50 text-[11px] text-[#777064]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1 rounded-md text-[#777064] hover:text-[#29251F] hover:bg-[#F1EADF] transition-colors"
                    title="Attach Context from Calendar, Email, or Tasks"
                  >
                    <Paperclip size={14} />
                  </button>
                  <span className="hidden sm:inline text-[10px]">
                    Press <kbd className="font-mono bg-[#F1EADF] px-1 py-0.5 rounded border border-[#E8DFD1]">Enter ↵</kbd> to dispatch, <kbd className="font-mono bg-[#F1EADF] px-1 py-0.5 rounded border border-[#E8DFD1]">Shift+Enter</kbd> for newline
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={!cockpitInput.trim() || isGenerating}
                  size="sm"
                  className="h-7 text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] disabled:opacity-40 text-white"
                >
                  <span>Dispatch Instruction</span>
                  <ArrowUp size={12} />
                </Button>
              </div>
            </form>

            {/* Quick Contextual Dispatches */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <span className="text-[#777064] font-medium text-[10px] uppercase font-mono mr-1">Suggestions:</span>
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => submitPrompt(item.prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#F1EADF] hover:bg-[#E5DCCE] text-[#777064] hover:text-[#29251F] border border-[#E8DFD1] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCTIVITY GRID: Prominent Agenda & Decision Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Chronological Agenda (PROMINENT SECTION) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            {/* 22px-24px Prominent Section Heading */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">
              Today's Chronological Agenda
            </h2>
            <Link href="/calendar" className="text-xs font-semibold text-[#D97736] hover:text-[#B95727] flex items-center gap-1">
              <span>Full Calendar</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Event 1: Completed Standup */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-2xs">
              <span className="font-mono text-xs text-[#777064] font-semibold w-18 shrink-0 mt-0.5">09:00 AM</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#29251F] text-sm">Team Standup & Daily Alignment</h4>
                  <Badge variant="verified" className="text-[10px]">Completed ✓</Badge>
                </div>
                <p className="text-xs text-[#777064] mt-0.5">Aditya Sharma, Nikhil Bhardwaj, Vanshika Rana</p>
              </div>
            </div>

            {/* Event 2: Focus Block */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-2xs">
              <span className="font-mono text-xs text-[#777064] font-semibold w-18 shrink-0 mt-0.5">10:00 AM</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#29251F] text-sm">Deep Work: Frontend Architecture</h4>
                  <Badge variant="outline" className="text-[10px] border-[#D97736]/30 text-[#D97736]">Focus Block</Badge>
                </div>
                <p className="text-xs text-[#777064] mt-0.5">2 hours uninterrupted time • System notifications muted</p>
              </div>
            </div>

            {/* Event 3: Collision Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-[#F5C2BC] bg-[#FDEDEB]/60 shadow-2xs">
              <span className="font-mono text-xs text-[#C65345] font-bold w-18 shrink-0 mt-0.5">02:00 PM</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#C65345] text-sm flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>Sprint Demo Review (Partner Collision)</span>
                  </h4>
                  <Badge variant="destructive" className="text-[10px]">Conflict ⚠️</Badge>
                </div>
                <p className="text-xs text-[#29251F] mt-1 leading-relaxed">
                  Overlaps with 1:1 Aditya Review. <span className="font-semibold text-[#C58A32]">Optimal reschedule to 04:00 PM staged for approval.</span>
                </p>
                <div className="pt-2 mt-2 border-t border-[#F5C2BC]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#777064]">Zero-conflict slot available at 4:00 PM</span>
                  <Link href="/approvals" className="text-xs font-semibold text-[#D97736] hover:underline flex items-center gap-1">
                    <span>Inspect Decision</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Event 4: Deep Work */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-2xs">
              <span className="font-mono text-xs text-[#777064] font-semibold w-18 shrink-0 mt-0.5">03:00 PM</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#29251F] text-sm">Deep Work: Database Vector Migrations</h4>
                  <Badge variant="outline" className="text-[10px] border-[#D97736]/30 text-[#D97736]">Focus Block</Badge>
                </div>
                <p className="text-xs text-[#777064] mt-0.5">Protected slot • Next up after demo</p>
              </div>
            </div>

            {/* Event 5: Proposed Reschedule */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-dashed border-[#D0C4B2] bg-[#F8F4EC]/40">
              <span className="font-mono text-xs text-[#777064] font-semibold w-18 shrink-0 mt-0.5">04:00 PM</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-[#777064] text-sm">1:1 Aditya Review (Proposed Reschedule Slot)</h4>
                  <Badge variant="warning" className="text-[10px]">Awaiting Sign-off</Badge>
                </div>
                <p className="text-xs text-[#777064] mt-0.5">Zero collision score • Preserves uninterrupted 3:00 PM focus time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Pending Decision Gates & Verified Proofs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#29251F]">
              Pending Decision Gates
            </h2>
            <Badge variant="warning" className="text-[10px] font-mono">
              {pendingApprovals.length} PENDING
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
                <div key={entry.id} className="p-3 rounded-lg border border-[#E8DFD1] bg-[#FFFCF6] text-xs flex items-center justify-between">
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

      {/* Execution Plan Preview Dialog (Inspect Steps Before Authorizing) */}
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
                <div key={step.id} className="p-2.5 rounded-lg border border-[#E8DFD1] bg-[#FFFCF6] flex items-center justify-between text-xs">
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
