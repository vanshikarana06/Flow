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
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockCalendarEvents } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"week" | "month" | "day">("week");
  const { toggleOpen, submitPrompt } = useCopilotStore();

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E8DFD1]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 border border-[#E8DFD1] rounded-lg p-0.5 bg-[#FFFCF6] shadow-2xs">
            <button className="p-1 text-[#777064] hover:text-[#29251F] rounded hover:bg-[#F1EADF]">
              <ChevronLeft size={15} />
            </button>
            <span className="px-2.5 text-xs font-semibold text-[#29251F]">October 26 - 31, 2026</span>
            <button className="p-1 text-[#777064] hover:text-[#29251F] rounded hover:bg-[#F1EADF]">
              <ChevronRight size={15} />
            </button>
          </div>
          <Badge variant="verified" className="text-[10px]">
            Graph Synced
          </Badge>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={() => {
              toggleOpen();
              submitPrompt("Optimize my schedule today: auto-resolve the 2 PM conflict and preserve focus blocks");
            }}
            size="sm"
            className="text-xs font-semibold gap-1.5"
          >
            <Sparkles size={13} />
            <span>AI Smart Reschedule</span>
          </Button>
        </div>
      </div>

      {/* Conflict Radar Notification Bar */}
      <div className="p-3 rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-[#C58A32]">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>Schedule Conflict Detected:</strong> Partner Sync overlaps with 1:1 Aditya Review at 02:00 PM today.
          </span>
        </div>
        <Button
          onClick={() => {
            toggleOpen();
            submitPrompt("Reschedule sync with Aditya to 4 PM");
          }}
          size="sm"
          variant="warning"
          className="h-7 text-xs font-semibold gap-1"
        >
          <Zap size={11} />
          <span>Resolve via Copilot</span>
        </Button>
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
              <div key={time} className="grid grid-cols-6 min-h-[68px] text-xs">
                {/* Time Label */}
                <div className="p-2.5 border-r border-[#E8DFD1] text-[#777064] font-mono text-[10px]">
                  {time}
                </div>

                {/* Days Mon - Thu */}
                <div className="p-1.5 border-r border-[#E8DFD1]/60" />
                <div className="p-1.5 border-r border-[#E8DFD1]/60">
                  {is9AM && (
                    <div className="p-1.5 rounded-md bg-[#F1EADF] text-[#29251F] border border-[#E8DFD1] text-[11px]">
                      Team Standup
                    </div>
                  )}
                </div>
                <div className="p-1.5 border-r border-[#E8DFD1]/60" />
                <div className="p-1.5 border-r border-[#E8DFD1]/60">
                  {is9AM && (
                    <div className="p-1.5 rounded-md bg-[#F1EADF] text-[#29251F] border border-[#E8DFD1] text-[11px]">
                      Team Standup
                    </div>
                  )}
                </div>

                {/* Friday (Today Column) */}
                <div className="p-1.5 bg-[#FCEEE5]/15 border-l border-[#F7D2BC]">
                  {is9AM && (
                    <div className="p-1.5 rounded-md bg-[#EDF5F0] border border-[#CDE3D5] text-[#477A58]">
                      <p className="font-semibold text-[11px]">Team Standup & Alignment</p>
                      <p className="text-[9px] font-mono">09:00 - 09:30 AM</p>
                    </div>
                  )}

                  {is10AM && (
                    <div className="p-1.5 rounded-md bg-[#FCEEE5] border border-[#F7D2BC] text-[#B95727]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                        Focus Block 🧠
                      </span>
                      <p className="font-semibold text-[11px]">Deep Work: Frontend Refinement</p>
                      <p className="text-[9px] font-mono">10:00 AM - 12:00 PM</p>
                    </div>
                  )}

                  {is2PM && (
                    <div className="p-1.5 rounded-md bg-[#FEF8ED] border-2 border-[#C58A32] text-[#C58A32] animate-pulse">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider">
                          Conflict ⚠️
                        </span>
                        <Badge variant="destructive" className="text-[7px] px-1 py-0">
                          Overlap
                        </Badge>
                      </div>
                      <p className="font-semibold text-[11px] text-[#29251F] mt-0.5">Demo vs 1:1 Aditya</p>
                      <p className="text-[9px] font-mono">02:00 - 03:00 PM</p>
                    </div>
                  )}

                  {is4PM && (
                    <div className="p-1.5 rounded-md bg-[#F1EADF] border border-dashed border-[#D0C4B2] text-[#777064]">
                      <span className="text-[8px] font-semibold text-primary uppercase">
                        ⚡ Staged Candidate Slot
                      </span>
                      <p className="font-semibold text-[11px] text-[#29251F]">1:1 Aditya Review</p>
                      <p className="text-[9px] font-mono">04:00 - 04:30 PM</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
