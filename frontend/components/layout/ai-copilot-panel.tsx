"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    inputValue, 
    setInputValue, 
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
        "flex flex-col border-l border-white/5 bg-[#0D121B] z-30 transition-all duration-300 shadow-2xl",
        isDocked ? "w-[360px] lg:w-[400px]" : "fixed right-4 bottom-4 top-16 w-[420px] rounded-xl border-white/10"
      )}
    >
      {/* Copilot Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/5 bg-[#111827]/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
            <Sparkles size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">FLOW Copilot</span>
            <span className="text-[10px] text-emerald-400 font-mono">Agent Loop Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleDocked}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5"
            title={isDocked ? "Float Window" : "Dock Window"}
          >
            {isDocked ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button
            onClick={toggleOpen}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5"
            title="Close Copilot (⌘J)"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Execution DAG & Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Multi-step Plan DAG View */}
        {activePlan && (
          <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3.5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bot size={13} /> Active Agent Plan
              </span>
              <Badge variant="outline" className="text-[9px] border-primary/40 text-indigo-300">
                Step {activePlan.currentStepIndex} of {activePlan.steps.length}
              </Badge>
            </div>
            
            <p className="text-xs font-medium text-gray-200">{activePlan.goal}</p>

            <div className="space-y-1.5 pt-1">
              {activePlan.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg p-2 text-xs transition-all",
                    step.status === "completed"
                      ? "bg-white/[0.02] text-gray-400"
                      : step.status === "waiting_approval"
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium"
                      : "text-gray-500"
                  )}
                >
                  <div className="mt-0.5">
                    {step.status === "completed" ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : step.status === "waiting_approval" ? (
                      <Clock size={13} className="text-amber-400 animate-pulse" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{step.description}</p>
                    {step.output && (
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                        ↳ {step.output}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Human Approval Trigger */}
            <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <ShieldCheck size={14} /> Human Decision Required
              </div>
              <p className="text-[11px] text-gray-300">
                Reschedule 1:1 with Aditya to 4:00 PM and send confirmation email.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="success"
                  className="h-7 text-xs flex-1 gap-1"
                  onClick={() => approveAction("appr_101")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs px-2.5"
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
              "flex flex-col gap-1 max-w-[90%] text-xs",
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "rounded-xl p-3 leading-relaxed",
                msg.sender === "user"
                  ? "bg-primary text-white rounded-br-none shadow-md"
                  : "bg-card border border-white/5 text-gray-200 rounded-bl-none shadow-sm"
              )}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-500 font-mono px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
            <Sparkles size={14} />
            <span>Agent reasoning & retrieving context...</span>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-[#111827]/40">
        <div className="relative flex items-center">
          <Input
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Instruct FLOW (e.g. 'Schedule review with Aditya')..."
            className="pr-10 text-xs bg-card-subtle border-white/10 placeholder:text-gray-500 focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={!localInput.trim()}
            className="absolute right-2 p-1.5 text-primary hover:text-indigo-400 disabled:opacity-40 disabled:hover:text-primary transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-gray-500">
          <span>Proactive guardrails active</span>
          <kbd className="font-mono">Enter to plan</kbd>
        </div>
      </form>
    </aside>
  );
}

