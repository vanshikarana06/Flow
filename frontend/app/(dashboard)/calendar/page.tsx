"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { triggerConfetti } from "@/lib/confetti";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { apiClient } from "@/lib/api-client";

interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_focus_block: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month" | "day">("week");
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetSlotDate, setTargetSlotDate] = useState<Date>(new Date());
  const [targetSlotTime, setTargetSlotTime] = useState("10:00 AM");
  const [blockTitle, setBlockTitle] = useState("Deep Work: Focus Block");
  const [blockDescription, setBlockDescription] = useState("");
  const [blockDuration, setBlockDuration] = useState("60");
  const [isFocusBlock, setIsFocusBlock] = useState(true);

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conflictSummary, setConflictSummary] = useState<string | null>(null);
  const [hasLiveConflict, setHasLiveConflict] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { toggleOpen, submitPrompt } = useCopilotStore();

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  // Helper to get 7 days of the active week (Monday through Sunday)
  const getDaysOfWeek = (base: Date) => {
    const current = new Date(base);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentDate);

  const isToday = (d: Date) => {
    const now = new Date();
    return d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  };

  const isSameDay = (dateStr: string, d: Date) => {
    if (!dateStr) return false;
    const evtDate = new Date(dateStr);
    return evtDate.getDate() === d.getDate() &&
      evtDate.getMonth() === d.getMonth() &&
      evtDate.getFullYear() === d.getFullYear();
  };

  const parseSlotHour = (timeStr: string) => {
    const [hourPart, modifier] = timeStr.split(" ");
    let hours = parseInt(hourPart.split(":")[0], 10);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return hours;
  };

  const getEventsForDayAndSlot = (day: Date, timeSlot: string) => {
    const slotHour = parseSlotHour(timeSlot);
    return events.filter((evt) => {
      if (!isSameDay(evt.start_time, day)) return false;
      const d = new Date(evt.start_time);
      return d.getHours() === slotHour;
    });
  };

  // Fetch events for active date range
  const loadCalendarData = async () => {
    try {
      setIsLoading(true);
      const startRange = new Date(currentDate);
      startRange.setDate(startRange.getDate() - 30);
      startRange.setHours(0, 0, 0, 0);

      const endRange = new Date(currentDate);
      endRange.setDate(endRange.getDate() + 30);
      endRange.setHours(23, 59, 59, 999);

      const startIso = startRange.toISOString();
      const endIso = endRange.toISOString();

      const eventsRes = await apiClient.get<any[]>("/calendar/events", {
        params: { start_time: startIso, end_time: endIso },
      });

      if (Array.isArray(eventsRes)) {
        setIsLiveConnected(true);
        setEvents(eventsRes.map((e) => ({
          id: String(e.id),
          title: e.title,
          description: e.description,
          start_time: e.start_time,
          end_time: e.end_time,
          is_focus_block: Boolean(e.is_focus_block),
        })));
      } else {
        setEvents([]);
      }

      // Check conflicts
      const conflictRes = await apiClient.get<any>("/calendar/conflicts", {
        params: { start_time: startIso, end_time: endIso },
      });

      if (conflictRes) {
        setHasLiveConflict(Boolean(conflictRes.has_conflict));
        setConflictSummary(conflictRes.summary || null);
      }
    } catch (err) {
      console.warn("Backend calendar endpoint error:", err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  // Navigate dates
  const handleNavigate = (direction: -1 | 1) => {
    const next = new Date(currentDate);
    if (viewMode === "day") {
      next.setDate(next.getDate() + direction);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setMonth(next.getMonth() + direction);
    }
    setCurrentDate(next);
  };

  const handleResetToday = () => {
    setCurrentDate(new Date());
  };

  const openCreateModal = (day: Date, timeSlot: string) => {
    setTargetSlotDate(day);
    setTargetSlotTime(timeSlot);
    setBlockTitle("Deep Work: Focus Session");
    setBlockDescription("Protected time registered through FLOW Workspace Calendar");
    setIsFocusBlock(true);
    setShowCreateModal(true);
  };

  // Save new event
  const handleSaveEvent = async () => {
    setShowCreateModal(false);

    try {
      const slotHour = parseSlotHour(targetSlotTime);
      const start = new Date(targetSlotDate);
      start.setHours(slotHour, 0, 0, 0);

      const durationMin = parseInt(blockDuration, 10) || 60;
      const end = new Date(start.getTime() + durationMin * 60000);

      await apiClient.post("/calendar/events", {
        title: blockTitle || "Focus Block",
        description: blockDescription || "Scheduled event",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_focus_block: isFocusBlock,
      });

      setToastMessage(`Scheduled "${blockTitle}" for ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      triggerConfetti({ particleCount: 35, spread: 50, origin: { y: 0.65 } });
      setTimeout(() => setToastMessage(null), 3500);

      loadCalendarData();
    } catch (err) {
      console.warn("Could not persist event to backend:", err);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    setSelectedEvent(null);
    try {
      await apiClient.delete(`/calendar/events/${eventId}`);
      setToastMessage("Event removed from calendar");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn("Could not delete event:", err);
    }
  };

  return (
    <FadeIn className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] text-xs font-semibold shadow-elevated animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Calendar & Schedule</h1>
            <Badge variant="verified" className="text-[10px]">
              {isLiveConnected ? "● Live Graph Connected" : "Calendar Runtime"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Synchronized workspace scheduling with automated conflict detection and time blocking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 border border-[#E8DFD1] rounded-lg p-0.5 bg-[#FFFCF6] shadow-2xs">
            <button
              onClick={() => handleNavigate(-1)}
              className="p-1 text-[#777064] hover:text-[#29251F] rounded hover:bg-[#F1EADF] transition-colors"
              title="Previous"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={handleResetToday}
              className="px-2.5 text-xs font-semibold text-[#29251F] hover:text-primary transition-colors"
            >
              {viewMode === "day"
                ? currentDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                : viewMode === "month"
                ? currentDate.toLocaleDateString([], { month: "long", year: "numeric" })
                : `${weekDays[0].toLocaleDateString([], { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
            </button>
            <button
              onClick={() => handleNavigate(1)}
              className="p-1 text-[#777064] hover:text-[#29251F] rounded hover:bg-[#F1EADF] transition-colors"
              title="Next"
            >
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
            onClick={() => openCreateModal(new Date(), "10:00 AM")}
            shimmerColor="rgba(255, 255, 255, 0.45)"
            background="#D97736"
            className="h-8 gap-1.5 px-3"
          >
            <Plus size={13} />
            <span>Block Focus Time</span>
          </ShimmerButton>
        </div>
      </div>

      {/* Conflict Radar Bar (Only shown if a live conflict is detected) */}
      {hasLiveConflict && conflictSummary && (
        <div className="relative overflow-hidden p-3.5 rounded-xl border border-[#F9E2BE] bg-[#FEF8ED] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <BorderBeam size={160} duration={10} colorFrom="#D97736" colorTo="#C58A32" />
          <div className="flex items-center gap-2 text-[#C58A32] relative z-10">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              <strong>Schedule Collision:</strong> {conflictSummary}
            </span>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <Button
              onClick={() => {
                toggleOpen();
                submitPrompt(`Resolve calendar conflict: ${conflictSummary}`);
              }}
              size="sm"
              className="h-7 text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white gap-1"
            >
              <span>Auto-Resolve With Copilot</span>
              <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {/* VIEW: WEEK GRID */}
      {viewMode === "week" && (
        <Card className="overflow-hidden border-[#E8DFD1] bg-[#FFFCF6] shadow-soft">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b border-[#E8DFD1] bg-[#F8F4EC]/80 text-xs font-semibold text-[#777064]">
            <div className="p-2.5 border-r border-[#E8DFD1] text-center text-[10px]">TIME</div>
            {weekDays.map((d, i) => {
              const active = isToday(d);
              return (
                <div
                  key={i}
                  className={`p-2.5 text-center border-r border-[#E8DFD1] last:border-r-0 ${
                    active ? "bg-[#FCEEE5]/80 text-primary font-bold" : ""
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider">
                    {d.toLocaleDateString([], { weekday: "short" })}
                  </div>
                  <div className={`text-xs mt-0.5 ${active ? "text-primary" : "text-[#29251F]"}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots Rows */}
          <div className="divide-y divide-[#E8DFD1]/60">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 min-h-[60px] text-xs">
                {/* Time Slot Label */}
                <div className="p-2 border-r border-[#E8DFD1] text-[#777064] font-mono text-[10px] flex items-center justify-center">
                  {time}
                </div>

                {/* 7 Days Columns */}
                {weekDays.map((day, dayIdx) => {
                  const slotEvents = getEventsForDayAndSlot(day, time);
                  const active = isToday(day);

                  return (
                    <div
                      key={dayIdx}
                      className={`p-1 border-r border-[#E8DFD1]/50 last:border-r-0 relative group transition-colors ${
                        active ? "bg-[#FDFBF7]" : "bg-[#FFFCF6] hover:bg-[#F8F4EC]/30"
                      }`}
                    >
                      {slotEvents.length > 0 ? (
                        slotEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-1.5 rounded-lg border shadow-2xs space-y-0.5 cursor-pointer hover:shadow-soft transition-all ${
                              evt.is_focus_block
                                ? "border-[#D0C4B2] bg-[#F8F4EC] text-[#29251F] hover:border-primary"
                                : "border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] hover:border-[#477A58]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-[11px] truncate">{evt.title}</span>
                              <Badge variant="outline" className="text-[8px] px-1 py-0 shrink-0">
                                {evt.is_focus_block ? "Focus" : "Event"}
                              </Badge>
                            </div>
                            {evt.description && (
                              <p className="text-[9px] text-[#777064] truncate">{evt.description}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div
                          onClick={() => openCreateModal(day, time)}
                          className="h-full min-h-[44px] rounded hover:bg-[#F1EADF]/40 cursor-pointer flex items-center justify-center text-[10px] text-transparent group-hover:text-[#777064] transition-all"
                        >
                          + Add
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VIEW: DAY VIEW */}
      {viewMode === "day" && (
        <Card className="p-5 border-[#E8DFD1] bg-[#FFFCF6] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#29251F]">
                {currentDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h2>
              <p className="text-xs text-[#777064]">Detailed hourly timeline and schedule</p>
            </div>
            {isToday(currentDate) && (
              <Badge variant="verified" className="text-[10px]">Today</Badge>
            )}
          </div>

          <div className="divide-y divide-[#E8DFD1]/60">
            {timeSlots.map((time) => {
              const slotEvents = getEventsForDayAndSlot(currentDate, time);

              return (
                <div key={time} className="py-2.5 flex items-start gap-4">
                  <div className="w-20 shrink-0 text-xs font-mono text-[#777064] pt-1">
                    {time}
                  </div>
                  <div className="flex-1 min-h-[36px]">
                    {slotEvents.length > 0 ? (
                      <div className="space-y-2">
                        {slotEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-3 rounded-xl border shadow-2xs cursor-pointer hover:shadow-soft transition-all flex items-center justify-between ${
                              evt.is_focus_block
                                ? "border-[#D0C4B2] bg-[#F8F4EC] text-[#29251F]"
                                : "border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs">{evt.title}</span>
                                <Badge variant="outline" className="text-[9px]">
                                  {evt.is_focus_block ? "Focus Block" : "Calendar Event"}
                                </Badge>
                              </div>
                              {evt.description && (
                                <p className="text-[11px] text-[#777064] mt-0.5">{evt.description}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-[#777064] font-mono">
                              {new Date(evt.start_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – {new Date(evt.end_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => openCreateModal(currentDate, time)}
                        className="w-full py-1.5 px-3 rounded-lg border border-dashed border-[#E8DFD1] hover:border-primary text-[11px] text-[#777064] hover:text-primary hover:bg-[#F8F4EC]/40 text-left transition-colors"
                      >
                        + Reserve slot at {time}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VIEW: MONTH VIEW */}
      {viewMode === "month" && (
        <Card className="overflow-hidden border-[#E8DFD1] bg-[#FFFCF6] shadow-soft p-4">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-[#777064] uppercase font-mono">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, idx) => {
              const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const dayOffset = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), idx - dayOffset + 1);
              const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
              const active = isToday(cellDate);

              const dayEvents = events.filter((e) => isSameDay(e.start_time, cellDate));

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(cellDate);
                    setViewMode("day");
                  }}
                  className={`min-h-[76px] p-2 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? "border-primary bg-[#FCEEE5]/40 shadow-2xs"
                      : isCurrentMonth
                      ? "border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D0C4B2]"
                      : "border-transparent bg-[#F8F4EC]/30 text-[#A39B8E]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${active ? "text-primary font-bold" : ""}`}>
                      {cellDate.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="h-4 w-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className="text-[9px] truncate px-1 py-0.5 rounded bg-[#F8F4EC] border border-[#E8DFD1] text-[#29251F]"
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-[#777064]">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Time Block Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-[#29251F]">
              Schedule Event for {targetSlotDate.toLocaleDateString([], { month: "short", day: "numeric" })} at {targetSlotTime}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#777064]">
              Reserve focus time or register a calendar commitment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Title</label>
              <input
                value={blockTitle}
                onChange={(e) => setBlockTitle(e.target.value)}
                placeholder="e.g. Deep Work: Architecture Design"
                className="w-full h-8 px-2.5 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F] focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Description</label>
              <input
                value={blockDescription}
                onChange={(e) => setBlockDescription(e.target.value)}
                placeholder="Optional notes or agenda"
                className="w-full h-8 px-2.5 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F] focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#777064]">Duration</label>
                <select
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  className="w-full h-8 px-2 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
                >
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="90">1.5 Hours</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#777064]">Event Type</label>
                <select
                  value={isFocusBlock ? "focus" : "standard"}
                  onChange={(e) => setIsFocusBlock(e.target.value === "focus")}
                  className="w-full h-8 px-2 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
                >
                  <option value="focus">Protected Focus Block</option>
                  <option value="standard">Standard Meeting / Event</option>
                </select>
              </div>
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
              onClick={handleSaveEvent}
              className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
            >
              Save Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-sm bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant={selectedEvent.is_focus_block ? "secondary" : "verified"} className="text-[10px]">
                  {selectedEvent.is_focus_block ? "Focus Block" : "Confirmed Event"}
                </Badge>
                <span className="text-[10px] font-mono text-[#777064]">
                  #{selectedEvent.id.slice(0, 8)}
                </span>
              </div>
              <DialogTitle className="text-sm font-bold text-[#29251F] mt-1">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#777064]">
                {new Date(selectedEvent.start_time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} • {new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – {new Date(selectedEvent.end_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent.description && (
              <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-xs text-[#777064]">
                {selectedEvent.description}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD1]">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="h-7 text-xs gap-1"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="h-7 text-xs border-[#E8DFD1]"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </FadeIn>
  );
}
