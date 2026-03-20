@AGENTS.md

# Tava Health - AI Mental Health Treatment Plans

## Overview

AI-powered full-stack app that transforms therapy session transcripts into structured treatment plans with two views: clinical (for therapists) and plain-language (for clients). Built for a hiring partner assignment. Focus: AI-central experience, role-based UX, treatment plan lifecycle.

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Hosting**: Vercel
- **Database**: Supabase (Postgres + Auth)
- **AI**: OpenAI API (gpt-4o or gpt-4o-mini for structured output)
- **Styling**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest

## Project Structure

```
src/
  app/
    (auth)/
      login/               # Login page
      register/            # Registration (therapist or client)
    therapist/
      dashboard/           # Client list, recent sessions
      clients/[id]/        # Client detail + sessions
      sessions/[id]/       # Session detail + transcript + plan
      plans/[id]/          # Plan view/edit (therapist version)
      plans/[id]/history/  # Plan version history
    client/
      dashboard/           # My plan, goals, homework
      plans/[id]/          # Plan view (client version)
      sessions/[id]/       # Session summary (client version)
    api/
      auth/                # Auth callbacks
      ai/
        generate-plan/     # Generate treatment plan from transcript
        generate-summary/  # Generate session summary
        safety-check/      # Crisis/risk language detection
  components/
    treatment-plan/        # Plan display components (therapist + client views)
    session/               # Transcript upload, session cards
    dashboard/             # Dashboard widgets, client cards
    shared/                # Nav, sidebar, disclaimers, loading states
  lib/
    supabase/              # Supabase client + queries
    ai/                    # OpenAI helpers, prompt templates, output parsing
    types/                 # TypeScript types for all data models
```

## Data Model

- **User**: id, email, role (therapist|client), name, created_at
- **TherapistProfile**: user_id, license_type, specializations
- **ClientProfile**: user_id, therapist_id (FK)
- **Session**: id, client_id, therapist_id, session_date, session_number, notes
- **Transcript**: id, session_id, content (text), source (upload|paste), created_at
- **TreatmentPlan**: id, client_id, therapist_id, status (draft|active|archived), current_version_id, created_at, updated_at
- **TreatmentPlanVersion**: id, plan_id, version_number, session_id (which session triggered this version), therapist_view (JSON), client_view (JSON), created_at
  - therapist_view JSON: { presenting_concerns, clinical_impressions, goals: [{description, type: short|long, interventions, status}], homework, strengths, risk_indicators }
  - client_view JSON: { summary, goals: [{description, why_it_matters, action_steps}], homework: [{task, encouragement}], strengths, next_steps }
- **SafetyFlag**: id, session_id, plan_version_id, flag_type (crisis|self_harm|harm_to_others), severity (low|medium|high), excerpt, created_at

## AI Features (in scope)

### Core (Must-Have)
1. **Treatment Plan Generation** -- Parse transcript, output structured JSON for both therapist and client views in a single API call. Use structured output (JSON mode) for reliability.
2. **Two Plan Views** -- Same underlying data, rendered differently: clinical/structured for therapist, plain-language/supportive/action-oriented for client.

### Recommended (Doing These)
3. **Treatment Plan Lifecycle** -- When a new session is uploaded for an existing client, update the plan (create new version). Show version history with timestamps and which session triggered each version.
4. **Session Summaries** -- AI-generated summary per session: clinical for therapist view, friendly/encouraging for client view.
5. **Safety & Ethics Awareness** -- Detect crisis/high-risk language (self-harm, harm to others) in transcripts. Flag in therapist view with severity. Add privacy disclaimers throughout UI.

### NOT in scope (document as "What I'd Build Next")
- Model evaluation harness
- Therapist-guided model training/preferences
- Plan editing with diffs
- Video upload/playback
- Mobile PWA
- Multi-language support
- Explainability (linking plan elements to transcript snippets)

## Auth

Supabase Auth with email/password. On registration, user picks role (therapist or client). Therapist creates client accounts or clients self-register and get linked to a therapist.

Demo accounts:
- Therapist: therapist@demo.tavahealth.com / demo1234
- Client: client@demo.tavahealth.com / demo1234

## Seed Data

Create 2-3 synthetic therapy transcripts covering different scenarios:
1. **Anxiety + work stress** -- CBT-oriented, moderate severity, no safety flags
2. **Depression + relationship issues** -- mixed modality (CBT + ACT), includes mild risk language to trigger safety flagging
3. **Academic stress (adolescent)** -- strength-based, no flags, demonstrates different age/context

Each transcript: ~500-1000 words of realistic but fully synthetic dialogue.

## Privacy & Safety

- Banner on every page: "This is a demo application using synthetic data. Not a substitute for clinical judgment."
- No real PHI anywhere
- Safety flags visible ONLY to therapist, never to client
- Crisis language detection runs automatically on transcript upload

## Demo Script (for video recording)

1. **Intro** (30s): "I built an AI-powered treatment plan generator for Tava Health. It takes therapy session transcripts and creates two views -- clinical for therapists, plain-language for clients."
2. **Therapist flow** (2min): Login as therapist -> show client list -> upload transcript -> show AI generating plan -> walk through therapist view (structured fields, goals, interventions) -> show safety flag on transcript #2 -> show version history after uploading second session
3. **Client flow** (1min): Login as client -> show dashboard with goals, homework, encouragement -> show plain-language plan view -> highlight how same data looks different
4. **Side-by-side** (30s): Show therapist view and client view for same plan -- demonstrate the tonal difference
5. **Wrap-up** (30s): Architecture decisions, what I'd build next

## Development Guidelines

- Use synthetic transcripts only -- no real PHI
- AI calls go through Next.js API routes (server-side, never expose API key to client)
- Use OpenAI structured output (JSON mode) for reliable parsing
- Cache AI responses in DB -- don't regenerate unless explicitly requested
- Mobile-responsive from the start
- Test in Chrome before marking done
