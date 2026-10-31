"use client";

import React from "react";
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
  Sparkles, 
  GripVertical,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskItem } from "@/lib/types";

interface DndKanbanProps {
  tasks: TaskItem[];
  onTasksChange: (tasks: TaskItem[]) => void;
  onBlockTime: (task: TaskItem) => void;
  onSelectTask?: (task: TaskItem) => void;
}

const columns: { id: TaskItem["status"]; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "completed", title: "Completed" },
];

function DraggableCard({ 
  task, 
  onBlockTime,
  onSelectTask,
}: { 
  task: TaskItem; 
  onBlockTime: (task: TaskItem) => void;
  onSelectTask?: (task: TaskItem) => void;
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

      {/* Title & Click to Inspect */}
      <div 
        onClick={() => onSelectTask && onSelectTask(task)}
        className="cursor-pointer space-y-1"
      >
        <h4 className="font-semibold text-xs text-[#29251F] leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-[11px] text-[#777064] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* AI Decomposition Subtasks */}
      {task.aiBreakdown && task.aiBreakdown.length > 0 && (
        <div 
          onClick={() => onSelectTask && onSelectTask(task)}
          className="p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]/60 space-y-1 cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> AI Decomposition
            </span>
            <span className="text-[9px] text-[#777064] font-mono">
              {task.aiBreakdown.length} subtasks
            </span>
          </div>
          <div className="space-y-0.5">
            {task.aiBreakdown.slice(0, 3).map((st, i) => (
              <p key={i} className="text-[10px] text-[#777064] truncate">
                • {st}
              </p>
            ))}
            {task.aiBreakdown.length > 3 && (
              <p className="text-[9px] text-primary font-medium">+{task.aiBreakdown.length - 3} more...</p>
            )}
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
          onClick={(e) => {
            e.stopPropagation();
            onBlockTime(task);
          }}
          className="flex items-center gap-1 text-primary hover:text-primary-hover font-semibold transition-colors"
          title="Schedule focus time block on calendar"
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
  onSelectTask,
}: {
  column: { id: TaskItem["status"]; title: string };
  tasks: TaskItem[];
  onBlockTime: (task: TaskItem) => void;
  onSelectTask?: (task: TaskItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border p-3 min-h-[500px] transition-colors ${
        isOver
          ? "border-primary bg-[#FCEEE5]/20"
          : "border-[#E8DFD1] bg-[#F8F4EC]/40"
      }`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8DFD1]">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#29251F]">
            {column.title}
          </h3>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E8DFD1] text-[9px] font-mono font-bold text-[#777064]">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 flex-1">
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            onBlockTime={onBlockTime}
            onSelectTask={onSelectTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 flex items-center justify-center border border-dashed border-[#E8DFD1] rounded-lg text-[11px] text-[#A39B8E]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export function DndKanban({
  tasks,
  onTasksChange,
  onBlockTime,
  onSelectTask,
}: DndKanbanProps) {
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

    const taskId = String(active.id);
    const newStatus = over.id as TaskItem["status"];

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            progress: newStatus === "completed" ? 100 : newStatus === "in_progress" ? 50 : 0,
          }
        : t
    );

    onTasksChange(updatedTasks);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <DroppableColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
            onBlockTime={onBlockTime}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
