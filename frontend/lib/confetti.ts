"use client";

import type { Options } from "canvas-confetti";

export const triggerConfetti = async (options?: Options) => {
  if (typeof window === "undefined") return;
  try {
    const confettiModule = await import("canvas-confetti");
    const confetti = confettiModule.default || confettiModule;
    confetti(options);
  } catch (err) {
    // Fail silently in non-browser environments
  }
};

