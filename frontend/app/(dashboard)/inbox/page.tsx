"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Send, 
  Sparkles, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  ArrowRight,
  User,
  Paperclip
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockThreads } from "@/lib/mock-data";
import { EmailThread } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export default function InboxPage() {
  const [selectedThread, setSelectedThread] = useState<EmailThread>(mockThreads[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleOpen, submitPrompt } = useCopilotStore();
  const { approveAction } = useApprovalStore();

  const filteredThreads = mockThreads.filter((t) =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-xl border border-white/5 bg-card overflow-hidden shadow-2xl">
      {/* 3-Pane Fluid Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pane 1: Left Threads List */}
        <div className="w-80 md:w-96 border-r border-white/5 flex flex-col bg-[#0B0F14]/60">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-white/5 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads, senders... (⌘F)"
                className="pl-9 h-8 text-xs bg-card-subtle"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-gray-400">
              <Badge variant="default" className="text-[10px] cursor-pointer">
                All (3)
              </Badge>
              <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-white/5">
                Priority
              </Badge>
              <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-white/5">
                Drafts (1)
              </Badge>
            </div>
          </div>

          {/* Thread Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredThreads.map((thread) => {
              const isSelected = selectedThread.id === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-3.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isSelected ? "text-white" : "text-gray-200"}`}>
                      {thread.sender.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-gray-200 truncate">{thread.subject}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{thread.snippet}</p>

                  <div className="flex items-center gap-1.5 mt-2">
                    {thread.priority === "urgent" && (
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                        Urgent
                      </Badge>
                    )}
                    {thread.actionRequired && (
                      <Badge variant="warning" className="text-[9px] px-1.5 py-0">
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
        <div className="flex-1 flex flex-col border-r border-white/5 bg-[#111827]/30 overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-card">
            <div>
              <h2 className="text-sm font-semibold text-white">{selectedThread.subject}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                From: <span className="text-gray-200">{selectedThread.sender.name}</span> ({selectedThread.sender.email})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-white/10 gap-1.5"
                onClick={() => {
                  toggleOpen();
                  submitPrompt(`Convert email "${selectedThread.subject}" into a scheduled task`);
                }}
              >
                <CheckSquare size={13} className="text-indigo-400" />
                <span>Email to Task</span>
              </Button>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 space-y-2 ${
                  msg.isStagedDraft
                    ? "border-amber-500/40 bg-amber-500/[0.04]"
                    : "border-white/5 bg-card"
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-gray-200">
                      {msg.sender.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-200">{msg.sender.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{msg.timestamp}</span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>

                {/* Staged Draft HITL Decision Controls */}
                {msg.isStagedDraft && (
                  <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                      <ShieldCheck size={14} /> Pending Your Review Before Dispatch
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        className="h-7 text-xs font-semibold gap-1"
                        onClick={() => approveAction("appr_102")}
                      >
                        <Send size={12} />
                        <span>Approve & Send</span>
                      </Button>
                      <Button size="sm" variant="secondary" className="h-7 text-xs">
                        Modify
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pane 3: Right AI Insights Panel */}
        <div className="hidden xl:flex w-80 flex-col bg-[#0E141E] p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 border-b border-white/5 pb-2">
            <Sparkles size={15} className="text-primary" />
            <span>FLOW Email Intelligence</span>
          </div>

          {/* AI Executive Summary */}
          <div className="rounded-xl border border-white/5 bg-card p-3 space-y-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Thread Summary
            </span>
            <p className="text-xs text-gray-300 leading-relaxed">
              {selectedThread.aiSummary}
            </p>
          </div>

          {/* Extracted Entities */}
          <div className="rounded-xl border border-white/5 bg-card p-3 space-y-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Context Extracted
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>Implicit Deadline:</span>
                <span className="font-semibold text-amber-300">Today, 3:00 PM</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Key Tech Domain:</span>
                <span className="font-mono text-[11px] text-indigo-300">pgvector / Alembic</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Sender Tone:</span>
                <span className="text-emerald-400">Collaborative • Urgent</span>
              </div>
            </div>
          </div>

          {/* 1-Click Action Suggestions */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3 space-y-2.5">
            <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
              Suggested Next Actions
            </span>

            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs justify-start gap-2 border-white/10 hover:bg-white/5"
              onClick={() => {
                toggleOpen();
                submitPrompt("Create task to test database migrations before 3 PM");
              }}
            >
              <CheckSquare size={13} className="text-primary" />
              <span>Create Task for 3:00 PM</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs justify-start gap-2 border-white/10 hover:bg-white/5"
              onClick={() => {
                toggleOpen();
                submitPrompt("Block 45 minutes on calendar to review pgvector schema with Aditya");
              }}
            >
              <CalendarIcon size={13} className="text-emerald-400" />
              <span>Block Focus Review Slot</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

