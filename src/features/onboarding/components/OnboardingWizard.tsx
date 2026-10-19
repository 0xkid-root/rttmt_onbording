"use client";

import React from "react";
import { OnboardingProvider, useOnboarding } from "../hooks/OnboardingContext";
import { OnboardingShell } from "./OnboardingShell";
import { Step1AccountVerification } from "./steps/Step1AccountVerification";
import { Step2BusinessProfile } from "./steps/Step2BusinessProfile";
import { Step3CompanyDetails } from "./steps/Step3CompanyDetails";
import { Step4BusinessAddress } from "./steps/Step4BusinessAddress";
import { Step5KYC } from "./steps/Step5KYC";
import { Step6KYB } from "./steps/Step6KYB";
import { Step7BankAccount } from "./steps/Step7BankAccount";
import { Step8Compliance } from "./steps/Step8Compliance";
import { Step9ReviewSubmit } from "./steps/Step9ReviewSubmit";

function WizardActiveStep() {
  const { currentStep } = useOnboarding();

  switch (currentStep) {
    case 1:
      return <Step1AccountVerification />;
    case 2:
      return <Step2BusinessProfile />;
    case 3:
      return <Step3CompanyDetails />;
    case 4:
      return <Step4BusinessAddress />;
    case 5:
      return <Step5KYC />;
    case 6:
      return <Step6KYB />;
    case 7:
      return <Step7BankAccount />;
    case 8:
      return <Step8Compliance />;
    case 9:
      return <Step9ReviewSubmit />;
    default:
      return <Step1AccountVerification />;
  }
}

export function OnboardingWizard() {
  return (
    <OnboardingProvider>
      <OnboardingShell>
        <WizardActiveStep />
      </OnboardingShell>
    </OnboardingProvider>
  );
}
