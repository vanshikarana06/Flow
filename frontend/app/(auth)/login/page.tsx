"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  Cpu, 
  Fingerprint, 
  Lock, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Flow3DCore } from "@/components/ui/flow-3d-core";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { useAuth } from "@/lib/auth/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect immediately to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authLoading, router, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      router.replace(redirectPath);
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid email or password. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("vanshika@flow.ai");
    setPassword("flowpass123");
  };

  return (
    <CardSpotlight
      color="#D97736"
      className="p-6 sm:p-8 space-y-6 border-[#E8DFD1] bg-[#FFFCF6] shadow-soft"
    >
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#777064]">
          <Fingerprint size={14} className="text-primary" />
          <span className="font-mono uppercase tracking-wider text-[11px]">Identity Verification</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#29251F]">
          Welcome Back to FLOW
        </h2>
        <p className="text-xs text-[#777064]">
          Authenticate to access your verified agentic workspace.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-[#FDEDEB] border border-[#F5C2BC] text-[#C65345] text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#29251F]">Work Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-3 text-[#777064]" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vanshika@flow.ai"
              required
              className="pl-9 h-10 text-xs bg-[#F8F4EC] border-[#E8DFD1] text-[#29251F]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#29251F]">Password</label>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[10px] text-primary hover:underline font-mono"
            >
              Auto-fill Demo
            </button>
          </div>
          <div className="relative">
            <Key size={14} className="absolute left-3 top-3 text-[#777064]" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="pl-9 h-10 text-xs bg-[#F8F4EC] border-[#E8DFD1] text-[#29251F]"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-10 text-xs font-semibold gap-1.5 bg-primary hover:bg-[#B95727] text-white shadow-2xs active:scale-[0.99] transition-all"
          disabled={isSubmitting || authLoading}
        >
          <span>{isSubmitting ? "Authenticating..." : "Sign In with Password"}</span>
          <ArrowRight size={14} />
        </Button>
      </form>

      {/* Footer & Link to Signup */}
      <div className="pt-2 text-center space-y-2 border-t border-[#E8DFD1]">
        <p className="text-xs text-[#777064]">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#777064]">
          <Lock size={12} className="text-[#477A58]" />
          <span>Zero-Knowledge Vault • OAuth 2.0 PKCE Protected</span>
        </div>
      </div>
    </CardSpotlight>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Visual Identity Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center">
          <Flow3DCore size={76} interactive={false} />
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className="border-[#E8DFD1] bg-[#FFFCF6] text-[#777064] text-[10px] font-mono">
            SECURE ACCESS PROTOCOL
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#29251F]">
            FLOW Operating System
          </h1>
          <p className="text-xs text-[#777064]">
            Trust-First Agentic Productivity Architecture
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="p-8 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] text-center text-xs text-[#777064]">
          Initializing Secure Session...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
