# CLAUDE.md — Tello Project Reference

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

---

## Project Overview

**Tello** is an AI-powered mock interview web app for early access users. Users log in, configure an interview, conduct a live voice interview with an AI agent (ElevenLabs), and receive a detailed scored results page.

**Live domain:** tello.zach13.com
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
**Hosting:** Cloudflare Pages (auto-deploys from GitHub on push to main)
**Auth:** Supabase (email/password only)
**Backend:** n8n workflows via webhooks (self-hosted at n8n.zach13.com)
**Voice AI:** ElevenLabs SDK (`@elevenlabs/react`)
**Data store:** Google Sheets (primary operational store — NOT Supabase)

---

## System Architecture

```
User Browser
     │
     ├── / (Landing)          Public marketing page
     ├── /auth                Login / Sign up (Supabase)
     │
     └── [Protected]
          ├── /form            Interview setup form
          │     └── POST ──► n8n WF1 (session creation) ──► Google Sheets
          │
          ├── /interview       Live ElevenLabs voice session
          │     └── EL SDK ──► Ivy / Int / Adv agent
          │                    │
          │                    ├── mid-interview ──► n8n WF0 (question retrieval)
          │                    └── post-interview ──► n8n WF2 (grading)
          │
          └── /results/:sessionId   Score display
                └── polls every 5s ──► n8n WF3 (retrieve results)
                                        └── n8n WF4 (log durations)

Any n8n failure ──► n8n WF5 (Telegram alert to developer)
```

---

## Route Map

| Path | Component | Auth | Purpose |
|------|-----------|------|---------|
| `/` | `Landing.tsx` | Public | Marketing landing page |
| `/auth` | `Auth.tsx` | Public | Login / sign up |
| `/form` | `Index.tsx` | Protected | Interview setup form |
| `/interview` | `Interview.tsx` | Protected | Live AI voice interview |
| `/results/:sessionId` | `Results.tsx` | Protected | Score & feedback display |

---

## External Service Integrations

### Supabase — Auth Only
- Email/password authentication
- No operational tables (no sessions, scores, or questions stored in Supabase)
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (set in Cloudflare Pages dashboard)
- Client: `src/lib/supabase.ts`
- Context: `src/context/AuthContext.tsx` — provides `user`, `loading`, `signIn`, `signUp`, `signOut`

### ElevenLabs — Voice AI
- SDK: `@elevenlabs/react`, `useConversation` hook in `src/pages/Interview.tsx`
- 3 agents by difficulty (hardcoded in `Interview.tsx:64-68`):
  - Beginner → `agent_5201khb8ye2se6ta1vsxf6f4wsx6` (Ivy — active development)
  - Intermediate → `agent_0101khb8tr92e3st3vbnjm3z0jwk` (pending Ivy stability)
  - Advanced → `agent_6501khb8vxzmeejsq3mga7tn8kdn` (pending Ivy stability)
- Dynamic variables sent at session start: `user_name`, `job_field`, `difficulty`, `duration`, `session_id`
- EL triggers n8n mid-interview (WF0) and post-interview (WF2) via built-in webhooks
- See skill: `skills/tello-elevenlabs/SKILL.md`

### n8n — Backend Automation
- Self-hosted at n8n.zach13.com
- **WF1 session creation:** `https://n8n.zach13.com/webhook/743697f7-3774-4876-b10d-775cbbb67613`
  - Called by: `src/components/InterviewForm.tsx` on form submit
  - Returns: `{ sessionId, name, duration, jobField, difficulty }`
- **WF3 results polling:** `https://n8n.zach13.com/webhook/276ad840-3dcb-4e2b-ac0f-30b1cb9f158f`
  - Called by: `src/pages/Results.tsx` every 5s (max 60 polls)
  - Returns: `{ status: 'processing' }` or `{ status: 'completed', finalScore, scores: {...} }`
- See skill: `skills/tello-n8n/SKILL.md`

### Google Sheets — Primary Data Store
- Single "Master" sheet: 53 columns, one row per session
- Stores user prefs, Q&A pairs, scores, comments, QA notes, timing data, n8n execution IDs
- See skill: `skills/tello-data/SKILL.md`

---

## Key Source Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Router + providers |
| `src/context/AuthContext.tsx` | Auth state, signIn/signUp/signOut |
| `src/lib/supabase.ts` | Supabase client |
| `src/components/InterviewForm.tsx` | Form + WF1 webhook call |
| `src/pages/Interview.tsx` | EL SDK session management |
| `src/pages/Results.tsx` | WF3 polling + score display |
| `src/pages/Landing.tsx` | Marketing page |
| `src/components/landing/` | 12 landing page section components |
| `src/components/ScoreCard.tsx` | Individual score criterion card |
| `src/components/PerformanceOverview.tsx` | Comparative score chart |
| `src/components/AppHeader.tsx` | Shared header for app pages |
| `src/index.css` | Design system CSS variables + Tailwind utilities |
| `tailwind.config.ts` | Tailwind token extensions |

---

## Design System

**Fonts:** DM Serif Display (headings, `font-serif`) + Inter (body)

**Color tokens** (use these — never raw Tailwind palette):
| Token | Role |
|-------|------|
| `primary` | Deep brown — main brand |
| `coral` / `coral-dark` / `coral-light` | CTA, accents |
| `teal` / `teal-light` | Secondary accent |
| `gold` / `gold-light` | Achievements |
| `success` / `success-light` | Positive states |
| `secondary` | Warm muted beige |
| `muted` / `muted-foreground` | Subdued text/surfaces |
| `background` | Warm cream |
| `card` | Slightly lighter cream |

**Shadows** (never use `shadow-md`):
`shadow-soft` · `shadow-medium` · `shadow-strong` · `shadow-coral` · `shadow-card`

**Gradients:**
`gradient-hero` · `gradient-warm` · `gradient-coral` · `gradient-card`
(also available as `bg-gradient-*` prefix)

**Button variants** (`src/components/ui/button.tsx`):
`coral` · `coral-outline` · `hero` · `teal` · `default` · `outline` · `secondary` · `ghost` · `link` · `destructive`

**Animations:** `animate-float` · `animate-pulse-soft` · `animate-slide-up` · `animate-fade-in`
Only animate `transform` and `opacity`. Never `transition-all`.

---

## Local Development

```bash
npm run dev      # → http://localhost:8080
npm run build    # → dist/
npm run test     # Vitest
```

**Screenshots:**
```bash
node "C:\Users\Admin\Downloads\Tello Frontend v4\screenshot.mjs" http://localhost:8080
```
Saved to `C:\Users\Admin\Downloads\Tello Frontend v4\temporary screenshots\`.
Read PNG with the Read tool after each screenshot. Do at least 2 comparison rounds.

---

## Output Defaults
- Edit `.tsx` files in `src/` — do NOT create standalone `index.html`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Logo: `brand_assets/tello_logo.jpg` + `public/tello_logo.jpg`
- Favicon: `public/tello_icon.svg`
- Hero: `src/assets/hero-illustration.png`
- Avatars: `src/assets/avatar-beginner.png`, `avatar-medium.png`, `avatar-hard.png`

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

---

## Skills Index

| Skill | File | Use when... |
|-------|------|-------------|
| `tello-n8n` | `skills/tello-n8n/SKILL.md` | Backend, webhooks, n8n workflows, data flow |
| `tello-elevenlabs` | `skills/tello-elevenlabs/SKILL.md` | Interview page, EL SDK, voice agents, Ivy |
| `tello-data` | `skills/tello-data/SKILL.md` | Data schema, Google Sheets, session lifecycle |
| `tello-deployment` | `skills/tello-deployment/SKILL.md` | GitHub, Cloudflare Pages, deploying |
| `frontend-design` | (global) | Any frontend UI work — invoke first every session |
| `skill-creator` | `~/.claude/skills/skill-creator/` | Creating or improving skills |

---

## MCP Roadmap

### n8n MCP (planned — not yet active)
Backup first: export all 6 workflows as JSON → commit to `n8n-backups/`.
Setup: generate API key at n8n.zach13.com → Settings → API, configure n8n-mcp in Claude Code.
Installed n8n skills (ready to use once MCP active): `n8n-mcp-tools-expert`, `n8n-workflow-patterns`, `n8n-node-configuration`, `n8n-validation-expert`, `n8n-code-javascript`, `n8n-expression-syntax`.

### ElevenLabs MCP (deferred)
Evaluate after n8n MCP is stable. Back up Ivy's system prompt to `skills/tello-elevenlabs/` first.
