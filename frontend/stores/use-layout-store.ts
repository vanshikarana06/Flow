import { create } from "zustand";

interface LayoutState {
  sidebarCollapsed: boolean;
  commandMenuOpen: boolean;
  activeView: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
  setActiveView: (view: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  sidebarCollapsed: false,
  commandMenuOpen: false,
  activeView: "dashboard",
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
  setActiveView: (activeView) => set({ activeView }),
}));

