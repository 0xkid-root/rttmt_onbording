"use client";

import React from "react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { Step2BusinessProfileData } from "../../types";
import { TradingIdentitySection } from "./step2/TradingIdentitySection";
import { OnlinePresenceSection } from "./step2/OnlinePresenceSection";
import { OperationsProfileSection } from "./step2/OperationsProfileSection";

export function Step2BusinessProfile() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step2;

  const handleUpdate = (updates: Partial<Step2BusinessProfileData>) => {
    updateStepData("step2", updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Business & Operating Profile
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide your commercial trading identity, industry classification, and transaction volume forecasts.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Brand Name & Categorization */}
        <TradingIdentitySection
          data={data}
          onUpdate={handleUpdate}
          stepErrors={stepErrors}
        />

        {/* Section 2: Online Presence & Business Description */}
        <OnlinePresenceSection
          data={data}
          onUpdate={handleUpdate}
          stepErrors={stepErrors}
        />

        {/* Section 3: Financial Metrics & Processing Projections */}
        <OperationsProfileSection
          data={data}
          onUpdate={handleUpdate}
          stepErrors={stepErrors}
        />
      </div>
    </div>
  );
}
