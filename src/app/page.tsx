import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
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
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
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
