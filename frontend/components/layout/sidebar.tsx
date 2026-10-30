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
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Bot,
  Zap,
  Cpu,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/use-layout-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | number;
    isApproval?: boolean;
    isConflict?: boolean;
  }[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Assistant", href: "/ai", icon: Bot },
      { name: "Inbox", href: "/inbox", icon: Inbox, badge: "3" },
      { name: "Calendar", href: "/calendar", icon: Calendar, isConflict: true, badge: "1" },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Automation",
    items: [
      { name: "AI Agents", href: "/agents", icon: Cpu },
      { name: "Workflows", href: "/workflows", icon: Zap },
      { name: "Integrations", href: "/integrations", icon: Layers },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "Approval Center", href: "/approvals", icon: ShieldCheck, isApproval: true },
      { name: "Activity History", href: "/activity", icon: History },
    ],
  },
  {
    label: "Preferences",
    items: [
      { name: "Personal Memory", href: "/memory", icon: Brain },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { approvals } = useApprovalStore();
  
  const pendingApprovalsCount = approvals.filter((a) => a.status === "pending").length;

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[#E8DFD1] bg-[#FFFCF6] transition-all duration-200 ease-in-out select-none z-30 shrink-0",
        sidebarCollapsed ? "w-[64px]" : "w-[220px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-[#E8DFD1]">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-2xs">
            F
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[#29251F]">FLOW</span>
              <span className="text-[10px] text-[#777064] font-mono leading-none">Trust-First OS</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="text-[#777064] hover:text-[#29251F] p-1 rounded-md hover:bg-[#F1EADF] transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar (⌘B)"}
        >
          {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 space-y-3 p-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!sidebarCollapsed ? (
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[#777064] uppercase tracking-wider">
                {group.label}
              </div>
            ) : (
              <div className="my-1.5 border-t border-[#E8DFD1]/60" />
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              const badgeCount = item.isApproval ? pendingApprovalsCount : item.badge;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#FCEEE5] text-[#B95727] font-semibold border border-[#F7D2BC]"
                      : "text-[#777064] hover:bg-[#F1EADF] hover:text-[#29251F]"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-[#777064] group-hover:text-[#29251F]"
                    )}
                  />
                  {!sidebarCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                  {!sidebarCollapsed && badgeCount !== undefined && Number(badgeCount) > 0 && (
                    <span
                      className={cn(
                        "ml-auto flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold font-mono",
                        item.isApproval
                          ? "bg-[#FEF8ED] text-[#C58A32] border border-[#F9E2BE]"
                          : item.isConflict
                          ? "bg-[#FDEDEB] text-[#C65345] border border-[#F5C2BC]"
                          : "bg-[#F1EADF] text-[#777064]"
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Trust Profile Footer */}
      <div className="border-t border-[#E8DFD1] p-2.5">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg p-2 bg-[#F1EADF]/60 border border-[#E8DFD1]",
            sidebarCollapsed ? "justify-center" : ""
          )}
        >
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EDF5F0] text-[#477A58] border border-[#CDE3D5] text-xs font-bold">
            VR
            <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-[#477A58] ring-1 ring-[#FFFCF6]" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-semibold text-[#29251F]">Vanshika Rana</span>
              <span className="flex items-center gap-1 text-[9px] text-[#477A58] font-mono">
                <Shield size={9} /> Verified Tenant
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
