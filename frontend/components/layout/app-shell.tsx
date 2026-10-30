"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AiCopilotPanel } from "./ai-copilot-panel";
import { BottomNav } from "./bottom-nav";
import { CommandMenu } from "./command-menu";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAiPage = pathname.includes("/ai");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F4EC] text-[#29251F]">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-3.5 md:p-5 lg:p-6 pb-16 md:pb-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Right AI Copilot Dock / Panel (Yields when on dedicated /ai page) */}
      {!isAiPage && <AiCopilotPanel />}

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global ⌘K Command Dialog */}
      <CommandMenu />
    </div>
  );
}
