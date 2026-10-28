"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  FileClock,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";
import { WORKFLOW_STAGES } from "./hero/workflowStages";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { DesktopStageCard } from "./hero/DesktopStageCard";
import { MobileStageCard } from "./hero/MobileStageCard";
import { HorizontalConnector } from "./hero/HorizontalConnector";

export function OnboardingWelcomeHero() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Check user preference for reduced motion
  const prefersReducedMotion = useReducedMotion();

  // Sequential stage spotlight interval
  useEffect(() => {
    if (prefersReducedMotion || isUserInteracting) return;

    const timer = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % WORKFLOW_STAGES.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [prefersReducedMotion, isUserInteracting]);

  const handleStageSelect = useCallback((index: number) => {
    setActiveStageIndex(index);
    setIsUserInteracting(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-x-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Background Subtle Tech Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_25%,#000_65%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full border-b border-border bg-background/90 backdrop-blur-md px-4 sm:px-6 py-2.5 lg:py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs group-hover:bg-primary/90 transition-colors">
              <Activity className="size-4 sm:size-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-foreground text-sm sm:text-base font-mono">
                RTTMT
              </span>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                Real-Time Transaction Monitoring & Threat Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground text-xs h-7.5 sm:h-8 px-2 sm:px-2.5 focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <LogIn className="mr-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Login</span>
            </Link>

            <Link
              href="/onboarding/status"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border text-foreground hover:bg-muted text-xs h-7.5 sm:h-8 px-2.5 sm:px-3 focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <FileClock className="mr-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="hidden sm:inline">Check Application Status</span>
              <span className="sm:hidden">Status</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 lg:py-5">
        <div className="w-full max-w-6xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Get Started with RTTMT
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Complete your merchant application in a few simple steps.
            </p>
          </div>

          {/* Workflow Canvas */}
          <section
            aria-label="Merchant Onboarding Workflow"
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-xs p-4 sm:p-5 lg:p-6 relative transition-colors"
          >
            {/* Dot Grid Background */}
            <div
              className="absolute inset-0 bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:16px_16px] opacity-75 pointer-events-none rounded-2xl"
              aria-hidden="true"
            />

            {/* Simplified Toolbar */}
            <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-border/80 text-xs font-medium">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-semibold text-foreground">Merchant onboarding</span>
                <span className="text-border">|</span>
                <span>6 stages · 9 steps</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>Est. 5–10 minutes</span>
              </div>
            </div>

            {/* Workflow Canvas Body */}
            <div className="relative z-10 mt-4 sm:mt-5">
              {/* DESKTOP WORKFLOW (Horizontal Multi-Row Connected Layout, >= md) */}
              <div className="hidden md:block space-y-3.5">
                {/* Row 1: Stages 01, 02, 03 */}
                <div className="flex items-center justify-between gap-2 lg:gap-3">
                  <DesktopStageCard
                    stage={WORKFLOW_STAGES[0]}
                    isActive={activeStageIndex === 0}
                    onSelect={() => handleStageSelect(0)}
                  />

                  <HorizontalConnector
                    isActive={activeStageIndex === 0}
                    isPassed={activeStageIndex > 0}
                  />

                  <DesktopStageCard
                    stage={WORKFLOW_STAGES[1]}
                    isActive={activeStageIndex === 1}
                    onSelect={() => handleStageSelect(1)}
                  />

                  <HorizontalConnector
                    isActive={activeStageIndex === 1}
                    isPassed={activeStageIndex > 1}
                  />

                  <DesktopStageCard
                    stage={WORKFLOW_STAGES[2]}
                    isActive={activeStageIndex === 2}
                    onSelect={() => handleStageSelect(2)}
                  />
                </div>

                {/* Subtle Divider between Row 1 and Row 2 */}
                <div className="h-px bg-border/60 my-2" aria-hidden="true" />

                {/* Row 2: Stages 04, 05, 06 */}
                <div className="flex items-center justify-between gap-2 lg:gap-3">
                  <DesktopStageCard
                    stage={WORKFLOW_STAGES[3]}
                    isActive={activeStageIndex === 3}
                    onSelect={() => handleStageSelect(3)}
                  />

                  <HorizontalConnector
                    isActive={activeStageIndex === 3}
                    isPassed={activeStageIndex > 3}
                  />

                  <DesktopStageCard
                    stage={WORKFLOW_STAGES[4]}
                    isActive={activeStageIndex === 4}
                    onSelect={() => handleStageSelect(4)}
                  />

                  <HorizontalConnector
                    isActive={activeStageIndex === 4}
                    isPassed={activeStageIndex > 4}
                  />

                  <DesktopStageCard
                    stage={WORKFLOW_STAGES[5]}
                    isActive={activeStageIndex === 5}
                    onSelect={() => handleStageSelect(5)}
                  />
                </div>

                {/* Downward Vertical Connector to Final CTA */}
                <div className="flex flex-col items-center justify-center pt-2 pb-0.5" aria-hidden="true">
                  <svg width="24" height="22" viewBox="0 0 24 22" className="overflow-visible">
                    <line
                      x1="12"
                      y1="0"
                      x2="12"
                      y2="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className={cn(
                        "transition-colors duration-300",
                        activeStageIndex === 5 ? "text-primary animate-flow-dash" : "text-border"
                      )}
                    />
                    <polygon
                      points="8,14 12,20 16,14"
                      className={cn(
                        "transition-colors",
                        activeStageIndex === 5 ? "fill-primary" : "fill-border"
                      )}
                    />
                  </svg>
                </div>
              </div>

              {/* MOBILE WORKFLOW (Vertical Connected Sequence, < md) */}
              <div className="md:hidden space-y-0">
                {WORKFLOW_STAGES.map((stage, idx) => (
                  <div key={stage.id} className="flex flex-col items-center">
                    <MobileStageCard
                      stage={stage}
                      isActive={activeStageIndex === idx}
                      onSelect={() => handleStageSelect(idx)}
                    />

                    {/* Vertical Connector between Stages (not after the final stage) */}
                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <div className="flex flex-col items-center justify-center h-6 my-0.5" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <line
                            x1="12"
                            y1="0"
                            x2="12"
                            y2="18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            className={cn(
                              "transition-colors duration-300",
                              activeStageIndex === idx ? "text-primary animate-flow-dash" : "text-border"
                            )}
                          />
                          <polygon
                            points="8,15 12,21 16,15"
                            className={cn(
                              "transition-colors",
                              activeStageIndex === idx ? "fill-primary" : "fill-border"
                            )}
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FINAL CTA CARD: Prominent End-of-Workflow Node */}
              <div
                className={cn(
                  "mt-2.5 sm:mt-1 rounded-xl border transition-colors duration-200 p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-muted/40 via-card to-muted/40 text-card-foreground shadow-xs relative",
                  activeStageIndex === 5
                    ? "border-primary/60 ring-1 ring-primary/20"
                    : "border-border"
                )}
              >
                {/* Node Target Socket Handle */}
                <div
                  className="hidden md:block absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full border-2 border-background bg-border ring-1 ring-border"
                  aria-hidden="true"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-foreground">
                      Ready to get started?
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Complete your merchant onboarding in 9 steps.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <Link
                      href="/onboarding"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-10 sm:h-11 px-5 sm:px-6 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs flex items-center justify-center gap-2 group cursor-pointer"
                      )}
                    >
                      <span>Start Merchant Onboarding</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>

                    <Link
                      href="/onboarding/status"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-10 sm:h-11 px-3.5 text-xs font-medium text-foreground hover:bg-muted flex items-center justify-center gap-1.5"
                      )}
                    >
                      <FileClock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <span>Check application status</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border bg-background/90 py-2.5 sm:py-3 px-4 sm:px-6 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <span className="font-semibold text-foreground font-mono text-[11px] sm:text-xs">
            © 2026 RTTMT · Merchant Onboarding
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo Portal Login
            </Link>
            <span aria-hidden="true">&bull;</span>
            <Link
              href="/onboarding/status"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Check Application Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
