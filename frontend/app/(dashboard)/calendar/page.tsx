"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Zap,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      {/* Calendar Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-card">
            <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-semibold text-white">October 26 - 31, 2026</span>
            <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5">
              <ChevronRight size={16} />
            </button>
          </div>
          <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30">
            Graph Calendar Synced
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center bg-card-subtle p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "day" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "week" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "month" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
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
            className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-indigo-500"
          >
            <Sparkles size={13} />
            <span>AI Smart Reschedule</span>
          </Button>
        </div>
      </div>

      {/* Conflict Radar Notification Bar */}
      <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
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
          variant="glass"
          className="h-7 text-xs bg-amber-500 text-black font-semibold hover:bg-amber-400 gap-1 border-0"
        >
          <Zap size={12} />
          <span>Resolve via Copilot</span>
        </Button>
      </div>

      {/* Week Grid */}
      <Card className="border-white/5 bg-card overflow-hidden shadow-2xl">
        <div className="grid grid-cols-6 border-b border-white/5 bg-[#111827]/80 text-xs font-semibold text-gray-400">
          <div className="p-3 border-r border-white/5 text-center">TIME</div>
          <div className="p-3 border-r border-white/5 text-center">MON 27</div>
          <div className="p-3 border-r border-white/5 text-center">TUE 28</div>
          <div className="p-3 border-r border-white/5 text-center">WED 29</div>
          <div className="p-3 border-r border-white/5 text-center">THU 30</div>
          <div className="p-3 text-center bg-primary/10 text-white border-l border-primary/20">
            FRI 31 (TODAY)
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {timeSlots.map((time) => {
            const is9AM = time === "09:00 AM";
            const is10AM = time === "10:00 AM";
            const is2PM = time === "02:00 PM";
            const is4PM = time === "04:00 PM";

            return (
              <div key={time} className="grid grid-cols-6 min-h-[72px] text-xs">
                {/* Time Label */}
                <div className="p-3 border-r border-white/5 text-gray-500 font-mono text-[11px]">
                  {time}
                </div>

                {/* Days Mon - Thu Empty Grid Placeholders */}
                <div className="p-2 border-r border-white/5 hover:bg-white/[0.01]" />
                <div className="p-2 border-r border-white/5 hover:bg-white/[0.01]">
                  {is9AM && (
                    <div className="p-2 rounded bg-white/5 border border-white/10 text-gray-300">
                      Team Standup
                    </div>
                  )}
                </div>
                <div className="p-2 border-r border-white/5 hover:bg-white/[0.01]" />
                <div className="p-2 border-r border-white/5 hover:bg-white/[0.01]">
                  {is9AM && (
                    <div className="p-2 rounded bg-white/5 border border-white/10 text-gray-300">
                      Team Standup
                    </div>
                  )}
                </div>

                {/* Friday (Today Column) */}
                <div className="p-2 bg-primary/[0.02] border-l border-primary/20">
                  {is9AM && (
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      <p className="font-semibold text-xs">Team Standup & Alignment</p>
                      <p className="text-[10px] text-emerald-400 font-mono">09:00 - 09:30 AM</p>
                    </div>
                  )}

                  {is10AM && (
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/40 text-indigo-200">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                        Focus Block 🧠
                      </span>
                      <p className="font-semibold text-xs">Deep Work: Frontend Architecture</p>
                      <p className="text-[10px] text-indigo-300 font-mono">10:00 AM - 12:00 PM</p>
                    </div>
                  )}

                  {is2PM && (
                    <div className="p-2 rounded-lg bg-amber-500/20 border-2 border-amber-500 text-amber-200 animate-pulse">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                          Conflict Detected ⚠️
                        </span>
                        <Badge variant="destructive" className="text-[8px] px-1 py-0">
                          Overlap
                        </Badge>
                      </div>
                      <p className="font-semibold text-xs text-white mt-1">Demo Sync vs 1:1 Aditya</p>
                      <p className="text-[10px] text-amber-300 font-mono">02:00 - 03:00 PM</p>
                    </div>
                  )}

                  {is4PM && (
                    <div className="p-2 rounded-lg bg-indigo-500/15 border border-dashed border-indigo-400/50 text-indigo-200">
                      <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider">
                        ⚡ Staged Candidate Slot
                      </span>
                      <p className="font-semibold text-xs">1:1 Aditya Review (Rescheduled)</p>
                      <p className="text-[10px] text-indigo-300 font-mono">04:00 - 04:30 PM</p>
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

