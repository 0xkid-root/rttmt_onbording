"use client";

import React from "react";
import { Info, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../../hooks/OnboardingContext";

export function DemoAlert() {
  const { loadDemoData, resetDraft } = useOnboarding();

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-primary">Simulated Sandbox Environment: </span>
            <span className="text-muted-foreground">
              All OTPs, MCA registry queries, and penny-drop bank checks are simulated for demonstration.
              Demo OTP code is <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">123456</code>.
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={loadDemoData}
            className="h-7 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <Sparkles className="size-3 text-primary" />
            Fill Demo Data
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={resetDraft}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
