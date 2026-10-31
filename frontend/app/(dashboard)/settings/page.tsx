"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Globe, 
  ShieldCheck, 
  Lock, 
  Layers, 
  ArrowRight, 
  Sliders, 
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { triggerConfetti } from "@/lib/confetti";

export default function SettingsPage() {
  const [hitlEmail, setHitlEmail] = useState(true);
  const [hitlCalendar, setHitlCalendar] = useState(true);
  const [hitlTask, setHitlTask] = useState(false);
  const [quotaPerHour, setQuotaPerHour] = useState(15);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerConfirmText, setDangerConfirmText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePurgeMemory = () => {
    if (dangerConfirmText !== "PURGE") return;
    setShowDangerModal(false);
    setDangerConfirmText("");
    showNotification("Cached session memory vector embeddings purged successfully.");
    triggerConfetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
  };

  return (
    <FadeIn className="space-y-5 max-w-3xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] text-xs font-semibold shadow-elevated animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Header */}
      <div className="pb-3 border-b border-[#E8DFD1]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">System Settings & Guardrails</h1>
        <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
          Workspace integrations, Human-in-the-Loop decision policies, and security credentials.
        </p>
      </div>

      {/* Section 1: Connected Services Quick View */}
      <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#29251F]">
              <Globe size={15} className="text-primary" /> Connected Workspace Services
            </CardTitle>
            <CardDescription>
              Third-party API connections managed via OAuth 2.0 PKCE.
            </CardDescription>
          </div>
          <Link href="/integrations">
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1 border-[#E8DFD1] hover:bg-[#F1EADF]">
              <span>Manage Integrations</span>
              <ArrowRight size={12} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {/* Microsoft 365 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-[#FFFCF6] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-blue-600">
                M
              </div>
              <div>
                <h4 className="font-semibold text-[#29251F]">Microsoft 365 / Graph API</h4>
                <p className="text-[10px] text-[#777064] font-mono">Mail, Calendar, Tasks • vanshika@flow.ai</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[9px]">
              CONNECTED ✓
            </Badge>
          </div>

          {/* Google Workspace */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-[#FFFCF6] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-red-600">
                G
              </div>
              <div>
                <h4 className="font-semibold text-[#29251F]">Google Workspace</h4>
                <p className="text-[10px] text-[#777064] font-mono">Gmail API, Google Calendar API • vanshika.flow@gmail.com</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[9px]">
              CONNECTED ✓
            </Badge>
          </div>

          {/* Supabase Database */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-[#FFFCF6] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-[#477A58]">
                S
              </div>
              <div>
                <h4 className="font-semibold text-[#29251F]">Supabase PostgreSQL 15+</h4>
                <p className="text-[10px] text-[#777064] font-mono">pgvector extension, RLS policies</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[9px]">
              HEALTHY ✓
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Human-in-the-Loop Safety Policies */}
      <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#C58A32]">
            <ShieldCheck size={16} /> Human Decision Guardrail Policies
          </CardTitle>
          <CardDescription>
            Specify which external mutations require human approval before execution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 text-xs">
          {/* Email Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
            <div>
              <h4 className="font-semibold text-[#29251F]">Outbound Email Confirmation</h4>
              <p className="text-[11px] text-[#777064]">Require approval before sending emails to external parties.</p>
            </div>
            <Button
              size="sm"
              variant={hitlEmail ? "default" : "outline"}
              className={`h-7 text-[11px] font-semibold ${hitlEmail ? "bg-primary hover:bg-primary-hover text-white" : "border-[#E8DFD1]"}`}
              onClick={() => {
                setHitlEmail(!hitlEmail);
                showNotification(`Outbound email guardrail set to ${!hitlEmail ? "Strict Approval" : "Autonomous"}`);
              }}
            >
              {hitlEmail ? "Enabled (Strict)" : "Disabled"}
            </Button>
          </div>

          {/* Calendar Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
            <div>
              <h4 className="font-semibold text-[#29251F]">Calendar Rescheduling & Cancellations</h4>
              <p className="text-[11px] text-[#777064]">Require approval when moving meetings with multiple attendees.</p>
            </div>
            <Button
              size="sm"
              variant={hitlCalendar ? "default" : "outline"}
              className={`h-7 text-[11px] font-semibold ${hitlCalendar ? "bg-primary hover:bg-primary-hover text-white" : "border-[#E8DFD1]"}`}
              onClick={() => {
                setHitlCalendar(!hitlCalendar);
                showNotification(`Calendar reschedule guardrail set to ${!hitlCalendar ? "Strict Approval" : "Autonomous"}`);
              }}
            >
              {hitlCalendar ? "Enabled (Strict)" : "Disabled"}
            </Button>
          </div>

          {/* Task Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
            <div>
              <h4 className="font-semibold text-[#29251F]">Task Creation & Decomposition</h4>
              <p className="text-[11px] text-[#777064]">Allow agent to autonomously decompose and track tasks.</p>
            </div>
            <Button
              size="sm"
              variant={hitlTask ? "default" : "secondary"}
              className={`h-7 text-[11px] font-semibold ${hitlTask ? "bg-primary hover:bg-primary-hover text-white" : "bg-[#F1EADF] text-[#777064]"}`}
              onClick={() => {
                setHitlTask(!hitlTask);
                showNotification(`Task decomposition guardrail set to ${!hitlTask ? "Strict Approval" : "Autonomous"}`);
              }}
            >
              {hitlTask ? "Enabled (Strict)" : "Autonomous"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Autonomous Execution Quota */}
      <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#29251F]">
            <Sliders size={16} className="text-primary" /> Autonomous Action Quota & Rate Limits
          </CardTitle>
          <CardDescription>
            Prevent agent runaway execution with strict hourly action budgets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#29251F]">Max Operations Per Hour:</span>
            <span className="font-mono font-bold text-primary text-sm">{quotaPerHour} actions / hr</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={quotaPerHour}
            onChange={(e) => setQuotaPerHour(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <p className="text-[10px] text-[#777064]">
            If this quota is reached, all subsequent operations are paused and require explicit Human-in-the-Loop authorization.
          </p>
        </CardContent>
      </Card>

      {/* Section 4: Danger Zone */}
      <Card className="border-[#F5C2BC] bg-[#FDEDEB]/40">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#C65345]">
            <AlertTriangle size={16} /> Danger Zone
          </CardTitle>
          <CardDescription className="text-[#C65345]/80">
            Irreversible actions affecting stored memory vector embeddings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#29251F]">Purge Session Memory Vector Embeddings</h4>
              <p className="text-[11px] text-[#777064]">Clear learned working preferences and relationship dossiers.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDangerModal(true)}
              className="h-8 text-xs font-semibold gap-1 bg-[#C65345] hover:bg-[#A84337]"
            >
              <Trash2 size={12} />
              <span>Purge Memory</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Confirmation Modal */}
      <Dialog open={showDangerModal} onOpenChange={setShowDangerModal}>
        <DialogContent className="max-w-md bg-[#FFFCF6] border-[#F5C2BC] p-5 text-[#29251F]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FDEDEB] text-[#C65345] border border-[#F5C2BC]">
                <AlertTriangle size={18} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#C65345]">
                  Confirm Memory Vector Purge
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  This will purge 1,420 indexed memory embeddings. This cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-[#29251F]">
              To confirm, type <strong className="font-mono text-[#C65345]">PURGE</strong> below:
            </p>
            <input
              value={dangerConfirmText}
              onChange={(e) => setDangerConfirmText(e.target.value)}
              placeholder="Type PURGE to confirm"
              className="w-full h-9 px-3 rounded-lg border border-[#F5C2BC] bg-[#FDEDEB]/60 text-xs font-mono text-[#29251F] focus:outline-none focus:border-[#C65345]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDangerModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={dangerConfirmText !== "PURGE"}
              onClick={handlePurgeMemory}
              className="text-xs font-semibold bg-[#C65345] hover:bg-[#A84337] text-white disabled:opacity-40"
            >
              Confirm Purge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
