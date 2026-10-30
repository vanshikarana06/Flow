# FLOW — Agentic AI Personal Productivity Operating System

> **From scattered work to coordinated action.**  
> An agentic AI personal productivity operating system that coordinates Email, Calendar, and Tasks through a unified dashboard while keeping users in control with explicit human approval, state verification, and immutable activity logging.

---

## 🚀 Overview

FLOW is an Agentic AI Personal Productivity Operating System designed to eliminate the fragmentation of modern knowledge work. Instead of requiring users to manually copy-paste details between email, calendar, and task management apps, FLOW interprets user intent via natural language, devises an execution plan, coordinates actions across external services (Microsoft Graph API, Gmail API, and Google Calendar API), and verifies outcome status before recording it to an append-only activity ledger.

### Core Principles
- **Human Approval Required:** Critical or consequential actions (sending emails, deleting meetings, modifying task boards) require explicit user review with options to Approve, Reject, or Modify.
- **Verification Before Success:** Verifies external API responses and query states to avoid false completions.
- **Activity Logging:** Complete append-only audit trail capturing execution logs, approval decisions, and verification proofs.
- **Retry-Safe Execution:** Cryptographic idempotency keys prevent duplicate operations during retries.
- **Persistent User Memory:** Maintains long-term memory of contacts, relationships, preferences, events, and behavioral patterns.
- **Proactive Assistance:** Continuous background monitoring detects deadline risks, missing email replies, and schedule conflicts.
- **Explainable Actions:** Clear reasoning and retrieved context accompany every proposed plan.

---

## 🏗️ Approved System Architecture

| Layer | Technologies & Platforms |
| :--- | :--- |
| **Frontend** | Next.js, React, Tailwind CSS, Shadcn UI (Deployed on Vercel) |
| **Backend** | NestJS, Node.js, TypeScript (Deployed on Render) |
| **Local AI Layer** | LiteLLM, Ollama, Qwen 2.5 (Bridged via Cloudflare Tunnel) |
| **Database** | Supabase (PostgreSQL 15+ with `pgvector` extension) |
| **Integrations** | Microsoft Graph API (M365 Mail, Calendar, To Do), Gmail API, Google Calendar API |
| **10 Backend Modules** | Auth, Agent, Memory, Email, Calendar, Tasks, Approvals, Verification, Activities, Dashboard |

---

## 📂 Repository & Documentation Structure

All core specifications, architecture guides, and evaluation materials are organized within the [`docs/`](./docs) directory:

### 1. Foundations & Product Design
- [Project Overview](./docs/project-overview/overview.md) — Problem statement, product definition, and high-level goals.
- [Feature Specifications](./docs/features/feature-specifications.md) — Detailed functional requirements across all modules.
- [Product Design & Wireframes](./docs/product-design/design-and-wireframes.md) — UI/UX layouts, wireframes, and design philosophy.
- [Core User Flows](./docs/user-flows/core-user-flows.md) — End-to-end user journeys, approvals, and rescheduling flows.

### 2. Architecture & Agent Design
- [System Architecture](./docs/architecture/system-architecture.md) — Layered architecture, deployment topology, and request flows (with Mermaid diagrams).
- [Agent Orchestration](./docs/agent-design/agent-orchestration.md) — Multi-agent pipeline, memory retrieval, and execution flows (with Mermaid diagrams).
- [Approval & Verification Framework](./docs/agent-design/approval-and-verification.md) — HITL approval states, state verification, and retry protection (with Mermaid diagrams).

### 3. Engineering & Technical Specs
- [Frontend & Dashboard](./docs/frontend/frontend-and-dashboard.md) — Next.js architecture, component hierarchy, and navigation (with Mermaid diagrams).
- [Backend Setup & APIs](./docs/backend/backend-setup-and-apis.md) — NestJS architecture, 10 core modules, and REST/WebSocket API specs (with Mermaid diagrams).
- [Database Schema & Models](./docs/database/schema-and-models.md) — Relational schema, pgvector embeddings, and ER diagrams (with Mermaid diagrams).
- [Authentication & Security](./docs/security/auth-and-security.md) — OAuth 2.0 PKCE, token encryption, RLS policies, and threat model.
- [Test Plan & Quality Assurance](./docs/testing/test-plan.md) — Test matrix for modules, agent evaluation, and idempotency tests.

### 4. Integration Research & Market Analysis
- [Microsoft Graph Integration](./docs/microsoft-graph-research/graph-integration.md) — M365 Mail, Calendar, and To Do flows (with Mermaid diagrams).
- [API Evaluation](./docs/api-research/api-evaluation.md) — Comparative analysis of productivity APIs, LiteLLM, Ollama, and Cloudflare Tunnel.
- [Technical & Market Research](./docs/research/tech-and-market-research.md) — Industry landscape, agentic design patterns, and benchmarks.
- [Competitor Matrix](./docs/competitor-analysis/competitor-matrix.md) — Feature-by-feature comparative analysis.

### 5. Presentation & Evaluation Materials
- [Judges Summary](./docs/presentation-materials/judges-summary.md) — Executive summary tailored for hackathon evaluation.
- [Pitch Deck Outline](./docs/presentation-materials/pitch-deck-outline.md) — Slide-by-slide pitch structure, metrics, and value proposition.
- [Demo Script & Walkthrough](./docs/demo-scenarios/demo-script-and-walkthrough.md) — Scripted demonstration scenarios and flows.
- [Documentation Audit Report](./docs/documentation-audit-report.md) — Architectural synchronization and audit report.

---

## 🛠️ Status

The documentation is fully audited, synchronized, and validated against the FLOW System Architecture and Feature Source of Truth.
