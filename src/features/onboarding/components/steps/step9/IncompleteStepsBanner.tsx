"use client";

import React from "react";
import { AlertTriangle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepStatusItem {
  num: number;
  label: string;
  valid: boolean;
}

interface IncompleteStepsBannerProps {
  stepStatuses: StepStatusItem[];
  goToStep: (stepNumber: number) => void;
}

export function IncompleteStepsBanner({
  stepStatuses,
  goToStep,
}: IncompleteStepsBannerProps) {
  const incompleteSteps = stepStatuses.filter((s) => !s.valid);

  if (incompleteSteps.length === 0) return null;

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-xs space-y-2">
      <div className="flex items-center gap-2 font-semibold text-warning">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Attention: The following sections require completion before submission:</span>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {incompleteSteps.map((s) => (
          <Button
            key={s.num}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => goToStep(s.num)}
            className="h-6 text-[11px] border-warning/40 text-warning hover:bg-warning/20"
          >
            <Edit2 className="mr-1 size-3" />
            Step {s.num}: {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
