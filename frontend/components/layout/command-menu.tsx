"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator 
} from "cmdk";
import { 
  LayoutDashboard, 
  Inbox, 
  Calendar, 
  CheckSquare, 
  ShieldCheck, 
  History, 
  Brain, 
  Settings, 
  Sparkles,
  Zap,
  Bot,
  Cpu,
  Layers
} from "lucide-react";
import { useLayoutStore } from "@/stores/use-layout-store";
import { useCopilotStore } from "@/stores/use-copilot-store";

export function CommandMenu() {
  const router = useRouter();
  const { commandMenuOpen, setCommandMenuOpen } = useLayoutStore();
  const { toggleOpen: toggleCopilot, submitPrompt } = useCopilotStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCopilot();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandMenuOpen, setCommandMenuOpen, toggleCopilot]);

  const handleSelect = (callback: () => void) => {
    callback();
    setCommandMenuOpen(false);
  };

  if (!commandMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#29251F]/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-elevated overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        <Command className="w-full">
          <div className="flex items-center border-b border-[#E8DFD1] px-3.5">
            <CommandInput
              placeholder="Search views, actions, or instruct FLOW..."
              className="h-11 w-full bg-transparent text-xs text-[#29251F] placeholder:text-[#A39B8E] focus:outline-none"
            />
            <kbd className="text-[10px] text-[#777064] font-mono px-1.5 py-0.5 rounded border border-[#E8DFD1] bg-[#F1EADF]">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-80 overflow-y-auto p-1.5 text-xs">
            <CommandEmpty className="py-6 text-center text-xs text-[#777064]">
              No matching commands found.
            </CommandEmpty>

            <CommandGroup heading="Workspace" className="text-[#777064] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/dashboard"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <LayoutDashboard size={14} className="text-primary" />
                <span>Executive Overview</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/ai"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Bot size={14} className="text-primary" />
                <span>AI Assistant Studio</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/inbox"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Inbox size={14} className="text-[#477A58]" />
                <span>Unified Inbox</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/calendar"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Calendar size={14} className="text-[#C58A32]" />
                <span>Smart Calendar</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/tasks"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <CheckSquare size={14} className="text-primary" />
                <span>Task Pipeline</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-1 border-t border-[#E8DFD1]" />

            <CommandGroup heading="Automation & Governance" className="text-[#777064] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/approvals"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <ShieldCheck size={14} className="text-[#C58A32]" />
                <span>Approval Center (Review Decisions)</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/agents"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Cpu size={14} className="text-primary" />
                <span>AI Agents & Guardrails</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/workflows"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Zap size={14} className="text-primary" />
                <span>Workflow Pipelines</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/integrations"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Layers size={14} className="text-[#477A58]" />
                <span>Connected Integrations</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/activity"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <History size={14} className="text-[#777064]" />
                <span>Activity History & Receipts</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/memory"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Brain size={14} className="text-primary" />
                <span>Personal Memory & Context</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/settings"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Settings size={14} className="text-[#777064]" />
                <span>System Settings</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-1 border-t border-[#E8DFD1]" />

            <CommandGroup heading="Quick Copilot Actions" className="text-[#777064] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
              <CommandItem
                onSelect={() =>
                  handleSelect(() => {
                    toggleCopilot();
                    submitPrompt("Audit my calendar conflicts for today and stage optimal reschedules");
                  })
                }
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Sparkles size={14} className="text-primary" />
                <span>Audit & Resolve Today's Schedule Conflicts</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleSelect(() => {
                    toggleCopilot();
                    submitPrompt("Summarize urgent unread emails and draft responses");
                  })
                }
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#29251F] hover:bg-[#F1EADF] cursor-pointer"
              >
                <Inbox size={14} className="text-[#477A58]" />
                <span>Triage Unread Actionable Emails</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
