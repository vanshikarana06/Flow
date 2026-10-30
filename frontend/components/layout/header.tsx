"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  Search, 
  Sparkles, 
  Command as CommandIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useLayoutStore } from "@/stores/use-layout-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export function Header() {
  const pathname = usePathname();
  const { toggleOpen, isOpen } = useCopilotStore();
  const { setCommandMenuOpen } = useLayoutStore();
  const { approvals } = useApprovalStore();

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const getPageTitle = () => {
    if (pathname.includes("dashboard")) return "Executive Overview";
    if (pathname.includes("ai")) return "AI Assistant Studio";
    if (pathname.includes("approvals")) return "Approval Center";
    if (pathname.includes("inbox")) return "Unified Inbox";
    if (pathname.includes("calendar")) return "Smart Calendar";
    if (pathname.includes("tasks")) return "Task Pipeline";
    if (pathname.includes("agents")) return "AI Agent Fleet";
    if (pathname.includes("workflows")) return "Workflow Pipelines";
    if (pathname.includes("integrations")) return "Connected Integrations";
    if (pathname.includes("activity")) return "Activity History";
    if (pathname.includes("memory")) return "Personal Memory & Context";
    if (pathname.includes("settings")) return "System Settings";
    return "FLOW";
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E8DFD1] bg-[#FFFCF6]/90 px-4 md:px-6 backdrop-blur-xs z-20">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold text-[#29251F] tracking-tight">{getPageTitle()}</span>
        <Badge variant="outline" className="hidden sm:inline-flex text-[9px] text-[#777064] border-[#E8DFD1]">
          FLOW OS
        </Badge>
      </div>

      {/* Center ⌘K Search Pill */}
      <button
        onClick={() => setCommandMenuOpen(true)}
        className="flex h-8 w-56 md:w-72 items-center justify-between rounded-lg border border-[#E8DFD1] bg-[#F1EADF]/60 px-2.5 text-xs text-[#777064] hover:border-[#D0C4B2] hover:text-[#29251F] transition-all shadow-2xs"
      >
        <span className="flex items-center gap-2">
          <Search size={13} className="text-[#A39B8E]" />
          <span className="text-[11px]">Quick actions & search...</span>
        </span>
        <kbd className="flex items-center gap-0.5 rounded bg-[#FFFCF6] px-1.5 py-0.5 text-[9px] text-[#777064] border border-[#E8DFD1] font-mono">
          <CommandIcon size={9} /> K
        </kbd>
      </button>

      {/* Right Actions & Copilot Trigger */}
      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[#FEF8ED] border border-[#F9E2BE] px-2.5 py-0.5 text-[11px] text-[#C58A32] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C58A32] animate-pulse" />
            <span>{pendingCount} Pending Approval</span>
          </div>
        )}

        {/* AI Copilot Toggle Button (Only if not on /ai full page) */}
        {!pathname.includes("/ai") && (
          <Button
            onClick={toggleOpen}
            variant={isOpen ? "default" : "secondary"}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <Sparkles size={13} className={isOpen ? "text-white" : "text-primary"} />
            <span className="hidden sm:inline">{isOpen ? "Close Copilot" : "Copilot"}</span>
            <kbd className="hidden lg:inline text-[9px] opacity-75 font-mono ml-0.5">⌘J</kbd>
          </Button>
        )}
      </div>
    </header>
  );
}
