"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Edit3, 
  Sparkles, 
  AlertTriangle, 
  Fingerprint, 
  ArrowRight, 
  History,
  FileCode,
  Layers,
  Send,
  Calendar,
  CheckSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useApprovalStore } from "@/stores/use-approval-store";
import { ApprovalItem } from "@/lib/types";

export default function ApprovalsPage() {
  const { approvals, approveAction, rejectAction, modifyAction } = useApprovalStore();
  const [modifyingItem, setModifyingItem] = useState<ApprovalItem | null>(null);
  const [modifiedText, setModifiedText] = useState("");

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const openModifyDialog = (item: ApprovalItem) => {
    setModifyingItem(item);
    setModifiedText(JSON.stringify(item.diff.after, null, 2));
  };

  const handleSaveModification = () => {
    if (!modifyingItem) return;
    try {
      const parsed = JSON.parse(modifiedText);
      modifyAction(modifyingItem.id, parsed);
      setModifyingItem(null);
    } catch (e) {
      alert("Invalid JSON format in parameters.");
    }
  };

  return (
    <div className="space-y-6">
      {/* USP Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Approval Center</h2>
            <Badge variant="warning" className="text-[10px] px-2 font-mono">
              {pendingApprovals.length} PENDING DECISIONS
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Human-in-the-Loop Verification Gate. Review consequential agent operations before execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="glass"
            className="text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            onClick={() => {
              pendingApprovals.forEach((a) => approveAction(a.id));
            }}
          >
            <Check size={14} />
            <span>Batch Approve All ({pendingApprovals.length})</span>
          </Button>
        </div>
      </div>

      {/* Review Cards (GitHub PR Review Aesthetic) */}
      <div className="space-y-4">
        {approvals.map((item) => {
          const isPending = item.status === "pending";
          const isApproved = item.status === "approved";
          const isRejected = item.status === "rejected";
          const isModified = item.status === "modified";

          return (
            <Card
              key={item.id}
              className={`border transition-all duration-200 overflow-hidden shadow-xl ${
                isPending
                  ? "border-amber-500/40 bg-[#121824]"
                  : isApproved
                  ? "border-emerald-500/30 bg-emerald-950/[0.04]"
                  : isRejected
                  ? "border-red-500/20 bg-red-950/[0.04] opacity-60"
                  : "border-indigo-500/30 bg-card"
              }`}
            >
              {/* Card Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-white/5 bg-[#111827]/70 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-white/5 text-gray-300">
                    {item.diff.entityType === "email" ? (
                      <Send size={14} className="text-primary" />
                    ) : item.diff.entityType === "calendar" ? (
                      <Calendar size={14} className="text-emerald-400" />
                    ) : (
                      <CheckSquare size={14} className="text-amber-400" />
                    )}
                  </div>
                  <span className="font-semibold text-white">{item.title}</span>
                  <span className="text-[10px] text-gray-500 font-mono">#{item.id}</span>
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

              {/* Main PR-Style Body */}
              <CardContent className="p-5 space-y-4 text-xs">
                {/* 1. Plan & Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Originating User Request
                    </span>
                    <p className="p-2.5 rounded-lg bg-card-subtle border border-white/5 text-gray-300 italic font-sans">
                      "{item.originPrompt}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Agent Reasoning & Justification
                    </span>
                    <p className="p-2.5 rounded-lg bg-card-subtle border border-white/5 text-gray-300 font-sans">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* 2. Visual Diff (Data View) */}
                <div className="rounded-xl border border-white/10 bg-[#0B0F14] p-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-white/5 pb-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-300 font-sans font-semibold">
                      <FileCode size={13} className="text-primary" /> Proposed State Mutation
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Target: {item.targetService}
                    </span>
                  </div>

                  {item.diff.before && (
                    <div className="text-red-300/80 bg-red-950/20 p-2 rounded border border-red-500/20 space-y-0.5">
                      <span className="text-[9px] text-red-400 uppercase font-sans font-bold">
                        - CURRENT STATE:
                      </span>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(item.diff.before, null, 2)}</pre>
                    </div>
                  )}

                  <div className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/20 space-y-0.5">
                    <span className="text-[9px] text-emerald-400 uppercase font-sans font-bold">
                      + PROPOSED NEW STATE:
                    </span>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(item.diff.after, null, 2)}</pre>
                  </div>
                </div>

                {/* 3. Safety & Idempotency Key */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono px-1">
                  <span className="flex items-center gap-1">
                    <Fingerprint size={12} className="text-indigo-400" />
                    Idempotency Key: {item.idempotencyKey}
                  </span>
                  <span>Safety Gate: Rollback Supported</span>
                </div>
              </CardContent>

              {/* Action Buttons (Approve / Modify / Reject) */}
              {isPending && (
                <CardFooter className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-white/5 bg-[#111827]/40">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-400 hover:bg-red-500/10 border-white/10 gap-1.5"
                    onClick={() => rejectAction(item.id)}
                  >
                    <X size={13} />
                    <span>Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs text-gray-200 hover:bg-white/10 gap-1.5"
                    onClick={() => openModifyDialog(item)}
                  >
                    <Edit3 size={13} />
                    <span>Modify Parameters</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => approveAction(item.id)}
                  >
                    <Check size={14} />
                    <span>Approve & Dispatch</span>
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modify Parameters Modal */}
      <Dialog open={!!modifyingItem} onOpenChange={() => setModifyingItem(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Modify Action Parameters</DialogTitle>
            <DialogDescription>
              Adjust payload values before granting human approval for execution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase">
              Editable JSON Payload:
            </span>
            <Textarea
              rows={8}
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              className="font-mono text-xs bg-[#0B0F14] text-emerald-300 border-white/10"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModifyingItem(null)}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveModification}>
              Save & Stage Modified Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

