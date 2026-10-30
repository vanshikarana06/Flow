"use client";

import React, { useState } from "react";
import { 
  Brain, 
  Plus, 
  Sparkles, 
  HeartHandshake 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion-primitives";
import { mockContacts, mockPreferences } from "@/lib/mock-data";
import { useCopilotStore } from "@/stores/use-copilot-store";

export default function MemoryPage() {
  const [contacts] = useState(mockContacts);
  const [preferences] = useState(mockPreferences);
  const { toggleOpen, submitPrompt } = useCopilotStore();

  return (
    <FadeIn className="space-y-5">
      {/* Memory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Personal Memory & Context Graph</h1>
            <Badge variant="outline" className="text-[10px] text-[#D97736] border-[#F7D2BC] font-mono">
              1,420 Memory Items Indexed
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Relationship dossiers, working preferences, and learned behavioral patterns across your workspace.
          </p>
        </div>

        <Button
          onClick={() => {
            toggleOpen();
            submitPrompt("Add custom contact preference for Aditya: Always notify 15 mins before standup");
          }}
          size="sm"
          className="text-xs font-semibold gap-1.5 bg-[#D97736] hover:bg-[#B95727] text-white"
        >
          <Plus size={13} />
          <span>Add Custom Memory</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Relationship Dossiers */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#29251F] flex items-center gap-2">
              <HeartHandshake size={16} className="text-[#D97736]" /> Contact Relationship Dossiers
            </h2>
            <span className="text-[11px] text-[#777064] font-mono">{contacts.length} Contacts</span>
          </div>

          <div className="space-y-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="border-[#E8DFD1] bg-[#FFFCF6] p-4 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCEEE5] text-[#D97736] border border-[#F7D2BC] font-bold text-xs">
                      {contact.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#29251F]">{contact.name}</h3>
                      <p className="text-[11px] text-[#777064]">{contact.role}</p>
                      <p className="text-[10px] text-[#777064] font-mono mt-0.5">{contact.email}</p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="text-[9px] uppercase font-mono">
                    {contact.relationship}
                  </Badge>
                </div>

                {/* Stored Preferences */}
                <div className="rounded-lg bg-[#F8F4EC] p-2.5 space-y-1 border border-[#E8DFD1] text-xs">
                  <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                    Known Preferences
                  </span>
                  <ul className="space-y-0.5 text-[#29251F] text-[11px]">
                    {contact.preferences.map((pref, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#D97736] mt-0.5">•</span>
                        <span>{pref}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Behavioral Context */}
                <div className="rounded-lg bg-[#FCEEE5]/40 p-2.5 space-y-1 border border-[#F7D2BC] text-xs">
                  <span className="text-[9px] font-semibold text-[#D97736] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-[#D97736]" /> Learned Context
                  </span>
                  <ul className="space-y-0.5 text-[#777064] text-[11px]">
                    {contact.learnedContext.map((ctx, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#D97736] mt-0.5">↳</span>
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
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#29251F] flex items-center gap-2">
              <Brain size={16} className="text-[#477A58]" /> Working Habits & Rules
            </h2>
            <span className="text-[11px] text-[#777064] font-mono">{preferences.length} Active Rules</span>
          </div>

          <Card className="divide-y divide-[#E8DFD1] border-[#E8DFD1] bg-[#FFFCF6]">
            {preferences.map((pref) => (
              <div key={pref.id} className="p-3.5 space-y-0.5 text-xs hover:bg-[#F8F4EC]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-[#777064] uppercase tracking-wider">
                    {pref.category}
                  </span>
                  {pref.isLearned ? (
                    <Badge variant="default" className="text-[8px] bg-[#D97736]/10 text-[#D97736] border-[#D97736]/30">
                      AI Learned
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[8px] border-[#E8DFD1] text-[#777064]">
                      Explicit
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-[#29251F] text-xs">{pref.label}</h3>
                <p className="text-[#777064] text-[11px] font-sans">{pref.value}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </FadeIn>
  );
}
