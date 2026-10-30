"use client";

import React, { useState } from "react";
import { 
  Brain, 
  UserCheck, 
  Plus, 
  Sparkles, 
  Settings2, 
  Search, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Layers,
  HeartHandshake
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockContacts, mockPreferences } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";

export default function MemoryPage() {
  const [contacts, setContacts] = useState(mockContacts);
  const [preferences, setPreferences] = useState(mockPreferences);
  const { toggleOpen, submitPrompt } = useCopilotStore();

  return (
    <div className="space-y-6">
      {/* Memory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Personal Memory & Context Graph</h2>
            <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
              1,420 Vectors Indexed
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Persistent relationship dossiers, working habits, and learned behavioral patterns across your workspace.
          </p>
        </div>

        <Button
          onClick={() => {
            toggleOpen();
            submitPrompt("Add custom contact preference for Aditya: Always notify 15 mins before standup");
          }}
          size="sm"
          className="text-xs font-semibold gap-1.5"
        >
          <Plus size={14} />
          <span>Add Custom Memory</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Relationship Dossiers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake size={14} className="text-primary" /> Contact Relationship Dossiers
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">{contacts.length} Contacts</span>
          </div>

          <div className="space-y-3.5">
            {contacts.map((contact) => (
              <Card key={contact.id} className="border-white/5 bg-card p-4 space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold text-sm">
                      {contact.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{contact.name}</h4>
                      <p className="text-xs text-gray-400">{contact.role}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{contact.email}</p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="text-[9px] uppercase font-mono">
                    {contact.relationship}
                  </Badge>
                </div>

                {/* Stored Preferences */}
                <div className="rounded-lg bg-card-subtle p-3 space-y-1.5 border border-white/5 text-xs">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Known Preferences
                  </span>
                  <ul className="space-y-1 text-gray-300">
                    {contact.preferences.map((pref, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{pref}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Behavioral Context */}
                <div className="rounded-lg bg-primary/[0.03] p-3 space-y-1.5 border border-primary/20 text-xs">
                  <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-primary" /> Learned Context
                  </span>
                  <ul className="space-y-1 text-gray-400 text-[11px]">
                    {contact.learnedContext.map((ctx, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 mt-0.5">↳</span>
                        <span>{ctx}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: User Preferences & Learned Patterns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain size={14} className="text-emerald-400" /> Working Habits & Rules
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">{preferences.length} Rules Active</span>
          </div>

          <Card className="divide-y divide-white/5 border-white/5 bg-card">
            {preferences.map((pref) => (
              <div key={pref.id} className="p-4 space-y-1 text-xs hover:bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    {pref.category}
                  </span>
                  {pref.isLearned ? (
                    <Badge variant="default" className="text-[9px] bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                      AI Learned
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] border-white/10 text-gray-400">
                      User Explicit
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-gray-200">{pref.label}</h4>
                <p className="text-gray-400 text-[11px] font-sans">{pref.value}</p>
              </div>
            ))}
          </Card>

          {/* AI Memory Insights Box */}
          <Card className="border-indigo-500/20 bg-indigo-500/[0.03] p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-indigo-300">
              <Sparkles size={14} className="text-primary" />
              <span>Semantic Memory Health</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              FLOW continuously updates contact weights and scheduling preferences based on your email threads and calendar approvals. Zero third-party LLM training is performed on this personal memory.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

