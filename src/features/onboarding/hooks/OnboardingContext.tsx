"use client";

import React, { createContext, useContext } from "react";
import { useOnboardingWizard, WizardHookReturn } from "./useOnboardingWizard";

const OnboardingContext = createContext<WizardHookReturn | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const wizard = useOnboardingWizard();
  return (
    <OnboardingContext.Provider value={wizard}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): WizardHookReturn {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

export function useOptionalOnboarding(): WizardHookReturn | null {
  return useContext(OnboardingContext);
}
