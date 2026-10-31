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
  Bot,
  Brain,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldAlert
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

  const { approvals, approveAction, rejectAction } = useApprovalStore();
  const [localInput, setLocalInput] = useState("");
  const [expandedReasoningIds, setExpandedReasoningIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoningIds((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === undefined ? false : !prev[msgId],
    }));
  };

  const isReasoningExpanded = (msgId: string, isLatest: boolean) => {
    if (expandedReasoningIds[msgId] !== undefined) {
      return expandedReasoningIds[msgId];
    }
    return isLatest; // Default to open for the latest AI response
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim()) return;
    submitPrompt(localInput);
    setLocalInput("");
  };

  // Find real pending approval for HITL gate
  const pendingApprovals = approvals.filter(
    (a) => a.status === "pending" || a.status === "proposed"
  );
  const activeApproval = pendingApprovals[0];

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-[#29251F]/30 backdrop-blur-2xs xl:hidden animate-in fade-in"
        onClick={toggleOpen}
      />

      <aside
        className={cn(
          "flex flex-col border-l border-[#E8DFD1] bg-[#FFFCF6] z-50 transition-all duration-200 shadow-soft",
          isDocked 
            ? "fixed inset-y-0 right-0 w-full sm:w-[360px] xl:relative xl:w-[360px] 2xl:w-[400px] xl:z-30" 
            : "fixed right-4 bottom-4 top-16 w-full max-w-[420px] rounded-xl border-[#E8DFD1] shadow-elevated"
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
              <span className="text-[9px] text-[#477A58] font-mono leading-none flex items-center gap-1">
                <ShieldCheck size={9} /> Zero-Trust Guardrails Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleDocked}
              className="hidden xl:inline-flex p-1 text-[#777064] hover:text-[#29251F] rounded-md hover:bg-[#F1EADF]"
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

              {/* Real Pending Human Decision Gate */}
              {activeApproval && (
                <div className="mt-2.5 rounded-lg border border-[#F9E2BE] bg-[#FEF8ED] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#C58A32]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} /> Decision Required (HITL)
                    </span>
                    <Badge variant="outline" className="text-[9px] bg-white border-[#F9E2BE] text-[#C58A32]">
                      #{activeApproval.id.slice(0, 8)}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-medium text-[#29251F]">
                    {activeApproval.title}
                  </p>
                  <p className="text-[10px] text-[#777064]">
                    {activeApproval.description}
                  </p>
                  {activeApproval.diff?.entityType === "email" && activeApproval.diff?.after?.to && (
                    <div className="rounded bg-white/90 p-1.5 border border-[#F9E2BE] text-[10px] space-y-0.5 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-[#777064]">To:</span>
                        <span className="font-semibold text-[#29251F]">{activeApproval.diff.after.to}</span>
                      </div>
                      {activeApproval.diff.after.subject && (
                        <div className="truncate text-[#777064]">
                          Subject: <span className="text-[#29251F]">{activeApproval.diff.after.subject}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="success"
                      className="h-6 text-[11px] flex-1 gap-1"
                      onClick={() => approveAction(activeApproval.id)}
                    >
                      Authorize & Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-[11px] px-2"
                      onClick={() => rejectAction(activeApproval.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversation Stream */}
          {messages.map((msg, idx) => {
            const isLatestAi = msg.sender === "flow" && idx === messages.length - 1;
            const expanded = isReasoningExpanded(msg.id, isLatestAi);

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1 max-w-[95%] text-xs",
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Message Bubble */}
                <div
                  className={cn(
                    "rounded-xl p-3 leading-relaxed shadow-2xs space-y-2",
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-[#FFFCF6] border border-[#E8DFD1] text-[#29251F] rounded-bl-none"
                  )}
                >
                  <div className="whitespace-pre-line text-xs">
                    {msg.text}
                  </div>

                  {/* Agent Reasoning & Transparency Trace Accordion */}
                  {msg.sender === "flow" && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                    <div className="pt-1 border-t border-[#E8DFD1]/70">
                      <button
                        type="button"
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full flex items-center justify-between text-[10px] font-semibold text-primary hover:text-primary-hover py-1 transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <Brain size={12} />
                          <span>Agent Reasoning & Thinking Trace ({msg.reasoningSteps.length})</span>
                        </span>
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {expanded && (
                        <div className="mt-1 space-y-1.5 p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[10px] text-[#777064]">
                          {msg.reasoningSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-[#A39B8E] select-none font-mono text-[9px] mt-0.5">
                                {sIdx + 1}.
                              </span>
                              <span className="text-[#29251F]">
                                {step}
                              </span>
                            </div>
                          ))}
                          <div className="pt-1 text-[9px] text-[#477A58] font-mono flex items-center gap-1">
                            <ShieldCheck size={10} /> Verified by FLOW Zero-Trust Runtime
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-[#777064] font-mono px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#F7D2BC] bg-[#FCEEE5]/40 text-xs text-primary animate-pulse">
              <Brain size={14} className="animate-spin text-primary" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold">Reasoning & evaluating memory context...</span>
                <span className="text-[9px] text-[#777064]">Synthesizing multi-tool execution plan</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Input Box */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-[#E8DFD1] bg-[#FFFCF6]">
          <div className="relative flex items-center">
            <input
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Instruct FLOW (e.g. 'Schedule meeting with Sarah tomorrow')..."
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
    </>
  );
}
