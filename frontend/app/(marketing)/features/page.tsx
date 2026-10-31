"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Mail, 
  Calendar, 
  CheckSquare, 
  Brain, 
  Fingerprint, 
  Cpu, 
  Zap, 
  Layers, 
  ArrowRight,
  Sliders
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";

export default function FeaturesPage() {
  const featurePillars = [
    {
      icon: ShieldCheck,
      title: "Human-in-the-Loop Approval Center",
      badge: "CORE TRUST DOMAIN",
      description: "Visual before-and-after diff inspection for all staged actions. Slide-to-confirm tactile authorization for high-risk actions like outbound emails, rescheduling meetings, or bulk updating tasks.",
      subfeatures: [
        "Structured parameter modification (no raw JSON editing required)",
        "Cryptographic idempotency keys prevent double execution",
        "Configurable risk-based thresholds (strict, balanced, or lenient)"
      ]
    },
    {
      icon: Mail,
      title: "Self-Owned Email Operating System",
      badge: "RESEND + APPS SCRIPT",
      description: "A dual-pipeline email architecture: verified inbound delivery via signed Resend webhooks, and authenticated outbound dispatch via custom Google Apps Script webhooks.",
      subfeatures: [
        "Automatic thread summarization and action item extraction",
        "Executive AI draft replies with explicit user approval gate",
        "Spam and phishing heuristic filtering"
      ]
    },
    {
      icon: Calendar,
      title: "Smart Calendar Runtime & Conflict Engine",
      badge: "MICROSOFT GRAPH SYNC",
      description: "Intelligent schedule management that detects meeting overlaps, focus block violations, and VIP attendee collisions. Proposes optimal non-conflicting slots with zero manual back-and-forth.",
      subfeatures: [
        "Automated reschedule proposals with staged confirmation emails",
        "Deep work Focus Block protection",
        "Multi-calendar synchronization across Microsoft 365 and Google"
      ]
    },
    {
      icon: CheckSquare,
      title: "Task Pipeline & AI Goal Decomposer",
      badge: "DND KANBAN",
      description: "Physics-based drag-and-drop Kanban board powered by @dnd-kit. Decomposes high-level ambiguous goals into ordered execution plans with time estimates.",
      subfeatures: [
        "One-click 'Block Time on Calendar' focus scheduling",
        "Category tagging and priority filtering",
        "Automated dependency resolution and deadline tracking"
      ]
    },
    {
      icon: Brain,
      title: "Personal Memory & Context Graph",
      badge: "SUPABASE PGVECTOR",
      description: "Long-term relationship dossiers and personalized working preferences indexed as 1536-dimensional vectors for semantic context assembly during agent planning.",
      subfeatures: [
        "Relationship context (colleagues, roles, communication tones)",
        "Learned working guidelines (e.g. 'Never schedule calls before 10 AM')",
        "Privacy-first memory vector purging with typed confirmation"
      ]
    },
    {
      icon: Fingerprint,
      title: "Cryptographic Activity Ledger",
      badge: "APPEND-ONLY AUDIT",
      description: "An immutable verification ledger recording every single action, intent classification, and human authorization. Mints verifiable SHA-256 receipts with microsecond timestamps.",
      subfeatures: [
        "Tamper-evident append-only SQLite/PostgreSQL architecture",
        "Copyable receipt hashes for compliance verification",
        "Full JSON audit log export for security reviews"
      ]
    }
  ];

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-mono">
          COMPLETE FEATURE MATRIX
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#29251F]">
          Built for Autonomous Speed. <br />
          <span className="text-primary">Secured by Human Oversight.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#777064] leading-relaxed">
          Explore the integrated domains that power FLOW: from the local Qwen3:8b reasoning engine to the cryptographic trust layer.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featurePillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <CardSpotlight
              key={pillar.title}
              color="rgba(217, 119, 54, 0.08)"
              radius={280}
              className="border border-[#E8DFD1] bg-[#FFFCF6] rounded-2xl p-6 space-y-4 shadow-soft flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
                    <Icon size={20} />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono text-[#777064] border-[#E8DFD1]">
                    {pillar.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-[#29251F]">{pillar.title}</h3>
                <p className="text-xs text-[#777064] leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DFD1]/60 space-y-1.5 text-xs text-[#29251F]">
                {pillar.subfeatures.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-[#777064]">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardSpotlight>
          );
        })}
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl border border-[#E8DFD1] bg-[#FFFCF6] p-8 text-center space-y-4 shadow-soft">
        <h2 className="text-xl sm:text-2xl font-bold text-[#29251F]">
          See these features in action in your workspace.
        </h2>
        <div className="flex justify-center gap-3">
          <Link href="/signup">
            <Button className="bg-primary hover:bg-[#B95727] text-white text-xs font-semibold">
              Get Started Free
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-[#E8DFD1] text-xs">
              Talk to Engineering
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

