"use client";

import React from "react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { Step3CompanyDetailsData } from "../../types";
import { EntityClassificationSection } from "./step3/EntityClassificationSection";
import { StatutoryTaxIdentifiersSection } from "./step3/StatutoryTaxIdentifiersSection";

export function Step3CompanyDetails() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step3;

  const isCorporate = ["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(data.entityType);
  const isLlp = data.entityType === "LLP";
  const isGstinRequired = isCorporate || isLlp;

  // Local date in YYYY-MM-DD format to prevent timezone offset bugs with future date limit
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleUpdate = (updates: Partial<Step3CompanyDetailsData>) => {
    updateStepData("step3", updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Legal Entity & Statutory Identifiers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the statutory registration records corresponding to your tax filings and corporate registrar.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Entity Classification & Registration */}
        <EntityClassificationSection
          data={data}
          onUpdate={handleUpdate}
          stepErrors={stepErrors}
          maxDate={maxDate}
        />

        {/* Section 2: Tax Identifiers (PAN & GSTIN) */}
        <StatutoryTaxIdentifiersSection
          data={data}
          onUpdate={handleUpdate}
          stepErrors={stepErrors}
          isGstinRequired={isGstinRequired}
        />
      </div>
    </div>
  );
}
