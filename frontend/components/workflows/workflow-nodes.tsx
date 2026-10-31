"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { 
  Zap, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Clock, 
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl border bg-[#FFFCF6] p-3 shadow-soft transition-all ${
        selected ? "border-primary ring-2 ring-primary/20" : "border-[#E8DFD1]"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-[#E8DFD1]/60 pb-2 mb-2">
        <div className="p-1 rounded-md bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
          <Zap size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-mono font-bold text-[#777064] uppercase">TRIGGER</span>
          <p className="text-xs font-bold text-[#29251F] truncate">{data.label as string}</p>
        </div>
      </div>
      <p className="text-[11px] text-[#777064] leading-relaxed">{data.subtext as string}</p>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-primary !border-2 !border-[#FFFCF6]"
      />
    </div>
  );
});
TriggerNode.displayName = "TriggerNode";

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[210px] rounded-xl border bg-[#FFFCF6] p-3 shadow-soft transition-all ${
        selected ? "border-[#D97736] ring-2 ring-[#D97736]/20" : "border-[#E8DFD1]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-[#777064] !border-2 !border-[#FFFCF6]"
      />

      <div className="flex items-center gap-2 border-b border-[#E8DFD1]/60 pb-2 mb-2">
        <div className="p-1 rounded-md bg-[#F8F4EC] text-[#777064] border border-[#E8DFD1]">
          <Filter size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-mono font-bold text-[#777064] uppercase">CONDITION</span>
          <p className="text-xs font-bold text-[#29251F] truncate">{data.label as string}</p>
        </div>
      </div>
      <p className="text-[11px] text-[#777064] leading-relaxed">{data.subtext as string}</p>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-[#D97736] !border-2 !border-[#FFFCF6]"
      />
    </div>
  );
});
ConditionNode.displayName = "ConditionNode";

export const HitlGateNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[230px] rounded-xl border bg-[#FEF8ED] p-3 shadow-soft transition-all ${
        selected ? "border-[#C58A32] ring-2 ring-[#C58A32]/25" : "border-[#F9E2BE]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-[#C58A32] !border-2 !border-[#FFFCF6]"
      />

      <div className="flex items-center gap-2 border-b border-[#F9E2BE] pb-2 mb-2">
        <div className="p-1 rounded-md bg-[#FEF8ED] text-[#C58A32] border border-[#F9E2BE]">
          <Lock size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-[#C58A32] uppercase">HITL SAFETY GATE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#C58A32] animate-pulse" />
          </div>
          <p className="text-xs font-bold text-[#29251F] truncate">{data.label as string}</p>
        </div>
      </div>
      <p className="text-[11px] text-[#777064] leading-relaxed">{data.subtext as string}</p>

      <div className="mt-2 pt-1.5 border-t border-[#F9E2BE]/60 flex items-center justify-between text-[10px] text-[#C58A32] font-semibold">
        <span>Approval Threshold: Explicit</span>
        <ShieldCheck size={12} />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-[#477A58] !border-2 !border-[#FFFCF6]"
      />
    </div>
  );
});
HitlGateNode.displayName = "HitlGateNode";

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl border bg-[#FFFCF6] p-3 shadow-soft transition-all ${
        selected ? "border-[#477A58] ring-2 ring-[#477A58]/25" : "border-[#E8DFD1]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-[#477A58] !border-2 !border-[#FFFCF6]"
      />

      <div className="flex items-center gap-2 border-b border-[#E8DFD1]/60 pb-2 mb-2">
        <div className="p-1 rounded-md bg-[#EDF5F0] text-[#477A58] border border-[#CDE3D5]">
          <CheckCircle2 size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-mono font-bold text-[#477A58] uppercase">ACTION & RECEIPT</span>
          <p className="text-xs font-bold text-[#29251F] truncate">{data.label as string}</p>
        </div>
      </div>
      <p className="text-[11px] text-[#777064] leading-relaxed">{data.subtext as string}</p>
      
      <div className="mt-2 pt-1.5 border-t border-[#E8DFD1]/60 flex items-center justify-between text-[10px] font-mono text-[#777064]">
        <span>Receipt: SHA-256 Valid</span>
        <Badge variant="verified" className="text-[8px] py-0 px-1">Verified</Badge>
      </div>
    </div>
  );
});
ActionNode.displayName = "ActionNode";

