"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  Fingerprint 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10">
      {/* Left: Product Manifesto / Hero */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-400 text-white font-bold text-base shadow-lg shadow-primary/30">
            F
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FLOW</span>
          <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
            v2.0
          </Badge>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Trust-First Agentic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-primary to-purple-400">
              Productivity OS
            </span>
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Coordinating Email, Calendar, and Tasks through an agentic core that keeps you in control with explicit human approvals and verifiable outcomes.
          </p>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Human-in-the-Loop decision guardrails before action execution</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <Fingerprint size={16} className="text-indigo-400 shrink-0" />
            <span>Cryptographic activity ledger with verified receipt hashes</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <Cpu size={16} className="text-amber-400 shrink-0" />
            <span>Deep integrations with Microsoft Graph API and Google Workspace</span>
          </div>
        </div>
      </div>

      {/* Right: Glassmorphic Auth Card */}
      <div className="glass-panel-elevated rounded-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-lg font-bold text-white">Sign in to FLOW</h2>
          <p className="text-xs text-gray-400">Choose your workspace identity provider</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handleOAuthLogin("google")}
            variant="secondary"
            className="w-full justify-center gap-3 h-10 border border-white/10 hover:border-white/20 text-xs font-semibold"
            disabled={isLoading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google Workspace
          </Button>

          <Button
            onClick={() => handleOAuthLogin("microsoft")}
            variant="secondary"
            className="w-full justify-center gap-3 h-10 border border-white/10 hover:border-white/20 text-xs font-semibold"
            disabled={isLoading}
          >
            <svg className="h-4 w-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft 365
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#111827] px-2 text-[10px] text-gray-500 uppercase tracking-widest">
            or passwordless email
          </span>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-3 text-gray-500" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="pl-9 h-10 text-xs"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-xs font-semibold gap-1.5"
            disabled={isLoading}
          >
            <span>{isLoading ? "Signing in..." : "Send Magic Link"}</span>
            <ArrowRight size={14} />
          </Button>
        </form>

        {/* Security Stamp */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <Lock size={12} className="text-emerald-400" />
          <span>Zero-Knowledge Vault • OAuth 2.0 PKCE Protected</span>
        </div>
      </div>
    </div>
  );
}

