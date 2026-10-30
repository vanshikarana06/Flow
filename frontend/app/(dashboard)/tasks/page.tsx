"use client";

import React, { useState } from "react";
import { 
  CheckSquare, 
  Sparkles, 
  Kanban, 
  List as ListIcon, 
  Clock, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion-primitives";
import { mockTasks } from "@/lib/mock-data";
import { TaskItem } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { toggleOpen, submitPrompt } = useCopilotStore();

  const columns: { id: TaskItem["status"]; title: string }[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "in_review", title: "In Review" },
    { id: "completed", title: "Completed" },
  ];

  const categories = ["All", "Backend", "Product", "Security", "Research"];

  const filteredTasks = tasks.filter(t => 
    selectedCategory === "All" ? true : t.category === selectedCategory
  );

  const toggleTaskCompleted = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status: t.status === "completed" ? "todo" : "completed",
            progress: t.status === "completed" ? 0 : 100 
          }
        : t
    ));
  };

  return (
    <FadeIn className="space-y-5">
      {/* Task View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Tasks & Execution Plan</h1>
            <Badge variant="outline" className="text-[10px] text-[#777064] border-[#E8DFD1]">
              {filteredTasks.length} Items
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Motion-inspired task management with AI goal decomposition and calendar time blocking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="hidden md:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#D97736] text-white"
                    : "text-[#777064] hover:bg-[#F1EADF] hover:text-[#29251F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#F1EADF] p-0.5 rounded-lg border border-[#E8DFD1]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === "kanban" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === "list" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              <ListIcon size={13} />
              <span>List</span>
            </button>
          </div>

          <Button
            onClick={() => {
              toggleOpen();
              submitPrompt("Decompose my high-level project goal 'Launch FLOW Hackathon Release' into subtasks with time estimates");
            }}
            size="sm"
            className="text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] text-white"
          >
            <Sparkles size={13} />
            <span>AI Goal Decomposer</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#777064] px-1">
                  <span>{col.title}</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-[#F1EADF] font-mono text-[9px] text-[#29251F]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D97736]/40 transition-all p-3 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-semibold text-[#D97736] font-mono uppercase">
                          {task.category}
                        </span>
                        <Badge
                          variant={
                            task.priority === "urgent"
                              ? "destructive"
                              : task.priority === "high"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[8px] px-1.5 py-0"
                        >
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-semibold text-[#29251F] leading-snug">
                        {task.title}
                      </h4>

                      {/* AI Breakdown Subtasks */}
                      {task.aiBreakdown && task.aiBreakdown.length > 0 && (
                        <div className="rounded-lg bg-[#F8F4EC] p-2 space-y-1 border border-[#E8DFD1]">
                          <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={10} className="text-[#D97736]" /> AI Decomposition
                          </span>
                          {task.aiBreakdown.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#777064]">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#D97736] shrink-0" />
                              <span className="truncate">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Duration & Time Blocking */}
                      <div className="flex items-center justify-between text-[10px] text-[#777064] pt-1 border-t border-[#E8DFD1]/50 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {task.estimatedDuration || "1 hr"}
                        </span>
                        <button
                          onClick={() => {
                            toggleOpen();
                            submitPrompt(`Schedule time block for task: "${task.title}"`);
                          }}
                          className="text-[10px] text-[#D97736] hover:underline flex items-center gap-0.5 font-sans"
                        >
                          <Calendar size={10} />
                          <span>Block Time</span>
                        </button>
                      </div>

                      {/* Progress Bar & Due Date */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#777064]">
                          <span className="font-mono">{task.dueDate}</span>
                          <span className="font-mono text-[#29251F] font-semibold">{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1EADF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D97736] rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="p-6 text-center border border-dashed border-[#E8DFD1] rounded-xl text-xs text-[#777064]">
                      No tasks in {col.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="divide-y divide-[#E8DFD1] border-[#E8DFD1] bg-[#FFFCF6]">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3.5 hover:bg-[#F8F4EC]/60 text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaskCompleted(task.id)}
                  className="text-[#777064] hover:text-[#477A58] transition-colors"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 size={16} className="text-[#477A58]" />
                  ) : (
                    <div className="h-4 w-4 rounded border border-[#D0C4B2] hover:border-[#D97736]" />
                  )}
                </button>
                <div>
                  <h4 className={`font-semibold text-[#29251F] ${task.status === "completed" ? "line-through text-[#777064]" : ""}`}>
                    {task.title}
                  </h4>
                  <p className="text-[10px] text-[#777064] font-mono mt-0.5">
                    {task.category} • Est: {task.estimatedDuration || "1 hr"} • Due {task.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Badge
                  variant={
                    task.priority === "urgent"
                      ? "destructive"
                      : task.priority === "high"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-[9px] uppercase font-mono"
                >
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="text-[9px] border-[#E8DFD1] font-mono">
                  {task.status.toUpperCase()}
                </Badge>
                <div className="w-16 hidden sm:block">
                  <div className="h-1.5 w-full bg-[#F1EADF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D97736] rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </FadeIn>
  );
}
