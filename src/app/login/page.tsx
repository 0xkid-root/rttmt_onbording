import { Metadata } from "next";
import { LoginScreen } from "@/features/onboarding/components/LoginScreen";

export const metadata: Metadata = {
  title: "Merchant Portal Login (Demo) — RTTMT",
  description: "Sign in to access your RTTMT merchant onboarding portal (Simulated environment).",
};

export default function LoginPage() {
  return <LoginScreen />;
}


