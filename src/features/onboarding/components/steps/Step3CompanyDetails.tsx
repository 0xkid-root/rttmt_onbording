"use client";

import React from "react";
import { FileText } from "lucide-react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { ENTITY_TYPE_OPTIONS } from "../../mocks/options";
import { Step3CompanyDetailsData } from "../../types";
import { EntityClassificationSection } from "./step3/EntityClassificationSection";
import { StatutoryTaxIdentifiersSection } from "./step3/StatutoryTaxIdentifiersSection";

export function Step3CompanyDetails() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step3;

  const currentEntityConfig = ENTITY_TYPE_OPTIONS.find(
    (e) => e.value === data.entityType
  );

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

        {/* Section 3: Required Documents (Informational Checklist) */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="size-4 text-primary" />
              <span>Required Documents &mdash; {currentEntityConfig?.label || "Entity"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Informational overview &bull; Uploads collected in Step 6 (KYB)
            </span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 text-muted-foreground pt-1">
            {currentEntityConfig?.requiredKybDocs.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground/70 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
