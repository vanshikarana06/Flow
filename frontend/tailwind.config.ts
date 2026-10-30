import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        base: "#0B0F14",
        card: {
          DEFAULT: "#111827",
          hover: "#1A2234",
          subtle: "#0F172A",
          foreground: "#F9FAFB",
        },
        popover: {
          DEFAULT: "#111827",
          foreground: "#F9FAFB",
        },
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
          hover: "#4338CA",
          muted: "rgba(79, 70, 229, 0.15)",
        },
        secondary: {
          DEFAULT: "#1F2937",
          foreground: "#F9FAFB",
        },
        muted: {
          DEFAULT: "#1F2937",
          foreground: "#9CA3AF",
        },
        accent: {
          DEFAULT: "#1F2937",
          foreground: "#F9FAFB",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: {
          DEFAULT: "#1F2937",
          subtle: "#161F2E",
          glow: "rgba(79, 70, 229, 0.3)",
        },
        input: "#1F2937",
        ring: "#4F46E5",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out forwards",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

