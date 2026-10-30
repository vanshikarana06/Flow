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
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockIntegrations } from "@/lib/mock-data";
import { IntegrationItem } from "@/lib/types";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(mockIntegrations);

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
  };

  return (
    <div className="space-y-5">
      {/* Integrations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#29251F]">Connected Integrations</h2>
            <Badge variant="verified" className="text-[10px] font-mono">
              {integrations.filter(i => i.status === "connected").length} CONNECTED SERVICES
            </Badge>
          </div>
          <p className="text-xs text-[#777064] mt-0.5">
            Manage authorized OAuth 2.0 PKCE connections, API tokens, and access scopes across your productivity stack.
          </p>
        </div>

        <Button
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
                    <CardTitle className="text-xs font-semibold text-[#29251F]">{item.name}</CardTitle>
                    <p className="text-[10px] text-[#777064] font-mono">{item.category}</p>
                  </div>
                </div>

                <Badge
                  variant={isConnected ? "verified" : "secondary"}
                  className="text-[9px] uppercase font-mono"
                >
                  {isConnected ? "Connected ✓" : "Disconnected"}
                </Badge>
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

                <div className="pt-2 border-t border-[#E8DFD1] flex items-center justify-between">
                  <span className="text-[10px] text-[#777064] font-mono">
                    {item.authType}
                  </span>
                  <Button
                    size="sm"
                    variant={isConnected ? "outline" : "default"}
                    onClick={() => toggleConnection(item.id)}
                    className="h-7 text-xs border-[#E8DFD1]"
                  >
                    {isConnected ? "Disconnect" : "Connect Account"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
