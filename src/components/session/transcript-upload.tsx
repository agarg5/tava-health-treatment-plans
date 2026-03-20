"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TranscriptUpload({
  clientId,
  therapistId,
  sessionCount,
}: {
  clientId: string;
  therapistId: string;
  sessionCount: number;
}) {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(source: "paste" | "upload", content?: string) {
    const transcriptContent = content || text;
    if (!transcriptContent.trim()) {
      setError("Please provide a transcript.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          client_id: clientId,
          therapist_id: therapistId,
          session_date: new Date().toISOString(),
          session_number: sessionCount + 1,
          notes: notes || null,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create transcript
      const { error: transcriptError } = await supabase
        .from("transcripts")
        .insert({
          session_id: session.id,
          content: transcriptContent,
          source,
        });

      if (transcriptError) throw transcriptError;

      setText("");
      setNotes("");
      router.push(`/therapist/sessions/${session.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload transcript");
      setLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleSubmit("upload", content);
    };
    reader.readAsText(file);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Transcript</CardTitle>
        <CardDescription>
          Add a new session transcript to generate or update the treatment plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Brief notes about this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Tabs defaultValue="paste">
            <TabsList>
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="space-y-3">
              <Textarea
                placeholder="Paste the session transcript here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <Button
                onClick={() => handleSubmit("paste")}
                disabled={loading || !text.trim()}
              >
                {loading ? "Creating session..." : "Create Session"}
              </Button>
            </TabsContent>
            <TabsContent value="upload" className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".txt,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <p className="text-lg mb-1">Drop a .txt file or click to browse</p>
                  <p className="text-sm">Plain text transcripts only</p>
                </label>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
