"use client";

import React, { useState } from "react";
import { 
  History, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Filter, 
  Fingerprint, 
  Clock, 
  ExternalLink,
  Cpu,
  Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockLedger } from "@/lib/mock-data";

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Activity Ledger</h2>
            <Badge variant="verified" className="text-[10px]">
              Append-Only Store Active
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Complete cryptographic audit trail: Plan ➔ Approval ➔ Execution ➔ Verification ➔ Receipt.
          </p>
        </div>

        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-white/10 hover:bg-white/5">
          <Download size={13} />
          <span>Export Audit Log (JSON)</span>
        </Button>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {mockLedger.map((item, idx) => (
          <Card key={item.id} className="border-white/5 bg-card overflow-hidden shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-white/5 bg-[#111827]/70 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold">
                  ✓
                </span>
                <span className="font-semibold text-white">{item.title}</span>
                <span className="text-[10px] text-gray-500 font-mono">#{item.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-mono">{item.timestamp}</span>
                <Badge variant="verified" className="text-[10px] uppercase">
                  {item.status} ✓
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 space-y-4 text-xs">
              {/* 5-Step Lifecycle Visual Progress Bar */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Verification Lifecycle Sequence
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-[11px] font-mono">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-emerald-400 font-bold">1. Plan Staged</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">Agent Engine</p>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-emerald-400 font-bold">2. Approved</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">Vanshika (HITL)</p>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-emerald-400 font-bold">3. Executed</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">{item.service}</p>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-emerald-400 font-bold">4. Verified</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">API State Check</p>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold">5. Receipt Minted</span>
                    <p className="text-[9px] text-emerald-400 mt-0.5">SHA-256 Valid</p>
                  </div>
                </div>
              </div>

              {/* Cryptographic Receipt Box */}
              {item.receipt && (
                <div className="rounded-xl border border-white/10 bg-[#0B0F14] p-3.5 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-white/5 pb-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-sans font-semibold">
                      <Fingerprint size={14} /> Immutable Verification Receipt
                    </span>
                    <span className="text-[10px] text-gray-500">
                      HTTP {item.receipt.httpStatus} • {item.receipt.latencyMs}ms
                    </span>
                  </div>

                  <div className="space-y-1 text-gray-300 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Receipt Hash:</span>
                      <span className="text-indigo-300 truncate">{item.receipt.receiptHash}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Signature:</span>
                      <span className="text-gray-400">{item.receipt.signature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Verified By:</span>
                      <span className="text-emerald-400">{item.receipt.verifiedBy}</span>
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

