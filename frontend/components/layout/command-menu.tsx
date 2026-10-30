"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Command,
  CommandDialog,
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
  Plus,
  Zap
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-xl border border-white/10 bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        <Command className="w-full">
          <div className="flex items-center border-b border-white/10 px-3">
            <CommandInput
              placeholder="Type a command, jump to a view, or plan an action..."
              className="h-12 w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
            />
            <kbd className="text-[10px] text-gray-500 font-mono px-1.5 py-0.5 rounded border border-white/10">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-80 overflow-y-auto p-2 text-xs">
            <CommandEmpty className="py-6 text-center text-gray-500">
              No matching commands found.
            </CommandEmpty>

            <CommandGroup heading="Quick Navigation" className="text-gray-400 font-medium px-2 py-1">
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/dashboard"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <LayoutDashboard size={15} className="text-primary" />
                <span>Go to Executive Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/approvals"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <ShieldCheck size={15} className="text-amber-400" />
                <span>Open Approval Center</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/inbox"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Inbox size={15} className="text-indigo-400" />
                <span>Go to Unified Inbox</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/calendar"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Calendar size={15} className="text-emerald-400" />
                <span>Go to Smart Calendar</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/activity"))}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <History size={15} className="text-gray-400" />
                <span>Inspect Activity Ledger</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-1.5 h-px bg-white/5" />

            <CommandGroup heading="Agent Actions" className="text-gray-400 font-medium px-2 py-1">
              <CommandItem
                onSelect={() => handleSelect(() => {
                  toggleCopilot();
                  submitPrompt("Resolve the 2:00 PM calendar conflict with Aditya");
                })}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Zap size={15} className="text-amber-400" />
                <span>Auto-Resolve Today's 2 PM Calendar Conflict</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => {
                  toggleCopilot();
                  submitPrompt("Draft follow-up reply to Aditya's email regarding pgvector");
                })}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <Sparkles size={15} className="text-primary" />
                <span>Draft Reply for Inbound Email from Aditya</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <div 
        className="fixed inset-0 -z-10" 
        onClick={() => setCommandMenuOpen(false)} 
      />
    </div>
  );
}

