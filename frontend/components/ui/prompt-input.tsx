"use client";

import React, { useRef, useEffect } from "react";
import { Paperclip, ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "./shimmer-button";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isGenerating?: boolean;
  className?: string;
  suggestions?: { label: string; prompt: string }[];
  onSelectSuggestion?: (prompt: string) => void;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask FLOW to schedule, draft an email, or coordinate tasks...",
  isGenerating = false,
  className,
  suggestions = [],
  onSelectSuggestion,
}: PromptInputProps) {
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
      if (value.trim() && !isGenerating) {
        onSubmit();
      }
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="relative rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-card focus-within:border-[#D97736] focus-within:ring-2 focus-within:ring-[#D97736]/20 transition-all p-3">
        <textarea
          ref={textareaRef}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs sm:text-sm text-[#29251F] placeholder:text-[#A39B8E] focus:outline-none resize-none leading-relaxed px-1 min-h-[46px] max-h-[160px]"
        />

        <div className="flex items-center justify-between pt-2.5 border-t border-[#E8DFD1]/60 text-[11px] text-[#777064]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-lg text-[#777064] hover:text-[#29251F] hover:bg-[#F1EADF] transition-colors"
              title="Attach Context from Calendar, Email, or Tasks"
            >
              <Paperclip size={14} />
            </button>
            <span className="hidden sm:inline text-[10px]">
              Press <kbd className="font-mono bg-[#F1EADF] px-1.5 py-0.5 rounded border border-[#E8DFD1]">Enter ↵</kbd> to dispatch, <kbd className="font-mono bg-[#F1EADF] px-1.5 py-0.5 rounded border border-[#E8DFD1]">Shift+Enter</kbd> for newline
            </span>
          </div>

          <ShimmerButton
            onClick={onSubmit}
            disabled={!value.trim() || isGenerating}
            shimmerColor="rgba(255, 255, 255, 0.4)"
            background="#D97736"
            className="h-7 px-3 text-xs gap-1.5"
          >
            <span>Dispatch</span>
            <ArrowUp size={13} />
          </ShimmerButton>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-[#777064] font-medium text-[10px] uppercase font-mono mr-1 shrink-0 flex items-center gap-1">
            <Sparkles size={11} className="text-[#D97736]" /> Suggestions:
          </span>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion?.(item.prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#F1EADF] hover:bg-[#E5DCCE] text-[#777064] hover:text-[#29251F] border border-[#E8DFD1] transition-colors shrink-0 text-[11px]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
