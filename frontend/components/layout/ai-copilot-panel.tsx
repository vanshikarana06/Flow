"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";
import { cn } from "@/lib/utils";

export function AiCopilotPanel() {
  const { 
    isOpen, 
    toggleOpen, 
    isDocked, 
    toggleDocked, 
    activePlan, 
    messages, 
    submitPrompt,
    isGenerating 
  } = useCopilotStore();

  const { approveAction, rejectAction } = useApprovalStore();
  const [localInput, setLocalInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim()) return;
    submitPrompt(localInput);
    setLocalInput("");
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-l border-[#E8DFD1] bg-[#FFFCF6] z-30 transition-all duration-200 shadow-soft",
        isDocked ? "w-[340px] lg:w-[380px]" : "fixed right-4 bottom-4 top-16 w-[400px] rounded-xl border-[#E8DFD1] shadow-elevated"
      )}
    >
      {/* Copilot Header */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-[#E8DFD1] bg-[#FFFCF6]">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
            <Sparkles size={13} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#29251F]">FLOW Copilot</span>
            <span className="text-[9px] text-[#477A58] font-mono leading-none">Guardrails Active</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleDocked}
            className="p-1 text-[#777064] hover:text-[#29251F] rounded-md hover:bg-[#F1EADF]"
            title={isDocked ? "Float Window" : "Dock Window"}
          >
            {isDocked ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button
            onClick={toggleOpen}
            className="p-1 text-[#777064] hover:text-[#29251F] rounded-md hover:bg-[#F1EADF]"
            title="Close Copilot (⌘J)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Execution DAG & Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#F8F4EC]/40">
        {/* Active Multi-step Plan DAG View */}
        {activePlan && (
          <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Bot size={12} /> Execution Plan
              </span>
              <Badge variant="outline" className="text-[9px] border-[#E8DFD1] text-[#777064]">
                Step {activePlan.currentStepIndex} of {activePlan.steps.length}
              </Badge>
            </div>
            
            <p className="text-xs font-semibold text-[#29251F]">{activePlan.goal}</p>

            <div className="space-y-1 pt-0.5">
              {activePlan.steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg p-2 text-xs transition-all",
                    step.status === "completed"
                      ? "bg-[#F1EADF]/40 text-[#777064]"
                      : step.status === "waiting_approval"
                      ? "bg-[#FEF8ED] border border-[#F9E2BE] text-[#C58A32] font-medium"
                      : "text-[#A39B8E]"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle2 size={13} className="text-[#477A58]" />
                    ) : step.status === "waiting_approval" ? (
                      <Clock size={13} className="text-[#C58A32] animate-pulse" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-[#D0C4B2]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[11px]">{step.description}</p>
                    {step.output && (
                      <p className="text-[9px] text-[#777064] font-mono mt-0.5 truncate">
                        ↳ {step.output}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Human Decision Prompt */}
            <div className="mt-2.5 rounded-lg border border-[#F9E2BE] bg-[#FEF8ED] p-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C58A32]">
                <ShieldCheck size={13} /> Decision Required
              </div>
              <p className="text-[11px] text-[#777064]">
                Reschedule 1:1 with Aditya to 4:00 PM and send confirmation notice.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant="success"
                  className="h-6 text-[11px] flex-1 gap-1"
                  onClick={() => approveAction("appr_101")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 text-[11px] px-2"
                  onClick={() => rejectAction("appr_101")}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-1 max-w-[92%] text-xs",
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "rounded-xl p-3 leading-relaxed shadow-2xs",
                msg.sender === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-[#FFFCF6] border border-[#E8DFD1] text-[#29251F] rounded-bl-none"
              )}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-[#777064] font-mono px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
            <Sparkles size={13} />
            <span className="text-[11px]">Reasoning & retrieving context...</span>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#E8DFD1] bg-[#FFFCF6]">
        <div className="relative flex items-center">
          <input
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Instruct FLOW (e.g. 'Move meeting to 4 PM')..."
            className="w-full h-8 pl-3 pr-9 rounded-lg border border-[#E8DFD1] bg-[#F1EADF]/60 text-xs text-[#29251F] placeholder:text-[#A39B8E] focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!localInput.trim()}
            className="absolute right-1.5 p-1 rounded-md text-primary hover:text-primary-hover disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </form>
    </aside>
  );
}
