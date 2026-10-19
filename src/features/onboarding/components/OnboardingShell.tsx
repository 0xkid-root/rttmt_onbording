"use client";

import React from "react";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingSidebar } from "./OnboardingSidebar";
import { OnboardingMobileNav } from "./OnboardingMobileNav";
import { DemoAlert } from "./common/DemoAlert";
import { StepNavigation } from "./StepNavigation";

interface OnboardingShellProps {
  children: React.ReactNode;
}

export function OnboardingShell({ children }: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <OnboardingHeader />
      <OnboardingMobileNav />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <OnboardingSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            <DemoAlert />
            <div className="rounded-xl border border-border bg-card p-5 sm:p-8 shadow-sm">
              {children}
              <StepNavigation />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
