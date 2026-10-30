import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLOW — Trust-First Agentic Productivity Operating System",
  description:
    "An AI-powered productivity operating system combining an AI Assistant, Self-Owned Email, Smart Calendar, Intelligent Tasks, and an immutable Activity Ledger with human-in-the-loop verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#0B0F14] text-white">
        {children}
      </body>
    </html>
  );
}
