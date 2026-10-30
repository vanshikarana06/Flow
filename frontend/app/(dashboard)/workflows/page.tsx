"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Play, 
  Clock, 
  Filter, 
  Settings2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion-primitives";
import { mockWorkflows } from "@/lib/mock-data";
import { WorkflowItem } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";

export default function WorkflowsPage() {
  const [workflows] = useState<WorkflowItem[]>(mockWorkflows);
  const { toggleOpen, submitPrompt } = useCopilotStore();

  return (
    <FadeIn className="space-y-5">
      {/* Workflows Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Workflow Pipelines</h1>
            <Badge variant="verified" className="text-[10px] font-mono">
              {workflows.length} ACTIVE AUTOMATIONS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Trigger-condition-action workflow sequences with integrated Human-in-the-Loop decision gates.
          </p>
        </div>

        <Button
          onClick={() => {
            toggleOpen();
            submitPrompt("Create a new workflow that converts incoming emails with tasks into calendar blocks");
          }}
          size="sm"
          className="text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] text-white"
        >
          <Sparkles size={13} />
          <span>New Workflow Pipeline</span>
        </Button>
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <Card key={wf.id} className="border-[#E8DFD1] bg-[#FFFCF6] shadow-soft overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E8DFD1] bg-[#F8F4EC]/60 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC]">
                  <Zap size={14} />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-[#29251F]">{wf.name}</CardTitle>
                  <p className="text-[10px] text-[#777064] mt-0.5">Trigger: {wf.trigger}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#777064]">
                  Last run: {wf.lastRun} • {wf.totalRuns} executions
                </span>
                <Badge variant={wf.hitlRequired ? "warning" : "verified"} className="text-[9px]">
                  {wf.hitlRequired ? "HITL Gate Required" : "Autonomous"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              <p className="text-[11px] text-[#777064] leading-relaxed">
                {wf.description}
              </p>

              {/* Zapier-Style Visual Pipeline Sequence */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                  Execution Pipeline Progression
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {wf.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        step.type === "hitl_gate"
                          ? "bg-[#FEF8ED] border-[#F9E2BE]"
                          : step.type === "trigger"
                          ? "bg-[#F8F4EC] border-[#E8DFD1]"
                          : step.type === "condition"
                          ? "bg-[#F8F4EC] border-[#E8DFD1]"
                          : "bg-[#EDF5F0]/60 border-[#CDE3D5]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-[#777064] uppercase">
                          Step {step.order}: {step.type.replace("_", " ")}
                        </span>
                        {step.type === "hitl_gate" && (
                          <ShieldCheck size={12} className="text-[#C58A32]" />
                        )}
                      </div>
                      <h5 className="font-semibold text-[#29251F] text-[11px]">{step.label}</h5>
                      <p className="text-[10px] text-[#777064] leading-snug line-clamp-2">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </FadeIn>
  );
}

