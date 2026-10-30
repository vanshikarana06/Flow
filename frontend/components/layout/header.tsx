"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Bell, 
  SlidersHorizontal,
  Command as CommandIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useLayoutStore } from "@/stores/use-layout-store";

export function Header() {
  const pathname = usePathname();
  const { toggleOpen, isOpen } = useCopilotStore();
  const { setCommandMenuOpen } = useLayoutStore();

  const getPageTitle = () => {
    if (pathname.includes("dashboard")) return "Executive Dashboard";
    if (pathname.includes("inbox")) return "Unified Inbox & Triage";
    if (pathname.includes("calendar")) return "Smart Calendar & Conflicts";
    if (pathname.includes("tasks")) return "Intelligent Tasks";
    if (pathname.includes("approvals")) return "Approval Center";
    if (pathname.includes("activity")) return "Activity Ledger";
    if (pathname.includes("memory")) return "Personal Memory & Dossiers";
    if (pathname.includes("settings")) return "System Settings";
    if (pathname.includes("ai")) return "AI Assistant Studio";
    return "FLOW OS";
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0B0F14]/90 px-6 backdrop-blur-md z-20">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white tracking-wide">{getPageTitle()}</h1>
        <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-gray-400 bg-white/[0.02]">
          Trust-First OS
        </Badge>
      </div>

      {/* Center ⌘K Search Pill */}
      <button
        onClick={() => setCommandMenuOpen(true)}
        className="flex h-8 w-64 items-center justify-between rounded-lg border border-white/10 bg-card-subtle px-3 text-xs text-gray-400 hover:border-white/20 hover:text-gray-200 transition-all shadow-sm"
      >
        <span className="flex items-center gap-2">
          <Search size={14} className="text-gray-500" />
          <span>Quick actions & search...</span>
        </span>
        <kbd className="flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400 border border-white/10">
          <CommandIcon size={10} /> K
        </kbd>
      </button>

      {/* Right Action Icons & Copilot Trigger */}
      <div className="flex items-center gap-2.5">
        {/* Proactive Pulse Alert */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-medium text-[11px]">1 Conflict Detected</span>
        </div>

        {/* AI Copilot Toggle Button */}
        <Button
          onClick={toggleOpen}
          variant={isOpen ? "default" : "secondary"}
          size="sm"
          className="gap-1.5 text-xs font-medium"
        >
          <Sparkles size={14} className={isOpen ? "text-white" : "text-primary"} />
          <span>{isOpen ? "Close Copilot" : "AI Copilot"}</span>
          <kbd className="hidden lg:inline text-[10px] opacity-75 font-mono ml-1">⌘J</kbd>
        </Button>
      </div>
    </header>
  );
}

