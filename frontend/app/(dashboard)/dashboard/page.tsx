"use client";

import React from "react";
import Link from "next/link";
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  ShieldAlert, 
  Mail, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  AlertTriangle,
  History,
  Zap,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Cpu,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCalendarEvents, mockLedger, mockApprovals, mockTasks, mockAgents } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function DashboardPage() {
  const { toggleOpen, submitPrompt } = useCopilotStore();
  const { approvals } = useApprovalStore();

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="space-y-5">
      {/* 1. Executive Greeting & Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#29251F]">
            Good morning, Vanshika 👋
          </h2>
          <p className="text-xs text-[#777064] mt-0.5">
            Today is Friday, Oct 31 • <span className="text-[#C58A32] font-semibold">{pendingApprovals.length} decisions pending approval</span> and 1 scheduling conflict require attention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/approvals">
            <Button size="sm" variant="default" className="text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] text-white">
              <ShieldAlert size={13} />
              <span>Review Approvals ({pendingApprovals.length})</span>
            </Button>
          </Link>
          <Link href="/ai">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs font-semibold text-[#29251F] bg-[#F1EADF] hover:bg-[#E8DFD1] border border-[#E8DFD1]"
            >
              <Sparkles size={13} className="text-[#D97736]" />
              <span>Open AI Workspace</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Motion-Inspired Action Priority Focal Banner */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-soft">
          <div className="flex items-start gap-3 text-[#C58A32]">
            <div className="p-1 rounded-md bg-[#FEF8ED] border border-[#F9E2BE] text-[#C58A32] shrink-0 mt-0.5">
              <AlertTriangle size={15} />
            </div>
            <div>
              <span className="font-semibold text-[#29251F]">Priority Action Required Before 11:30 AM:</span>
              <p className="text-[#777064] mt-0.5 leading-relaxed">
                A 02:00 PM calendar conflict was detected between <em>Sprint Demo Review</em> and <em>1:1 Aditya</em>. An optimal reschedule to 04:00 PM and notification email have been staged.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/approvals">
              <Button size="sm" className="h-8 text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white gap-1.5">
                <span>Inspect Staged Decision</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Actionable Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link href="/approvals">
          <Card className="hover:border-[#D97736]/50 transition-all cursor-pointer group border-[#F9E2BE] bg-[#FEF8ED]/40">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Pending Approvals</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#FEF8ED] text-[#C58A32] border border-[#F9E2BE]">
                <ShieldAlert size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">{pendingApprovals.length}</div>
              <p className="text-[10px] text-[#C58A32] mt-0.5 font-medium">
                1 Consequential Email • 1 Reschedule
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="hover:border-[#D97736]/50 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Today's Meetings</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#F1EADF] text-[#29251F]">
                <CalendarIcon size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">3 Events</div>
              <p className="text-[10px] text-[#C65345] mt-0.5 font-medium">
                1 Conflict at 02:00 PM
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="hover:border-[#D97736]/50 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Active Tasks</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#F1EADF] text-[#29251F]">
                <CheckSquare size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">4 Tasks</div>
              <p className="text-[10px] text-[#777064] mt-0.5">
                Next: Verify pgvector migrations (3 PM)
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inbox">
          <Card className="hover:border-[#D97736]/50 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Actionable Emails</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#F1EADF] text-[#29251F]">
                <Mail size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">3 Threads</div>
              <p className="text-[10px] text-[#D97736] mt-0.5 font-medium">
                1 Draft awaiting human approval
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 4. Motion-Inspired Today's Agenda & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Chronological Agenda & Execution History */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chronological Schedule with Conflict Highlights */}
          <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E8DFD1] pb-3">
              <div>
                <CardTitle className="text-xs font-semibold text-[#29251F] flex items-center gap-2">
                  <CalendarIcon size={14} className="text-[#D97736]" /> Today's Chronological Agenda
                </CardTitle>
                <CardDescription>
                  Time-blocked meetings and focus intervals synced from Microsoft Graph & Google Calendar.
                </CardDescription>
              </div>
              <Link href="/calendar" className="text-[11px] font-semibold text-[#D97736] hover:text-[#B95727] flex items-center gap-1">
                <span>Calendar View</span>
                <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {/* Event 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
                <span className="font-mono text-[10px] text-[#777064] w-16 shrink-0 mt-0.5">09:00 AM</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#29251F]">Team Standup & Daily Alignment</h4>
                    <Badge variant="verified" className="text-[9px]">Completed ✓</Badge>
                  </div>
                  <p className="text-[11px] text-[#777064] mt-0.5">Aditya Sharma, Nikhil Bhardwaj, Vanshika Rana</p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
                <span className="font-mono text-[10px] text-[#777064] w-16 shrink-0 mt-0.5">10:00 AM</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#29251F]">Deep Work: Frontend Architecture</h4>
                    <Badge variant="outline" className="text-[9px] border-[#D97736]/30 text-[#D97736]">Focus Block</Badge>
                  </div>
                  <p className="text-[11px] text-[#777064] mt-0.5">2 hours protected time • Notifications muted</p>
                </div>
              </div>

              {/* Event 3 - Conflict */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#FEF8ED] border border-[#F9E2BE]">
                <span className="font-mono text-[10px] text-[#C65345] font-bold w-16 shrink-0 mt-0.5">02:00 PM</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#29251F] flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-[#C65345]" />
                      <span>Sprint Demo Review (Partner Overlap)</span>
                    </h4>
                    <Badge variant="destructive" className="text-[9px]">Conflict ⚠️</Badge>
                  </div>
                  <p className="text-[11px] text-[#777064] mt-0.5">
                    Collides with 1:1 Aditya. <span className="text-[#C58A32] font-medium">Staged reschedule to 04:00 PM awaiting approval.</span>
                  </p>
                </div>
              </div>

              {/* Event 4 - Proposed */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F8F4EC]/40 border border-dashed border-[#D0C4B2]">
                <span className="font-mono text-[10px] text-[#777064] w-16 shrink-0 mt-0.5">04:00 PM</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[#777064]">1:1 Aditya Review (Proposed Reschedule)</h4>
                    <Badge variant="warning" className="text-[9px]">Awaiting Approval</Badge>
                  </div>
                  <p className="text-[10px] text-[#777064] mt-0.5">Zero conflict score • Aditya confirmed free</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Cryptographically Verified Activity Stream */}
          <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E8DFD1] pb-3">
              <div>
                <CardTitle className="text-xs font-semibold text-[#29251F] flex items-center gap-2">
                  <History size={14} className="text-[#477A58]" /> Verified Execution Stream
                </CardTitle>
                <CardDescription>
                  Append-only immutable record of human-approved and system-verified actions.
                </CardDescription>
              </div>
              <Link href="/activity" className="text-[11px] font-semibold text-[#D97736] hover:text-[#B95727] flex items-center gap-1">
                <span>Full Ledger</span>
                <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs divide-y divide-[#E8DFD1]/50">
              {mockLedger.map((item) => (
                <div key={item.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-[#EDF5F0] text-[#477A58] mt-0.5">
                      <CheckCircle2 size={13} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#29251F] text-xs">{item.title}</p>
                      <p className="text-[11px] text-[#777064]">{item.initiator} • {item.service}</p>
                      {item.receipt && (
                        <p className="text-[9px] font-mono text-[#477A58] mt-0.5">
                          Receipt: {item.receipt.receiptHash.substring(0, 24)}... (Verified ✓)
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#777064] shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Proactive Intelligence Monitors & Quick Suggestions */}
        <div className="space-y-5">
          {/* Lindy-Style Background Guardians */}
          <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
            <CardHeader className="border-b border-[#E8DFD1] pb-3">
              <CardTitle className="text-xs font-semibold text-[#29251F] flex items-center gap-2">
                <Cpu size={14} className="text-[#D97736]" /> Proactive Background Guardians
              </CardTitle>
              <CardDescription>
                Autonomous observers staging recommendations under strict HITL guardrails.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {mockAgents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="p-3 rounded-xl bg-[#F8F4EC]/60 border border-[#E8DFD1] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#29251F] text-xs flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#477A58] animate-pulse" />
                      {agent.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase font-mono">
                      {agent.hitlPolicy}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#777064] leading-relaxed line-clamp-2">
                    {agent.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#777064] pt-1 border-t border-[#E8DFD1]/60 font-mono">
                    <span>Active: {agent.lastActive}</span>
                    <span className="text-[#D97736]">{agent.actionsExecutedToday} actions staged</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick AI Copilot Suggestions */}
          <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
            <CardHeader className="border-b border-[#E8DFD1] pb-3">
              <CardTitle className="text-xs font-semibold text-[#29251F] flex items-center gap-2">
                <Sparkles size={14} className="text-[#D97736]" /> Contextual Quick Actions
              </CardTitle>
              <CardDescription>
                Direct instructions evaluated against your active calendar, inbox, and tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs">
              <button
                onClick={() => {
                  toggleOpen();
                  submitPrompt("Auto-resolve my 2:00 PM conflict by moving Aditya to 4:00 PM and drafting confirmation");
                }}
                className="w-full text-left p-2.5 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC]/60 hover:bg-[#F1EADF] text-[#29251F] transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#C58A32]">Resolve 2:00 PM Conflict</span>
                  <ChevronRight size={13} className="text-[#777064] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777064] mt-0.5">Move 1:1 Aditya to 4:00 PM & stage email</p>
              </button>

              <button
                onClick={() => {
                  toggleOpen();
                  submitPrompt("Draft a reply to Aditya regarding pgvector database migration validation");
                }}
                className="w-full text-left p-2.5 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC]/60 hover:bg-[#F1EADF] text-[#29251F] transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Draft pgvector Migration Reply</span>
                  <ChevronRight size={13} className="text-[#777064] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777064] mt-0.5">Send confirmation before 3:00 PM deadline</p>
              </button>

              <button
                onClick={() => {
                  toggleOpen();
                  submitPrompt("Decompose project goal 'Launch Hackathon Release' into subtasks");
                }}
                className="w-full text-left p-2.5 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC]/60 hover:bg-[#F1EADF] text-[#29251F] transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Decompose Hackathon Goals</span>
                  <ChevronRight size={13} className="text-[#777064] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777064] mt-0.5">Create structured checklist on Task Board</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
