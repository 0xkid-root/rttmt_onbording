"use client";

import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "../hooks/OnboardingContext";
import { ONBOARDING_STEPS } from "../mocks/options";

export function OnboardingMobileNav() {
  const { currentStep, completedSteps, goToStep } = useOnboarding();
  const currentConfig = ONBOARDING_STEPS[currentStep - 1];

  const progressPercentage = Math.round(
    (completedSteps.size / ONBOARDING_STEPS.length) * 100
  );

  return (
    <div className="lg:hidden border-b border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">
          Step {currentStep} of {ONBOARDING_STEPS.length}:{" "}
          <span className="text-primary">{currentConfig?.shortTitle}</span>
        </span>
        <span className="font-mono text-xs font-bold text-primary">
          {progressPercentage}%
        </span>
      </div>

      <Progress value={progressPercentage} className="h-1.5" />

      {/* Horizontal Scrollable Mini Stepper */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {ONBOARDING_STEPS.map((step) => {
          const isCurrent = step.stepNumber === currentStep;
          const isCompleted = completedSteps.has(step.stepNumber);
          const isAccessible = isCompleted || step.stepNumber <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isAccessible && goToStep(step.stepNumber)}
              disabled={!isAccessible}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isCurrent
                  ? "bg-primary text-primary-foreground border-primary"
                  : isCompleted
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <span>{step.stepNumber}</span>
              <span className="hidden xs:inline">{step.shortTitle}</span>
              {isCompleted && !isCurrent && <Check className="size-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
