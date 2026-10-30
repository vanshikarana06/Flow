"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Bot, 
  User, 
  Layers, 
  Cpu, 
  ArrowRight,
  Terminal,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function AiStudioPage() {
  const { activePlan, messages, submitPrompt, isGenerating } = useCopilotStore();
  const { approveAction, rejectAction } = useApprovalStore();
  const [inputVal, setInputVal] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    submitPrompt(inputVal);
    setInputVal("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-xl border border-white/5 bg-card overflow-hidden shadow-2xl">
      {/* Studio Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111827]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Assistant Studio & Plan Visualizer</h2>
            <p className="text-[10px] text-gray-400 font-mono">ChatGPT Naturalness + Cursor Plan Execution DAG</p>
          </div>
        </div>

        <Badge variant="verified" className="text-[10px]">
          HITL Guardrails Active
        </Badge>
      </div>

      {/* Main Conversation & Plan Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Sample Interaction Banner */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Bot size={15} />
            <span>Interactive Multi-Step Execution DAG</span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            When you instruct FLOW, it decomposes natural language into discrete tool actions across your connected integrations (Microsoft Graph, Gmail, Supabase, Task Store), staging consequential changes for human approval.
          </p>

          {/* Visual Plan DAG */}
          {activePlan && (
            <div className="rounded-xl border border-white/10 bg-[#0B0F14] p-4 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary" /> Goal: {activePlan.goal}
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  Stage {activePlan.currentStepIndex} of {activePlan.steps.length}
                </span>
              </div>

              <div className="space-y-2">
                {activePlan.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex items-start justify-between p-3 rounded-lg border text-xs transition-all ${
                      step.status === "completed"
                        ? "bg-white/[0.02] border-white/5 text-gray-300"
                        : step.status === "waiting_approval"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                        : "bg-transparent border-dashed border-gray-700 text-gray-500"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {step.status === "completed" ? (
                          <CheckCircle2 size={15} className="text-emerald-400" />
                        ) : step.status === "waiting_approval" ? (
                          <Clock size={15} className="text-amber-400 animate-pulse" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{step.description}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                          Tool: <span className="text-indigo-400">{step.tool}</span>
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
                        <p className="text-[10px] text-gray-400 font-mono mt-1">
                          {step.output}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Staged Card */}
              <div className="mt-3 p-3.5 rounded-lg border border-amber-500/40 bg-amber-500/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Action Intercepted (#APPR-101)
                  </span>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Calendar reschedule & outbound email confirmation staged for human approval.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    className="h-7 text-xs font-semibold"
                    onClick={() => approveAction("appr_101")}
                  >
                    Approve Action
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={() => rejectAction("appr_101")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "flow" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30 font-bold">
                F
              </div>
            )}
            <div
              className={`rounded-xl p-3.5 max-w-xl leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-[#0B0F14] border border-white/5 text-gray-200"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
            <Sparkles size={14} />
            <span>Agent synthesizing context and orchestrating tools...</span>
          </div>
        )}
      </div>

      {/* Input Prompt Dock */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#111827]/80">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Instruct FLOW (e.g. 'Schedule review with Aditya and email him the summary')..."
            className="h-11 pr-12 text-xs bg-card-subtle border-white/10 placeholder:text-gray-500"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputVal.trim()}
            className="absolute right-1.5 h-8 w-8 p-0"
          >
            <Send size={14} />
          </Button>
        </div>
      </form>
    </div>
  );
}

