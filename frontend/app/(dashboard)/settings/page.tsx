"use client";

import React, { useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Globe, 
  Mail, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  RefreshCw,
  Bell,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [hitlEmail, setHitlEmail] = useState(true);
  const [hitlCalendar, setHitlCalendar] = useState(true);
  const [hitlTask, setHitlTask] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Settings Header */}
      <div className="pb-2 border-b border-white/5">
        <h2 className="text-xl font-bold tracking-tight text-white">System Settings & Guardrails</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage workspace integrations, Human-in-the-Loop approval policies, and cryptographic security credentials.
        </p>
      </div>

      {/* Section 1: Connected Workspaces & Integrations */}
      <Card className="border-white/5 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe size={16} className="text-primary" /> Connected Workspace Services
          </CardTitle>
          <CardDescription>
            Third-party API connections managed via OAuth 2.0 PKCE.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Microsoft 365 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-white/5 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center font-bold text-blue-400">
                M
              </div>
              <div>
                <h4 className="font-semibold text-white">Microsoft 365 / Graph API</h4>
                <p className="text-[10px] text-gray-400 font-mono">Mail.ReadWrite, Calendars.ReadWrite, Tasks.ReadWrite</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[10px]">
              CONNECTED ✓
            </Badge>
          </div>

          {/* Google Workspace */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-white/5 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center font-bold text-red-400">
                G
              </div>
              <div>
                <h4 className="font-semibold text-white">Google Workspace</h4>
                <p className="text-[10px] text-gray-400 font-mono">Gmail API, Google Calendar API</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[10px]">
              CONNECTED ✓
            </Badge>
          </div>

          {/* Supabase Database */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-white/5 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center font-bold text-emerald-400">
                S
              </div>
              <div>
                <h4 className="font-semibold text-white">Supabase PostgreSQL 15+</h4>
                <p className="text-[10px] text-gray-400 font-mono">pgvector extension, RLS policies active</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[10px]">
              HEALTHY ✓
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Human-in-the-Loop Safety Policies */}
      <Card className="border-white/5 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" /> Human Decision Guardrail Policies
          </CardTitle>
          <CardDescription>
            Specify which external mutations require explicit human approval before execution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Email Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-white/5">
            <div>
              <h4 className="font-semibold text-white">Outbound Email Confirmation</h4>
              <p className="text-[11px] text-gray-400">Require approval before dispatching emails to external parties.</p>
            </div>
            <Button
              size="sm"
              variant={hitlEmail ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setHitlEmail(!hitlEmail)}
            >
              {hitlEmail ? "Enabled (Strict)" : "Disabled"}
            </Button>
          </div>

          {/* Calendar Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-white/5">
            <div>
              <h4 className="font-semibold text-white">Calendar Modifications & Rescheduling</h4>
              <p className="text-[11px] text-gray-400">Require approval when moving or deleting meetings with multiple attendees.</p>
            </div>
            <Button
              size="sm"
              variant={hitlCalendar ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setHitlCalendar(!hitlCalendar)}
            >
              {hitlCalendar ? "Enabled (Strict)" : "Disabled"}
            </Button>
          </div>

          {/* Task Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle border border-white/5">
            <div>
              <h4 className="font-semibold text-white">Task Creation & Priority Changes</h4>
              <p className="text-[11px] text-gray-400">Allow agent to autonomously decompose and track tasks without prompt.</p>
            </div>
            <Button
              size="sm"
              variant={hitlTask ? "default" : "secondary"}
              className="h-7 text-xs"
              onClick={() => setHitlTask(!hitlTask)}
            >
              {hitlTask ? "Require Approval" : "Autonomous (Fast)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
