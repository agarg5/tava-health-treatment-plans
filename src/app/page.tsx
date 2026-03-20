"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const DEMO_ACCOUNTS = [
  { email: "therapist@demo.com", password: "demo1234", label: "Sign In as Therapist", sub: "Dr. Sarah Chen", redirect: "/therapist/dashboard" },
  { email: "client@demo.com", password: "demo1234", label: "Sign In as Client", sub: "Marcus Johnson", redirect: "/client/dashboard" },
];

export default function HomePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDemoLogin(account: typeof DEMO_ACCOUNTS[0]) {
    setLoading(account.email);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }

    router.push(account.redirect);
  }

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI-Powered Treatment Plans
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Transform therapy session transcripts into structured, personalized
          treatment plans — tailored for both therapists and clients.
        </p>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.email}
              size="lg"
              variant={account.email.startsWith("therapist") ? "default" : "outline"}
              onClick={() => handleDemoLogin(account)}
              disabled={loading !== null}
            >
              {loading === account.email ? "Signing in..." : account.label}
            </Button>
          ))}
        </div>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm font-medium">For Therapists</div>
            <p className="text-sm text-muted-foreground">
              Upload transcripts, generate clinical treatment plans, track
              progress across sessions.
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm font-medium">For Clients</div>
            <p className="text-sm text-muted-foreground">
              View your plan in clear, supportive language. Understand your
              goals and next steps.
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm font-medium">AI-Powered</div>
            <p className="text-sm text-muted-foreground">
              Structured plans generated from session transcripts with safety
              awareness built in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
