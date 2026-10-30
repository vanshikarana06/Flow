"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AiCopilotPanel } from "./ai-copilot-panel";
import { BottomNav } from "./bottom-nav";
import { CommandMenu } from "./command-menu";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F14] text-[#F9FAFB]">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-16 md:pb-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Right AI Copilot Dock / Panel */}
      <AiCopilotPanel />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global ⌘K Command Dialog */}
      <CommandMenu />
    </div>
  );
}

