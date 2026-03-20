"use client";

import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-950/50 border-b border-amber-800/50 px-4 py-2 text-center text-sm text-amber-200">
      <AlertTriangle className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
      This is a demo application using synthetic data. Not a substitute for
      clinical judgment.
    </div>
  );
}
