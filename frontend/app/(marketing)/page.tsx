"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Calendar, 
  CheckSquare, 
  Brain, 
  Fingerprint, 
  Zap, 
  Lock,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flow3DCore } from "@/components/ui/flow-3d-core";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { FadeIn } from "@/components/ui/motion-primitives";
import { useAuth } from "@/lib/auth/auth-context";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD1] bg-[#FFFCF6] px-3.5 py-1 text-xs text-[#777064] shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-[#29251F]">FLOW v2.0 Production MVP</span>
            <span className="text-[#A39B8E]">|</span>
            <span className="font-mono text-[11px] text-[#477A58]">Trust-First Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#29251F] leading-[1.12]">
            The Agentic OS that puts <br />
            <span className="text-primary underline decoration-[#F7D2BC] decoration-wavy decoration-2">
              Human Authority
            </span>{" "}
            First.
          </h1>

          <p className="text-base sm:text-lg text-[#777064] leading-relaxed max-w-xl">
            Autonomous AI that plans and prepares high-stakes actions across your Email, Calendar, and Tasks. Sensitive dispatches enter an Approval Gate for explicit authorization before execution.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <ShimmerButton
                  shimmerColor="rgba(255, 255, 255, 0.45)"
                  background="#D97736"
                  className="h-11 px-6 font-semibold text-sm gap-2"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight size={15} />
                </ShimmerButton>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <ShimmerButton
                    shimmerColor="rgba(255, 255, 255, 0.45)"
                    background="#D97736"
                    className="h-11 px-6 font-semibold text-sm gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight size={15} />
                  </ShimmerButton>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-11 px-5 text-sm font-semibold border-[#E8DFD1] bg-[#FFFCF6] hover:bg-[#F1EADF] text-[#29251F]">
                    Sign In to FLOW
                  </Button>
                </Link>
              </>
            )}
            <Link href="/features">
              <Button variant="ghost" className="h-11 px-4 text-xs font-medium text-[#777064] hover:text-[#29251F] gap-1.5">
                <span>Explore Architecture</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#E8DFD1]/80 text-xs text-[#777064]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#477A58] shrink-0" />
              <span>Zero Unreviewed Outbound Emails</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#477A58] shrink-0" />
              <span>Collision-Free Smart Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#477A58] shrink-0" />
              <span>Cryptographic Activity Ledger</span>
            </div>
          </div>
        </div>

        {/* 3D Living Core Visual Hero */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-card overflow-hidden w-full max-w-md">
            <BorderBeam size={220} duration={12} colorFrom="#D97736" colorTo="#C58A32" />
            <Flow3DCore size={200} intensity={1.2} interactive={true} />
            <div className="mt-4 text-center space-y-1">
              <span className="text-xs font-bold text-[#29251F] font-mono tracking-tight">QWEN3:8B LOCAL REASONING CORE</span>
              <p className="text-[11px] text-[#777064]">Autonomous plan generator with LiteLLM SDK runtime</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="verified" className="text-[9px] font-mono">
                <Lock size={10} className="mr-1" /> HITL GATE ACTIVE
              </Badge>
              <Badge variant="outline" className="text-[9px] font-mono text-[#777064] border-[#E8DFD1]">
                100% PRIVATE
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-soft">
        <div className="text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#29251F]">
            <NumberTicker value={100} />%
          </div>
          <div className="text-xs text-[#777064]">Human Approval on Sensitive Actions</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#29251F]">
            <NumberTicker value={78} />
          </div>
          <div className="text-xs text-[#777064]">Automated Test Suites Passing</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#29251F]">
            <NumberTicker value={1536} />
          </div>
          <div className="text-xs text-[#777064]">Vector Embeddings Dimensionality</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#29251F]">
            &lt; 50ms
          </div>
          <div className="text-xs text-[#777064]">Cryptographic Ledger Verification</div>
        </div>
      </section>

      {/* 3. Three Core Pillars */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#29251F]">
            Architected for Absolute Verification
          </h2>
          <p className="text-xs sm:text-sm text-[#777064]">
            Most AI agents act as black boxes. FLOW flips the paradigm: every agentic action is staged, inspected via parameter diffs, and permanently recorded in an immutable ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Approval Center */}
          <CardSpotlight
            color="rgba(217, 119, 54, 0.08)"
            radius={300}
            className="border border-[#E8DFD1] bg-[#FFFCF6] rounded-2xl p-6 space-y-4 shadow-soft"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-[#29251F]">Decision Approval Gate</h3>
            <p className="text-xs text-[#777064] leading-relaxed">
              Consequential actions like outbound email dispatch, calendar rescheduling, or task deletion are paused in a pending state until you slide to authorize.
            </p>
            <div className="text-xs font-mono text-primary flex items-center gap-1 font-semibold pt-2">
              <span>Inspect Diffs Before Execution</span>
              <ArrowRight size={12} />
            </div>
          </CardSpotlight>

          {/* Pillar 2: Agent Planner */}
          <CardSpotlight
            color="rgba(217, 119, 54, 0.08)"
            radius={300}
            className="border border-[#E8DFD1] bg-[#FFFCF6] rounded-2xl p-6 space-y-4 shadow-soft"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-[#29251F]">Qwen3:8b Agent Planner</h3>
            <p className="text-xs text-[#777064] leading-relaxed">
              Powered by local LiteLLM SDK reasoning. Automatically resolves contacts from personal memory, detects calendar collisions, and stages execution steps.
            </p>
            <div className="text-xs font-mono text-primary flex items-center gap-1 font-semibold pt-2">
              <span>Structured Pydantic Outputs</span>
              <ArrowRight size={12} />
            </div>
          </CardSpotlight>

          {/* Pillar 3: Immutable Ledger */}
          <CardSpotlight
            color="rgba(217, 119, 54, 0.08)"
            radius={300}
            className="border border-[#E8DFD1] bg-[#FFFCF6] rounded-2xl p-6 space-y-4 shadow-soft"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
              <Fingerprint size={20} />
            </div>
            <h3 className="text-base font-bold text-[#29251F]">Cryptographic Activity Ledger</h3>
            <p className="text-xs text-[#777064] leading-relaxed">
              Every authorized execution mints a SHA-256 verification receipt with Ed25519 signatures, timestamp, and round-trip execution latency for total auditability.
            </p>
            <div className="text-xs font-mono text-primary flex items-center gap-1 font-semibold pt-2">
              <span>Append-Only Verification</span>
              <ArrowRight size={12} />
            </div>
          </CardSpotlight>
        </div>
      </section>

      {/* 4. Ready to Take Control CTA */}
      <section className="rounded-3xl border border-[#F7D2BC] bg-gradient-to-br from-[#FEF8ED] to-[#FFFCF6] p-8 md:p-12 text-center space-y-6 shadow-soft">
        <div className="space-y-2 max-w-xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-mono">
            GET STARTED TODAY
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29251F] tracking-tight">
            Step into the Trust-First Productivity Era.
          </h2>
          <p className="text-xs sm:text-sm text-[#777064]">
            Create your FLOW workspace tenant in seconds. Connect your calendar, email, and task pipelines with guaranteed human oversight.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="h-11 px-8 text-sm font-semibold bg-primary hover:bg-[#B95727] text-white shadow-soft">
              Create Free Workspace
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-semibold border-[#E8DFD1] bg-[#FFFCF6]">
              Sign In
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

