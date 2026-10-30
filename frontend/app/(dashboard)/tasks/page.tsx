"use client";

import React, { useState } from "react";
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Sparkles, 
  Kanban, 
  List as ListIcon, 
  FolderKanban, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Intelligent Tasks & Workflows</h2>
          <Badge variant="outline" className="text-[10px] text-gray-400 border-white/10">
            {tasks.length} Active Items
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-card-subtle p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                viewMode === "kanban" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                viewMode === "list" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <ListIcon size={13} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("project")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                viewMode === "project" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <FolderKanban size={13} />
              <span>Project</span>
            </button>
            <button
              onClick={() => setViewMode("study")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                viewMode === "study" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 px-1">
                  <span>{col.title}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white/5 font-mono text-[10px]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-white/5 hover:border-white/20 transition-all p-3.5 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold text-indigo-400 font-mono uppercase">
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
                          className="text-[9px] px-1.5 py-0"
                        >
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-semibold text-gray-100 leading-snug">
                        {task.title}
                      </h4>

                      {/* AI Breakdown Subtasks */}
                      {task.aiBreakdown && task.aiBreakdown.length > 0 && (
                        <div className="rounded-lg bg-card-subtle p-2 space-y-1 border border-white/5">
                          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={10} className="text-primary" /> AI Decomposition
                          </span>
                          {task.aiBreakdown.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                              <span className="truncate">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar & Due Date */}
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} /> {task.dueDate}
                          </span>
                          <span className="font-mono text-gray-400">{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
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
        /* List View (Linear Style) */
        <Card className="divide-y divide-white/5 border-white/5 bg-card">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckSquare size={16} className="text-gray-500" />
                <div>
                  <h4 className="font-semibold text-gray-200">{task.title}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {task.category} • Due {task.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] border-white/10 font-mono">
                  {task.status.toUpperCase()}
                </Badge>
                <div className="w-20 hidden sm:block">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
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

