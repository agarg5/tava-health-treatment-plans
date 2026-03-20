# Tava Health - AI Mental Health Treatment Plans

**Category:** AI-Solution (All Roles)
**Technical Contact:** jake.sorce@tavahealth.com
**Stack:** Anything modern. They use TypeScript, Node, React, GraphQL, Golang.

---

## Project: AI-Assisted Mental Health Treatment Plans

Build a full-stack application that takes therapy session transcripts and uses AI to generate structured, personalized treatment plans -- one clinical version for therapists, one plain-language version for clients.

## Problem Statement

Mental health therapists spend significant time creating and updating treatment plans. Quality and clarity vary widely between providers. Clients often receive plans in overly clinical language that is hard to understand or apply. The challenge is to build an AI-powered system that transforms therapy session transcripts into structured, clear, and personalized treatment plans tailored separately for therapists and clients.

## Core Functional Requirements

- **Full-stack app** with backend API, frontend UI, and persistent data store (Postgres, MongoDB, or SQLite)
- **Session input:** Accept audio transcripts (upload .txt, paste text, or integrate speech-to-text API). Each transcript tied to a client, therapist, and session with metadata.
- **AI-generated treatment plans** from transcripts with structured fields:
  - Presenting concerns
  - Clinical impressions (optional)
  - Goals (short-term, long-term)
  - Interventions/approaches (CBT, ACT, DBT, etc.)
  - Homework/between-session actions
  - Strengths and protective factors
  - Risk indicators/red flags
- **Two plan views from same data:**
  - Therapist view: clinical, structured, documentation-ready
  - Client view: plain-language, supportive, action-oriented
- **Role-based UI:**
  - Therapist dashboard: view clients/sessions, upload transcripts, trigger plan generation, review/edit plans
  - Client dashboard: view their plan, goals, next steps, homework
- **Basic auth or session handling** (not production-grade, but demonstrates the concept)
- **Documentation:** README with stack, architecture, local setup, AI integration details, limitations
- **Automated tests** on at least one core piece of logic (e.g., parsing model output)

## Recommended (Strongly Encouraged)

- Treatment plan lifecycle: update plans with new sessions, maintain version history, show timeline
- Session summaries: clinical for therapist, friendly/encouraging for client
- Safety and ethics: detect crisis/high-risk language, flag in therapist view, add disclaimers

## Bonus/Stretch Objectives

- Model evaluation harness (compare models/prompts, reading level checks, visualization)
- Therapist-guided model customization (modality preferences, "golden" plan examples, few-shot library)
- Plan editing with multi-source updates (manual edits, regeneration, diffs)
- Video upload and playback support
- Mobile-responsive or PWA client experience
- Advanced AI: multi-language support, explainability (link plan elements to transcript snippets), copilot features ("suggest alternative interventions", "explain this goal simply")

## Key Considerations

- **No real PHI.** Use only mock or synthetic transcripts. No real Tava Health production data.
- **Privacy disclaimers** visible in the UI.
- **Evaluation criteria:** Problem understanding, AI centrality and quality, product/UX coherence, technical execution (clean architecture, testing, error handling), ambition and creativity.
- **Deliverables:** Running app (local or hosted), source code repo, documentation (README + 1-2 page write-up on AI design, product decisions, future plans), optional demo video.

## Suggested Data Models

User, Therapist, Client, Session, Transcript, TreatmentPlan, TreatmentPlanVersion
