import { Metadata } from "next";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";

export const metadata: Metadata = {
  title: "Merchant Onboarding Wizard — RTTMT",
  description: "Complete your merchant compliance and account setup for RTTMT.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
