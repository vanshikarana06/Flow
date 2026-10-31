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
  X,
  Plus,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { triggerConfetti } from "@/lib/confetti";
import { mockCalendarEvents } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"week" | "month" | "day">("week");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState("11:00 AM");
  const { toggleOpen, submitPrompt } = useCopilotStore();
  const { approvals, approveAction } = useApprovalStore();

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const handleAuthorizeReschedule = () => {
    approveAction("appr_101");
    setShowPreviewModal(false);
    triggerConfetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#F28C38", "#477A58"],
    });
  };

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
                viewMode === "day" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold" : "text-[#777064]"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "week" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold" : "text-[#777064]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "month" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold" : "text-[#777064]"
              }`}
            >
              Month
            </button>
          </div>

          <ShimmerButton
            onClick={() => setShowPreviewModal(true)}
            shimmerColor="rgba(255, 255, 255, 0.45)"
            background="#D97736"
            className="h-8 gap-1.5 px-3"
          >
            <Sparkles size={13} />
            <span>AI Scheduling Preview</span>
          </ShimmerButton>
        </div>
      </div>

      {/* Reclaim-Style Conflict Radar Bar */}
      <div className="relative overflow-hidden p-3.5 rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <BorderBeam size={160} duration={10} colorFrom="#D97736" colorTo="#C58A32" />
        <div className="flex items-center gap-2 text-[#C58A32] relative z-10">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>Schedule Collision:</strong> Sprint Demo Review overlaps with 1:1 Aditya at 02:00 PM today.
          </span>
        </div>
        <div className="flex items-center gap-2 relative z-10">
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

      {/* Conditional View Rendering */}
      {viewMode === "week" && (
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

                  {/* Mon - Thu */}
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
                  <div 
                    onClick={() => {
                      if (!is9AM && !is10AM && !is2PM && !is4PM) {
                        setNewSlotTime(time);
                        setShowCreateModal(true);
                      }
                    }}
                    className="p-1 bg-[#FCEEE5]/20 border-l border-[#F7D2BC] relative group cursor-pointer"
                  >
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPreviewModal(true);
                          }}
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

                    {/* Hover Add Affordance */}
                    {!is9AM && !is10AM && !is2PM && !is4PM && (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-primary flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded border border-primary/20">
                          <Plus size={10} /> Block Time
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Day Mode (Detailed Chronological Single Day) */}
      {viewMode === "day" && (
        <Card className="p-5 border-[#E8DFD1] bg-[#FFFCF6] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#29251F]">Friday, October 31, 2026</h3>
              <p className="text-xs text-[#777064]">Full day agenda with Microsoft Graph auto-block protections</p>
            </div>
            <Badge variant="outline" className="border-primary text-primary text-xs">
              4 Events Scheduled
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0]/50 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-[#477A58] font-bold">09:00 AM - 09:30 AM</span>
                <h4 className="font-semibold text-[#29251F] text-sm mt-0.5">Team Standup & Daily Alignment</h4>
                <p className="text-[11px] text-[#777064]">Aditya Sharma, Nikhil Bhardwaj, Vanshika Rana</p>
              </div>
              <Badge variant="verified" className="text-[10px]">Completed ✓</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E8DFD1] bg-[#F1EADF]/40 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-primary font-bold">10:00 AM - 12:00 PM</span>
                <h4 className="font-semibold text-[#29251F] text-sm mt-0.5">Deep Work: Frontend Architecture</h4>
                <p className="text-[11px] text-[#777064]">Protected focus block • Notifications muted</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-primary text-primary">Focus Block</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-[#F5C2BC] bg-[#FDEDEB] flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-[#C65345] font-bold">02:00 PM - 03:00 PM</span>
                <h4 className="font-bold text-[#C65345] text-sm mt-0.5">Sprint Demo Review (Conflict with 1:1 Aditya)</h4>
                <p className="text-[11px] text-[#777064]">Overlapping attendees detected</p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowPreviewModal(true)}
                className="h-7 text-xs bg-[#C65345] hover:bg-[#A84337] text-white"
              >
                Resolve
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-dashed border-[#F9E2BE] bg-[#FEF8ED] flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-[#C58A32] font-bold">04:00 PM - 04:30 PM</span>
                <h4 className="font-semibold text-[#29251F] text-sm mt-0.5">1:1 Aditya Review (Proposed Reschedule Slot)</h4>
                <p className="text-[11px] text-[#777064]">Staged in Approval Center (#appr_101)</p>
              </div>
              <Badge variant="warning" className="text-[10px]">Awaiting Sign-off</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Month Mode (31-Day Grid) */}
      {viewMode === "month" && (
        <Card className="p-4 border-[#E8DFD1] bg-[#FFFCF6] shadow-soft">
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[#777064] pb-2 border-b border-[#E8DFD1]">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1 pt-2">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isToday = day === 31;
              return (
                <div
                  key={day}
                  className={`min-h-[64px] p-1.5 rounded-lg border text-left text-xs transition-colors ${
                    isToday
                      ? "border-primary bg-[#FCEEE5]/40 font-bold"
                      : "border-[#E8DFD1]/50 bg-[#FFFCF6] hover:bg-[#F8F4EC]"
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isToday ? "text-primary font-bold" : "text-[#777064]"}`}>
                    {day}
                  </span>
                  {isToday && (
                    <div className="mt-1 space-y-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#477A58]" title="Standup" />
                      <div className="h-1.5 w-1.5 rounded-full bg-[#C65345]" title="Conflict" />
                    </div>
                  )}
                  {day === 28 && <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#777064]" />}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Reclaim-Inspired Scheduling Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl bg-[#FFFCF6] border-[#E8DFD1] p-6 text-[#29251F]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#F5C2BC] bg-[#FDEDEB]/60 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-[#C65345]">Current State (Collision)</span>
                <h4 className="font-bold text-sm text-[#29251F]">02:00 PM - 03:00 PM</h4>
                <p className="text-[11px] text-[#777064]">
                  Sprint Demo overlaps with 1:1 Aditya. Two critical meetings booked concurrently.
                </p>
                <Badge variant="destructive" className="text-[9px]">100% Conflict Score</Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0]/60 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-[#477A58]">Proposed State (Zero Collision)</span>
                <h4 className="font-bold text-sm text-[#29251F]">04:00 PM - 04:30 PM</h4>
                <p className="text-[11px] text-[#777064]">
                  1:1 shifted to 4:00 PM. Microsoft Graph shared availability validated with zero clashes.
                </p>
                <Badge variant="verified" className="text-[9px]">0% Conflict Score</Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-xs font-mono text-[#777064]">
              Idempotency Key: <span className="text-primary">#idemp_ev_9921_mod</span> • Target: Microsoft Graph Calendar API
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={handleAuthorizeReschedule}
              className="text-xs font-semibold bg-[#477A58] hover:bg-[#3D6A4C] text-white gap-1"
            >
              <Check size={13} />
              <span>Authorize Reschedule & Dispatch</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Time Block Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-[#29251F]">
              Create AI Time Block at {newSlotTime}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#777064]">
              Reserve focus time or schedule a new alignment sync.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Block Title</label>
              <input
                defaultValue="Deep Work: Focus Block"
                className="w-full h-8 px-2.5 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Duration</label>
              <select className="w-full h-8 px-2 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]">
                <option>30 Minutes</option>
                <option>1 Hour</option>
                <option>2 Hours</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowCreateModal(false);
                triggerConfetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
              }}
              className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
            >
              Save Focus Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
