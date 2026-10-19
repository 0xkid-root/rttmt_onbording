import { Metadata } from "next";
import { LoginScreen } from "@/features/onboarding/components/LoginScreen";

export const metadata: Metadata = {
  title: "Merchant Portal Login — RTMT",
  description: "Sign in to your RTMT merchant dashboard.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
