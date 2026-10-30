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
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCalendarEvents, mockLedger, mockApprovals, mockTasks } from "@/lib/mock-data";
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
            Today is Friday, Oct 31 • <span className="text-[#C58A32] font-semibold">{pendingApprovals.length} pending decisions</span> and 1 scheduling conflict require your review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/approvals">
            <Button size="sm" variant="default" className="text-xs font-semibold gap-1.5">
              <ShieldAlert size={13} />
              <span>Review Approvals ({pendingApprovals.length})</span>
            </Button>
          </Link>
          <Link href="/ai">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs font-semibold text-[#29251F]"
            >
              <Sparkles size={13} className="text-primary" />
              <span>Open AI Workspace</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Action Priority Banner (When Conflicts or Approvals Exist) */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#C58A32]">
            <AlertTriangle size={16} className="shrink-0" />
            <div>
              <span className="font-semibold text-[#29251F]">Action Required Before 11:30 AM:</span>
              <span className="text-[#777064] ml-1">
                2:00 PM calendar overlap detected. Proposed reschedule to 4:00 PM is staged.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/approvals">
              <Button size="sm" variant="default" className="h-7 text-xs">
                Inspect Decision
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Actionable Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link href="/approvals">
          <Card className="hover:border-primary/50 transition-all cursor-pointer group border-[#F9E2BE] bg-[#FEF8ED]/40">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Pending Approvals</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#FEF8ED] text-[#C58A32] border border-[#F9E2BE]">
                <ShieldAlert size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">{pendingApprovals.length}</div>
              <p className="text-[10px] text-[#777064] mt-0.5 font-medium">
                1 Consequential Email • 1 Reschedule
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Today's Meetings</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#F1EADF] text-[#29251F]">
                <CalendarIcon size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">3 Events</div>
              <p className="text-[10px] text-[#C58A32] mt-0.5 font-medium">
                1 Conflict at 02:00 PM
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Active Tasks</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#F1EADF] text-[#29251F]">
                <CheckSquare size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">4 Tasks</div>
              <p className="text-[10px] text-[#777064] mt-0.5">
                Next: Verify pgvector migrations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inbox">
          <Card className="hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium text-[#777064]">Actionable Emails</CardTitle>
              <div className="p-1.5 rounded-lg bg-[#F1EADF] text-[#29251F]">
                <Mail size={14} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#29251F]">3 Threads</div>
              <p className="text-[10px] text-primary mt-0.5 font-medium">
                1 Draft awaiting sign-off
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 4. Middle Section: Today's Schedule & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Schedule & Conflicts */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule & Conflict Radar</CardTitle>
                <p className="text-[11px] text-[#777064]">Synced with Microsoft Graph Calendar</p>
              </div>
              <Link href="/calendar" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                View Calendar <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {mockCalendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all text-xs ${
                    evt.isConflict
                      ? "bg-[#FEF8ED] border-[#F9E2BE] text-[#29251F]"
                      : evt.category === "focus"
                      ? "bg-[#FCEEE5]/40 border-[#F7D2BC] text-[#29251F]"
                      : "bg-[#FFFCF6] border-[#E8DFD1] text-[#29251F]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        evt.isConflict ? "bg-[#C58A32] animate-ping" : "bg-primary"
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-[#29251F]">{evt.title}</h4>
                      <p className="text-[10px] text-[#777064] font-mono mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                        {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {evt.isConflict ? (
                    <Link href="/approvals">
                      <Button
                        size="sm"
                        variant="warning"
                        className="h-7 text-[11px] gap-1"
                      >
                        <Zap size={11} /> Auto-Resolve
                      </Button>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-[9px] uppercase font-mono">
                      {evt.category}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Stream */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Execution & Verification Stream</CardTitle>
                <p className="text-[11px] text-[#777064]">Append-only cryptographic audit ledger</p>
              </div>
              <Link href="/activity" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                Full Ledger <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockLedger.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 size={14} className="text-[#477A58] shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-[#29251F] truncate">{act.title}</p>
                      <p className="text-[10px] text-[#777064] font-mono">
                        {act.service} • {act.initiator}
                      </p>
                    </div>
                  </div>
                  <Badge variant="verified" className="text-[9px] shrink-0">
                    VERIFIED ✓
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: AI Context & Recommendations */}
        <div className="space-y-4">
          <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
            <CardHeader>
              <CardTitle className="text-xs font-semibold text-[#29251F] flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" />
                Proactive Intelligence
              </CardTitle>
              <CardDescription>Continuous background monitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {/* Card 1 */}
              <div className="p-3 rounded-lg border border-[#F9E2BE] bg-[#FEF8ED] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#C58A32]">
                  <AlertTriangle size={13} />
                  <span>Calendar Overlap at 2:00 PM</span>
                </div>
                <p className="text-[11px] text-[#777064] leading-relaxed">
                  Aditya is free at 4:00 PM. A proposed shift has been prepared.
                </p>
                <Link href="/approvals">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-6 text-[10px] justify-between border-[#F9E2BE] hover:bg-[#FEF8ED] text-[#C58A32]"
                  >
                    <span>View Staged Proposal</span>
                    <ChevronRight size={12} />
                  </Button>
                </Link>
              </div>

              {/* Card 2 */}
              <div className="p-3 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC]/60 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#29251F]">
                  <Mail size={13} className="text-primary" />
                  <span>Pending Email Follow-Up</span>
                </div>
                <p className="text-[11px] text-[#777064] leading-relaxed">
                  Aditya asked to confirm database migrations before 3:00 PM.
                </p>
                <Link href="/inbox">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full h-6 text-[10px] justify-between"
                  >
                    <span>Inspect Draft in Inbox</span>
                    <ChevronRight size={12} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
