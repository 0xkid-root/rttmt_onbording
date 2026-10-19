"use client";

import React from "react";
import Link from "next/link";
import { Activity, Save, FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOptionalOnboarding } from "../hooks/OnboardingContext";
import { ONBOARDING_STEPS } from "../mocks/options";

export function OnboardingHeader() {
  const onboarding = useOptionalOnboarding();
  const currentStep = onboarding?.currentStep;
  const totalSteps = onboarding?.totalSteps || 9;
  const currentConfig = currentStep ? ONBOARDING_STEPS[currentStep - 1] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/onboarding" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs group-hover:bg-primary/90 transition-colors">
              <Activity className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-base text-foreground font-mono">
                  RTMT
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Onboarding
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Real-Time Transaction Threat Platform
              </span>
            </div>
          </Link>

          {/* Current Step Pill */}
          {currentConfig && (
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-border">
              <Badge variant="outline" className="font-mono text-xs font-medium px-2.5 py-0.5">
                Step {currentStep} of {totalSteps} • {currentConfig.shortTitle}
              </Badge>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onboarding && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onboarding.saveDraft}
              className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-foreground"
            >
              <Save className="mr-1.5 size-3.5" />
              Save Draft
            </Button>
          )}

          <Link href="/onboarding/status">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
              <FileClock className="mr-1.5 size-3.5 text-muted-foreground" />
              <span className="hidden xs:inline">Check Status</span>
              <span className="xs:hidden">Status</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
