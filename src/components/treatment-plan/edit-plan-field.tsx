"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function EditPlanField({
  planId,
  versionId,
  field,
  currentValue,
}: {
  planId: string;
  versionId: string;
  field: string;
  currentValue: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);

    // Fetch current version data
    const { data: version } = await supabase
      .from("treatment_plan_versions")
      .select("therapist_view")
      .eq("id", versionId)
      .single();

    if (!version) {
      setSaving(false);
      return;
    }

    // Update the specific field
    const updatedView = { ...version.therapist_view };
    if (field === "clinical_impressions") {
      updatedView.clinical_impressions = value;
    } else if (field === "presenting_concerns") {
      updatedView.presenting_concerns = value.split("\n").filter((l: string) => l.trim());
    } else if (field === "homework") {
      updatedView.homework = value.split("\n").filter((l: string) => l.trim());
    }

    await supabase
      .from("treatment_plan_versions")
      .update({ therapist_view: updatedView })
      .eq("id", versionId);

    await supabase
      .from("treatment_plans")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", planId);

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={() => setEditing(true)}
      >
        Edit
      </Button>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setValue(currentValue);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
