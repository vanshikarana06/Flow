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
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      {/* Top Greeting & Operational State */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Good morning, Vanshika 👋
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            You have <span className="text-amber-400 font-semibold">{pendingApprovals.length} pending decisions</span> and 1 schedule conflict requiring your attention today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              toggleOpen();
              submitPrompt("Plan my priorities for today and resolve scheduling conflicts");
            }}
            variant="glass"
            size="sm"
            className="gap-2 text-xs font-semibold text-indigo-300 border-primary/30 hover:border-primary/50"
          >
            <Sparkles size={14} className="text-primary" />
            <span>AI Daily Briefing</span>
          </Button>
          <Link href="/approvals">
            <Button size="sm" variant="default" className="text-xs font-semibold gap-1.5 bg-amber-500 hover:bg-amber-600 text-black">
              <ShieldAlert size={14} />
              <span>Review Approvals ({pendingApprovals.length})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Due Card */}
        <Link href="/tasks">
          <Card className="hover:border-white/15 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Tasks Due Today</CardTitle>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <CheckSquare size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">4</div>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <span className="text-red-400 font-semibold">2 Urgent</span> • Next: Graph Scopes
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Meetings Card */}
        <Link href="/calendar">
          <Card className="hover:border-white/15 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Scheduled Meetings</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <CalendarIcon size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3</div>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                Next: <span className="text-emerald-400 font-medium">Sprint Demo (02:00 PM)</span>
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending Approvals Card (FLOW USP) */}
        <Link href="/approvals">
          <Card className="hover:border-amber-500/40 border-amber-500/20 bg-amber-500/[0.03] transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-amber-300">Pending Approvals</CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/25 transition-colors">
                <ShieldAlert size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-300">{pendingApprovals.length}</div>
              <p className="text-[11px] text-amber-200/70 mt-1 flex items-center gap-1">
                <span className="font-semibold text-amber-400">HITL Gate:</span> 1 Outbound Email
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* New Emails Card */}
        <Link href="/inbox">
          <Card className="hover:border-white/15 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Actionable Emails</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <Mail size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3</div>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <span className="text-purple-400 font-semibold">1 Draft</span> ready for approval
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Middle Section: Schedule & Proactive Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule & Focus Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Today's Schedule & Conflict Radar</CardTitle>
                <p className="text-xs text-gray-400">Synchronized with Microsoft Graph API</p>
              </div>
              <Link href="/calendar" className="text-xs text-primary hover:underline flex items-center gap-1">
                View Calendar <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCalendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    evt.isConflict
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : evt.category === "focus"
                      ? "bg-primary/[0.04] border-primary/20 text-gray-200"
                      : "bg-white/[0.02] border-white/5 text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        evt.isConflict ? "bg-amber-400 animate-ping" : "bg-primary"
                      }`}
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{evt.title}</h4>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} />
                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                        {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {evt.isConflict ? (
                    <Button
                      onClick={() => {
                        toggleOpen();
                        submitPrompt("Resolve the 2 PM calendar conflict with Aditya");
                      }}
                      size="sm"
                      variant="warning"
                      className="h-7 text-xs gap-1 bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                    >
                      <Zap size={12} /> Auto-Resolve
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-gray-400 border-white/10">
                      {evt.category.toUpperCase()}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Immutable Activity Stream */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Activity & Verification Stream</CardTitle>
                <p className="text-xs text-gray-400">Append-only audit trail</p>
              </div>
              <Link href="/activity" className="text-xs text-primary hover:underline flex items-center gap-1">
                Full Ledger <ArrowUpRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {mockLedger.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card-subtle border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-gray-200 truncate">{act.title}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {act.service} • {act.initiator}
                      </p>
                    </div>
                  </div>
                  <Badge variant="verified" className="text-[10px] shrink-0">
                    {act.status.toUpperCase()} ✓
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Proactive Intelligence & AI Recommendations */}
        <div className="space-y-4">
          <Card className="border-indigo-500/20 bg-indigo-500/[0.02]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Proactive Intelligence
              </CardTitle>
              <p className="text-xs text-gray-400">Autonomous monitors & suggestions</p>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {/* Alert 1 */}
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <AlertTriangle size={14} />
                  <span>Calendar Overlap at 2:00 PM</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Partner Sync overlaps with 1:1 with Aditya. Aditya is free at 4:00 PM.
                </p>
                <Button
                  onClick={() => {
                    toggleOpen();
                    submitPrompt("Reschedule sync with Aditya to 4 PM");
                  }}
                  size="sm"
                  variant="glass"
                  className="w-full h-7 text-xs text-amber-200 border-amber-500/40 hover:bg-amber-500/20 justify-between"
                >
                  <span>Stage Reschedule Approval</span>
                  <ChevronRight size={13} />
                </Button>
              </div>

              {/* Alert 2 */}
              <div className="p-3 rounded-lg border border-white/5 bg-card-subtle space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                  <Mail size={14} className="text-primary" />
                  <span>Pending Email Draft from Aditya</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Aditya asked to confirm database migrations before 3:00 PM. A confirmatory reply is staged.
                </p>
                <Link href="/inbox">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs border-white/10 hover:bg-white/5 justify-between"
                  >
                    <span>Inspect Draft in Inbox</span>
                    <ChevronRight size={13} />
                  </Button>
                </Link>
              </div>

              {/* Memory Insight */}
              <div className="p-3 rounded-lg border border-white/5 bg-card-subtle space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
                  Learned Habit Insight
                </span>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  You consistently block 2 hours of focus time for frontend code reviews on Friday mornings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

