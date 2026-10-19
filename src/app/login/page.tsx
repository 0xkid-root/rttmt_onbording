import { Metadata } from "next";
import { OnboardingWelcomeHero } from "@/features/onboarding/components/OnboardingWelcomeHero";

export const metadata: Metadata = {
  title: "Merchant Onboarding — RTMT",
  description: "Start your merchant onboarding flow on RTMT Threat Gateway.",
};

export default function LoginPage() {
  return <OnboardingWelcomeHero />;
}

