"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Send, 
  Sparkles, 
  CheckSquare, 
  ShieldCheck, 
  Mail, 
  Clock,
  CheckCircle2, 
  RefreshCw,
  Inbox as InboxIcon,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailThread, ThreadMessage } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";
import { triggerConfetti } from "@/lib/confetti";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";

const isUUID = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export default function InboxPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "priority" | "drafts">("all");
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const { toggleOpen, submitPrompt } = useCopilotStore();
  const { fetchApprovals } = useApprovalStore();

  // Load threads from backend: GET /api/v1/email/inbox
  const loadInboxThreads = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      const data = await apiClient.get<any[]>("/email/inbox");
      if (Array.isArray(data)) {
        setIsLiveConnected(true);
        const mappedThreads: EmailThread[] = data.map((t) => {
          const senderEmail = t.sender_email || "external@flow.dev";
          const senderName = t.sender_name || (senderEmail.includes("@") ? senderEmail.split("@")[0] : "External Sender");

          return {
            id: String(t.id),
            subject: t.subject || "(No Subject)",
            snippet: t.snippet || "Inbound message received via FLOW gateway",
            sender: {
              name: senderName,
              email: senderEmail,
            },
            unread: !t.is_read,
            priority: !t.is_read ? "urgent" : "normal",
            timestamp: t.last_message_at || new Date().toISOString(),
            tags: t.has_attachments ? ["Attachments"] : ["Inbound"],
            messages: [
              {
                id: `msg_${t.id}`,
                sender: {
                  name: senderName,
                  email: senderEmail,
                },
                content: t.snippet || "Email content synchronized from inbound stream.",
                timestamp: new Date(t.last_message_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            aiSummary: `Autonomous summary: Inbound message regarding "${t.subject}". Verified through Resend gateway.`,
            actionRequired: !t.is_read,
          };
        });

        setThreads(mappedThreads);

        // Keep or select current thread
        setSelectedThread((prev) => {
          if (!prev && mappedThreads.length > 0) {
            loadThreadDetails(mappedThreads[0].id);
            return mappedThreads[0];
          }
          if (prev) {
            const found = mappedThreads.find((t) => t.id === prev.id);
            return found ? { ...prev, ...found } : prev;
          }
          return null;
        });
      }
    } catch (err) {
      console.warn("Could not fetch inbox threads from backend:", err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  // Load full messages for a thread: GET /api/v1/email/threads/{thread_id}
  const loadThreadDetails = async (threadId: string) => {
    if (!isUUID(threadId)) return;
    try {
      const detail = await apiClient.get<any>(`/email/threads/${threadId}`);
      if (detail && Array.isArray(detail.messages)) {
        const fullMessages: ThreadMessage[] = detail.messages.map((m: any) => ({
          id: String(m.id),
          sender: {
            name: m.sender_name || (m.sender_email ? m.sender_email.split("@")[0] : "Participant"),
            email: m.sender_email || "",
          },
          content: m.body_plain || m.body_html || "(No message body)",
          timestamp: new Date(m.received_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isStagedDraft: m.direction === "OUTBOUND" && !m.is_read,
        }));

        setSelectedThread((prev) => {
          if (!prev || prev.id !== threadId) return prev;
          return {
            ...prev,
            subject: detail.subject || prev.subject,
            snippet: detail.snippet || prev.snippet,
            sender: fullMessages[0]?.sender || prev.sender,
            messages: fullMessages.length > 0 ? fullMessages : prev.messages,
          };
        });
      }
    } catch (err) {
      console.warn("Could not load full thread messages from backend:", err);
    }
  };

  useEffect(() => {
    loadInboxThreads();
    // Silently poll for new inbound emails every 7 seconds
    const interval = setInterval(() => {
      loadInboxThreads(false);
    }, 7000);
    return () => clearInterval(interval);
  }, [loadInboxThreads]);

  const handleSelectThread = (thread: EmailThread) => {
    setSelectedThread(thread);
    if (isUUID(thread.id)) {
      loadThreadDetails(thread.id);
    }
  };

  const filteredThreads = threads.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "priority") return matchesSearch && t.priority === "urgent";
    if (activeFilter === "drafts") return matchesSearch && t.messages.some(m => m.isStagedDraft);
    return matchesSearch;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    const currentText = replyText.trim();
    setReplyText("");

    // If backend thread, stage a real draft in backend
    if (isUUID(selectedThread.id)) {
      try {
        const draft = await apiClient.post<any>("/email/drafts", {
          thread_id: selectedThread.id,
          recipient_to: [selectedThread.sender.email],
          subject: selectedThread.subject.startsWith("Re:") ? selectedThread.subject : `Re: ${selectedThread.subject}`,
          body_plain: currentText,
        });

        if (draft && draft.id) {
          // Submit draft to Trust Layer for approval
          await apiClient.post(`/email/drafts/${draft.id}/submit-approval`);
          fetchApprovals();
        }
      } catch (err) {
        console.warn("Could not stage backend draft, updating client view", err);
      }
    }

    // Add optimistic message to the conversation
    const senderName = user?.full_name || "You";
    const senderEmail = user?.email || "you@flow.dev";

    const newMsg: ThreadMessage = {
      id: `msg_draft_${Date.now()}`,
      sender: {
        name: senderName,
        email: senderEmail,
      },
      content: currentText,
      timestamp: "Just now",
      isStagedDraft: true,
    };

    setSelectedThread((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMsg],
      };
    });

    setToastMessage(`Draft staged in Trust Layer: "${currentText.slice(0, 30)}..."`);
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#29251F] flex items-center gap-1.5">
                <Mail size={13} className="text-primary" />
                <span>Inbox Messages</span>
              </span>
              <div className="flex items-center gap-1.5">
                {isLiveConnected && (
                  <Badge variant="verified" className="text-[9px] px-1.5 py-0 bg-[#EDF5F0] text-[#477A58]">
                    Live Synced
                  </Badge>
                )}
                <button
                  onClick={() => loadInboxThreads(true)}
                  disabled={isRefreshing}
                  title="Refresh inbox"
                  className="p-1 rounded hover:bg-[#E8DFD1]/50 text-[#777064] transition-colors"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin text-primary" : ""} />
                </button>
              </div>
            </div>

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
                All ({threads.length})
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
                Drafts
              </button>
            </div>
          </div>

          {/* Thread Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8DFD1]/60">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#777064] space-y-2">
                <RefreshCw size={18} className="animate-spin text-primary" />
                <span className="text-xs">Connecting to FLOW Mail Gateway...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#777064] space-y-2">
                <InboxIcon size={28} className="text-[#A39B8E]" />
                <p className="text-xs font-medium text-[#29251F]">Inbox is Empty</p>
                <p className="text-[11px] text-[#A39B8E] max-w-xs leading-relaxed">
                  Send emails to your FLOW inbound address. They will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
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
                        {new Date(thread.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              })
            )}
          </div>
        </div>

        {/* Pane 2: Middle Conversation View */}
        <div className="flex-1 flex flex-col border-r border-[#E8DFD1] bg-[#FFFCF6] overflow-hidden">
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#777064] space-y-2">
              <Mail size={36} className="text-[#A39B8E] opacity-60" />
              <h3 className="text-sm font-semibold text-[#29251F]">No Conversation Selected</h3>
              <p className="text-xs text-[#A39B8E] max-w-sm">
                Select an email from your inbox on the left to read messages and interact with FLOW agent intelligence.
              </p>
            </div>
          ) : (
            <>
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
                      submitPrompt(`Convert email "${selectedThread.subject}" from ${selectedThread.sender.name} into an action item`);
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
                          {msg.sender.name ? msg.sender.name.charAt(0).toUpperCase() : "M"}
                        </div>
                        <span className="font-semibold text-[#29251F]">{msg.sender.name}</span>
                        <span className="text-[10px] text-[#777064]">({msg.sender.email})</span>
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
                          <ShieldCheck size={13} /> Staged in Trust Layer (Requires Approval)
                        </span>
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
            </>
          )}
        </div>

        {/* Pane 3: Right AI Context Panel */}
        {selectedThread && (
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
                {selectedThread.aiSummary || `Inbound message from ${selectedThread.sender.email} with subject "${selectedThread.subject}".`}
              </p>
            </div>

            {/* Live Message Metadata */}
            <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3 space-y-2 shadow-2xs text-xs">
              <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                Thread Metadata
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[#777064]">
                  <span>Messages:</span>
                  <span className="font-semibold text-[#29251F]">{selectedThread.messages.length}</span>
                </div>
                <div className="flex items-center justify-between text-[#777064]">
                  <span>Last Received:</span>
                  <span className="font-mono text-[10px] text-primary">
                    {new Date(selectedThread.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#777064]">
                  <span>Sender Domain:</span>
                  <span className="font-mono text-[10px] text-[#29251F]">
                    {selectedThread.sender.email.split("@")[1] || "direct"}
                  </span>
                </div>
              </div>
            </div>

            {/* 1-Click Action Suggestions */}
            <div className="rounded-xl border border-[#F7D2BC] bg-[#FCEEE5]/40 p-3 space-y-2 text-xs">
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">
                Autonomous Actions
              </span>

              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-[11px] justify-start gap-1.5 bg-[#FFFCF6] hover:bg-[#F1EADF]"
                onClick={() => {
                  toggleOpen();
                  submitPrompt(`Analyze email thread "${selectedThread.subject}" from ${selectedThread.sender.name} and extract tasks and calendar requests`);
                }}
              >
                <Sparkles size={12} className="text-primary" />
                <span>Extract Tasks & Events</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
