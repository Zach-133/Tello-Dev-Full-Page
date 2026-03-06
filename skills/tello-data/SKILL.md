---
name: tello-data
description: Reference for Tello's data architecture and session lifecycle. Use this skill whenever working with data flow, Google Sheets schema, session tracking, score storage, Supabase auth, or understanding how data moves through the system end-to-end. Also use when debugging missing data, understanding what gets written when, interpreting the Master sheet columns, or planning any change that touches how sessions or results are stored.
---

# Tello Data Architecture

## Overview

Tello uses two data stores:
- **Google Sheets** — primary operational data store. All session data, Q&A, scores, QA notes, and timing.
- **Supabase** — auth only. Email/password authentication. No operational tables.

---

## Google Sheets — Master Sheet

A single flat sheet called **Master**. One row per interview session.

Full column schema: see `references/master-schema.md`

**Key facts:**
- 53 columns total
- All data for a session accumulates in one row over multiple workflow executions
- `SessionID` is the primary key linking all workflows (format: `prefix-uuid-fragment`, e.g. `zac1-384aa041`)
- `Grading Status` is the polling flag: WF3 reads this to know when results are ready
- Score bands use: `"1"` · `"2-4"` · `"5-7"` · `"8-10"`
- Note: "Relevence" is a typo in the sheet — do not correct it as it would break n8n field references
- Note: "Questions Retrieval Duraiton" is also a typo in the sheet

**Reference files:**
- Source of truth: `Tello - Interview Coach v2 (now).xlsx` (in project root)
- Exported CSV: `Tello - Interview Coach v2 (now) - Master.csv` (in project root)

**Additional tabs** (not yet exported as CSV — structure TBD):
- Question Bank tab(s) — questions indexed by jobField, difficulty, questionType; queried by WF0

---

## Session Lifecycle

```
1. User submits form (/form)
   └── Frontend POST → WF1
       └── New row in Master sheet (Date, Time, SessionID, User Name, Duration, Job Field, Difficulty)
       └── Returns sessionId to frontend

2. EL interview session (/interview)
   └── EL agent calls WF0 mid-interview (question retrieval)
       └── Reads question bank → returns questions to EL
   └── Interview ends → EL calls WF2 post-interview webhook
       └── Writes Q&A pairs to Master row (Introductory/Technical/Scenario cols)
       └── Runs 4 AI graders
       └── Writes scores, bands, comments, finalScore to Master row
       └── Writes Interview Summary to Master row
       └── Sets Grading Status = "completed"
       └── Writes n8n Grading Execution ID

3. Results polling (/results/:sessionId)
   └── Frontend polls WF3 every 5s
       └── Checks Grading Status in Master row
       └── Returns { status: 'processing' } until complete
       └── Returns full scores JSON when complete
       └── Triggers WF4 (timing log) on completion

4. WF4 writes timing data to Master row
   (Form Submission Duration, Questions Retrieval Duration, Grading Duration)
```

---

## Supabase — Auth Only

- **Purpose:** User authentication exclusively
- **Tables:** Only Supabase's built-in `auth.users` — no custom tables
- **Auth method:** Email/password (`signInWithPassword`, `signUp`)
- **Client:** `src/lib/supabase.ts`
- **Context:** `src/context/AuthContext.tsx`
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

No session data, scores, questions, or feedback is stored in Supabase. Everything operational is in Google Sheets.

---

## Score Data Structure

What WF3 returns on completion (matches what `Results.tsx` expects):

```json
{
  "status": "completed",
  "finalScore": 67,
  "jobField": "AI Automation",
  "difficulty": "Beginner",
  "scores": {
    "technicalKnowledge": { "score": 9, "comment": "..." },
    "problemSolving": { "score": 6, "comment": "..." },
    "communicationSkills": { "score": 5, "comment": "..." },
    "relevance": { "score": 6, "comment": "..." }
  }
}
```

Performance ratings by finalScore (in `Results.tsx`):
- ≥ 90 → Excellent
- ≥ 70 → Good
- ≥ 50 → Fair
- < 50 → Needs Improvement

Read `references/master-schema.md` for the full 53-column breakdown.
