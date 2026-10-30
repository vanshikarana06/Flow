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
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex h-12 items-center justify-between px-4 border-b border-[#E8DFD1] bg-[#FFFCF6] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC]">
            <Bot size={14} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[#29251F]">FLOW Conversational Agent</h2>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex text-[9px] text-[#777064] border-[#E8DFD1]">
            Graph & Email Orchestrator
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#777064]">
          <span className="flex items-center gap-1 font-mono text-[#477A58]">
            <Shield size={12} /> HITL Guardrails Active
          </span>
          {pendingApprovals.length > 0 && (
            <Badge variant="warning" className="text-[9px] font-mono">
              {pendingApprovals.length} Staged Approvals
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Vertically Scrolling Conversation Canvas (Independent Scroll Container) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Manifesto & Trust Notice */}
          <div className="rounded-xl border border-[#E8DFD1] bg-[#F8F4EC]/60 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#29251F]">
              <Sparkles size={14} className="text-[#D97736]" />
              <span>Trust-First Agentic Interaction</span>
            </div>
            <p className="text-[#777064] leading-relaxed">
              FLOW interprets natural language requests, inspects connected workspace context across Google Workspace and Microsoft Graph, constructs verifiable execution plans, and strictly halts for your explicit approval before mutating external data.
            </p>
          </div>

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
            <div className="flex items-center gap-2 text-xs text-[#D97736] animate-pulse py-2">
              <Sparkles size={14} />
              <span>Querying Microsoft Graph and staging multi-step execution plan...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Sticky ChatGPT-Style Bottom Composer (Anchored to Chat Container) */}
      <div className="border-t border-[#E8DFD1] bg-[#FFFCF6] p-3.5 md:p-4 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Quick Prompt Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => submitPrompt(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#F1EADF] hover:bg-[#E5DCCE] text-[#777064] hover:text-[#29251F] border border-[#E8DFD1] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Multiline Textarea Composer Container */}
          <div className="relative rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-card focus-within:border-[#D97736] focus-within:ring-2 focus-within:ring-[#D97736]/20 transition-all p-2.5">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask FLOW to schedule, draft an email, or coordinate tasks..."
              className="w-full bg-transparent text-xs text-[#29251F] placeholder:text-[#A39B8E] focus:outline-none resize-none leading-relaxed min-h-[36px] max-h-[140px] px-1"
            />

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E8DFD1]/50 text-[11px] text-[#777064]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1 rounded-md text-[#777064] hover:text-[#29251F] hover:bg-[#F1EADF] transition-colors"
                  title="Attach Context from Calendar, Email, or Tasks"
                >
                  <Paperclip size={14} />
                </button>
                <span className="hidden sm:inline text-[10px]">
                  Press <kbd className="font-mono bg-[#F1EADF] px-1 py-0.5 rounded border border-[#E8DFD1]">Enter ↵</kbd> to send, <kbd className="font-mono bg-[#F1EADF] px-1 py-0.5 rounded border border-[#E8DFD1]">Shift+Enter</kbd> for newline
                </span>
              </div>

              {/* Orange Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!inputVal.trim() || isGenerating}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D97736] hover:bg-[#B95727] disabled:opacity-40 text-white shadow-2xs transition-all active:scale-95"
                title="Send Instruction"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
