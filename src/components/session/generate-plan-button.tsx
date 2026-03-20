"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GeneratePlanButton({
  sessionId,
  clientId,
  hasPlan,
}: {
  sessionId: string;
  clientId: string;
  hasPlan: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, clientId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate plan");
      }

      const data = await res.json();
      router.refresh();
      router.push(`/therapist/plans/${data.planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-3">
          {error}
        </div>
      )}
      <Button onClick={handleGenerate} disabled={loading} size="lg">
        {loading
          ? "Generating..."
          : hasPlan
          ? "Update Treatment Plan"
          : "Generate Treatment Plan"}
      </Button>
    </div>
  );
}
