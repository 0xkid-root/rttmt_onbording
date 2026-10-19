import { Metadata } from "next";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";

export const metadata: Metadata = {
  title: "Merchant Onboarding Wizard — RTMT",
  description: "Complete your merchant compliance and account setup for RTMT.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
