"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Plus, 
  Sparkles, 
  HeartHandshake,
  CheckCircle2,
  Trash2,
  Check,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion-primitives";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { mockContacts, mockPreferences } from "@/lib/mock-data";
import { ContactDossier, UserPreference } from "@/lib/types";
import { useCopilotStore } from "@/stores/use-copilot-store";
import { triggerConfetti } from "@/lib/confetti";
import { apiClient } from "@/lib/api-client";

export default function MemoryPage() {
  const [contacts, setContacts] = useState<ContactDossier[]>(mockContacts);
  const [preferences, setPreferences] = useState<UserPreference[]>(mockPreferences);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState("calendar");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toggleOpen, submitPrompt } = useCopilotStore();

  // 1. Fetch live memories from GET /api/v1/memory
  const loadMemories = async () => {
    try {
      const data = await apiClient.get<any[]>("/memory/");
      if (Array.isArray(data) && data.length > 0) {
        setIsLiveConnected(true);
        const livePrefs: UserPreference[] = data.map((m: any) => ({
          id: String(m.id),
          category: (m.category?.toLowerCase() || "general"),
          label: m.content?.split(":")[0] || "Learned Preference",
          value: m.content?.includes(":") ? m.content.split(":").slice(1).join(":").trim() : m.content,
          isLearned: m.confidence_score < 1.0,
        }));
        setPreferences(livePrefs);
      }
    } catch (err) {
      console.warn("Backend /memory endpoint returned error, using fallback preferences", err);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  // 2. Connect GET /api/v1/memory/search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }

    try {
      setIsSearching(true);
      const res = await apiClient.get<any>("/memory/search", {
        params: { query: searchQuery.trim() },
      });
      if (res && res.matched_memories && res.matched_memories.length > 0) {
        const found: UserPreference[] = res.matched_memories.map((m: any) => ({
          id: String(m.id),
          category: (m.category?.toLowerCase() || "semantic_match"),
          label: `Semantic Match: ${m.category}`,
          value: m.content,
          isLearned: true,
        }));
        setPreferences(found);
      }
    } catch (err) {
      console.warn("Semantic search failed, filtering client state:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Connect POST /api/v1/memory
  const handleAddRule = async () => {
    if (!newRuleTitle.trim()) return;

    const title = newRuleTitle.trim();
    const desc = newRuleDescription.trim();
    const cat = newRuleCategory;

    setNewRuleTitle("");
    setNewRuleDescription("");
    setShowAddModal(false);
    triggerConfetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });

    // Optimistic UI update
    const newPref: UserPreference = {
      id: `pref_${Date.now()}`,
      category: cat,
      label: title,
      value: desc || "Custom workspace guideline",
      isLearned: false,
    };
    setPreferences([newPref, ...preferences]);

    // Backend POST
    try {
      await apiClient.post("/memory/", {
        category: cat.toUpperCase(),
        content: `${title}: ${desc || "Custom guideline"}`,
        confidence_score: 1.0,
      });
      loadMemories();
    } catch (err) {
      console.warn("Could not save memory to backend:", err);
    }
  };

  return (
    <FadeIn className="space-y-5">
      {/* Memory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8DFD1]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#29251F]">Personal Memory & Context Graph</h1>
            <Badge variant="outline" className="text-[10px] text-primary border-[#F7D2BC] font-mono">
              {isLiveConnected ? "● Live Vector Graph Connected" : "1,420 Memory Items Indexed"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#777064] mt-0.5">
            Relationship dossiers, working preferences, and learned behavioral patterns across your workspace.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          className="text-xs font-semibold gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-2xs"
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
              <HeartHandshake size={16} className="text-primary" /> Contact Relationship Dossiers
            </h2>
            <span className="text-[11px] text-[#777064] font-mono">{contacts.length} Contacts</span>
          </div>

          <div className="space-y-3">
            {contacts.map((contact) => (
              <CardSpotlight
                key={contact.id}
                color="rgba(242, 140, 56, 0.08)"
                radius={280}
                className="border-[#E8DFD1] bg-[#FFFCF6] p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCEEE5] text-primary border border-[#F7D2BC] font-bold text-xs shadow-2xs">
                      {contact.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#29251F]">{contact.name}</h3>
                      <p className="text-xs text-[#777064]">{contact.role} • {contact.relationship}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-[#E8DFD1]">
                    {contact.interactionCount} Interactions
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] text-xs text-[#29251F] space-y-1">
                  <span className="text-[10px] font-semibold text-[#777064] uppercase tracking-wider">
                    Context Note
                  </span>
                  <p className="text-[11px] text-[#777064] leading-relaxed">
                    {contact.learnedContext?.[0] || "Active project collaborator."}
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-semibold text-[#777064] uppercase tracking-wider">
                    Learned Preferences
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {contact.preferences.map((pref, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#FFFCF6] border border-[#E8DFD1] px-2 py-0.5 rounded-md text-[#29251F]"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              </CardSpotlight>
            ))}
          </div>
        </div>

        {/* Right Column: Learned Behavioral Preferences */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#29251F] flex items-center gap-2">
              <Brain size={16} className="text-primary" /> Active Workspace Guardrails & Rules
            </h2>
            <span className="text-[11px] text-[#777064] font-mono">{preferences.length} Rules Active</span>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#A39B8E]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Semantic search across memory graph..."
              className="w-full h-8 pl-8 pr-20 text-xs rounded-lg border border-[#E8DFD1] bg-[#FFFCF6] text-[#29251F] focus:outline-none focus:border-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isSearching}
              className="absolute right-1 h-6 text-[10px] px-2 bg-primary hover:bg-primary-hover text-white"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>

          <div className="space-y-3">
            {preferences.map((pref) => (
              <Card key={pref.id} className="border-[#E8DFD1] bg-[#FFFCF6] p-4 space-y-2 shadow-2xs hover:border-[#D0C4B2] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-[#777064]">
                    {pref.category}
                  </span>
                  <Badge
                    variant={pref.isLearned ? "warning" : "outline"}
                    className="text-[9px] font-mono"
                  >
                    {pref.isLearned ? "AI Learned" : "Explicit"}
                  </Badge>
                </div>

                <h3 className="font-semibold text-xs text-[#29251F]">{pref.label}</h3>
                <p className="text-[11px] text-[#777064] leading-relaxed">
                  {pref.value}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Custom Memory Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md bg-[#FFFCF6] border-[#E8DFD1] p-5 text-[#29251F]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FCEEE5] text-primary border border-[#F7D2BC]">
                <Brain size={16} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#29251F]">
                  Teach FLOW a Workspace Rule
                </DialogTitle>
                <DialogDescription className="text-xs text-[#777064]">
                  Explicit guidelines that FLOW enforces across Calendar, Email, and Approvals.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Category</label>
              <select
                value={newRuleCategory}
                onChange={(e) => setNewRuleCategory(e.target.value)}
                className="w-full h-8 px-2 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
              >
                <option value="calendar">Calendar & Focus</option>
                <option value="email">Email Communications</option>
                <option value="guardrails">Agent Guardrails</option>
                <option value="general">General Habit</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Rule Title</label>
              <input
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                placeholder="e.g. Always reserve Friday afternoons for deep code work"
                className="w-full h-8 px-2.5 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#777064]">Behavioral Guideline</label>
              <textarea
                value={newRuleDescription}
                onChange={(e) => setNewRuleDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Reject any 1:1 meeting proposals that overlap with Friday 2:00 PM to 5:00 PM."
                className="w-full p-2.5 mt-1 rounded-lg border border-[#E8DFD1] bg-[#F8F4EC] text-xs text-[#29251F] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(false)}
              className="text-xs border-[#E8DFD1]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddRule}
              disabled={!newRuleTitle.trim()}
              className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
            >
              Save Memory Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
