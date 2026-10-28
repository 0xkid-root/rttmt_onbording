
"use client";

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

const STEP_COMPONENTS = {
  1: Step1AccountVerification,
  2: Step2BusinessProfile,
  3: Step3CompanyDetails,
  4: Step4BusinessAddress,
  5: Step5KYC,
  6: Step6KYB,
  7: Step7BankAccount,
  8: Step8Compliance,
  9: Step9ReviewSubmit,
} as const;

function WizardActiveStep() {
  const { currentStep } = useOnboarding();

  const ActiveStep =
    STEP_COMPONENTS[
    currentStep as keyof typeof STEP_COMPONENTS
    ] ?? Step1AccountVerification;

  return <ActiveStep />;
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
