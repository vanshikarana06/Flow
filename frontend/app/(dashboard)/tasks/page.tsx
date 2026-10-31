"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Sparkles, 
  Kanban, 
  List as ListIcon, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Check,
  Trash2,
  RefreshCw,
  Info,
  CalendarCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DndKanban } from "@/components/tasks/dnd-kanban";
import { TaskItem } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { triggerConfetti } from "@/lib/confetti";
import { apiClient } from "@/lib/api-client";

const isUUID = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  
  // AI Goal Decomposer Modal State
  const [showDecomposerModal, setShowDecomposerModal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goalPriority, setGoalPriority] = useState<string>("HIGH");
  const [goalCategory, setGoalCategory] = useState<string>("Product");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const { toggleOpen, submitPrompt } = useCopilotStore();

  const categories = ["All", "Backend", "Product", "Security", "Research"];

  // 1. Fetch live tasks from GET /api/v1/tasks
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<any[]>("/tasks/?include_completed=true");
      if (Array.isArray(data)) {
        const liveTasks: TaskItem[] = data.map((t: any) => {
          const statusLower = (t.status?.toLowerCase() || "todo") as TaskItem["status"];
          const subtaskList = Array.isArray(t.subtasks) ? t.subtasks : [];
          const completedCount = subtaskList.filter((s: any) => s.is_completed || s.completed).length;
          
          let calculatedProgress = 0;
          if (subtaskList.length > 0) {
            calculatedProgress = Math.round((completedCount / subtaskList.length) * 100);
          } else if (statusLower === "completed") {
            calculatedProgress = 100;
          } else if (statusLower === "in_progress") {
            calculatedProgress = 50;
          }

          return {
            id: String(t.id),
            title: t.title,
            description: t.description || undefined,
            category: t.task_type === "DEEP_WORK" ? "Backend" : t.task_type === "HABIT" ? "Security" : "Product",
            priority: (t.priority?.toLowerCase() || "medium") as TaskItem["priority"],
            status: statusLower === "completed" ? "completed" : statusLower === "in_progress" ? "in_progress" : "todo",
            progress: calculatedProgress,
            estimatedDuration: t.task_type === "DEEP_WORK" ? "2.0 hrs" : "45m",
            dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString([], { month: "short", day: "numeric" }) : "Tomorrow",
            subtasks: subtaskList.map((s: any) => ({
              id: s.id,
              title: s.title,
              is_completed: Boolean(s.is_completed ?? s.completed),
            })),
            aiBreakdown: subtaskList.length > 0
              ? subtaskList.map((s: any) => s.title)
              : [
                  "Analyze requirements & dependencies",
                  "Coordinate execution phase",
                  "Verify cryptographic receipt in Activity Ledger"
                ],
          };
        });
        setTasks(liveTasks);
        setIsLiveConnected(true);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.warn("Could not load tasks from backend:", err);
      setTasks([]);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => 
    selectedCategory === "All" ? true : t.category === selectedCategory
  );

  // 2. Schedule Real Focus Block on Calendar
  const handleBlockTime = async (task: TaskItem) => {
    try {
      const now = new Date();
      // Block tomorrow at 2:00 PM or 2 hours from now
      const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour focus block

      await apiClient.post("/calendar/events", {
        title: `Focus: ${task.title}`,
        description: task.description || `Autonomous Focus Block scheduled from Task #${task.id.slice(0, 8)}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_focus_block: true,
      });

      setToastMessage(`Calendar Focus Block scheduled for "${task.title}" at ${startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      triggerConfetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.warn("Could not schedule calendar focus block:", err);
      setToastMessage(`Could not stage calendar block for "${task.title}"`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // 3. Connect PATCH /api/v1/tasks/{id} on Kanban column change
  const handleTasksChange = async (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    for (const nt of newTasks) {
      const prev = tasks.find((t) => t.id === nt.id);
      if (prev && prev.status !== nt.status && isUUID(nt.id)) {
        try {
          const backendStatus = nt.status === "completed" ? "COMPLETED" : nt.status === "in_progress" ? "IN_PROGRESS" : "TODO";
          await apiClient.patch(`/tasks/${nt.id}`, { status: backendStatus });
        } catch (err) {
          console.warn("Could not patch task status in backend:", err);
        }
      }
    }
  };

  // Toggle subtask in details dialog
  const handleToggleSubtask = (subtaskIndex: number) => {
    if (!selectedTask || !selectedTask.subtasks) return;
    const updatedSubtasks = [...selectedTask.subtasks];
    const target = updatedSubtasks[subtaskIndex];
    target.is_completed = !target.is_completed;

    const completedCount = updatedSubtasks.filter((s) => s.is_completed).length;
    const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

    const updatedTask: TaskItem = {
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress: newProgress,
      status: newProgress === 100 ? "completed" : selectedTask.status,
    };

    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  // 4. Connect POST /api/v1/tasks in AI Goal Decomposer
  const handleDecomposeGoal = async () => {
    if (!goalInput.trim()) return;
    const goalText = goalInput.trim();
    setGoalInput("");
    setShowDecomposerModal(false);

    try {
      const res = await apiClient.post<any>("/tasks/", {
        title: goalText,
        description: `Autonomous Goal Decomposition for '${goalText}'. Scoped by FLOW Agent with milestone verification.`,
        task_type: "PROJECT",
        priority: goalPriority,
        subtask_titles: [
          `Analyze scope and prerequisites for ${goalText}`,
          "Coordinate implementation and test validation",
          "Verify execution receipt and update activity ledger"
        ]
      });

      if (res && res.id) {
        const newTask: TaskItem = {
          id: String(res.id),
          title: res.title,
          description: res.description,
          category: goalCategory as TaskItem["category"],
          priority: goalPriority.toLowerCase() as TaskItem["priority"],
          status: "todo",
          progress: 0,
          estimatedDuration: "2.5 hrs",
          dueDate: "Tomorrow",
          subtasks: [
            { title: `Analyze scope and prerequisites for ${goalText}`, is_completed: false },
            { title: "Coordinate implementation and test validation", is_completed: false },
            { title: "Verify execution receipt and update activity ledger", is_completed: false }
          ],
          aiBreakdown: [
            `Analyze scope and prerequisites for ${goalText}`,
            "Coordinate implementation and test validation",
            "Verify execution receipt and update activity ledger"
          ]
        };
        setTasks((prev) => [newTask, ...prev]);
        setToastMessage(`Decomposed and created task #${String(res.id).slice(0, 8)} in queue`);
        triggerConfetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.warn("Could not create task via backend API:", err);
    }
  };

  // 5. Connect DELETE /api/v1/tasks/{id}
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    if (isUUID(taskId)) {
      try {
        await apiClient.delete(`/tasks/${taskId}`);
        setToastMessage("Task deleted from database");
      } catch (err) {
        console.warn("Could not delete task from backend:", err);
      }
      setTimeout(() => setToastMessage(null), 3000);
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

      {/* Task View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Tasks & Execution Plan</h1>
            <Badge variant="outline" className="text-[10px] text-[#777064] border-[#E8DFD1]">
              {filteredTasks.length} Items
            </Badge>
            {isLiveConnected && (
              <Badge variant="verified" className="text-[9px] px-1.5 py-0 bg-[#EDF5F0] text-[#477A58]">
                Live Runtime
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#777064] mt-1">
            Real-time execution backlog managed by FLOW Agent Runtime with milestone tracking.
          </p>
        </div>

        {/* View Controls & Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter Pills */}
          <div className="flex items-center bg-[#F8F4EC] p-0.5 rounded-lg border border-[#E8DFD1] text-xs text-[#777064]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === cat ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold" : "hover:text-[#29251F]"
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
      {isLoading ? (
        <div className="p-16 text-center border border-dashed border-[#E8DFD1] rounded-2xl bg-[#FFFCF6] space-y-2">
          <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
          <p className="text-xs text-[#777064]">Loading live task backlog...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-[#E8DFD1] rounded-2xl bg-[#FFFCF6] space-y-3">
          <CheckSquare size={36} className="text-primary mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-[#29251F]">No Tasks In Queue</h3>
          <p className="text-xs text-[#777064] max-w-sm mx-auto leading-relaxed">
            Your task board is clear. Click &quot;AI Goal Decomposer&quot; to break down an objective or ask the AI Copilot to coordinate a workflow.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        <DndKanban
          tasks={filteredTasks}
          onTasksChange={handleTasksChange}
          onBlockTime={handleBlockTime}
          onSelectTask={(task) => setSelectedTask(task)}
        />
      ) : (
        <Card className="border-[#E8DFD1] bg-[#FFFCF6] shadow-soft overflow-hidden divide-y divide-[#E8DFD1]/60">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className="p-4 flex items-center justify-between text-xs hover:bg-[#F8F4EC]/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F8F4EC] text-primary border border-[#E8DFD1]">
                  <CheckSquare size={14} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#29251F] text-sm">{task.title}</h4>
                  {task.description && (
                    <p className="text-[11px] text-[#777064] line-clamp-1 mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#777064]">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {task.estimatedDuration}
                    </span>
                    <span>•</span>
                    <span>Due: {task.dueDate}</span>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">{task.subtasks.length} subtasks</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Badge variant={task.status === "completed" ? "verified" : "outline"} className="text-[10px]">
                  {task.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBlockTime(task)}
                  className="h-7 text-xs border-[#E8DFD1] gap-1"
                >
                  <Calendar size={12} />
                  <span>Block Time</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task.id)}
                  className="h-7 w-7 p-0 text-[#C65345] hover:bg-[#FDEDEB]"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Task Details & Subtasks Modal */}
      <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="max-w-lg bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedTask.priority === "urgent" ? "destructive" : selectedTask.priority === "high" ? "warning" : "secondary"} className="text-[10px]">
                    {selectedTask.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {selectedTask.category}
                  </Badge>
                </div>
                <span className="text-[10px] font-mono text-[#777064]">
                  #{selectedTask.id.slice(0, 8)}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-[#29251F] mt-2">
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#777064]">
                Due: {selectedTask.dueDate} • Est: {selectedTask.estimatedDuration || "45m"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Task Description */}
              {selectedTask.description && (
                <div className="p-3 rounded-xl bg-[#F8F4EC] border border-[#E8DFD1] text-xs text-[#29251F] leading-relaxed">
                  <span className="font-semibold text-[11px] text-[#777064] block mb-1 uppercase tracking-wider">
                    Task Objective & Agent Scope
                  </span>
                  {selectedTask.description}
                </div>
              )}

              {/* Subtasks Checklist */}
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#29251F] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-primary" /> AI Decomposition Subtasks
                    </span>
                    <span className="text-[11px] font-mono font-bold text-primary">
                      {selectedTask.progress}% Complete
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-[#E8DFD1] overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${selectedTask.progress}%` }}
                    />
                  </div>

                  <div className="divide-y divide-[#E8DFD1]/60 border border-[#E8DFD1] rounded-xl overflow-hidden bg-white">
                    {selectedTask.subtasks.map((st, i) => (
                      <div
                        key={i}
                        onClick={() => handleToggleSubtask(i)}
                        className="p-2.5 flex items-center gap-2.5 hover:bg-[#F8F4EC]/60 cursor-pointer transition-colors"
                      >
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                            st.is_completed
                              ? "bg-primary border-primary text-white"
                              : "border-[#D0C4B2] bg-white"
                          }`}
                        >
                          {st.is_completed && <Check size={11} />}
                        </div>
                        <span
                          className={`text-xs ${
                            st.is_completed ? "line-through text-[#A39B8E]" : "text-[#29251F]"
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD1]">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="h-8 text-xs gap-1"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBlockTime(selectedTask)}
                  className="h-8 text-xs border-[#E8DFD1] gap-1"
                >
                  <CalendarCheck size={13} className="text-primary" />
                  <span>Block on Calendar</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                  className="h-8 text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#777064]">Category</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full h-8 px-2 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
                >
                  <option value="Product">Product</option>
                  <option value="Backend">Backend</option>
                  <option value="Security">Security</option>
                  <option value="Research">Research</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#777064]">Priority</label>
                <select
                  value={goalPriority}
                  onChange={(e) => setGoalPriority(e.target.value)}
                  className="w-full h-8 px-2 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[11px] text-[#777064] space-y-1">
              <span className="font-semibold text-[#29251F]">Autonomous Breakdown Preview:</span>
              <p>• Scope requirements, deliverables & prerequisites</p>
              <p>• Execute core implementation & validation checkpoints</p>
              <p>• Verify cryptographic ledger receipt upon completion</p>
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
