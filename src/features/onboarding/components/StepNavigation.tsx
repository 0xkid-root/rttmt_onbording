"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../hooks/OnboardingContext";

export function StepNavigation() {
  const { currentStep, totalSteps, prevStep, nextStep, saveDraft, isSubmitting } =
    useOnboarding();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between border-t border-border mt-8">
      {/* Back button */}
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isSubmitting}
            className="w-full sm:w-auto font-medium"
          >
            <ChevronLeft className="mr-1.5 size-4" />
            Previous Step
          </Button>
        )}
      </div>

      {/* Right actions: Save Draft and Next */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={saveDraft}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
        >
          <Save className="mr-1.5 size-3.5" />
          Save Draft
        </Button>

        {!isLastStep && (
          <Button
            type="button"
            onClick={nextStep}
            disabled={isSubmitting}
            className="w-full sm:w-auto font-semibold px-6"
          >
            Save & Continue
            <ChevronRight className="ml-1.5 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
