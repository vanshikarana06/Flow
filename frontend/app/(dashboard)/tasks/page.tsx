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
  Filter,
  Check
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DndKanban } from "@/components/tasks/dnd-kanban";
import { mockTasks } from "@/lib/mock-data";
import { TaskItem } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { triggerConfetti } from "@/lib/confetti";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showDecomposerModal, setShowDecomposerModal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { toggleOpen, submitPrompt } = useCopilotStore();

  const categories = ["All", "Backend", "Product", "Security", "Research"];

  const filteredTasks = tasks.filter(t => 
    selectedCategory === "All" ? true : t.category === selectedCategory
  );

  const handleBlockTime = (task: TaskItem) => {
    setToastMessage(`Calendar Focus Block staged for "${task.title}" at 3:00 PM`);
    triggerConfetti({ particleCount: 25, spread: 45, origin: { y: 0.75 } });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDecomposeGoal = () => {
    if (!goalInput.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: goalInput,
      category: "Product",
      priority: "high",
      status: "todo",
      progress: 0,
      estimatedDuration: "2.5 hrs",
      dueDate: "Tomorrow",
      aiBreakdown: [
        "Audit existing schema specifications",
        "Generate automated integration test suite",
        "Deploy prototype behind feature flag"
      ]
    };

    setTasks([newTask, ...tasks]);
    setGoalInput("");
    setShowDecomposerModal(false);
    triggerConfetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
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
            Interactive physics-based drag-and-drop Kanban with AI goal decomposition and calendar time blocking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="hidden md:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-2xs font-semibold"
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "kanban" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold" : "text-[#777064]"
              }`}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list" ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold" : "text-[#777064]"
              }`}
            >
              <ListIcon size={13} />
              <span>List</span>
            </button>
          </div>

          <ShimmerButton
            onClick={() => setShowDecomposerModal(true)}
            shimmerColor="rgba(255, 255, 255, 0.45)"
            background="#D97736"
            className="h-8 gap-1.5 px-3"
          >
            <Sparkles size={13} />
            <span>AI Goal Decomposer</span>
          </ShimmerButton>
        </div>
      </div>

      {/* Kanban Board or Tabular List */}
      {viewMode === "kanban" ? (
        <DndKanban
          tasks={filteredTasks}
          onTasksChange={setTasks}
          onBlockTime={handleBlockTime}
        />
      ) : (
        <Card className="border-[#E8DFD1] bg-[#FFFCF6] shadow-soft overflow-hidden divide-y divide-[#E8DFD1]/60">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#F8F4EC]/40 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={16}
                  className={task.status === "completed" ? "text-[#477A58]" : "text-[#A39B8E]"}
                />
                <div>
                  <h4 className="font-semibold text-sm text-[#29251F]">{task.title}</h4>
                  <p className="text-[11px] text-[#777064]">Category: {task.category} • Est: {task.estimatedDuration || "45m"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={task.status === "completed" ? "verified" : "outline"} className="text-[10px]">
                  {task.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBlockTime(task)}
                  className="h-7 text-xs border-[#E8DFD1]"
                >
                  Block Time
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* AI Goal Decomposer Modal */}
      <Dialog open={showDecomposerModal} onOpenChange={setShowDecomposerModal}>
        <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
                <Sparkles size={16} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#29251F]">
                  Autonomous Goal Decomposition
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  Enter a high-level outcome. FLOW decomposes it into actionable Kanban subtasks.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Project Goal</label>
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Implement OAuth 2.0 PKCE Flow & Cookie Security"
                className="w-full h-9 px-3 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F] focus:border-primary focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[11px] text-[#777064] space-y-1">
              <span className="font-semibold text-[#29251F]">Autonomous Breakdown Preview:</span>
              <p>• Extract token verification endpoints</p>
              <p>• Configure HttpOnly SameSite cookie sessions</p>
              <p>• Run automated integration test suite</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDecomposerModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDecomposeGoal}
              disabled={!goalInput.trim()}
              className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1"
            >
              <Sparkles size={13} />
              <span>Decompose & Add to Board</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
