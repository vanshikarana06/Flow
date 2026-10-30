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
        background: "#F8F4EC",
        foreground: "#29251F",
        canvas: {
          DEFAULT: "#F8F4EC",
          subtle: "#F1EADF",
        },
        card: {
          DEFAULT: "#FFFCF6",
          foreground: "#29251F",
          muted: "#F1EADF",
          hover: "#EBE3D5",
        },
        popover: {
          DEFAULT: "#FFFCF6",
          foreground: "#29251F",
        },
        primary: {
          DEFAULT: "#D97736",
          foreground: "#FFFFFF",
          hover: "#B95727",
          subtle: "#FCEEE5",
          muted: "rgba(217, 119, 54, 0.12)",
        },
        secondary: {
          DEFAULT: "#F1EADF",
          foreground: "#29251F",
          hover: "#E5DCCE",
        },
        muted: {
          DEFAULT: "#F1EADF",
          foreground: "#777064",
        },
        accent: {
          DEFAULT: "#F1EADF",
          foreground: "#29251F",
          orange: "#D97736",
          deep: "#B95727",
          success: "#477A58",
          warning: "#C58A32",
          danger: "#C65345",
        },
        destructive: {
          DEFAULT: "#C65345",
          foreground: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E8DFD1",
          subtle: "#EFE8DC",
          focus: "#D97736",
          glow: "rgba(217, 119, 54, 0.25)",
        },
        input: "#E8DFD1",
        ring: "#D97736",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(41, 37, 31, 0.04), 0 1px 3px -1px rgba(41, 37, 31, 0.02)",
        card: "0 4px 16px -4px rgba(41, 37, 31, 0.06), 0 1px 3px 0 rgba(41, 37, 31, 0.03)",
        elevated: "0 12px 32px -6px rgba(41, 37, 31, 0.10), 0 4px 12px -2px rgba(41, 37, 31, 0.05)",
        composer: "0 10px 30px -5px rgba(41, 37, 31, 0.08), 0 2px 6px -1px rgba(41, 37, 31, 0.04)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(3px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
