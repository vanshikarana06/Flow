"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Edit3, 
  Send, 
  Calendar, 
  CheckSquare, 
  ArrowRight, 
  Clock, 
  Mail, 
  Fingerprint,
  AlertTriangle,
  RotateCcw,
  Loader2,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/ui/motion-primitives";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { triggerConfetti } from "@/lib/confetti";
import { useApprovalStore } from "@/stores/use-approval-store";
import { ApprovalItem } from "@/lib/types";

export default function ApprovalsPage() {
  const { approvals, approveAction, rejectAction, modifyAction, resetAll } = useApprovalStore();
  const [modifyingItem, setModifyingItem] = useState<ApprovalItem | null>(null);

  // Form states for structured modification (no raw JSON!)
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editNotification, setEditNotification] = useState("");

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const openModifyDialog = (item: ApprovalItem) => {
    setModifyingItem(item);
    if (item.diff.entityType === "email") {
      setEditSubject(item.diff.after.subject || "");
      setEditBody(item.diff.after.body || "");
    } else if (item.diff.entityType === "calendar") {
      setEditStartTime(item.diff.after.startTime || "");
      setEditNotification(item.diff.after.recipientNotification || "");
    }
  };

  const handleSaveModification = () => {
    if (!modifyingItem) return;
    let updated = { ...modifyingItem.diff.after };
    if (modifyingItem.diff.entityType === "email") {
      updated.subject = editSubject;
      updated.body = editBody;
    } else if (modifyingItem.diff.entityType === "calendar") {
      updated.startTime = editStartTime;
      updated.recipientNotification = editNotification;
    }
    modifyAction(modifyingItem.id, updated);
    setModifyingItem(null);
  };

  const getStatusBadge = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning" className="text-[10px] uppercase font-semibold">Pending Approval</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-[10px] uppercase text-[#D97736] border-[#D97736]/40 bg-[#D97736]/10 font-semibold">User Approved (Dispatching)</Badge>;
      case "executing":
        return (
          <Badge variant="outline" className="text-[10px] uppercase text-[#C58A32] border-[#C58A32]/40 bg-[#FEF8ED] font-semibold flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" /> Executing
          </Badge>
        );
      case "completed":
        return <Badge variant="verified" className="text-[10px] uppercase font-semibold">Executed & Verified ✓</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-[10px] uppercase font-semibold">Rejected</Badge>;
      case "modified":
        return <Badge variant="outline" className="text-[10px] uppercase text-primary border-primary/30 font-semibold">Parameters Modified</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-[10px] uppercase font-semibold">Execution Failed</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* USP Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Approval Center</h1>
            <Badge variant="warning" className="text-[10px] px-2 font-mono">
              {pendingApprovals.length} PENDING DECISIONS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Human-in-the-Loop Decision Gate. Consequential actions require your explicit authorization before execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingApprovals.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={resetAll}
              className="text-xs border-[#E8DFD1] hover:bg-[#F1EADF] gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset Demo State</span>
            </Button>
          )}

          {pendingApprovals.length > 0 && (
            <ShimmerButton
              shimmerColor="rgba(255, 255, 255, 0.45)"
              background="#D97736"
              className="h-8 gap-1.5 px-3"
              onClick={() => {
                triggerConfetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ["#F28C38", "#477A58", "#C65D20"],
                });
                pendingApprovals.forEach((a) => approveAction(a.id));
              }}
            >
              <Check size={13} />
              <span>Batch Authorize All ({pendingApprovals.length})</span>
            </ShimmerButton>
          )}
        </div>
      </div>

      {/* Review Cards (GitHub PR Review Archetype in Cream & Orange with Aceternity CardSpotlight) */}
      <FadeIn className="space-y-4">
        {approvals.map((item) => {
          const isPending = item.status === "pending";
          const isApproved = item.status === "approved";
          const isExecuting = item.status === "executing";
          const isCompleted = item.status === "completed";
          const isRejected = item.status === "rejected";

          const cardContent = (
            <div className="overflow-hidden rounded-xl">
              {/* Card Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#E8DFD1] bg-[#F8F4EC]/70 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#FFFCF6] border border-[#E8DFD1] text-[#29251F]">
                    {item.diff.entityType === "email" ? (
                      <Send size={13} className="text-[#D97736]" />
                    ) : item.diff.entityType === "calendar" ? (
                      <Calendar size={13} className="text-[#477A58]" />
                    ) : (
                      <CheckSquare size={13} className="text-[#C58A32]" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#29251F]">{item.title}</h3>
                  <span className="text-[10px] text-[#777064] font-mono">#{item.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.risk === "high"
                        ? "destructive"
                        : item.risk === "medium"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[9px] uppercase font-mono"
                  >
                    Risk: {item.risk}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Main Body: Reason + Structured Preview */}
              <CardContent className="p-4 space-y-3.5 text-xs">
                {/* Intent & Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#777064] uppercase tracking-wider">
                      Originating Request
                    </span>
                    <p className="p-2.5 rounded-lg bg-[#F1EADF]/50 border border-[#E8DFD1] text-[#29251F] italic font-sans text-[11px]">
                      "{item.originPrompt}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#777064] uppercase tracking-wider">
                      Agent Rationale & Target
                    </span>
                    <div className="p-2.5 rounded-lg bg-[#F1EADF]/50 border border-[#E8DFD1] text-[#29251F] font-sans text-[11px]">
                      <p>{item.description}</p>
                      <p className="text-[9px] text-[#777064] font-mono mt-1">
                        Service: <span className="text-[#29251F] font-semibold">{item.targetService}</span> • Idempotency: {item.idempotencyKey}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Domain-Specific Visual Preview (No Raw JSON Strings!) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-[#777064] uppercase tracking-wider">
                    Proposed Mutation Parameters (Inspect Before Approval)
                  </span>

                  {item.diff.entityType === "email" && (
                    <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3.5 space-y-2 text-xs shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between border-b border-[#E8DFD1]/70 pb-2 text-[11px] gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#777064]">To:</span>
                          <span className="font-semibold text-[#29251F] bg-[#F1EADF] px-2 py-0.5 rounded font-mono text-[10px]">
                            {item.diff.after.to}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#777064] font-mono">Outbound Gateway: Resend</span>
                      </div>
                      <div>
                        <span className="text-[#777064] text-[10px] font-mono">Subject:</span>
                        <h4 className="font-semibold text-[#29251F] text-xs">{item.diff.after.subject}</h4>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[11px] text-[#29251F] font-sans whitespace-pre-line leading-relaxed">
                        {item.diff.after.body}
                      </div>
                    </div>
                  )}

                  {item.diff.entityType === "calendar" && (
                    <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3.5 space-y-2.5 text-xs shadow-2xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg border border-[#F5C2BC] bg-[#FDEDEB]/60">
                          <span className="text-[10px] text-[#C65345] font-semibold uppercase font-mono">
                            Current Conflicting Slot
                          </span>
                          <p className="font-semibold text-[#29251F] mt-1">{item.diff.before?.startTime}</p>
                          <p className="text-[10px] text-[#C65345] mt-0.5">Overlaps with Partner Sync</p>
                        </div>

                        <div className="p-2.5 rounded-lg border border-[#CDE3D5] bg-[#EDF5F0]/60">
                          <span className="text-[10px] text-[#477A58] font-semibold uppercase font-mono">
                            Proposed Non-Conflicting Slot
                          </span>
                          <p className="font-semibold text-[#29251F] mt-1">{item.diff.after.startTime}</p>
                          <p className="text-[10px] text-[#477A58] mt-0.5">0 Collisions • Focus time preserved</p>
                        </div>
                      </div>
                      {item.diff.after.recipientNotification && (
                        <div className="p-2 rounded bg-[#F8F4EC] border border-[#E8DFD1] text-[10px] text-[#777064] flex items-center gap-1.5">
                          <Mail size={12} className="text-[#D97736]" />
                          <span>Notice: {item.diff.after.recipientNotification}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {item.diff.entityType === "task" && (
                    <div className="rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-3 space-y-2 text-xs shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#29251F]">{item.diff.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] line-through text-[#777064]">
                            {item.diff.before?.status} ({item.diff.before?.progress}%)
                          </span>
                          <ArrowRight size={12} className="text-[#777064]" />
                          <Badge variant="verified" className="text-[9px]">
                            {item.diff.after.status} (100%)
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cryptographic Execution Proof Banner (Visible when completed) */}
                {item.verificationReceipt && (
                  <div className="rounded-xl border border-[#CDE3D5] bg-[#EDF5F0]/60 p-3 space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-[#477A58] border-b border-[#CDE3D5] pb-1">
                      <span className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                        <Fingerprint size={13} /> Verified Execution Receipt
                      </span>
                      <span>HTTP {item.verificationReceipt.httpStatus} • {item.verificationReceipt.latencyMs}ms</span>
                    </div>
                    <div className="space-y-0.5 text-[#29251F]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[#777064]">Receipt Hash:</span>
                        <span className="text-[#D97736] font-bold truncate">{item.verificationReceipt.receiptHash}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#777064]">Engine:</span>
                        <span className="text-[#477A58]">{item.verificationReceipt.verifiedBy}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Action Decision Gate Footer (Only for Pending or Modified) */}
              {(isPending || item.status === "modified") && (
                <CardFooter className="px-4 py-3 bg-[#F8F4EC]/50 border-t border-[#E8DFD1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs gap-1"
                      onClick={() => rejectAction(item.id)}
                    >
                      <X size={13} />
                      <span>Reject Action</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 border-[#E8DFD1] hover:bg-[#F1EADF] text-[#29251F]"
                      onClick={() => openModifyDialog(item)}
                    >
                      <Edit3 size={13} />
                      <span>Modify Parameters</span>
                    </Button>
                  </div>

                  {item.risk === "high" ? (
                    <div className="w-full sm:w-72">
                      <SlideToConfirm
                        onConfirm={() => approveAction(item.id)}
                        label="Slide to Authorize (High Risk)"
                        confirmedLabel="Authorized & Dispatched"
                      />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs font-semibold gap-1.5 bg-[#477A58] hover:bg-[#3D6A4C] text-white shadow-2xs"
                      onClick={() => approveAction(item.id)}
                    >
                      <Check size={13} />
                      <span>Approve & Execute (HITL)</span>
                    </Button>
                  )}
                </CardFooter>
              )}
            </div>
          );

          if (isPending) {
            return (
              <CardSpotlight
                key={item.id}
                color="rgba(217, 119, 54, 0.08)"
                radius={320}
                className="border-[#F9E2BE] bg-[#FFFCF6]"
              >
                {cardContent}
              </CardSpotlight>
            );
          }

          return (
            <Card
              key={item.id}
              className={`border transition-all duration-200 overflow-hidden shadow-soft ${
                isCompleted
                  ? "border-[#CDE3D5] bg-[#EDF5F0]/20"
                  : isExecuting
                  ? "border-[#D97736]/40 bg-[#FFFCF6]"
                  : isRejected
                  ? "border-[#E8DFD1] bg-[#F1EADF]/30 opacity-60"
                  : "border-[#E8DFD1] bg-[#FFFCF6]"
              }`}
            >
              {cardContent}
            </Card>
          );
        })}
      </FadeIn>

      {/* Structured Parameter Modification Modal */}
      <Dialog open={!!modifyingItem} onOpenChange={(open) => !open && setModifyingItem(null)}>
        <DialogContent className="max-w-lg bg-[#FFFCF6] border-[#E8DFD1] text-[#29251F]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-[#29251F]">
              Modify Action Parameters: {modifyingItem?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#777064]">
              Adjust parameters before providing human authorization. These values will be validated and dispatched.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {modifyingItem?.diff.entityType === "email" && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#777064]">Subject Line</label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="h-8 text-xs bg-[#F8F4EC] border-[#E8DFD1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#777064]">Draft Body</label>
                  <Textarea
                    rows={5}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="text-xs bg-[#F8F4EC] border-[#E8DFD1] leading-relaxed"
                  />
                </div>
              </>
            )}

            {modifyingItem?.diff.entityType === "calendar" && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#777064]">Rescheduled Time Slot</label>
                  <Input
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="e.g. Friday, Oct 31, 04:30 PM"
                    className="h-8 text-xs bg-[#F8F4EC] border-[#E8DFD1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#777064]">Attendee Notification Note</label>
                  <Input
                    value={editNotification}
                    onChange={(e) => setEditNotification(e.target.value)}
                    placeholder="e.g. Sent to aditya@flow.ai"
                    className="h-8 text-xs bg-[#F8F4EC] border-[#E8DFD1]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModifyingItem(null)}
              className="text-xs border-[#E8DFD1]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveModification}
              className="text-xs font-semibold bg-[#D97736] hover:bg-[#B95727] text-white"
            >
              Save Parameters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
