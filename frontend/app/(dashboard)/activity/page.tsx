"use client";

import React from "react";
import { 
  History, 
  Download, 
  Fingerprint, 
  CheckCircle2, 
  Shield 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockLedger } from "@/lib/mock-data";

export default function ActivityPage() {
  return (
    <div className="space-y-5">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#29251F]">Activity Ledger</h2>
            <Badge variant="verified" className="text-[10px]">
              Append-Only Ledger Active
            </Badge>
          </div>
          <p className="text-xs text-[#777064] mt-0.5">
            Cryptographic execution log: Plan Staged ➔ Approved ➔ Executed ➔ Verified ➔ Receipt Minted.
          </p>
        </div>

        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-[#E8DFD1] hover:bg-[#F1EADF]">
          <Download size={13} />
          <span>Export Audit Log (JSON)</span>
        </Button>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3.5">
        {mockLedger.map((item) => (
          <Card key={item.id} className="border-[#E8DFD1] bg-[#FFFCF6] overflow-hidden shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#E8DFD1] bg-[#F8F4EC]/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EDF5F0] text-[#477A58] font-mono text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold text-[#29251F]">{item.title}</span>
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
                  <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">1. Plan Staged</span>
                    <p className="text-[8px] text-[#777064] mt-0.5">Agent Engine</p>
                  </div>
                  <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">2. Approved</span>
                    <p className="text-[8px] text-[#777064] mt-0.5">Vanshika (HITL)</p>
                  </div>
                  <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">3. Executed</span>
                    <p className="text-[8px] text-[#777064] mt-0.5">{item.service}</p>
                  </div>
                  <div className="p-1.5 rounded bg-[#F8F4EC] border border-[#E8DFD1]">
                    <span className="text-[#477A58] font-bold">4. Verified</span>
                    <p className="text-[8px] text-[#777064] mt-0.5">API State Check</p>
                  </div>
                  <div className="p-1.5 rounded bg-[#EDF5F0] border border-[#CDE3D5] text-[#477A58]">
                    <span className="font-bold">5. Receipt Minted</span>
                    <p className="text-[8px] text-[#477A58] mt-0.5">SHA-256 Valid</p>
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
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[#777064]">Receipt Hash:</span>
                      <span className="text-primary truncate font-semibold">{item.receipt.receiptHash}</span>
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
    </div>
  );
}
