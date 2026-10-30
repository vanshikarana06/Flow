# FLOW — Frontend Style Guide & Design System Specification

**Document Version:** 2.0 (Cream & Orange Edition)  
**Status:** Production Standard  
**Design Influences:** Notion + Linear + Cursor + Arc Browser + Raycast  
**Theme:** Warm Minimalist Cream & Orange  
**Base Technologies:** Next.js 15 · TypeScript · Tailwind CSS · Shadcn UI Primitives · Framer Motion · Lucide Icons · Zustand · TanStack Query  

---

## 1. Executive Summary & Product Philosophy

FLOW is a **Trust-First Agentic Productivity Operating System**. It unifies Email, Calendar, Tasks, Personal Memory, and AI Agents into an integrated workspace.

### Core Philosophy
> **"AI proposes. Humans approve. FLOW executes and verifies."**

The interface communicates:
* **Intelligence:** Context-aware, proactive, and anticipatory.
* **Reliability:** Predictable behaviors, zero hidden state changes, verified outcome receipts.
* **Transparency:** Plain-language agent reasoning, visual execution DAGs, domain-specific previews.
* **User Control:** Consequential actions require explicit human approval via structured decision gates.
* **Warmth & Restraint:** Thoughtful cream surfaces, terracotta accents, and calm typography replacing harsh neon dashboards.

---

## 2. Visual Identity — Cream & Orange Design Tokens

FLOW utilizes a warm, tactile palette engineered to reduce visual fatigue during long operational sessions.

### 2.1 Core Palette Tokens

| Token | HEX | Tailwind Token | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Background** | `#F8F4EC` | `bg-background` / `bg-[#F8F4EC]` | Main application canvas and app-shell backdrop |
| **Surface** | `#FFFCF6` | `bg-card` / `bg-[#FFFCF6]` | Elevated cards, dialogs, threads, panels |
| **Surface Muted** | `#F1EADF` | `bg-muted` / `bg-[#F1EADF]` | Inset inputs, code previews, secondary tabs, hover states |
| **Primary Orange** | `#D97736` | `bg-primary` / `text-[#D97736]` | Brand accent, primary CTAs, active indicators, AI action icons |
| **Deep Orange** | `#B95727` | `bg-primary-hover` / `text-[#B95727]`| Button hover state, high-emphasis text, active pill press |
| **Primary Text** | `#29251F` | `text-[#29251F]` | Espresso black headings, body text, high-contrast labels |
| **Secondary Text** | `#777064` | `text-[#777064]` | Supporting metadata, timestamps, input placeholders, captions |
| **Border** | `#E8DFD1` | `border-border` / `border-[#E8DFD1]` | Structural 1px dividers, card perimeters, input borders |
| **Success** | `#477A58` | `text-[#477A58]` / `bg-[#477A58]` | Verified receipts, approved actions, on-time task state |
| **Warning** | `#C58A32` | `text-[#C58A32]` / `bg-[#C58A32]` | Honey amber approval alerts, scheduling conflicts, review gates |
| **Danger** | `#C65345` | `text-[#C65345]` / `bg-[#C65345]` | Rejected actions, conflict cancellations, critical warnings |

### 2.2 Design Rules & Restraint
1. **Cream Dominance:** Over 80% of the viewport is warm cream (`#F8F4EC`) or ivory surfaces (`#FFFCF6`).
2. **Restrained Orange:** Terracotta orange (`#D97736`) is reserved for primary CTAs, key status indicators, and active navigation pills.
3. **High Contrast:** Espresso typography (`#29251F`) guarantees WCAG AAA compliance against both `#F8F4EC` and `#FFFCF6`.
4. **No Heavy Skeuomorphism or Cyberpunk Glow:** Avoid dark gradients, heavy blurs, and neon drop shadows in favor of 1px subtle borders (`#E8DFD1`) and soft ambient shadows (`rgba(41, 37, 31, 0.04)`).

---

## 3. Typography & Spatial Rhythm

* **Font Family:** System stack optimized for native rendering without external network latency:
  `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
* **Monospace Stack:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (used for verification hashes, item IDs, and code blocks).

### 3.1 Type Scale
* **Display / Page Header:** `text-2xl font-bold tracking-tight text-[#29251F]`
* **Section Heading:** `text-sm font-semibold tracking-tight text-[#29251F]`
* **Card Title:** `text-xs font-semibold text-[#29251F]`
* **Body / Messages:** `text-xs leading-relaxed text-[#29251F]`
* **Metadata / Supporting Text:** `text-[11px] text-[#777064]`
* **Micro Badges / Keychords:** `text-[10px] font-medium tracking-wide`

### 3.2 Spacing & Padding
* **Container Padding:** `p-4 sm:p-6 lg:p-8`
* **Card Internal Padding:** `p-4` (compact, high information density)
* **Panel Gaps:** `gap-4` or `gap-6`
* **Border Radii:**
  - Cards & Modals: `rounded-xl` (12px)
  - Buttons & Inputs: `rounded-lg` (8px)
  - Navigation Pills & Badges: `rounded-full` or `rounded-md`

---

## 4. Base Component Primitives

### 4.1 Buttons (`components/ui/button.tsx`)
* **Default (Primary Orange):** `bg-[#D97736] text-white hover:bg-[#B95727] shadow-sm font-medium`
* **Secondary:** `bg-[#F1EADF] text-[#29251F] hover:bg-[#E8DFD1] border border-[#E8DFD1]`
* **Outline:** `border border-[#E8DFD1] bg-transparent text-[#29251F] hover:bg-[#F1EADF]/60`
* **Ghost:** `hover:bg-[#F1EADF]/60 text-[#777064] hover:text-[#29251F]`
* **Success:** `bg-[#477A58] text-white hover:bg-[#3D6A4C] shadow-sm font-medium`
* **Warning:** `bg-[#C58A32] text-white hover:bg-[#B07B2D] shadow-sm font-medium`
* **Destructive:** `bg-[#C65345]/10 text-[#C65345] border border-[#C65345]/20 hover:bg-[#C65345] hover:text-white`

### 4.2 Status Badges (`components/ui/badge.tsx`)
* **Default:** `bg-[#D97736]/15 text-[#D97736] border border-[#D97736]/30`
* **Success / Verified:** `bg-[#477A58]/15 text-[#477A58] border border-[#477A58]/30 font-mono`
* **Warning:** `bg-[#C58A32]/15 text-[#C58A32] border border-[#C58A32]/30`
* **Destructive:** `bg-[#C65345]/15 text-[#C65345] border border-[#C65345]/30`
* **Outline:** `border border-[#E8DFD1] text-[#777064] bg-[#FFFCF6]`

### 4.3 Cards (`components/ui/card.tsx`)
* **Default Card:** `rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] text-[#29251F] shadow-soft`
* **Header:** `flex flex-col space-y-1 p-4`
* **Content:** `p-4 pt-0`

### 4.4 Form Controls (`components/ui/input.tsx`, `components/ui/textarea.tsx`)
* **Input / Textarea:** `bg-[#F8F4EC] border border-[#E8DFD1] text-[#29251F] placeholder:text-[#777064]/70 focus-visible:ring-1 focus-visible:ring-[#D97736] focus-visible:border-[#D97736]`

---

## 5. Application Shell Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Header: Breadcrumb · Search Trigger (⌘K) · Conflict Radar · Copilot Toggle (⌘J)   │
├────────────────┬───────────────────────────────────────────────┬─────────────────┤
│ Left Sidebar   │ Main Viewport (Fluid)                         │ AI Copilot Dock │
│ (240px / 68px) │ (Dashboard / Inbox / Calendar / Approvals... )│ (380px Slide)   │
│                │                                               │                 │
│ • Navigation   │                                               │                 │
│ • HITL Counter │                                               │ • Suppressed    │
│ • User Profile │                                               │   when on /ai   │
└────────────────┴───────────────────────────────────────────────┴─────────────────┘
```

1. **Left Sidebar (`components/layout/sidebar.tsx`):**
   - Brand logo with warm terracotta accent.
   - Clean navigation links: Dashboard, Inbox, Calendar, Tasks, Approvals (with live amber badge counter), Activity, Memory, Settings, and AI Copilot.
   - Collapse button (`⌘B`) collapsing to 68px icon rail.
   - User profile with quick workspace switcher.
2. **Top Header (`components/layout/header.tsx`):**
   - Breadcrumb navigation and live agent status ("Agent Ready" with forest green pulse).
   - Global Quick Search trigger (`⌘K`).
   - Quick action chords (`⌘J` Copilot toggle, `⌘B` Sidebar collapse).
3. **Right AI Copilot (`components/layout/ai-copilot-panel.tsx`):**
   - Persistent dockable companion on desktop (`380px`).
   - Automatically hides when the user navigates directly to the dedicated `/ai` workspace, eliminating dual-input confusion.
4. **Command Menu (`components/layout/command-menu.tsx`):**
   - Raycast-style instant search dialog with keyboard navigation and quick jumps.

---

## 6. Page-by-Page Specifications

### 6.1 Authentication (`app/(auth)/login/page.tsx`)
* **Layout:** Dual-column landing + auth screen on warm cream background with subtle terracotta ambient glow.
* **Manifesto:** Highlights the 3 Core Trust Pillars (HITL guardrails, cryptographic ledger, Google/Microsoft graph sync).
* **Identity Options:** Google Workspace OAuth, Microsoft 365 OAuth, and passwordless email magic link.

### 6.2 Executive Dashboard (`app/(dashboard)/dashboard/page.tsx`)
* **Greeting & Date:** Espresso typography (`Good Morning, John`) with today's date.
* **Actionable Priority Banner:** Prominent review trigger when pending approvals exist (`Review Decisions ➔`).
* **Telemetry Metric Cards:**
  - Tasks Due (with high-priority breakdown)
  - Scheduled Meetings (with time remaining to next sync)
  - Pending Approvals (with risk indicator)
  - Unread Inbound Emails
* **Main Grid:**
  - *Left (2/3):* Today's Upcoming Schedule & Chronological Activity Stream.
  - *Right (1/3):* Proactive Intelligence Monitors & Quick Suggestions.

### 6.3 Unified Inbox (`app/(dashboard)/inbox/page.tsx`)
* **Layout:** 3-Pane Linear/Gmail hybrid client.
* **Left Pane:** Folders (All Inbound, Unread, Staged Drafts, Sent) & thread list with status tags.
* **Center Pane:** Full thread conversation view with sender avatars, rich email bodies, and reply composer.
* **Right Pane:** AI Insights panel highlighting detected action items, proposed calendar invitations, and 1-click "Create Task from Email".

### 6.4 Smart Calendar (`app/(dashboard)/calendar/page.tsx`)
* **Views:** Month, Week, and Day toggle.
* **Ivory Grid:** Warm day cells with distinct styling for external meetings vs internal focus blocks.
* **Conflict Radar:** Visual honey amber alert banner when scheduling collisions occur, complete with an "Auto-Resolve Conflicts" one-click action.

### 6.5 Intelligent Tasks (`app/(dashboard)/tasks/page.tsx`)
* **Dual View:** Kanban Board (To-Do, In Progress, Review, Done) and Dense List View.
* **Task Card:** Title, priority badge (High/Medium/Low), due date, AI breakdown step count, and progress bar.
* **Quick Create:** Inline modal with instant assignee and priority tags.

### 6.6 The Approval Center — FLOW's USP (`app/(dashboard)/approvals/page.tsx`)
* **The Most Consequential Screen:** Modeled after GitHub Pull Request reviews.
* **Visual Domain Previews (No Raw JSON Strings):**
  - *Email Dispatch:* Visual card displaying recipient chips, sender identity, subject line, and formatted body draft.
  - *Calendar Time Shift:* Side-by-side time delta pill comparing Current Slot vs Proposed New Slot with conflict resolution notes.
  - *Task Modification:* Status change pills (`To-Do ➔ In Progress ➔ Completed`) and priority adjustments.
* **Action Bar:**
  - `[ Reject Action ]` (Crimson outlined button)
  - `[ Modify Parameters ]` (Opens structured inline edit modal)
  - `[ Approve & Dispatch ]` (Forest green primary CTA)

### 6.7 Activity Ledger (`app/(dashboard)/activity/page.tsx`)
* **Trust & Verification:** Append-only log of every agent proposed and executed action.
* **5-Stage Lifecycle Timeline:**
  1. `Plan Staged`
  2. `Human Approved`
  3. `Execution Dispatched`
  4. `Outcome Verified`
  5. `Receipt Minted`
* **Receipt Verification:** Displaying cryptographic SHA-256 hashes (`0x7f8a...`), external provider IDs, and expandable JSON payload inspector.

### 6.8 Personal Memory & Rules (`app/(dashboard)/memory/page.tsx`)
* **Contact Dossiers:** Key stakeholders, working hours, preferred communication style, and relationship notes.
* **Behavioral Guardrails:** Editable rules guiding agent autonomy (e.g., "Never auto-schedule over Friday focus time", "Require approval for emails with >5 recipients").

### 6.9 Settings & Governance (`app/(dashboard)/settings/page.tsx`)
* **Integrations:** Connected Google Workspace, Microsoft Graph, Slack, and GitHub accounts.
* **HITL Safety Policies:** Strictness toggles for Email dispatch, Calendar updates, and Task automation.
* **Autonomous Execution Budget:** Slider controlling hourly action quotas.

### 6.10 Dedicated AI Copilot Workspace (`app/(dashboard)/ai/page.tsx`)
* **ChatGPT-Style Bottom Composer:**
  - Independent message list scrolling (`overflow-y-auto`) with automatic scroll-to-bottom on new messages.
  - Sticky bottom-anchored multiline input container with responsive border (`#E8DFD1`), warm surface (`#FFFCF6`), and terracotta send button (`ArrowUp`).
  - Native keyboard ergonomics: `Enter` to send, `Shift+Enter` for multiline breaks.
  - Quick prompt suggestion chips for fast discovery.
* **Cursor-Style Visual Execution DAG:** Real-time step breakdown showing completed, active, and pending sub-tasks with execution timing.

---

## 7. Keyboard Shortcuts Map

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| **`⌘K` / `Ctrl+K`** | Open Command Palette | Global |
| **`⌘J` / `Ctrl+J`** | Toggle AI Copilot Dock | Global (except `/ai`) |
| **`⌘B` / `Ctrl+B`** | Toggle Sidebar Collapse | Global |
| **`Enter`** | Send AI Message / Confirm | Chat Composer / Modals |
| **`Shift+Enter`**| Newline in AI Composer | Chat Composer |
| **`ESC`** | Dismiss Overlay / Modal | Global |

---

## 8. Verification & Performance Checklist

* [x] Dominant warm cream canvas (`#F8F4EC`) and ivory cards (`#FFFCF6`).
* [x] Restrained terracotta orange (`#D97736`) used purposefully.
* [x] Zero duplicate input fields between Right Copilot and `/ai` workspace.
* [x] Approval Center features domain-specific previews for Email, Calendar, and Tasks.
* [x] ChatGPT-style bottom-anchored message composer with independent scroll container.
* [x] 100% clean Next.js 15 production compilation across all 14 static routes.
* [x] Preserved all backend endpoints, data schemas, and database contracts.

