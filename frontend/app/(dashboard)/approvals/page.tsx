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
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApprovalStore } from "@/stores/use-approval-store";
import { ApprovalItem } from "@/lib/types";

export default function ApprovalsPage() {
  const { approvals, approveAction, rejectAction, modifyAction } = useApprovalStore();
  const [modifyingItem, setModifyingItem] = useState<ApprovalItem | null>(null);

  // Form states for structured modification (no raw JSON!)
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editStartTime, setEditStartTime] = useState("");

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const openModifyDialog = (item: ApprovalItem) => {
    setModifyingItem(item);
    if (item.diff.entityType === "email") {
      setEditSubject(item.diff.after.subject || "");
      setEditBody(item.diff.after.body || "");
    } else if (item.diff.entityType === "calendar") {
      setEditStartTime(item.diff.after.startTime || "");
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
    }
    modifyAction(modifyingItem.id, updated);
    setModifyingItem(null);
  };

  return (
    <div className="space-y-5">
      {/* USP Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#29251F]">Approval Center</h2>
            <Badge variant="warning" className="text-[10px] px-2 font-mono">
              {pendingApprovals.length} PENDING DECISIONS
            </Badge>
          </div>
          <p className="text-xs text-[#777064] mt-0.5">
            Human-in-the-Loop Decision Gate. Inspect and review consequential actions before execution.
          </p>
        </div>

        {pendingApprovals.length > 0 && (
          <Button
            size="sm"
            variant="default"
            className="text-xs font-semibold gap-1.5"
            onClick={() => {
              pendingApprovals.forEach((a) => approveAction(a.id));
            }}
          >
            <Check size={13} />
            <span>Batch Approve All ({pendingApprovals.length})</span>
          </Button>
        )}
      </div>

      {/* Review Cards (GitHub PR Review Aesthetic in Cream & Orange) */}
      <div className="space-y-4">
        {approvals.map((item) => {
          const isPending = item.status === "pending";
          const isApproved = item.status === "approved";
          const isRejected = item.status === "rejected";

          return (
            <Card
              key={item.id}
              className={`border transition-all duration-200 overflow-hidden shadow-soft ${
                isPending
                  ? "border-[#F9E2BE] bg-[#FFFCF6]"
                  : isApproved
                  ? "border-[#CDE3D5] bg-[#EDF5F0]/20"
                  : "border-[#E8DFD1] bg-[#F1EADF]/30 opacity-60"
              }`}
            >
              {/* Card Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#E8DFD1] bg-[#F8F4EC]/70 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#FFFCF6] border border-[#E8DFD1] text-[#29251F]">
                    {item.diff.entityType === "email" ? (
                      <Send size={13} className="text-primary" />
                    ) : item.diff.entityType === "calendar" ? (
                      <Calendar size={13} className="text-[#477A58]" />
                    ) : (
                      <CheckSquare size={13} className="text-[#C58A32]" />
                    )}
                  </div>
                  <span className="font-semibold text-[#29251F]">{item.title}</span>
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
                  <Badge
                    variant={
                      isApproved ? "verified" : isPending ? "warning" : "secondary"
                    }
                    className="text-[10px] uppercase font-semibold"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>

              {/* Main Body: Reason + Rich Preview */}
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
                      Agent Rationale
                    </span>
                    <p className="p-2.5 rounded-lg bg-[#F1EADF]/50 border border-[#E8DFD1] text-[#29251F] font-sans text-[11px]">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Rich Domain Preview (Replacing Raw JSON) */}
                <div className="rounded-xl border border-[#E8DFD1] bg-[#F8F4EC]/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#777064] border-b border-[#E8DFD1] pb-1.5">
                    <span className="font-semibold text-[#29251F]">
                      Proposed Action Details
                    </span>
                    <span className="font-mono text-[10px]">
                      Target: {item.targetService}
                    </span>
                  </div>

                  {/* If Email Action */}
                  {item.diff.entityType === "email" && (
                    <div className="rounded-lg bg-[#FFFCF6] border border-[#E8DFD1] p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[11px] text-[#777064] border-b border-[#E8DFD1]/60 pb-1.5">
                        <Mail size={12} className="text-primary" />
                        <span>To: <strong className="text-[#29251F] font-mono">{item.diff.after.to}</strong></span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#29251F]">
                        Subject: {item.diff.after.subject}
                      </div>
                      <p className="text-[11px] text-[#777064] whitespace-pre-line leading-relaxed bg-[#F8F4EC]/50 p-2 rounded border border-[#E8DFD1]">
                        {item.diff.after.body}
                      </p>
                    </div>
                  )}

                  {/* If Calendar Action */}
                  {item.diff.entityType === "calendar" && (
                    <div className="rounded-lg bg-[#FFFCF6] border border-[#E8DFD1] p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[#FEF8ED] text-[#C58A32] border border-[#F9E2BE]">
                          <Clock size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#29251F]">{item.diff.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#777064] mt-1">
                            <span className="line-through text-[#C65345] bg-[#FDF2F0] px-1.5 py-0.5 rounded border border-[#F3C8C2]">
                              {item.diff.before?.startTime}
                            </span>
                            <ArrowRight size={12} className="text-[#777064]" />
                            <span className="font-semibold text-[#477A58] bg-[#EDF5F0] px-1.5 py-0.5 rounded border border-[#CDE3D5]">
                              {item.diff.after.startTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If Task Action */}
                  {item.diff.entityType === "task" && (
                    <div className="rounded-lg bg-[#FFFCF6] border border-[#E8DFD1] p-3 space-y-1.5 text-xs">
                      <p className="font-semibold text-[#29251F]">{item.diff.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#777064]">
                        <span>Status:</span>
                        <Badge variant="outline" className="text-[9px] line-through text-[#C65345]">
                          {item.diff.before?.status}
                        </Badge>
                        <ArrowRight size={11} />
                        <Badge variant="success" className="text-[9px]">
                          {item.diff.after.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cryptographic Idempotency Metadata */}
                <div className="flex items-center justify-between text-[10px] text-[#777064] font-mono px-1">
                  <span className="flex items-center gap-1">
                    <Fingerprint size={12} className="text-primary" />
                    Idempotency Key: {item.idempotencyKey}
                  </span>
                  <span className="text-[#477A58]">Rollback Verified</span>
                </div>
              </CardContent>

              {/* Action Buttons */}
              {isPending && (
                <CardFooter className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[#E8DFD1] bg-[#F8F4EC]/70">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs gap-1"
                    onClick={() => rejectAction(item.id)}
                  >
                    <X size={12} />
                    <span>Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs gap-1"
                    onClick={() => openModifyDialog(item)}
                  >
                    <Edit3 size={12} />
                    <span>Edit Proposal</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs font-semibold gap-1"
                    onClick={() => approveAction(item.id)}
                  >
                    <Check size={13} />
                    <span>Approve & Dispatch</span>
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {/* Structured Modify Proposal Dialog (Clean Forms, Not Raw JSON) */}
      <Dialog open={!!modifyingItem} onOpenChange={() => setModifyingItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Action Proposal</DialogTitle>
            <DialogDescription>
              Adjust proposal parameters directly before giving approval.
            </DialogDescription>
          </DialogHeader>

          {modifyingItem && (
            <div className="space-y-3 py-2 text-xs">
              {modifyingItem.diff.entityType === "email" ? (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#29251F]">Subject</label>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#29251F]">Email Message Body</label>
                    <Textarea
                      rows={5}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                    />
                  </div>
                </>
              ) : modifyingItem.diff.entityType === "calendar" ? (
                <div className="space-y-1">
                  <label className="font-semibold text-[#29251F]">Rescheduled Time Slot</label>
                  <Input
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="e.g. Friday, Oct 31, 04:00 PM"
                  />
                </div>
              ) : (
                <div className="p-3 bg-[#F1EADF] rounded text-[#777064]">
                  Confirm task status transition to completed.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button variant="ghost" size="sm" onClick={() => setModifyingItem(null)}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveModification}>
              Save & Update Proposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
