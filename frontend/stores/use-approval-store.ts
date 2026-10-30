import { create } from "zustand";
import { ApprovalItem } from "../lib/types";
import { mockApprovals } from "../lib/mock-data";

interface ApprovalState {
  approvals: ApprovalItem[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  approveAction: (id: string) => void;
  rejectAction: (id: string) => void;
  modifyAction: (id: string, updatedDiff: any) => void;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: mockApprovals,
  selectedId: "appr_101",
  setSelectedId: (selectedId) => set({ selectedId }),

  approveAction: (id: string) => {
    set((state) => ({
      approvals: state.approvals.map((appr) =>
        appr.id === id ? { ...appr, status: "approved" as const } : appr
      ),
    }));
  },

  rejectAction: (id: string) => {
    set((state) => ({
      approvals: state.approvals.map((appr) =>
        appr.id === id ? { ...appr, status: "rejected" as const } : appr
      ),
    }));
  },

  modifyAction: (id: string, updatedDiff: any) => {
    set((state) => ({
      approvals: state.approvals.map((appr) =>
        appr.id === id
          ? {
              ...appr,
              status: "modified" as const,
              diff: { ...appr.diff, after: updatedDiff },
            }
          : appr
      ),
    }));
  },
}));

