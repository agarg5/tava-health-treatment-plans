# Tava Health - AI Mental Health Treatment Plans

An AI-powered full-stack application that transforms therapy session transcripts into structured, personalized treatment plans with two distinct views: clinical for therapists and plain-language for clients.

**Live:** https://tava-health-plans.vercel.app

## Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Supabase (Postgres + Auth + RLS) |
| AI | OpenAI API (gpt-4o-mini, structured JSON output) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |
| Testing | Vitest |

### Architecture Overview

```
Browser → Next.js App Router → Supabase Auth (role-based)
                             → API Routes → OpenAI (3 parallel calls)
                             → Supabase Postgres (7 tables with RLS)
```

The AI pipeline runs three operations in parallel per transcript:
1. **Treatment plan generation** -- structured JSON with therapist + client views
2. **Session summary** -- clinical tone (therapist) + encouraging tone (client)
3. **Safety screening** -- detects crisis/self-harm/harm-to-others language

All AI responses use JSON mode for reliable parsing. Results are cached in the database.

## Running Locally

```bash
git clone https://github.com/agarg5/tava-health-treatment-plans.git
cd tava-health-treatment-plans
npm install
cp .env.local.example .env.local  # Fill in Supabase + OpenAI keys
npm run dev
```

Requires: Node.js 18+, a Supabase project (run `supabase/schema.sql`), and an OpenAI API key.

## Features

### Core
- **Transcript upload** -- paste text or upload .txt files, tied to client/therapist/session
- **AI-generated treatment plans** with structured fields: presenting concerns, clinical impressions, goals (short/long-term), interventions (CBT, ACT, DBT), homework, strengths, risk indicators
- **Dual plan views** -- same data, different presentation:
  - Therapist: clinical, structured, documentation-ready, editable
  - Client: plain-language, supportive, action-oriented, no clinical jargon
- **Role-based dashboards** -- therapist sees client list + sessions; client sees goals + homework
- **Basic auth** with demo accounts for quick evaluation

### Recommended (Implemented)
- **Plan versioning** -- new sessions create new plan versions with full history timeline
- **Session summaries** -- AI-generated in two tones (clinical + friendly)
- **Safety flagging** -- detects crisis language, flags in therapist view only, with severity levels
- **Privacy disclaimers** visible throughout the UI

## AI Integration Details

### Model Choice
**gpt-4o-mini** with JSON mode. Chosen for cost-efficiency on a demo project while maintaining output quality. The structured output format ensures reliable parsing -- every response is validated and missing fields are backfilled with safe defaults.

### Prompt Design
Three separate system prompts, each optimized for its task:
- **Plan generation**: produces both therapist and client views in a single call, ensuring consistency
- **Summary generation**: two tones from one transcript
- **Safety screening**: high-sensitivity, low-temperature (0.1) for reliable flag detection

### Data Flow
```
Transcript → OpenAI (3 parallel calls) → Parse & validate JSON
  → Store plan version (therapist_view + client_view as JSONB)
  → Store session summary
  → Store safety flags (if any)
```

### Key Decision: Single-Call Dual View
Both plan views are generated in one API call rather than two separate calls. This ensures the therapist and client views are always derived from the same analysis, preventing inconsistencies.

## Product Decisions & Tradeoffs

1. **Dark mode default** -- mental health apps benefit from a calmer, less clinical aesthetic. Dark mode also matches Tava's modern tech positioning.

2. **Safety flags are therapist-only** -- clients never see risk indicators or clinical concern language. This is a deliberate UX decision to keep the client experience supportive.

3. **Supabase over custom auth** -- for a demo project, Supabase Auth provides production-grade auth patterns (RLS, row-level security) without the overhead of building auth from scratch. This demonstrates understanding of real-world security patterns.

4. **Parallel AI calls** -- all three AI operations (plan, summary, safety) run concurrently. This reduces total generation time from ~9s sequential to ~4s parallel.

5. **JSON mode over function calling** -- more reliable structured output for this use case, and the parsing layer adds validation/backfill for robustness.

## Limitations

- Plans are generated fresh each time (no incremental updates that merge with previous version)
- No real-time collaboration between therapist and client
- Safety flagging relies on LLM judgment, not clinical-grade NLP
- No audit trail for plan edits (edits overwrite in-place)
- Demo accounts use a shared Supabase instance

## What I'd Build Next

1. **Explainability** -- click any plan element to see which transcript snippet influenced it, with highlighted source text
2. **Therapist-guided customization** -- store modality preferences per therapist (e.g., "prefer ACT over CBT"), use as few-shot context
3. **Plan diffs** -- when a new version is generated, show what changed from the previous version
4. **Reading level analysis** -- automatically check that client-facing language stays below a target grade level
5. **Multi-session context** -- feed previous session summaries into plan generation for longitudinal awareness

## Tests

```bash
npm test
```

12 tests covering AI output parsing: valid responses, markdown-wrapped JSON, missing fields, invalid types, empty inputs, and edge cases for all three parsers (plan, summary, safety flags).
