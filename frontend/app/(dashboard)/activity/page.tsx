"use client";

import React, { useState } from "react";
import { 
  History, 
  Download, 
  Fingerprint, 
  CheckCircle2, 
  Shield, 
  Copy, 
  Check, 
  Filter,
  Code2,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { mockLedger } from "@/lib/mock-data";
import { triggerConfetti } from "@/lib/confetti";

export default function ActivityPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("All");
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const categories = ["All", "Calendar", "Email", "Task", "Security"];

  const filtered = mockLedger.filter(item => 
    filterCat === "All" ? true : item.category.toLowerCase() === filterCat.toLowerCase()
  );

  const copyReceiptHash = (hash: string, id: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyJsonPayload = () => {
    navigator.clipboard?.writeText(JSON.stringify(mockLedger, null, 2));
    setCopiedJson(true);
    triggerConfetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <FadeIn className="space-y-5">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Activity History & Verification Ledger</h1>
            <Badge variant="verified" className="text-[10px] font-mono">
              Append-Only Ledger Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Cryptographic execution log: Plan Staged ➔ Approved ➔ Executed ➔ Verified ➔ Receipt Minted.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F1EADF] p-0.5 rounded-lg border border-[#E8DFD1]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filterCat === cat
                    ? "bg-[#FFFCF6] text-[#29251F] shadow-2xs font-semibold"
                    : "text-[#777064] hover:text-[#29251F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowExportModal(true)}
            className="text-xs font-semibold gap-1.5 border-[#E8DFD1] hover:bg-[#F1EADF]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export Audit Log (JSON)</span>
          </Button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <Card key={item.id} className="border-[#E8DFD1] bg-[#FFFCF6] overflow-hidden shadow-2xs hover:border-[#D0C4B2] transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#E8DFD1] bg-[#F8F4EC]/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EDF5F0] text-[#477A58] font-mono text-[10px] font-bold">
                  ✓
                </span>
                <h3 className="font-semibold text-[#29251F]">{item.title}</h3>
                <span className="text-[10px] text-[#777064] font-mono">#{item.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#777064] font-mono">{item.timestamp}</span>
                <Badge variant="verified" className="text-[9px] uppercase">
                  {item.status} ✓
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3 text-xs">
              {/* 5-Step Lifecycle Visual Progress Bar */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                  Verification Lifecycle Sequence
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">1. Plan Staged</span>
                    <p className="text-[9px] text-[#777064] mt-0.5">Agent Engine</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">2. Approved</span>
                    <p className="text-[9px] text-[#777064] mt-0.5">Vanshika (HITL)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">3. Executed</span>
                    <p className="text-[9px] text-[#777064] mt-0.5">{item.service}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">4. Verified</span>
                    <p className="text-[9px] text-[#777064] mt-0.5">API State Check</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#EDF5F0] border border-[#CDE3D5] text-[#477A58] shadow-2xs">
                    <span className="font-bold">5. Receipt Minted</span>
                    <p className="text-[9px] text-[#477A58] mt-0.5 font-semibold">SHA-256 Valid</p>
                  </div>
                </div>
              </div>

              {/* Cryptographic Receipt Box */}
              {item.receipt && (
                <div className="rounded-xl border border-[#E8DFD1] bg-[#F8F4EC]/50 p-3 space-y-1.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-[#777064] border-b border-[#E8DFD1]/60 pb-1">
                    <span className="flex items-center gap-1.5 text-xs text-[#477A58] font-sans font-semibold">
                      <Fingerprint size={13} /> Verification Proof
                    </span>
                    <span>
                      HTTP {item.receipt.httpStatus} • {item.receipt.latencyMs}ms latency
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[#29251F]">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[#777064]">Receipt Hash:</span>
                        <span className="text-primary truncate font-semibold">
                          <DecryptedText text={item.receipt.receiptHash} speed={30} characters="0123456789abcdef" />
                        </span>
                      </div>
                      <button
                        onClick={() => copyReceiptHash(item.receipt!.receiptHash, item.id)}
                        className="text-[#777064] hover:text-[#29251F] p-1 rounded hover:bg-[#F1EADF] shrink-0"
                        title="Copy Hash"
                      >
                        {copiedId === item.id ? <Check size={12} className="text-[#477A58]" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#777064]">Signature:</span>
                      <span className="text-[#777064]">{item.receipt.signature}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#777064]">Engine:</span>
                      <span className="text-[#477A58]">{item.receipt.verifiedBy}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* JSON Audit Log Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-primary" />
                <DialogTitle className="text-sm font-bold text-[#29251F]">
                  Cryptographic Audit Log Export (JSON)
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs text-[#777064]">
              Complete append-only audit trail containing cryptographic receipts, signatures, and timestamps.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 p-3 rounded-xl bg-[#29251F] text-[#EDE3D8] font-mono text-[11px] max-h-80 overflow-y-auto">
            <pre>{JSON.stringify(mockLedger, null, 2)}</pre>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD1]">
            <span className="text-xs text-[#777064] font-mono">{mockLedger.length} verified records</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(false)}
                className="text-xs border-[#E8DFD1]"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={copyJsonPayload}
                className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1.5"
              >
                {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedJson ? "Copied JSON!" : "Copy JSON to Clipboard"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
