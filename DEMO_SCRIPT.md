# Tava Health Demo Script (~4 min)

**URL:** https://tava-health-plans.vercel.app

---

## 1. Intro (30s)

> "I built an AI-powered treatment plan generator for Tava Health. The core insight is that therapists and clients need the same plan data presented in completely different ways -- clinical and structured for therapists, warm and actionable for clients. Let me walk you through it."

## 2. Therapist Flow (2 min)

**Login** -- Click "therapist@demo.com" demo button, sign in.

> "As a therapist, I see my client list. Let me open Marcus Johnson's profile."

**Upload transcript** -- Click Marcus, paste a transcript, click Create Session.

> "I upload a session transcript -- this can be pasted text or a .txt file. The system creates a session record."

**Generate plan** -- Click "Generate Treatment Plan", wait for redirect.

> "One click runs three AI operations in parallel: it generates a structured treatment plan, creates session summaries in two tones, and scans for safety flags like crisis language or self-harm indicators."

**Walk through therapist view** -- Scroll through the plan.

> "The therapist view is clinical and documentation-ready: presenting concerns, goals with specific interventions like CBT, homework assignments, and identified strengths. If there were risk indicators, they'd appear in red at the bottom."

## 3. Client Flow (1 min)

**Sign out, sign in as client** -- Click demo button for client@demo.com.

> "Now as the client, Marcus sees the exact same plan data -- but in a completely different voice."

**Walk through client dashboard** -- Scroll through goals, homework, strengths.

> "No clinical jargon, no risk flags. Instead: 'Feel more in control of your anxiety.' Homework comes with encouragement. Strengths are highlighted. It feels like a supportive conversation, not a medical document."

## 4. Wrap-up (30s)

> "The architecture: Next.js 16, Supabase for auth and Postgres, OpenAI for structured JSON generation. Plans version automatically when new sessions are uploaded, so therapists can track how the plan evolves over time."

> "If I had more time, I'd add explainability -- clicking a plan element to see which transcript snippet influenced it -- and therapist-guided model customization so the AI learns each therapist's preferred modalities."
