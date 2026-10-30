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
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { useApprovalStore } from "@/stores/use-approval-store";

export function BottomNav() {
  const pathname = usePathname();
  const { toggleOpen, isOpen } = useCopilotStore();
  const { approvals } = useApprovalStore();
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const mobileNav = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inbox", href: "/inbox", icon: Inbox },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Approvals", href: "/approvals", icon: ShieldCheck, badge: pendingCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-white/5 bg-[#0B0F14]/95 px-2 backdrop-blur-lg md:hidden">
      {mobileNav.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center p-1 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-200"
            )}
          >
            <Icon size={18} />
            <span className="mt-0.5">{item.name}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-0 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}

      <button
        onClick={toggleOpen}
        className={cn(
          "flex flex-col items-center justify-center p-1 text-[10px] font-medium transition-colors",
          isOpen ? "text-indigo-400" : "text-gray-400 hover:text-white"
        )}
      >
        <Sparkles size={18} className="text-primary" />
        <span className="mt-0.5">Copilot</span>
      </button>
    </div>
  );
}

