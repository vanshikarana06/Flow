"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { mockCalendarEvents } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"week" | "month" | "day">("week");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { toggleOpen, submitPrompt } = useCopilotStore();
  const { approvals, approveAction } = useApprovalStore();

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  return (
    <FadeIn className="space-y-5">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Calendar & Schedule</h1>
            <Badge variant="verified" className="text-[10px]">
              Microsoft Graph Synced
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Synchronized workspace scheduling with automated conflict detection and time blocking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 border border-[#E8DFD1] rounded-lg p-0.5 bg-[#FFFCF6] shadow-2xs">
            <button className="p-1 text-[#777064] hover:text-[#29251F] rounded hover:bg-[#F1EADF] transition-colors">
              <ChevronLeft size={15} />
            </button>
            <span className="px-2.5 text-xs font-semibold text-[#29251F]">October 26 - 31, 2026</span>
            <button className="p-1 text-[#777064] hover:text-[#29251F] rounded hover:bg-[#F1EADF] transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F1EADF] p-0.5 rounded-lg border border-[#E8DFD1]">
            <button
              onClick={() => setViewMode("day")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "day" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "week" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "month" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              Month
            </button>
          </div>

          <Button
            onClick={() => setShowPreviewModal(true)}
            size="sm"
            className="text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] text-white"
          >
            <Sparkles size={13} />
            <span>AI Scheduling Preview</span>
          </Button>
        </div>
      </div>

      {/* Reclaim-Style Conflict Radar Bar */}
      <div className="p-3.5 rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-[#C58A32]">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>Schedule Collision:</strong> Sprint Demo Review overlaps with 1:1 Aditya at 02:00 PM today.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPreviewModal(true)}
            size="sm"
            className="h-7 text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white gap-1"
          >
            <span>Preview Proposal (Reclaim Mode)</span>
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>

      {/* Week Grid in Warm Cream */}
      <Card className="overflow-hidden border-[#E8DFD1] bg-[#FFFCF6] shadow-soft">
        <div className="grid grid-cols-6 border-b border-[#E8DFD1] bg-[#F8F4EC]/80 text-xs font-semibold text-[#777064]">
          <div className="p-2.5 border-r border-[#E8DFD1] text-center text-[10px]">TIME</div>
          <div className="p-2.5 border-r border-[#E8DFD1] text-center text-[11px]">MON 27</div>
          <div className="p-2.5 border-r border-[#E8DFD1] text-center text-[11px]">TUE 28</div>
          <div className="p-2.5 border-r border-[#E8DFD1] text-center text-[11px]">WED 29</div>
          <div className="p-2.5 border-r border-[#E8DFD1] text-center text-[11px]">THU 30</div>
          <div className="p-2.5 text-center bg-[#FCEEE5]/60 text-[#B95727] border-l border-[#F7D2BC] font-bold text-[11px]">
            FRI 31 (TODAY)
          </div>
        </div>

        <div className="divide-y divide-[#E8DFD1]/60">
          {timeSlots.map((time) => {
            const is9AM = time === "09:00 AM";
            const is10AM = time === "10:00 AM";
            const is2PM = time === "02:00 PM";
            const is4PM = time === "04:00 PM";

            return (
              <div key={time} className="grid grid-cols-6 min-h-[72px] text-xs">
                {/* Time Label */}
                <div className="p-2.5 border-r border-[#E8DFD1] text-[#777064] font-mono text-[10px]">
                  {time}
                </div>

                {/* Days Mon - Thu Placeholder */}
                <div className="p-1 border-r border-[#E8DFD1]/50 bg-[#FFFCF6]">
                  {is9AM && (
                    <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1] text-[10px] text-[#777064]">
                      Standup
                    </div>
                  )}
                </div>
                <div className="p-1 border-r border-[#E8DFD1]/50 bg-[#FFFCF6]">
                  {is10AM && (
                    <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1] text-[10px] text-[#777064]">
                      Architecture Sync
                    </div>
                  )}
                </div>
                <div className="p-1 border-r border-[#E8DFD1]/50 bg-[#FFFCF6]">
                  {is2PM && (
                    <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1] text-[10px] text-[#777064]">
                      Sprint Retro
                    </div>
                  )}
                </div>
                <div className="p-1 border-r border-[#E8DFD1]/50 bg-[#FFFCF6]">
                  {is10AM && (
                    <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1] text-[10px] text-[#777064]">
                      Product Sync
                    </div>
                  )}
                </div>

                {/* FRIDAY (TODAY) */}
                <div className="p-1 bg-[#FCEEE5]/20 border-l border-[#F7D2BC] relative">
                  {is9AM && (
                    <div className="p-2 rounded-lg bg-[#EDF5F0] border border-[#CDE3D5] text-[#477A58] text-[11px] font-medium shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#29251F]">Team Standup</span>
                        <CheckCircle2 size={11} className="text-[#477A58]" />
                      </div>
                      <span className="text-[9px] text-[#777064] font-mono">09:00 - 09:30 AM</span>
                    </div>
                  )}

                  {is10AM && (
                    <div className="p-2 rounded-lg bg-[#F1EADF] border border-[#E8DFD1] text-[#29251F] text-[11px] shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Deep Work: Architecture</span>
                        <Badge variant="outline" className="text-[8px] border-[#D97736]/30 text-[#D97736]">Focus</Badge>
                      </div>
                      <span className="text-[9px] text-[#777064] font-mono">10:00 - 12:00 PM</span>
                    </div>
                  )}

                  {is2PM && (
                    <div className="p-2 rounded-lg bg-[#FDEDEB] border border-[#F5C2BC] text-[#C65345] text-[11px] shadow-2xs animate-pulse">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <AlertTriangle size={11} /> ⚠️ 2:00 PM Overlap
                        </span>
                        <Badge variant="destructive" className="text-[8px]">Conflict</Badge>
                      </div>
                      <p className="text-[10px] text-[#29251F] mt-0.5">Partner Sync vs 1:1 Aditya</p>
                      <button
                        onClick={() => setShowPreviewModal(true)}
                        className="text-[9px] text-[#D97736] font-semibold underline mt-1"
                      >
                        Inspect Reschedule Proposal ➔
                      </button>
                    </div>
                  )}

                  {is4PM && (
                    <div className="p-2 rounded-lg bg-[#FEF8ED] border border-dashed border-[#F9E2BE] text-[#C58A32] text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#29251F]">1:1 Aditya (Proposed Slot)</span>
                        <Badge variant="warning" className="text-[8px]">Awaiting Sign-off</Badge>
                      </div>
                      <span className="text-[9px] text-[#777064] font-mono">04:00 - 04:30 PM • 0 Conflicts</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reclaim-Inspired Scheduling Preview Modal (Split-Diff View) */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl bg-[#FFFCF6] border-[#E8DFD1] p-6 text-[#29251F]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC]">
                <Sparkles size={16} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#29251F]">
                  Reclaim-Style Scheduling Proposal Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  Inspect the ripple effect of proposed schedule adjustments before committing changes.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Impact Summary Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-center text-xs">
              <div>
                <span className="text-[10px] text-[#777064] uppercase font-mono">Events Moved</span>
                <p className="font-bold text-[#29251F] text-sm">1 Meeting</p>
              </div>
              <div>
                <span className="text-[10px] text-[#777064] uppercase font-mono">Focus Preserved</span>
                <p className="font-bold text-[#477A58] text-sm">120 Minutes</p>
              </div>
              <div>
                <span className="text-[10px] text-[#777064] uppercase font-mono">Secondary Conflicts</span>
                <p className="font-bold text-[#477A58] text-sm">0 (Zero)</p>
              </div>
            </div>

            {/* Split Comparison: Current vs Proposed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Current Overlapping State */}
              <div className="p-3.5 rounded-xl border border-[#F5C2BC] bg-[#FDEDEB]/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#C65345]">
                  <span>Current Schedule State</span>
                  <Badge variant="destructive" className="text-[9px]">Conflict</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-[#FFFCF6] border border-[#F5C2BC]">
                    <span className="font-bold text-[#29251F]">02:00 PM - 03:00 PM</span>
                    <p className="text-[11px] text-[#777064]">Sprint Demo Review (Partner Sync)</p>
                  </div>
                  <div className="p-2 rounded bg-[#FDEDEB] border border-[#C65345]/30">
                    <span className="font-bold text-[#C65345]">02:00 PM - 02:30 PM (COLLIDING)</span>
                    <p className="text-[11px] text-[#29251F]">1:1 Aditya Review</p>
                  </div>
                </div>
              </div>

              {/* Proposed Resolved State */}
              <div className="p-3.5 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0]/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#477A58]">
                  <span>Proposed Reclaim State</span>
                  <Badge variant="verified" className="text-[9px]">Resolved ✓</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-[#FFFCF6] border border-[#E8DFD1]">
                    <span className="font-bold text-[#29251F]">02:00 PM - 03:00 PM</span>
                    <p className="text-[11px] text-[#777064]">Sprint Demo Review (Uninterrupted)</p>
                  </div>
                  <div className="p-2 rounded bg-[#EDF5F0] border border-[#CDE3D5]">
                    <span className="font-bold text-[#477A58]">04:00 PM - 04:30 PM (SHIFTED)</span>
                    <p className="text-[11px] text-[#29251F]">1:1 Aditya Review (Aditya Confirmed Free)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Notice */}
            <div className="p-3 rounded-lg bg-[#FEF8ED] border border-[#F9E2BE] text-xs text-[#777064] flex items-center gap-2">
              <ShieldAlert size={15} className="text-[#C58A32] shrink-0" />
              <span>
                Under FLOW's Human-in-the-Loop policy, moving this meeting requires email notification to <strong>aditya@flow.ai</strong> before calendar dispatch.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Discard Proposal
            </Button>
            <Button
              size="sm"
              onClick={() => {
                approveAction("appr_101");
                setShowPreviewModal(false);
              }}
              className="text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white gap-1.5"
            >
              <span>Approve & Dispatch Reschedule</span>
              <ArrowRight size={13} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
