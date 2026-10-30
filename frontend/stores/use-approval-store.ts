import { create } from "zustand";
import { ApprovalItem, ApprovalStatus, VerificationReceipt } from "../lib/types";
import { mockApprovals } from "../lib/mock-data";

interface ApprovalState {
  approvals: ApprovalItem[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  approveAction: (id: string) => void;
  rejectAction: (id: string) => void;
  modifyAction: (id: string, updatedDiff: any) => void;
  resetAll: () => void;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: mockApprovals,
  selectedId: "appr_101",
  setSelectedId: (selectedId) => set({ selectedId }),

  approveAction: (id: string) => {
    // 1. Immediately transition to 'approved' (Human authorization granted)
    set((state) => ({
      approvals: state.approvals.map((appr) =>
        appr.id === id ? { ...appr, status: "approved" as ApprovalStatus } : appr
      ),
    }));

    // 2. Dispatch execution to target service (Graph API, Resend, Task Ledger)
    setTimeout(() => {
      set((state) => ({
        approvals: state.approvals.map((appr) =>
          appr.id === id ? { ...appr, status: "executing" as ApprovalStatus } : appr
        ),
      }));

      // 3. Complete execution and mint verification receipt
      setTimeout(() => {
        const receipt: VerificationReceipt = {
          receiptHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          timestamp: new Date().toISOString(),
          signature: "sig_ed25519_" + Math.random().toString(36).substring(2, 9),
          verifiedBy: "FLOW Cryptographic Receipt Engine",
          latencyMs: Math.floor(Math.random() * 80) + 120,
          httpStatus: 200,
        };

        set((state) => ({
          approvals: state.approvals.map((appr) =>
            appr.id === id
              ? {
                  ...appr,
                  status: "completed" as ApprovalStatus,
                  verificationReceipt: receipt,
                }
              : appr
          ),
        }));
      }, 900);
    }, 450);
  },

  rejectAction: (id: string) => {
    set((state) => ({
      approvals: state.approvals.map((appr) =>
        appr.id === id ? { ...appr, status: "rejected" as ApprovalStatus } : appr
      ),
    }));
  },

  modifyAction: (id: string, updatedDiff: any) => {
    set((state) => ({
      approvals: state.approvals.map((appr) =>
        appr.id === id
          ? {
              ...appr,
              status: "modified" as ApprovalStatus,
              diff: { ...appr.diff, after: updatedDiff },
            }
          : appr
      ),
    }));
  },

  resetAll: () => {
    set({ approvals: mockApprovals });
  },
}));
