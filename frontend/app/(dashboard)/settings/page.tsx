"use client";

import React, { useState } from "react";
import { 
  Globe, 
  ShieldCheck, 
  Lock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [hitlEmail, setHitlEmail] = useState(true);
  const [hitlCalendar, setHitlCalendar] = useState(true);
  const [hitlTask, setHitlTask] = useState(false);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Settings Header */}
      <div className="pb-3 border-b border-[#E8DFD1]">
        <h2 className="text-base font-bold tracking-tight text-[#29251F]">System Settings & Guardrails</h2>
        <p className="text-xs text-[#777064] mt-0.5">
          Workspace integrations, Human-in-the-Loop decision policies, and security credentials.
        </p>
      </div>

      {/* Section 1: Connected Services */}
      <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
        <CardHeader>
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Globe size={15} className="text-primary" /> Connected Workspace Services
          </CardTitle>
          <CardDescription>
            Third-party API connections managed via OAuth 2.0 PKCE.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {/* Microsoft 365 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-[#FFFCF6] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-blue-600">
                M
              </div>
              <div>
                <h4 className="font-semibold text-[#29251F]">Microsoft 365 / Graph API</h4>
                <p className="text-[10px] text-[#777064] font-mono">Mail, Calendar, Tasks</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[9px]">
              CONNECTED ✓
            </Badge>
          </div>

          {/* Google Workspace */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-[#FFFCF6] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-red-600">
                G
              </div>
              <div>
                <h4 className="font-semibold text-[#29251F]">Google Workspace</h4>
                <p className="text-[10px] text-[#777064] font-mono">Gmail API, Google Calendar API</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[9px]">
              CONNECTED ✓
            </Badge>
          </div>

          {/* Supabase Database */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-[#FFFCF6] border border-[#E8DFD1] flex items-center justify-center font-bold text-xs text-[#477A58]">
                S
              </div>
              <div>
                <h4 className="font-semibold text-[#29251F]">Supabase PostgreSQL 15+</h4>
                <p className="text-[10px] text-[#777064] font-mono">pgvector extension, RLS policies</p>
              </div>
            </div>
            <Badge variant="verified" className="text-[9px]">
              HEALTHY ✓
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Human-in-the-Loop Safety Policies */}
      <Card className="border-[#E8DFD1] bg-[#FFFCF6]">
        <CardHeader>
          <CardTitle className="text-xs font-semibold flex items-center gap-2 text-[#C58A32]">
            <ShieldCheck size={15} /> Human Decision Guardrail Policies
          </CardTitle>
          <CardDescription>
            Specify which external mutations require human approval before execution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 text-xs">
          {/* Email Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
            <div>
              <h4 className="font-semibold text-[#29251F]">Outbound Email Confirmation</h4>
              <p className="text-[11px] text-[#777064]">Require approval before sending emails to external parties.</p>
            </div>
            <Button
              size="sm"
              variant={hitlEmail ? "default" : "outline"}
              className="h-6 text-[11px]"
              onClick={() => setHitlEmail(!hitlEmail)}
            >
              {hitlEmail ? "Enabled (Strict)" : "Disabled"}
            </Button>
          </div>

          {/* Calendar Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
            <div>
              <h4 className="font-semibold text-[#29251F]">Calendar Rescheduling & Cancellations</h4>
              <p className="text-[11px] text-[#777064]">Require approval when moving meetings with multiple attendees.</p>
            </div>
            <Button
              size="sm"
              variant={hitlCalendar ? "default" : "outline"}
              className="h-6 text-[11px]"
              onClick={() => setHitlCalendar(!hitlCalendar)}
            >
              {hitlCalendar ? "Enabled (Strict)" : "Disabled"}
            </Button>
          </div>

          {/* Task Policy */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F4EC]/60 border border-[#E8DFD1]">
            <div>
              <h4 className="font-semibold text-[#29251F]">Task Creation & Decomposition</h4>
              <p className="text-[11px] text-[#777064]">Allow agent to autonomously decompose and track tasks.</p>
            </div>
            <Button
              size="sm"
              variant={hitlTask ? "default" : "secondary"}
              className="h-6 text-[11px]"
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
