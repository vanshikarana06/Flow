"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowUp, 
  Paperclip, 
  Sparkles, 
  X, 
  Bot, 
  Cpu, 
  FileText,
  CornerDownLeft,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface V0ChatProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (prompt: string, model?: string, attachments?: string[]) => void;
  isGenerating?: boolean;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function VercelV0Chat({
  value,
  onChange,
  onSubmit,
  isGenerating = false,
  placeholder = "Ask FLOW to schedule, draft an email, or coordinate tasks...",
  suggestions = [
    "Reschedule sync with Aditya to 4:00 PM",
    "Draft reply regarding pgvector database migration",
    "Audit today's calendar collisions",
    "Decompose Hackathon Release into subtasks",
  ],
  className = "",
}: V0ChatProps) {
  const [selectedModel, setSelectedModel] = useState<"reasoning" | "fast">("reasoning");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim() || isGenerating) return;
    onSubmit(value, selectedModel, attachments);
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const addAttachment = () => {
    const samples = ["Calendar Context (Oct 31)", "Draft RFC Doc", "Idempotency Hash #9921"];
    const unadded = samples.filter((s) => !attachments.includes(s));
    if (unadded.length > 0) {
      setAttachments([...attachments, unadded[0]]);
    }
  };

  const removeAttachment = (item: string) => {
    setAttachments(attachments.filter((a) => a !== item));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Suggestions Pills */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] shrink-0 flex items-center gap-1 mr-1">
            <Sparkles size={11} className="text-primary" /> Suggestions:
          </span>
          {suggestions.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(prompt);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }}
              className="shrink-0 rounded-full border border-[#E8DFD1] bg-[#FFFCF6] px-3 py-1 text-[11px] text-[#777064] hover:border-primary hover:text-primary hover:bg-[#FCEEE5]/40 transition-all active:scale-95 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] p-3 shadow-soft transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
        {/* Attached Context Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#E8DFD1]/60 mb-2">
            {attachments.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1EADF] text-[#29251F] text-[11px] font-mono border border-[#E8DFD1]"
              >
                <FileText size={11} className="text-[#777064]" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(item)}
                  className="hover:text-[#C65345] ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Text Area */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full border-none bg-transparent p-1 text-xs sm:text-sm text-[#29251F] placeholder:text-[#A39B8E] focus-visible:ring-0 shadow-none leading-relaxed"
        />

        {/* Bottom Toolbar & Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD1]/60 mt-1">
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={addAttachment}
              className="flex items-center gap-1 rounded-md p-1.5 text-[#777064] hover:bg-[#F1EADF] hover:text-[#29251F] text-xs transition-colors"
              title="Attach context file or schedule"
            >
              <Paperclip size={14} />
              <span className="hidden sm:inline text-[11px]">Context</span>
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1.5 rounded-full border border-[#E8DFD1] bg-[#F1EADF]/60 px-2.5 py-1 text-[11px] font-medium text-[#29251F] hover:border-primary transition-all"
              >
                {selectedModel === "reasoning" ? (
                  <>
                    <Bot size={12} className="text-primary" />
                    <span>FLOW Reasoning v2</span>
                  </>
                ) : (
                  <>
                    <Cpu size={12} className="text-[#477A58]" />
                    <span>Fast Execution</span>
                  </>
                )}
                <ChevronDown size={10} className="text-[#777064]" />
              </button>

              {showModelDropdown && (
                <div className="absolute left-0 bottom-full mb-1 w-48 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-1.5 shadow-elevated z-20 space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel("reasoning");
                      setShowModelDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-2 rounded-lg p-2 text-left transition-colors",
                      selectedModel === "reasoning" ? "bg-[#FCEEE5] text-primary" : "hover:bg-[#F1EADF]"
                    )}
                  >
                    <Bot size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-xs text-[#29251F]">FLOW Reasoning v2</p>
                      <p className="text-[10px] text-[#777064]">Deep multi-step planning & HITL guardrails</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel("fast");
                      setShowModelDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-2 rounded-lg p-2 text-left transition-colors",
                      selectedModel === "fast" ? "bg-[#EDF5F0] text-[#477A58]" : "hover:bg-[#F1EADF]"
                    )}
                  >
                    <Cpu size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-xs text-[#29251F]">Fast Execution</p>
                      <p className="text-[10px] text-[#777064]">Direct single-action dispatches</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <span className="hidden md:inline text-[10px] text-[#A39B8E] font-mono">
              Press Enter ↵ to dispatch
            </span>
          </div>

          {/* Send / Dispatch Button */}
          <button
            type="button"
            disabled={!value.trim() || isGenerating}
            onClick={handleSend}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3.5 rounded-lg font-semibold text-xs transition-all active:scale-95 shadow-2xs",
              value.trim() && !isGenerating
                ? "bg-primary text-white hover:bg-primary-hover"
                : "bg-[#F1EADF] text-[#A39B8E] cursor-not-allowed"
            )}
          >
            <span>{isGenerating ? "Reasoning..." : "Dispatch"}</span>
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

