import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLOW — Trust-First Agentic Productivity Operating System",
  description:
    "A warm, precision-crafted AI productivity operating system combining an AI Assistant, Self-Owned Email, Smart Calendar, Intelligent Tasks, and an immutable Activity Ledger with human-in-the-loop verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#F8F4EC] text-[#29251F] selection:bg-[#FCEEE5] selection:text-[#B95727]">
        {children}
      </body>
    </html>
  );
}
