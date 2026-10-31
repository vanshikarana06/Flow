import React from "react";
import Link from "next/link";
import { Shield, Sparkles, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E8DFD1] bg-[#FFFCF6] text-[#777064] text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-2xs">
                F
              </div>
              <span className="font-bold text-sm tracking-tight text-[#29251F]">FLOW</span>
              <span className="text-[11px] font-mono text-[#777064]">v2.0 MVP</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              The Trust-First Agentic Productivity Operating System. Autonomous AI that coordinates Email, Calendar, and Tasks under explicit human-in-the-loop authorization.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="verified" className="text-[10px] font-mono">
                <Shield size={10} className="mr-1" /> HITL Guardrails Active
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-[#777064] border-[#E8DFD1]">
                Local Qwen3:8b Inference
              </Badge>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#29251F] uppercase tracking-wider">Product</span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/features" className="hover:text-[#29251F] transition-colors">
                  System Architecture & Features
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#29251F] transition-colors">
                  Manifesto & About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#29251F] transition-colors">
                  Developer Support & Contact
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#29251F] transition-colors">
                  App Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#29251F] uppercase tracking-wider">Security & Trust</span>
            <ul className="space-y-1.5 text-xs font-mono text-[11px]">
              <li>OAuth 2.0 PKCE Handshake</li>
              <li>SHA-256 Activity Ledger</li>
              <li>Supabase pgvector Embeddings</li>
              <li>Resend + Apps Script Outbound</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#E8DFD1] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} FLOW Operating System. Built with trust and precision.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-[#29251F]">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#29251F]">
              Sign Up
            </Link>
            <Link href="/features" className="hover:text-[#29251F]">
              Features
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

