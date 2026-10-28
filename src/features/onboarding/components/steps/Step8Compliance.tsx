"use client";

import React from "react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { PolicyUrlsSection } from "./step8/PolicyUrlsSection";
import { StatutoryDeclarationsSection } from "./step8/StatutoryDeclarationsSection";

export function Step8Compliance() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step8;

  const websiteUrl = formData.step2.websiteUrl;
  const accountEmail = formData.step1.email;
  const accountPhone = formData.step1.phone;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Compliance, Public Policies & Declarations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide customer-facing legal URLs and complete statutory AML, PEP, and tax
          regulatory disclosures.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Customer-Facing Policy URLs & Contact */}
        <PolicyUrlsSection
          data={data}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
          websiteUrl={websiteUrl}
          accountEmail={accountEmail}
          accountPhone={accountPhone}
        />

        {/* Section 2: Statutory Compliance Declarations & Consents */}
        <StatutoryDeclarationsSection
          data={data}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
        />
      </div>
    </div>
  );
}
