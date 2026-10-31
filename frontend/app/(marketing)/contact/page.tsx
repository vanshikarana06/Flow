"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Send, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { triggerConfetti } from "@/lib/confetti";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    triggerConfetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center space-y-3">
        <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-mono">
          GET IN TOUCH
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#29251F]">
          Contact FLOW Team
        </h1>
        <p className="text-sm text-[#777064] max-w-lg mx-auto">
          Have questions about self-hosting, enterprise HITL policy customization, or API integrations? We are here to help.
        </p>
      </section>

      {/* Form / Confirmation Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-soft max-w-xl mx-auto">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF5F0] text-[#477A58] border border-[#CDE3D5] mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#29251F]">Message Sent Successfully</h3>
            <p className="text-xs text-[#777064] max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out, {name}. Our engineering team has logged your inquiry and will respond to <strong>{email}</strong> within 24 hours.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setMessage("");
              }}
              variant="outline"
              size="sm"
              className="text-xs border-[#E8DFD1]"
            >
              Send Another Inquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#29251F]">Your Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vanshika Rana"
                required
                className="bg-[#FFFCF6] border-[#E8DFD1] text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#29251F]">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vanshika@example.com"
                required
                className="bg-[#FFFCF6] border-[#E8DFD1] text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#29251F]">Inquiry Details</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your team, deployment requirements, or questions..."
                required
                rows={4}
                className="bg-[#FFFCF6] border-[#E8DFD1] text-xs resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-semibold bg-primary hover:bg-[#B95727] text-white h-9 shadow-2xs gap-1.5"
            >
              <Send size={13} />
              <span>Send Message</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

