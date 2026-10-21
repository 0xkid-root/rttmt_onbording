"use client";

import React from "react";
import { Check, ShieldCheck, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "../hooks/OnboardingContext";
import { ONBOARDING_STEPS } from "../mocks/options";

export function OnboardingSidebar() {
  const { currentStep, completedSteps, goToStep } = useOnboarding();

  const progressPercentage = Math.round(
    (completedSteps.size / ONBOARDING_STEPS.length) * 100
  );

  return (
    <aside className="w-80 shrink-0 hidden lg:block border-r border-border bg-card/60 p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground uppercase tracking-wider text-[11px]">
            Onboarding Progress
          </span>
          <span className="font-mono text-primary font-bold">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
        <p className="text-[11px] text-muted-foreground">
          {completedSteps.size} of {ONBOARDING_STEPS.length} sections validated
        </p>
      </div>

      {/* Stepper Vertical List */}
      <nav aria-label="Onboarding Steps" className="space-y-1">
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
              className={`w-full group flex items-start gap-3.5 rounded-lg p-3 text-left transition-all ${
                isCurrent
                  ? "bg-primary/10 border border-primary/30 text-foreground font-semibold shadow-2xs"
                  : isAccessible
                  ? "hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer"
                  : "opacity-50 cursor-not-allowed text-muted-foreground/60"
              }`}
            >
              {/* Step Circle Indicator */}
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors mt-0.5 ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : isCompleted
                    ? "bg-success text-success-foreground"
                    : "border border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="size-3.5 stroke-[3]" />
                ) : (
                  step.stepNumber
                )}
              </div>

              {/* Step Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs truncate ${
                      isCurrent
                        ? "font-bold text-foreground"
                        : isCompleted
                        ? "font-medium text-foreground"
                        : "font-normal"
                    }`}
                  >
                    {step.title}
                  </span>
                  {isCurrent && (
                    <ChevronRight className="size-3.5 text-primary shrink-0 ml-1" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-tight">
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Security Assurance Badge */}
      <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheck className="size-4 text-primary" />
          <span>Enterprise Encryption</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          All submitted merchant documents are encrypted and subject to RBI AML & PMLA regulatory guidelines.
        </p>
      </div>
    </aside>
  );
}
