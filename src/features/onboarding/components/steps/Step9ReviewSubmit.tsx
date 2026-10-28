"use client";

import React, { useMemo } from "react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { IncompleteStepsBanner } from "./step9/IncompleteStepsBanner";
import { ReviewSummaryCards } from "./step9/ReviewSummaryCards";
import { ReviewAffirmationsSection } from "./step9/ReviewAffirmationsSection";

export function Step9ReviewSubmit() {
  const {
    formData,
    goToStep,
    validateStep,
    updateStepData,
    stepErrors,
    submit,
    isSubmitting,
  } = useOnboarding();

  const data = formData.step9;
  const entityName =
    formData.step3.legalEntityName || formData.step2.brandName || "the Entity";

  // Check validation status of each step
  const stepStatuses = useMemo(
    () => [
      { num: 1, label: "Account Credentials", valid: validateStep(1).isValid },
      { num: 2, label: "Business Profile", valid: validateStep(2).isValid },
      { num: 3, label: "Company Identifiers", valid: validateStep(3).isValid },
      { num: 4, label: "Operating Address", valid: validateStep(4).isValid },
      { num: 5, label: "Signatory KYC", valid: validateStep(5).isValid },
      { num: 6, label: "Corporate KYB", valid: validateStep(6).isValid },
      { num: 7, label: "Settlement Account", valid: validateStep(7).isValid },
      { num: 8, label: "Policies & Compliance", valid: validateStep(8).isValid },
    ],
    [validateStep]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Review Application & Submit
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Carefully review all merchant information, documents, and declarations before
          final submission.
        </p>
      </div>

      {/* Incomplete steps warning banner if any */}
      <IncompleteStepsBanner
        stepStatuses={stepStatuses}
        goToStep={goToStep}
      />

      <div className="grid gap-6">
        {/* Sections 1 to 8 Review Cards */}
        <ReviewSummaryCards
          formData={formData}
          goToStep={goToStep}
        />

        {/* Final Affirmations & Submission Checkboxes */}
        <ReviewAffirmationsSection
          data={data}
          entityName={entityName}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
          isSubmitting={isSubmitting}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}
