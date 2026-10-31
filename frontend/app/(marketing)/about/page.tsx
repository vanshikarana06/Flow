"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight, Heart, Users, Target, Lock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-mono">
          OUR MISSION & ARCHITECTURE
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#29251F]">
          Why We Built FLOW
        </h1>
        <p className="text-sm sm:text-base text-[#777064] leading-relaxed">
          Artificial Intelligence agents are being granted unprecedented access to our inboxes, calendars, and communications. Yet almost all of them operate on blind trust. FLOW restores human agency.
        </p>
      </section>

      {/* The Core Problem & Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#29251F]">The AI Trust Paradox</h2>
          <p className="text-xs sm:text-sm text-[#777064] leading-relaxed">
            When you ask an autonomous agent to "Email my team about the delay" or "Clear my afternoon for deep work", a single hallucination can cause irreparable professional damage. Either you don't trust the AI and never use it, or you trust it blindly and suffer the consequences.
          </p>
          <p className="text-xs sm:text-sm text-[#777064] leading-relaxed">
            FLOW resolves this paradox through our <strong>Human-in-the-Loop (HITL) Decision Gate</strong>. Low-consequence tasks execute immediately. High-consequence tasks are meticulously planned, visualized as before/after diffs, and await your authorization.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-[#29251F] font-mono uppercase tracking-wider text-primary">
            The 3 Invariants of FLOW
          </h3>
          <div className="space-y-3 text-xs text-[#29251F]">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCEEE5] text-primary font-bold text-[10px]">1</span>
              <div>
                <strong className="block font-semibold">Zero Unreviewed Outbound Actions</strong>
                <span className="text-[#777064]">No email or message leaves your workspace without you previewing the exact payload.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCEEE5] text-primary font-bold text-[10px]">2</span>
              <div>
                <strong className="block font-semibold">Immutable Append-Only Audit Trail</strong>
                <span className="text-[#777064]">Every executed action mints a cryptographic SHA-256 receipt for total accountability.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCEEE5] text-primary font-bold text-[10px]">3</span>
              <div>
                <strong className="block font-semibold">Local Privacy & Reasoning Sovereignty</strong>
                <span className="text-[#777064]">Powered by local Qwen3:8b through the LiteLLM SDK. Your private data remains yours.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#29251F]">
          Engineered with Modern Standards
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] space-y-1">
            <span className="font-bold text-sm text-[#29251F]">FastAPI & Python 3.12</span>
            <p className="text-[11px] text-[#777064]">High-concurrency async runtime</p>
          </div>
          <div className="p-4 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] space-y-1">
            <span className="font-bold text-sm text-[#29251F]">Qwen3:8b via LiteLLM</span>
            <p className="text-[11px] text-[#777064]">Local reasoning without proxy</p>
          </div>
          <div className="p-4 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] space-y-1">
            <span className="font-bold text-sm text-[#29251F]">Supabase pgvector</span>
            <p className="text-[11px] text-[#777064]">1536-dim memory embeddings</p>
          </div>
          <div className="p-4 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] space-y-1">
            <span className="font-bold text-sm text-[#29251F]">Next.js 15 & React 19</span>
            <p className="text-[11px] text-[#777064]">Warm, tactile responsive UI</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center pt-8 border-t border-[#E8DFD1] space-y-4">
        <h3 className="text-xl font-bold text-[#29251F]">Ready to experience the platform?</h3>
        <div className="flex justify-center gap-3">
          <Link href="/signup">
            <Button className="bg-primary hover:bg-[#B95727] text-white text-xs font-semibold">
              Create an Account
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline" className="border-[#E8DFD1] text-xs">
              View Feature Tour
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

