"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  Cpu, 
  Fingerprint, 
  Lock, 
  Mail, 
  User,
  Key,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Flow3DCore } from "@/components/ui/flow-3d-core";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signup(fullName, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
      {/* Left: Product Manifesto */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-base shadow-sm">
              F
            </div>
            <span className="text-xl font-bold tracking-tight text-[#29251F]">FLOW</span>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">
              v2.0 MVP
            </Badge>
          </Link>
          <Flow3DCore size={68} intensity={1.2} interactive={true} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#29251F] leading-tight">
            Claim Your Verified <br />
            <span className="text-primary">
              Workspace Tenant
            </span>
          </h1>
          <p className="text-sm text-[#777064] leading-relaxed">
            Create an account to deploy your private autonomous agent fleet with cryptographic audit logs and Human-in-the-Loop decision verification.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2.5 text-xs text-[#29251F]">
            <CheckCircle2 size={16} className="text-[#477A58] shrink-0" />
            <span>Dedicated personal memory graph with pgvector storage</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#29251F]">
            <Fingerprint size={16} className="text-primary shrink-0" />
            <span className="font-mono">
              <DecryptedText text="Cryptographic activity ledger with verified receipt hashes" speed={30} />
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#29251F]">
            <Cpu size={16} className="text-[#C58A32] shrink-0" />
            <span>Local Qwen3:8b AI reasoning with zero data leakage</span>
          </div>
        </div>
      </div>

      {/* Right: Signup Card */}
      <CardSpotlight
        color="rgba(242, 140, 56, 0.12)"
        radius={360}
        className="bg-[#FFFCF6] border border-[#E8DFD1] rounded-2xl p-6 md:p-8 space-y-5 shadow-soft"
      >
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-lg font-bold text-[#29251F]">Create Workspace Account</h2>
          <p className="text-xs text-[#777064]">Get started with your private FLOW instance</p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-[#F5C2BC] bg-[#FDEDEB] text-[#C65345] text-xs font-medium animate-in fade-in">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#29251F]">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-[#777064]" />
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Vanshika Rana"
                required
                className="pl-9 h-10 text-xs bg-[#F8F4EC] border-[#E8DFD1] text-[#29251F]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#29251F]">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#777064]" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vanshika@example.com"
                required
                className="pl-9 h-10 text-xs bg-[#F8F4EC] border-[#E8DFD1] text-[#29251F]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#29251F]">Password</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-3 text-[#777064]" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="pl-9 h-10 text-xs bg-[#F8F4EC] border-[#E8DFD1] text-[#29251F]"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-xs font-semibold gap-1.5 bg-primary hover:bg-[#B95727] text-white shadow-2xs active:scale-[0.99] transition-all"
            disabled={isSubmitting || authLoading}
          >
            <span>{isSubmitting ? "Creating Account..." : "Create Free Account"}</span>
            <ArrowRight size={14} />
          </Button>
        </form>

        <div className="pt-2 text-center space-y-2 border-t border-[#E8DFD1]">
          <p className="text-xs text-[#777064]">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#777064]">
            <Lock size={12} className="text-[#477A58]" />
            <span>Zero-Knowledge Vault • OAuth 2.0 PKCE Protected</span>
          </div>
        </div>
      </CardSpotlight>
    </div>
  );
}

