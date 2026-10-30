"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Bot, 
  Terminal, 
  Paperclip,
  ArrowUp,
  Shield,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlowAgentOrb } from "@/components/ui/flow-agent-orb";
import { FadeIn } from "@/components/ui/motion-primitives";
import { PromptInput } from "@/components/ui/prompt-input";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function AiStudioPage() {
  const { activePlan, messages, submitPrompt, isGenerating } = useCopilotStore();
  const { approvals, approveAction, rejectAction } = useApprovalStore();
  
  const [inputVal, setInputVal] = useState("");
  const [showReasoning, setShowReasoning] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, activePlan]);

  // Handle textarea auto-resizing
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputVal.trim() || isGenerating) return;
    submitPrompt(inputVal);
    setInputVal("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const promptChips = [
    "Reschedule sync with Aditya to 4:00 PM",
    "Draft reply regarding pgvector database migration",
    "Audit today's calendar collisions",
    "Decompose Hackathon Release into subtasks",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-soft overflow-hidden">
      {/* 1. Studio Header Bar */}
      <div className="flex h-14 items-center justify-between px-5 border-b border-[#E8DFD1] bg-[#FFFCF6] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC] shadow-2xs">
            <Bot size={16} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#29251F]">FLOW AI Workspace</h1>
            <p className="text-[11px] text-[#777064]">Autonomous workspace reasoning & multi-step execution</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#777064]">
          <span className="inline-flex items-center gap-1.5 font-mono text-[#477A58] bg-[#EBF3ED] px-2.5 py-1 rounded-md border border-[#D1E3D7] text-[11px]">
            <Shield size={12} /> HITL Guardrails Active
          </span>
          {pendingApprovals.length > 0 && (
            <Badge variant="warning" className="text-[10px] font-mono px-2 py-0.5">
              {pendingApprovals.length} Staged Approvals
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Vertically Scrolling Conversation Canvas (Independent Scroll Container) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <FadeIn className="text-center py-8 space-y-4">
              <div className="flex justify-center mb-2">
                <FlowAgentOrb size={90} glow={true} isProcessing={isGenerating} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-[#29251F]">How can FLOW assist you today?</h2>
                <p className="text-xs text-[#777064] max-w-md mx-auto leading-relaxed">
                  FLOW coordinates calendar schedules, drafts high-context emails, audits tasks, and organizes your workspace under strict human oversight.
                </p>
              </div>
            </FadeIn>
          )}

          {/* Cursor-Style Active Plan Execution DAG */}
          {activePlan && (
            <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-2 text-xs">
                <span className="font-semibold text-[#29251F] flex items-center gap-1.5">
                  <Terminal size={14} className="text-[#D97736]" /> Plan: {activePlan.goal}
                </span>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center gap-1 text-[10px] text-[#777064] hover:text-[#29251F] font-mono"
                >
                  <span>Stage {activePlan.currentStepIndex} of {activePlan.steps.length}</span>
                  {showReasoning ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showReasoning && (
                <div className="space-y-1.5">
                  {activePlan.steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-start justify-between p-2.5 rounded-lg border text-xs transition-all ${
                        step.status === "completed"
                          ? "bg-[#F1EADF]/30 border-[#E8DFD1] text-[#777064]"
                          : step.status === "waiting_approval"
                          ? "bg-[#FEF8ED] border-[#F9E2BE] text-[#C58A32]"
                          : "bg-transparent border-dashed border-[#D0C4B2] text-[#A39B8E]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {step.status === "completed" ? (
                            <CheckCircle2 size={14} className="text-[#477A58]" />
                          ) : step.status === "waiting_approval" ? (
                            <Clock size={14} className="text-[#C58A32] animate-pulse" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-[#D0C4B2]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#29251F]">{step.description}</p>
                          <p className="text-[10px] text-[#777064] font-mono mt-0.5">
                            Tool: <span className="text-[#D97736]">{step.tool}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant={
                            step.status === "completed"
                              ? "success"
                              : step.status === "waiting_approval"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[9px] uppercase font-mono"
                        >
                          {step.status.replace("_", " ")}
                        </Badge>
                        {step.output && (
                          <p className="text-[10px] text-[#777064] font-mono mt-1">
                            ↳ {step.output}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* In-Chat Decision Gate Card (Consequential Action Safeguard) */}
              {pendingApprovals.length > 0 && (
                <div className="mt-3 p-3.5 rounded-lg border border-[#F9E2BE] bg-[#FEF8ED] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#C58A32] flex items-center gap-1.5">
                      <ShieldCheck size={14} /> Explicit Human Approval Required ({pendingApprovals[0].id})
                    </span>
                    <p className="text-[11px] text-[#777064] mt-0.5 leading-relaxed">
                      {pendingApprovals[0].title}. Target: {pendingApprovals[0].targetService}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      className="h-7 text-xs font-semibold bg-[#477A58] hover:bg-[#3D6A4C] text-white"
                      onClick={() => approveAction(pendingApprovals[0].id)}
                    >
                      Approve & Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => rejectAction(pendingApprovals[0].id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversation Messages Stream */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "flow" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC] font-bold text-xs mt-0.5 shadow-2xs">
                  F
                </div>
              )}

              <div
                className={`rounded-2xl p-4 max-w-xl leading-relaxed text-xs shadow-2xs ${
                  msg.sender === "user"
                    ? "bg-[#FCEEE5] border border-[#F7D2BC] text-[#29251F] rounded-br-none"
                    : "bg-[#FFFCF6] border border-[#E8DFD1] text-[#29251F] rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                <div
                  className="mt-1.5 text-[9px] font-mono text-right text-[#777064]"
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#F7D2BC] bg-[#FCEEE5]/60 text-xs shadow-2xs">
              <FlowAgentOrb size={32} isProcessing={true} glow={false} />
              <div className="space-y-0.5">
                <p className="font-semibold text-[#29251F]">Querying Microsoft Graph & Staging Plan...</p>
                <p className="text-[11px] text-[#777064]">Evaluating constraints and calculating optimal scheduling parameters.</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Sticky Bottom Composer (21st.dev Prompt Input) */}
      <div className="border-t border-[#E8DFD1] bg-[#FFFCF6] p-3.5 md:p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <PromptInput
            value={inputVal}
            onChange={setInputVal}
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
            placeholder="Ask FLOW to schedule, draft an email, or coordinate tasks..."
            suggestions={promptChips.map((c) => ({ label: c, prompt: c }))}
            onSelectSuggestion={(prompt) => submitPrompt(prompt)}
          />
        </div>
      </div>
    </div>
  );
}
