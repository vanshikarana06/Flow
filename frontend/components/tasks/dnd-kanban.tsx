"use client";

import React, { useState } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  GripVertical,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskItem } from "@/lib/types";
import { triggerConfetti } from "@/lib/confetti";

interface DndKanbanProps {
  tasks: TaskItem[];
  onTasksChange: (tasks: TaskItem[]) => void;
  onBlockTime: (task: TaskItem) => void;
}

const columns: { id: TaskItem["status"]; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "completed", title: "Completed" },
];

function DraggableCard({ 
  task, 
  onBlockTime 
}: { 
  task: TaskItem; 
  onBlockTime: (task: TaskItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border p-3.5 space-y-2.5 transition-all select-none ${
        isDragging
          ? "border-primary bg-[#FFFCF6] shadow-elevated scale-105 opacity-90"
          : "border-[#E8DFD1] bg-[#FFFCF6] hover:border-[#D0C4B2] hover:shadow-soft"
      }`}
    >
      {/* Drag Handle & Card Header */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-0.5 text-[#A39B8E] hover:text-[#29251F] rounded"
            title="Drag to reorder column"
          >
            <GripVertical size={13} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-[#777064]">
            {task.category}
          </span>
        </div>

        <Badge
          variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "warning" : "secondary"}
          className="text-[9px] uppercase font-mono px-1.5 py-0"
        >
          {task.priority}
        </Badge>
      </div>

      <h4 className="font-semibold text-xs text-[#29251F] leading-snug">
        {task.title}
      </h4>

      {/* AI Decomposition Subtasks */}
      {task.aiBreakdown && task.aiBreakdown.length > 0 && (
        <div className="p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]/60 space-y-1">
          <span className="text-[9px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} /> AI Decomposition
          </span>
          <div className="space-y-0.5">
            {task.aiBreakdown.map((st, i) => (
              <p key={i} className="text-[10px] text-[#777064] truncate">
                • {st}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-[#777064] font-mono">
          <span>Progress</span>
          <span className="font-bold text-[#29251F]">{task.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E8DFD1] overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Card Footer: Estimated Time & Calendar Block */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E8DFD1]/60 text-[10px] text-[#777064]">
        <span className="flex items-center gap-1 font-mono">
          <Clock size={11} />
          <span>{task.estimatedDuration || "45m"}</span>
        </span>

        <button
          onClick={() => onBlockTime(task)}
          className="flex items-center gap-1 text-primary hover:text-primary-hover font-semibold transition-colors"
          title="Block focus time on calendar"
        >
          <Calendar size={11} />
          <span>Block Time</span>
        </button>
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onBlockTime,
}: {
  column: { id: TaskItem["status"]; title: string };
  tasks: TaskItem[];
  onBlockTime: (task: TaskItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border p-3.5 space-y-3 transition-colors ${
        isOver
          ? "border-primary bg-[#FCEEE5]/30 ring-2 ring-primary/20"
          : "border-[#E8DFD1] bg-[#F8F4EC]/60"
      }`}
    >
      <div className="flex items-center justify-between pb-1 border-b border-[#E8DFD1]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#29251F]">{column.title}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8DFD1] text-[10px] font-bold text-[#777064] font-mono">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 min-h-[300px]">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} onBlockTime={onBlockTime} />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-[#D0C4B2] text-xs text-[#A39B8E]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export function DndKanban({ tasks, onTasksChange, onBlockTime }: DndKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetStatus = over.id as TaskItem["status"];

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const isNowCompleted = targetStatus === "completed";
        if (isNowCompleted && t.status !== "completed") {
          triggerConfetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#F28C38", "#477A58"],
          });
        }
        return {
          ...t,
          status: targetStatus,
          progress: isNowCompleted ? 100 : targetStatus === "in_review" ? 90 : targetStatus === "in_progress" ? 50 : 20,
        };
      }
      return t;
    });

    onTasksChange(updated);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <DroppableColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
            onBlockTime={onBlockTime}
          />
        ))}
      </div>
    </DndContext>
  );
}

