"use client";

import React, { useState } from "react";
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  Activity,
  Sliders,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { mockIntegrations } from "@/lib/mock-data";
import { IntegrationItem } from "@/lib/types";
import { triggerConfetti } from "@/lib/confetti";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(mockIntegrations);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [configuringItem, setConfiguringItem] = useState<IntegrationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setIntegrations(integrations.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: item.status === "connected" ? "disconnected" : "connected",
            lastSynced: item.status === "connected" ? "Never" : "Just now"
          }
        : item
    ));
    setToastMessage("Integration status updated successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestPing = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      setToastMessage("API Handshake verified • 42ms roundtrip latency.");
      triggerConfetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });
      setTimeout(() => setToastMessage(null), 3000);
    }, 800);
  };

  return (
    <FadeIn className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 rounded-xl border border-[#CDE3D5] bg-[#EDF5F0] text-[#477A58] text-xs font-semibold shadow-elevated animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Integrations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Connected Integrations</h1>
            <Badge variant="verified" className="text-[10px] font-mono">
              {integrations.filter(i => i.status === "connected").length} CONNECTED SERVICES
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Manage authorized OAuth 2.0 PKCE connections, API tokens, and access scopes across your workspace.
          </p>
        </div>

        <Button
          onClick={() => {
            setToastMessage("All OAuth 2.0 PKCE tokens refreshed and cryptographically verified.");
            setTimeout(() => setToastMessage(null), 3000);
          }}
          size="sm"
          variant="outline"
          className="text-xs font-semibold gap-1.5 border-[#E8DFD1] hover:bg-[#F1EADF]"
        >
          <RefreshCw size={12} />
          <span>Sync All Tokens</span>
        </Button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const isConnected = item.status === "connected";
          const isTesting = testingId === item.id;

          return (
            <Card
              key={item.id}
              className={`border transition-all shadow-soft ${
                isConnected ? "border-[#E8DFD1] bg-[#FFFCF6]" : "border-[#E8DFD1] bg-[#F8F4EC]/40 opacity-70"
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between border-b border-[#E8DFD1] pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#F8F4EC] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-[#29251F]">
                    {item.provider === "microsoft" ? "M" : item.provider === "google" ? "G" : item.provider === "supabase" ? "S" : item.provider === "resend" ? "R" : "#"}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-[#29251F]">{item.name}</CardTitle>
                    <p className="text-[10px] text-[#777064] font-mono">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isConnected && (
                    <span className="h-2 w-2 rounded-full bg-[#477A58] animate-pulse mr-1" title="Live connection active" />
                  )}
                  <Badge
                    variant={isConnected ? "verified" : "secondary"}
                    className="text-[9px] uppercase font-mono"
                  >
                    {isConnected ? "Connected ✓" : "Disconnected"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                    Authorized Principal
                  </span>
                  <p className="text-[11px] font-mono text-[#29251F] truncate">
                    {item.connectedAccount}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                    Granted Scopes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.scopes.map((scope, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono text-[#777064] bg-[#F1EADF] px-1.5 py-0.5 rounded border border-[#E8DFD1]"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DFD1] flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!isConnected || isTesting}
                    onClick={() => handleTestPing(item.id)}
                    className="h-7 text-[11px] text-[#777064] hover:text-[#29251F] px-2 gap-1"
                  >
                    <Activity size={12} className={isTesting ? "animate-spin text-primary" : ""} />
                    <span>{isTesting ? "Pinging..." : "Test Ping"}</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfiguringItem(item)}
                      className="h-7 text-xs border-[#E8DFD1] px-2"
                    >
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant={isConnected ? "outline" : "default"}
                      onClick={() => toggleConnection(item.id)}
                      className="h-7 text-xs border-[#E8DFD1]"
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configure Scopes Modal */}
      <Dialog open={!!configuringItem} onOpenChange={(open) => !open && setConfiguringItem(null)}>
        {configuringItem && (
          <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[#29251F]">
                Configure Scopes: {configuringItem.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#777064]">
                Granular permissions granted to FLOW for autonomous tool execution.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-[#777064]">
                  <span>OAuth Provider:</span>
                  <span className="text-[#29251F] font-bold">{configuringItem.provider}</span>
                </div>
                <div className="flex justify-between text-[#777064]">
                  <span>Connected ID:</span>
                  <span className="text-[#29251F]">{configuringItem.connectedAccount}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-xs text-[#29251F]">Active Access Scopes:</span>
                {configuringItem.scopes.map((sc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8DFD1] text-[11px] font-mono">
                    <span>{sc}</span>
                    <Badge variant="verified" className="text-[8px]">Authorized</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfiguringItem(null)}
                className="text-xs border-[#E8DFD1]"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </FadeIn>
  );
}
