"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  PauseCircle, 
  Play, 
  Layers, 
  Sliders, 
  AlertTriangle, 
  ArrowRight,
  Shield,
  Activity,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { NumberTicker } from "@/components/ui/number-ticker";
import { mockAgents } from "@/lib/mock-data";
import { AgentItem } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { triggerConfetti } from "@/lib/confetti";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentItem[]>(mockAgents);
  const [editingGuardrailAgent, setEditingGuardrailAgent] = useState<AgentItem | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<AgentItem["hitlPolicy"]>("strict");
  const { toggleOpen, submitPrompt } = useCopilotStore();

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map(a => 
      a.id === id 
        ? { ...a, status: a.status === "active" ? "paused" : "active" } 
        : a
    ));
  };

  const handleOpenGuardrails = (agent: AgentItem) => {
    setEditingGuardrailAgent(agent);
    setSelectedPolicy(agent.hitlPolicy);
  };

  const handleSaveGuardrails = () => {
    if (!editingGuardrailAgent) return;
    setAgents(agents.map(a => 
      a.id === editingGuardrailAgent.id 
        ? { ...a, hitlPolicy: selectedPolicy } 
        : a
    ));
    setEditingGuardrailAgent(null);
    triggerConfetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  return (
    <FadeIn className="space-y-5">
      {/* Agents Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">AI Agent Fleet</h1>
            <Badge variant="verified" className="text-[10px] font-mono">
              {agents.filter(a => a.status === "active").length} ACTIVE AGENTS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Autonomous workspace agents with transparent capabilities, connected tools, and strict HITL safety boundaries.
          </p>
        </div>

        <Button
          onClick={() => {
            toggleOpen();
            submitPrompt("Configure a new autonomous monitoring routine for calendar follow-ups");
          }}
          size="sm"
          className="text-xs font-semibold gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-2xs"
        >
          <Sparkles size={13} />
          <span>Deploy New Agent</span>
        </Button>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const isActive = agent.status === "active";

          return (
            <Card
              key={agent.id}
              className={`border transition-all shadow-soft ${
                isActive ? "border-[#E8DFD1] bg-[#FFFCF6]" : "border-[#E8DFD1] bg-[#F8F4EC]/40 opacity-75"
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between border-b border-[#E8DFD1] pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FCEEE5] text-primary border border-[#F7D2BC] mt-0.5 shadow-2xs">
                    <Cpu size={16} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-[#29251F]">
                      {agent.name}
                    </CardTitle>
                    <p className="text-[10px] text-[#777064] font-mono mt-0.5">
                      Last active: {agent.lastActive}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={isActive ? "verified" : "secondary"}
                    className="text-[9px] uppercase font-mono"
                  >
                    {isActive ? "Active 🟢" : "Paused ⏸"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5 text-xs">
                <p className="text-[11px] text-[#777064] leading-relaxed">
                  {agent.description}
                </p>

                {/* Connected Services */}
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                    Connected Integrations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agent.connectedServices.map((svc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#F1EADF] text-[#29251F] text-[10px] border border-[#E8DFD1] font-mono"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Safety & Permissions with NumberTicker */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-[10px]">
                  <div>
                    <span className="text-[#777064] uppercase font-mono">HITL Guardrail:</span>
                    <p className="font-semibold text-[#29251F] uppercase mt-0.5">
                      {agent.hitlPolicy} Approval
                    </p>
                  </div>
                  <div>
                    <span className="text-[#777064] uppercase font-mono">Actions Today:</span>
                    <p className="font-semibold text-primary mt-0.5 flex items-center gap-1">
                      <NumberTicker value={agent.actionsExecutedToday} /> staged
                    </p>
                  </div>
                </div>

                {/* Authorized Capabilities */}
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                    Authorized Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agent.permissions.map((perm, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono text-[#777064] bg-[#FFFCF6] px-1.5 py-0.5 rounded border border-[#E8DFD1]"
                      >
                        • {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agent Action Buttons */}
                <div className="pt-2 border-t border-[#E8DFD1] flex items-center justify-between">
                  <Button
                    size="sm"
                    variant={isActive ? "outline" : "default"}
                    onClick={() => toggleAgentStatus(agent.id)}
                    className="h-7 text-xs gap-1 border-[#E8DFD1]"
                  >
                    {isActive ? <PauseCircle size={12} /> : <Play size={12} />}
                    <span>{isActive ? "Pause Agent" : "Resume Agent"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenGuardrails(agent)}
                    className="h-7 text-[11px] text-[#777064] hover:text-[#29251F] gap-1"
                  >
                    <Sliders size={12} />
                    <span>Guardrails</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Guardrails Adjustment Modal */}
      <Dialog open={!!editingGuardrailAgent} onOpenChange={(open) => !open && setEditingGuardrailAgent(null)}>
        {editingGuardrailAgent && (
          <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
                  <Shield size={16} />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-[#29251F]">
                    Tune Safety Guardrails: {editingGuardrailAgent.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-[#777064]">
                    Set the autonomy boundary for action dispatches.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-2">
                {(["strict", "moderate", "autonomous"] as const).map((policy) => (
                  <button
                    key={policy}
                    type="button"
                    onClick={() => setSelectedPolicy(policy)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedPolicy === policy
                        ? "border-primary bg-[#FCEEE5]/50 ring-1 ring-primary"
                        : "border-[#E8DFD1] bg-[#F8F4EC] hover:bg-[#F1EADF]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase text-[#29251F]">{policy} Approval</span>
                      {selectedPolicy === policy && <Check size={14} className="text-primary" />}
                    </div>
                    <p className="text-[11px] text-[#777064] mt-0.5">
                      {policy === "strict" && "Requires explicit human sign-off on every action before API dispatch."}
                      {policy === "moderate" && "Automatically executes low-risk actions. High-risk actions require human sign-off."}
                      {policy === "autonomous" && "Auto-dispatches within pre-configured budget boundaries and mints ledger receipts."}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGuardrailAgent(null)}
                className="text-xs border-[#E8DFD1]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveGuardrails}
                className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
              >
                Apply Guardrails
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </FadeIn>
  );
}
