# FLOW — Frontend Style Guide & Design System Specification

**Document Version:** 1.0  
**Status:** Approved Specification  
**Design Paradigm:** Notion + Linear + Cursor + Arc Browser + Raycast  
**Theme:** Dark Mode First  
**Base Technologies:** Next.js 15 · Tailwind CSS · Shadcn UI · Framer Motion · Lucide Icons  

---

## 1. Executive Summary & Aesthetic DNA

FLOW is a **Trust-First Agentic Productivity Operating System**. Its user interface balances deep information density with high aesthetic clarity.

### The Five Aesthetic Influences
1. **Linear (Precision & Operational Speed):** High contrast, 1px borders, compact typography, keyboard-first interactions, and instantaneous state transitions.
2. **Notion (Structure & Content Organization):** Clean nesting, clear document hierarchy, and readable typography for complex context.
3. **Cursor (Agentic Transparency):** Visual plan execution DAGs, step-by-step progress pills, inline diffs, and real-time reasoning logs.
4. **Arc Browser (Fluid Navigation & Workspace Layout):** Collapsible sidebar rail, pill-shaped toggles, multi-pane fluid viewports, and subtle glassmorphic backgrounds.
5. **Raycast (Action Palettes & Command Speed):** Global Command Menu (`⌘K`), quick-action keyboard chords (`⌘J`, `⌘B`), and zero-latency filtering.

---

## 2. Color System & Design Tokens

FLOW utilizes a dark-mode-first color palette designed to reduce cognitive fatigue while highlighting consequential agent decisions.

### 2.1 Surface & Background Tokens

| Token | Hex Value | Semantic Role | Usage Example |
| :--- | :--- | :--- | :--- |
| **`bg-base`** | `#0B0F14` | Deep Void Base | Main application background, canvas base |
| **`bg-card`** | `#111827` | Carbon Elevated Surface | Interactive cards, modal backdrops, thread panels |
| **`bg-card-hover`** | `#1A2234` | Hover Elevation | List items on hover, selected navigation tabs |
| **`bg-card-subtle`** | `#0F172A` | Inset Surface | Code blocks, diff viewers, search inputs, nested containers |

### 2.2 Accent & Brand Colors

| Token | Hex Value | Opacity Muted Variant | Semantic Role |
| :--- | :--- | :--- | :--- |
| **`primary`** | `#4F46E5` (Electric Indigo) | `rgba(79, 70, 229, 0.15)` | Primary CTAs, active focus indicators, AI actions |
| **`primary-hover`**| `#4338CA` | — | Button hover states |
| **`accent-success`**| `#22C55E` (Emerald) | `rgba(34, 197, 94, 0.12)` | State Verified, Approved actions, successful executions |
| **`accent-warning`**| `#F59E0B` (Amber) | `rgba(245, 158, 11, 0.12)` | Pending human approvals, scheduling conflicts, urgent flags |
| **`accent-danger`** | `#EF4444` (Crimson) | `rgba(239, 68, 68, 0.12)` | Rejected actions, destructive triggers, critical failures |

### 2.3 Border & Glow Tokens

| Token | CSS Definition | Semantic Role |
| :--- | :--- | :--- |
| **`border-subtle`** | `rgba(255, 255, 255, 0.05)` | Default structural borders between cards and panels |
| **`border-hover`** | `rgba(255, 255, 255, 0.15)` | Interactive borders on card hover |
| **`border-glow`** | `rgba(79, 70, 229, 0.35)` | Active AI copilot highlight or selected approval card |
| **`border-amber`** | `rgba(245, 158, 11, 0.40)` | High-priority Human-in-the-Loop decision gate |

---

## 3. Surface Elevation Matrix (5-Tier Hierarchy)

To eliminate visual clutter while maintaining clear spatial relationships, the interface adheres strictly to 5 elevation tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Tier 4: Overlays & Command Bar                                         │
│         bg-[#111827] • backdrop-blur-2xl • shadow-2xl • border-white/10│
│         (Raycast ⌘K Modal, Action Modification Dialogs)               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Tier 3: Persistent Utility Rails & Slide-over Panels                   │
│         bg-[#0D121B] • backdrop-blur-xl • border-white/5              │
│         (Cursor-style AI Copilot Dock, Floating Modifiers)             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Tier 2: Interactive Modules & Content Tiles                            │
│         bg-[#111827] • border-white/5 • hover:border-white/20         │
│         (Dashboard Stat Cards, Task Tiles, Email Thread Cards)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Tier 1: Inset Sub-Containers & Data Blocks                             │
│         bg-[#0F172A] • border-white/5 • font-mono                     │
│         (Diff Viewers, Cryptographic Receipt Boxes, DAG Steps)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Tier 0: Master Application Canvas Base                                 │
│         bg-[#0B0F14] (Deep Void)                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Typography Standards

FLOW employs a dual-font system pairing clean geometric sans-serif for UI clarity with monospace for cryptographic and operational precision.

### 4.1 Font Families
* **Primary Sans:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
* **Technical Monospace:** `JetBrains Mono`, `Fira Code`, `ui-monospace`, `monospace`

### 4.2 Type Scale & Hierarchy

| Role | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Title** | 24px - 32px | Extrabold (800) | `-0.025em` | Auth hero header, major landing statements |
| **Page Title** | 20px - 24px | Bold (700) | `-0.02em` | Page headers ("Executive Dashboard", "Approval Center") |
| **Section Header** | 14px - 16px | Semibold (600) | `-0.01em` | Card titles, timeline headers, dialog titles |
| **Body Primary** | 13px - 14px | Medium (500) / Regular (400) | Normal | Email message bodies, reasoning descriptions |
| **Body Secondary** | 12px | Regular (400) | Normal | Metadata, email snippets, attendee listings |
| **Micro Caption** | 10px - 11px | Semibold (600) | `+0.05em` | Category tags, timestamps, status indicators |
| **Technical Code** | 10px - 11px | Mono Regular (400) | Normal | Receipt hashes, idempotency keys, API latency |

---

## 5. Component Style Specifications

### 5.1 Buttons (`components/ui/button.tsx`)
All buttons have an active micro-scale transition (`active:scale-[0.98]`) and a standardized height scale:
* **`default` (Electric Indigo):** `bg-primary text-white hover:bg-primary-hover shadow-md`
* **`success` (Emerald):** `bg-emerald-600 text-white hover:bg-emerald-500` (Used for "Approve & Execute")
* **`warning` (Amber):** `bg-amber-500 text-black hover:bg-amber-400 font-semibold` (Used for "Auto-Resolve")
* **`destructive` (Crimson):** `bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white`
* **`glass` (Pill):** `glass-pill text-gray-200 hover:bg-white/10 border-white/10`
* **`secondary`:** `bg-card-hover text-gray-200 hover:bg-gray-800 border border-white/5`

### 5.2 Status Badges (`components/ui/badge.tsx`)
* **`verified`:** Emerald border and light green text (`border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono`)
* **`warning`:** Amber border and text (`border-amber-500/30 bg-amber-500/15 text-amber-400`)
* **`destructive`:** Red border and text (`border-red-500/30 bg-red-500/15 text-red-400`)
* **`outline`:** Neutral border and muted text (`border-white/10 text-gray-400 bg-white/[0.02]`)

### 5.3 GitHub PR-Style Review Card (The Approval Center)
The Approval Center is FLOW's primary differentiator. The card styling mimics a GitHub pull request review:
1. **Header Bar:** Action requested icon, title, item ID, and risk rubric badge (Low / Medium / High).
2. **Context Split:**
   - *Originating Request:* Italicized blockquote in inset surface (`bg-card-subtle`).
   - *Agent Reasoning:* Plain-text breakdown of why the action was generated.
3. **Diff Box:** Monospace terminal view:
   - `- Current State:` Red background (`bg-red-950/20 text-red-300 border-red-500/20`).
   - `+ Proposed New State:` Emerald background (`bg-emerald-950/20 text-emerald-300 border-emerald-500/20`).
4. **Footer Decision Gate:** `[ Reject ]`, `[ Modify Parameters ]`, and `[ Approve & Dispatch ]`.

### 5.4 AI Copilot Execution DAG
Visual execution pipeline inspired by Cursor:
* **Completed Step:** Emerald circular check icon (`CheckCircle2`), dimmed gray text, output result.
* **Waiting Approval Step:** Amber clock icon (`Clock`) with subtle pulsing glow, highlighted background.
* **Pending Step:** 12px hollow ring with dashed connector lines.

---

## 6. Glassmorphism Utilities (`globals.css`)

```css
/* Subtle glassmorphic panel */
.glass-panel {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* Elevated modal and drawer glass */
.glass-panel-elevated {
  background: rgba(22, 30, 48, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
}

/* Compact glass pill for shortcuts and filters */
.glass-pill {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 7. Motion, Animations & Micro-Interactions

FLOW prioritizes functional animations that convey execution status without delaying user actions.

### 7.1 Transition Defaults (`lib/animations.ts`)
* **Standard Spring Curve:** `transition: { type: "spring", stiffness: 350, damping: 28 }`
* **Entry Fade:** `initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0, transition: { duration: 0.18 } }`
* **Copilot Dock Slide:** `initial: { x: "100%" }, animate: { x: 0 }`

### 7.2 Pulse Indicators
* **Amber Conflict Pulse:** Used when the conflict radar detects meeting collisions.
* **Verified Emerald Pop:** Brief emerald glow when an action is verified on-chain or in the append-only ledger.

---

## 8. Keyboard Shortcuts & Raycast Experience

Keyboard chords ensure power users never need to leave the home row:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`⌘K` / `Ctrl+K`** | Global Command Menu | Opens the command palette for switching views and dispatching actions |
| **`⌘J` / `Ctrl+J`** | Toggle AI Copilot Dock | Slides the right-side execution assistant in or out |
| **`⌘B` / `Ctrl+B`** | Collapse Sidebar | Toggles the sidebar between expanded (240px) and icon rail (68px) |
| **`⌘F` / `Ctrl+F`** | Focus Search | Focuses the thread search in Inbox or action search in Ledger |
| **`ESC`** | Close Overlay | Dismisses modals, drawers, or command dialogs |

---

## 9. Layout Specifications & Breakpoints

* **Desktop Layout (`≥ 1280px`):** 3-pane fluid workspace:
  - Left Sidebar: `240px` (or `68px` collapsed)
  - Main Viewport: Flexible (`min-w-[640px]`)
  - AI Copilot: `380px` fixed docked rail
* **Tablet Layout (`768px - 1279px`):** 2-pane workspace with Copilot accessible as a floating overlay.
* **Mobile Layout (`< 768px`):** Single-column workspace, floating bottom navigation bar (`h-14`), and full-screen drawer for Copilot.
