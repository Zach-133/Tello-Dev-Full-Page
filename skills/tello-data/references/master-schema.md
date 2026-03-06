# Master Sheet — Full Column Schema

Source of truth: `Tello - Interview Coach v2 (now).xlsx` (project root)
CSV export: `Tello - Interview Coach v2 (now) - Master.csv` (project root)

One row per interview session. 53 columns total.

---

## Session Identity

| Column | Written by | Description |
|--------|-----------|-------------|
| Date | WF1 | Session date (DD/MM/YYYY) |
| Time | WF1 | Session start time |
| SessionID | WF1 | Primary key — links all workflows. Format: `prefix-uuid-fragment` (e.g. `zac1-384aa041`) |
| User Name | WF1 | From form field `name` |
| Duration | WF1 | Interview duration in minutes (5 / 10 / 15) |
| Job Field | WF1 | From form dropdown |
| Difficulty | WF1 | From form dropdown (Beginner / Intermediate / Advanced) |
| Grading Status | WF2 | Polling flag. WF3 reads this. Values: `"completed"` or `"Completed"` (casing inconsistency — WF3 handles both) |

---

## Developer QA Notes (manual — filled by developer)

| Column | Description |
|--------|-------------|
| The good | Developer note on what worked well in this session |
| The bad | Developer note on issues observed |
| Test fixes | Developer note on changes made as a result |

---

## Performance Timing (written by WF4)

| Column | Description |
|--------|-------------|
| Form Submission Duration | Latency of WF1 (ms or seconds) |
| Questions Retrieval Duraiton | Latency of WF0 — **note: "Duraiton" is a typo in the sheet, do not fix** |
| Grading Duration | Latency of WF2 |

---

## QA Checklists (manual — filled by developer)

| Column | Description |
|--------|-------------|
| Interview Completed Check | Did the interview complete successfully? |
| Technical Issues Check | Were there any technical issues? |
| Agent Behaviour Check | Did Ivy behave as expected? |
| User Behaviour Check | Notes on user behaviour (e.g., off-topic, malicious) |
| Security Check | Security-related observations |
| MISC User Feedback | Free-text feedback notes |
| End Call Reason | Why the call ended (e.g., "off-topic", "malicious behavior: information extraction") |

---

## Interview Q&A (written by WF2)

Up to 8 question/response pairs. Empty slots stored as `"null"`.

| Column | Description |
|--------|-------------|
| Introductory Q1 | First introductory question text |
| Introductory R1 | User's response to Q1 |
| Introductory Q2 | Second introductory question text |
| Introductory R2 | User's response to Q2 |
| Technical Q1 | First technical question text |
| Technical R1 | User's response |
| Technical Q2 | |
| Technical R2 | |
| Technical Q3 | |
| Technical R3 | |
| Scenario Q1 | First scenario/problem-solving question |
| Scenario R1 | User's response |
| Scenario Q2 | |
| Scenario R2 | |
| Scenario Q3 | |
| Scenario R3 | |

**Question count by duration:**
- 5 min ≈ 1 intro + 1 tech + 1 scenario (3 total)
- 10 min ≈ 2 intro + 2-3 tech + 1-2 scenario
- 15 min ≈ up to all 8 slots

---

## AI Summary and Final Score (written by WF2)

| Column | Description |
|--------|-------------|
| Interview Summary | AI-generated narrative summary of the interview |
| Final Score | Weighted overall score 0–100 |

---

## Grading — Technical Knowledge (written by WF2)

| Column | Description |
|--------|-------------|
| Technical_Band | Score band: `"1"` / `"2-4"` / `"5-7"` / `"8-10"` |
| Technical_Score | Numeric score within band |
| Technical_Comments | AI grader commentary |

---

## Grading — Problem Solving (written by WF2)

| Column | Description |
|--------|-------------|
| Problem_Band | Score band |
| Problem_Score | Numeric score |
| Problem_Comments | AI grader commentary |

---

## Grading — Communication Skills (written by WF2)

| Column | Description |
|--------|-------------|
| Communication_Band | Score band |
| Communication_Score | Numeric score |
| Communication_Comments | AI grader commentary |

---

## Grading — Relevance & Depth (written by WF2)

| Column | Description |
|--------|-------------|
| Relevence_Band | Score band — **note: "Relevence" is a typo in the sheet, do not fix** |
| Relevence_Score | Numeric score |
| Relevence_Comments | AI grader commentary |

---

## n8n Execution IDs (written by respective workflows)

| Column | Description |
|--------|-------------|
| n8n Form Submission Execution ID | WF1 execution ID — use to debug session creation |
| n8n Questions Retrieval Execution ID | WF0 execution ID — use to debug question retrieval |
| n8n Grading Execution ID | WF2 execution ID — use to debug grading |

---

## Additional Sheets Tabs (not yet exported)

- **Question Bank tab(s):** Questions indexed by jobField, difficulty, and questionType. Queried by WF0 during interviews. Exact column structure to be verified once n8n MCP is active.
