"use client";

import React, { useState } from "react";
import { 
  Search, 
  Send, 
  Sparkles, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  User, 
  Clock, 
  Mail, 
  ChevronRight,
  Reply,
  CheckCircle2,
  Paperclip
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockThreads } from "@/lib/mock-data";
import { EmailThread } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";
import { triggerConfetti } from "@/lib/confetti";

export default function InboxPage() {
  const [selectedThread, setSelectedThread] = useState<EmailThread>(mockThreads[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "priority" | "drafts">("all");
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { toggleOpen, submitPrompt } = useCopilotStore();
  const { approveAction } = useApprovalStore();

  const filteredThreads = mockThreads.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "priority") return matchesSearch && t.priority === "urgent";
    if (activeFilter === "drafts") return matchesSearch && t.messages.some(m => m.isStagedDraft);
    return matchesSearch;
  });

  const handleApproveSend = () => {
    approveAction("appr_102");
    setToastMessage("Architecture RFC Reply Approved & Dispatched via Resend Gateway.");
    triggerConfetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setToastMessage(`Draft staged for approval: "${replyText.slice(0, 30)}..."`);
    setReplyText("");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-soft overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] text-xs font-semibold shadow-elevated animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-Pane Fluid Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pane 1: Left Threads List */}
        <div className="w-80 md:w-88 border-r border-[#E8DFD1] flex flex-col bg-[#F8F4EC]/50 shrink-0">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-[#E8DFD1] space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-[#A39B8E]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads, senders..."
                className="pl-8 h-8 text-xs bg-[#FFFCF6]"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-[#777064]">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  activeFilter === "all" ? "bg-primary text-white shadow-2xs font-semibold" : "bg-[#FFFCF6] border border-[#E8DFD1] text-[#777064]"
                }`}
              >
                All ({mockThreads.length})
              </button>
              <button
                onClick={() => setActiveFilter("priority")}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  activeFilter === "priority" ? "bg-primary text-white shadow-2xs font-semibold" : "bg-[#FFFCF6] border border-[#E8DFD1] text-[#777064]"
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setActiveFilter("drafts")}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  activeFilter === "drafts" ? "bg-primary text-white shadow-2xs font-semibold" : "bg-[#FFFCF6] border border-[#E8DFD1] text-[#777064]"
                }`}
              >
                Drafts (1)
              </button>
            </div>
          </div>

          {/* Thread Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8DFD1]/60">
            {filteredThreads.map((thread) => {
              const isSelected = selectedThread.id === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-3.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[#FCEEE5]/60 border-l-2 border-primary"
                      : "hover:bg-[#F1EADF]/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isSelected ? "text-primary" : "text-[#29251F]"}`}>
                      {thread.sender.name}
                    </span>
                    <span className="text-[10px] text-[#777064] font-mono">
                      {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-[#29251F] truncate">{thread.subject}</h4>
                  <p className="text-[11px] text-[#777064] line-clamp-1 mt-0.5">{thread.snippet}</p>

                  <div className="flex items-center gap-1.5 mt-2">
                    {thread.priority === "urgent" && (
                      <Badge variant="destructive" className="text-[8px] px-1.5 py-0">
                        Urgent
                      </Badge>
                    )}
                    {thread.actionRequired && (
                      <Badge variant="warning" className="text-[8px] px-1.5 py-0">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pane 2: Middle Conversation View */}
        <div className="flex-1 flex flex-col border-r border-[#E8DFD1] bg-[#FFFCF6] overflow-hidden">
          {/* Thread Header */}
          <div className="p-3.5 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FFFCF6]">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#29251F] leading-snug">{selectedThread.subject}</h2>
              <p className="text-[11px] text-[#777064] mt-0.5">
                From: <span className="text-[#29251F] font-medium">{selectedThread.sender.name}</span> ({selectedThread.sender.email})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-[11px] gap-1.5"
                onClick={() => {
                  toggleOpen();
                  submitPrompt(`Convert email "${selectedThread.subject}" into a scheduled task`);
                }}
              >
                <CheckSquare size={12} className="text-primary" />
                <span>Email to Task</span>
              </Button>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8F4EC]/30">
            {selectedThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 space-y-2 text-xs shadow-2xs ${
                  msg.isStagedDraft
                    ? "border-[#F9E2BE] bg-[#FEF8ED]"
                    : "border-[#E8DFD1] bg-[#FFFCF6]"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD1]/60">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1EADF] text-[10px] font-bold text-[#29251F]">
                      {msg.sender.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-[#29251F]">{msg.sender.name}</span>
                  </div>
                  <span className="text-[10px] text-[#777064] font-mono">{msg.timestamp}</span>
                </div>

                <p className="text-[#29251F] leading-relaxed whitespace-pre-line text-xs">
                  {msg.content}
                </p>

                {/* Staged Draft Decision Controls */}
                {msg.isStagedDraft && (
                  <div className="pt-2.5 border-t border-[#F9E2BE] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-[#C58A32] font-semibold flex items-center gap-1.5">
                      <ShieldCheck size={13} /> Decision Required Before Dispatch
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        className="h-6 text-[11px] font-semibold gap-1"
                        onClick={handleApproveSend}
                      >
                        <Send size={11} />
                        <span>Approve & Send</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Inline Reply Composer */}
          <form onSubmit={handleSendReply} className="p-3 border-t border-[#E8DFD1] bg-[#FFFCF6] flex items-center gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${selectedThread.sender.name}...`}
              className="flex-1 h-9 px-3 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F] placeholder:text-[#A39B8E] focus:outline-none focus:border-primary"
            />
            <Button
              type="submit"
              disabled={!replyText.trim()}
              size="sm"
              className="h-9 px-3 text-xs bg-primary hover:bg-primary-hover text-white gap-1"
            >
              <Send size={12} />
              <span>Send</span>
            </Button>
          </form>
        </div>

        {/* Pane 3: Right AI Context Panel */}
        <div className="hidden xl:flex w-76 flex-col bg-[#F8F4EC]/60 p-4 space-y-3.5 overflow-y-auto shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#29251F] border-b border-[#E8DFD1] pb-2">
            <Sparkles size={15} className="text-primary" />
            <span>Thread Intelligence</span>
          </div>

          {/* AI Executive Summary */}
          <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3 space-y-1 shadow-2xs">
            <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
              Summary
            </span>
            <p className="text-xs text-[#29251F] leading-relaxed">
              {selectedThread.aiSummary}
            </p>
          </div>

          {/* Extracted Context */}
          <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3 space-y-2 shadow-2xs text-xs">
            <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
              Extracted Context
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-[#777064]">
                <span>Implicit Deadline:</span>
                <span className="font-semibold text-[#C58A32]">Today, 3:00 PM</span>
              </div>
              <div className="flex items-center justify-between text-[#777064]">
                <span>Domain Focus:</span>
                <span className="font-mono text-[10px] text-primary">pgvector / Alembic</span>
              </div>
            </div>
          </div>

          {/* 1-Click Action Suggestions */}
          <div className="rounded-xl border border-[#F7D2BC] bg-[#FCEEE5]/40 p-3 space-y-2 text-xs">
            <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">
              Suggested Next Actions
            </span>

            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-[11px] justify-start gap-1.5 bg-[#FFFCF6] hover:bg-[#F1EADF]"
              onClick={() => {
                toggleOpen();
                submitPrompt("Create task to test database migrations before 3 PM");
              }}
            >
              <CheckSquare size={12} className="text-primary" />
              <span>Create Task for 3:00 PM</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
