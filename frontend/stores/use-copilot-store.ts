import { create } from "zustand";
import { AgentPlan, CopilotMessage } from "../lib/types";
import { mockInitialPlan } from "../lib/mock-data";

interface CopilotState {
  isOpen: boolean;
  isDocked: boolean;
  activePlan: AgentPlan | null;
  messages: CopilotMessage[];
  inputValue: string;
  isGenerating: boolean;
  
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  toggleDocked: () => void;
  setInputValue: (value: string) => void;
  addMessage: (message: CopilotMessage) => void;
  updateStepStatus: (stepId: string, status: "completed" | "in_progress" | "pending" | "waiting_approval") => void;
  submitPrompt: (prompt: string) => void;
}

export const useCopilotStore = create<CopilotState>((set, get) => ({
  isOpen: true,
  isDocked: true,
  activePlan: mockInitialPlan,
  inputValue: "",
  isGenerating: false,
  messages: [
    {
      id: "msg_1",
      sender: "flow",
      text: "Good morning Vanshika. I noticed a calendar conflict between your Partner Sync and 1:1 with Aditya at 2:00 PM today. I've staged an approval to reschedule Aditya to 4:00 PM and drafted the confirmation email.",
      timestamp: "09:30 AM",
      plan: mockInitialPlan,
    },
  ],

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  toggleDocked: () => set((state) => ({ isDocked: !state.isDocked })),
  setInputValue: (inputValue) => set({ inputValue }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateStepStatus: (stepId, status) => {
    const { activePlan } = get();
    if (!activePlan) return;
    const updatedSteps = activePlan.steps.map((step) =>
      step.id === stepId ? { ...step, status } : step
    );
    set({ activePlan: { ...activePlan, steps: updatedSteps } });
  },

  submitPrompt: (prompt: string) => {
    if (!prompt.trim()) return;
    const userMsg: CopilotMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: "Just now",
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      inputValue: "",
      isGenerating: true,
    }));

    // Simulate Agent Plan generation
    setTimeout(() => {
      const agentMsg: CopilotMessage = {
        id: `ai_${Date.now()}`,
        sender: "flow",
        text: `I have analyzed your request: "${prompt}". Checking context and preparing execution steps...`,
        timestamp: "Just now",
      };
      set((state) => ({
        messages: [...state.messages, agentMsg],
        isGenerating: false,
      }));
    }, 700);
  },
}));

