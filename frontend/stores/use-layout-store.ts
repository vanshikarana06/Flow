import { create } from "zustand";

interface LayoutState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  commandMenuOpen: boolean;
  activeView: string;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
  setActiveView: (view: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  commandMenuOpen: false,
  activeView: "dashboard",
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
  setActiveView: (activeView) => set({ activeView }),
}));
