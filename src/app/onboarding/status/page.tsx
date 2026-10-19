import { Metadata } from "next";
import { OnboardingStatusScreen } from "@/features/onboarding/components/OnboardingStatusScreen";

export const metadata: Metadata = {
  title: "Application Status & Verification Timeline — RTMT",
  description: "Track your RTMT merchant underwriting and compliance review timeline.",
};

export default function OnboardingStatusPage() {
  return <OnboardingStatusScreen />;
}
