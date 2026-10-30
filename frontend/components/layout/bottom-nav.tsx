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
  Bot 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApprovalStore } from "@/stores/use-approval-store";

export function BottomNav() {
  const pathname = usePathname();
  const { approvals } = useApprovalStore();
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const mobileNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", href: "/ai", icon: Bot },
    { name: "Approvals", href: "/approvals", icon: ShieldCheck, badge: pendingCount },
    { name: "Inbox", href: "/inbox", icon: Inbox },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-[#E8DFD1] bg-[#FFFCF6]/95 px-2 backdrop-blur-md md:hidden">
      {mobileNav.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center p-1 text-[10px] font-medium transition-colors",
              isActive ? "text-primary font-semibold" : "text-[#777064] hover:text-[#29251F]"
            )}
          >
            <Icon size={17} />
            <span className="mt-0.5">{item.name}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-0 right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white font-mono">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
