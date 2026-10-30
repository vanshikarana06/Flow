"use client";

import React, { useState } from "react";
import { 
  CheckSquare, 
  Sparkles, 
  Kanban, 
  List as ListIcon, 
  FolderKanban, 
  BookOpen, 
  Clock 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockTasks } from "@/lib/mock-data";
import { TaskItem } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "project" | "study">("kanban");
  const { toggleOpen, submitPrompt } = useCopilotStore();

  const columns: { id: TaskItem["status"]; title: string }[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "in_review", title: "In Review" },
    { id: "completed", title: "Completed" },
  ];

  return (
    <div className="space-y-4">
      {/* Task View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E8DFD1]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#29251F]">Intelligent Tasks</h2>
          <Badge variant="outline" className="text-[10px] text-[#777064] border-[#E8DFD1]">
            {tasks.length} Active Items
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Buttons */}
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
            <button
              onClick={() => setViewMode("project")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === "project" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              <FolderKanban size={13} />
              <span>Project</span>
            </button>
            <button
              onClick={() => setViewMode("study")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === "study" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs" : "text-[#777064]"
              }`}
            >
              <BookOpen size={13} />
              <span>Study Plan</span>
            </button>
          </div>

          <Button
            onClick={() => {
              toggleOpen();
              submitPrompt("Decompose project goal 'Launch FLOW Hackathon Release' into subtasks");
            }}
            size="sm"
            className="text-xs font-semibold gap-1.5"
          >
            <Sparkles size={13} />
            <span>AI Task Breakdown</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
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
                      className="border-[#E8DFD1] bg-[#FFFCF6] hover:border-primary/40 transition-all p-3 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-semibold text-primary font-mono uppercase">
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
                            <Sparkles size={10} className="text-primary" /> AI Decomposition
                          </span>
                          {task.aiBreakdown.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#777064]">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span className="truncate">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar & Due Date */}
                      <div className="pt-0.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#777064]">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} /> {task.dueDate}
                          </span>
                          <span className="font-mono text-[#29251F] font-semibold">{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1EADF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="divide-y divide-[#E8DFD1] border-[#E8DFD1] bg-[#FFFCF6]">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 hover:bg-[#F8F4EC]/60 text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare size={15} className="text-[#777064]" />
                <div>
                  <h4 className="font-semibold text-[#29251F]">{task.title}</h4>
                  <p className="text-[10px] text-[#777064] font-mono mt-0.5">
                    {task.category} • Due {task.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="text-[9px] border-[#E8DFD1] font-mono">
                  {task.status.toUpperCase()}
                </Badge>
                <div className="w-16 hidden sm:block">
                  <div className="h-1.5 w-full bg-[#F1EADF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
