"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/use-layout-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: Inbox, badge: "3" },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Approvals", href: "/approvals", icon: ShieldCheck, isApproval: true },
  { name: "Activity", href: "/activity", icon: History },
  { name: "Memory", href: "/memory", icon: Brain },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { approvals } = useApprovalStore();
  
  const pendingApprovalsCount = approvals.filter((a) => a.status === "pending").length;

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/5 bg-[#0B0F14] transition-all duration-300 ease-in-out select-none z-30",
        sidebarCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-400 text-white font-bold text-sm shadow-md shadow-primary/20">
            F
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-wide text-white">FLOW</span>
              <span className="text-[10px] text-gray-500 font-mono">OS v2.0</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-2.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const badgeCount = item.isApproval ? pendingApprovalsCount : item.badge;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/15 text-white border border-primary/20 shadow-sm"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-200"
                )}
              />
              {!sidebarCollapsed && <span className="flex-1 truncate">{item.name}</span>}
              {!sidebarCollapsed && badgeCount && Number(badgeCount) > 0 && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    item.isApproval
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      : "bg-white/10 text-gray-300"
                  )}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Trust Profile Footer */}
      <div className="border-t border-white/5 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2 bg-white/[0.02] border border-white/5",
            sidebarCollapsed ? "justify-center" : ""
          )}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-xs font-bold">
            VR
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#0B0F14]" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-medium text-gray-200">Vanshika Rana</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <UserCheck size={10} /> Verified Tenant
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

