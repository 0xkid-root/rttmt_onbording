"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  FileClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function OnboardingWelcomeHero() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-x-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Background Subtle Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_25%,#000_60%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full border-b border-border bg-background/90 backdrop-blur-md px-4 sm:px-6 py-2.5 lg:py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs group-hover:bg-primary/90 transition-colors">
              <Activity className="size-4 sm:size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-foreground text-sm sm:text-base font-mono">RTTMT</span>
                <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  MERCHANT ONBOARDING
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                Real-Time Transaction Monitoring & Threat Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>Merchant Onboarding Portal</span>
            </div>

            <Link href="/onboarding/status">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted text-xs h-7.5 sm:h-8 px-2.5 sm:px-3"
              >
                <FileClock className="mr-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="hidden sm:inline">Check Application Status</span>
                <span className="sm:hidden">Status</span>
              </Button>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-6 lg:py-4 xl:py-5">
        <div className="w-full max-w-6xl">
          {/* Hero Header */}
          <div className="text-center mb-4 sm:mb-5 lg:mb-5.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 sm:mb-2.5">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              <span>SECURE MERCHANT ONBOARDING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-[2.15rem] xl:text-4xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Apply for an RTTMT Merchant Account
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get started with RTTMT by providing your business information, verifying your contact details, and submitting the required documents for review.
            </p>
          </div>

          {/* Side-by-Side Enterprise Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">

            {/* Card 1: Features & Information (Left Side) */}
            <div className="lg:col-span-6 rounded-xl border border-border bg-card text-card-foreground p-4.5 sm:p-5 lg:p-5.5 flex flex-col justify-between shadow-xs transition-colors">
              <div>
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 text-primary border border-primary/20">
                      <Activity className="size-4 sm:size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-foreground">Transaction Risk Intelligence</h2>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">Built to support safer digital transactions</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground text-[10px] sm:text-[11px] font-mono px-2 py-0.5">
                    CAPABILITIES
                  </Badge>
                </div>

                {/* Feature Rows */}
                <div className="mt-3 sm:mt-3.5 space-y-2 sm:space-y-2.5">
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-2.5 sm:p-3 transition-colors hover:bg-muted/40">
                    <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary shrink-0">
                      <Activity className="size-3.5 sm:size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Transaction Monitoring</h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Identify potentially suspicious transaction patterns and support risk-based investigation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-2.5 sm:p-3 transition-colors hover:bg-muted/40">
                    <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary shrink-0">
                      <ShieldCheck className="size-3.5 sm:size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Business Verification</h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Provide business registration information and supporting KYC/KYB documents during onboarding.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-2.5 sm:p-3 transition-colors hover:bg-muted/40">
                    <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary shrink-0">
                      <Building2 className="size-3.5 sm:size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Settlement Bank Details</h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Submit the bank account information required for the applicable merchant settlement workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capability Indicators */}
              <div className="mt-3.5 sm:mt-4 pt-3 border-t border-border">
                <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2">
                  Core Platform Focus
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/40 p-2 border border-border">
                    <div className="text-[11px] sm:text-xs font-semibold text-foreground">Risk Monitoring</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Pattern Detection</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2 border border-border">
                    <div className="text-[11px] sm:text-xs font-semibold text-foreground">KYC & KYB Workflow</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Entity Verification</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2 border border-border">
                    <div className="text-[11px] sm:text-xs font-semibold text-foreground">Settlement Details</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Payout Routing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Start Your Onboarding Application (Right Side) */}
            <div className="lg:col-span-6 rounded-xl border border-border bg-card text-card-foreground p-4.5 sm:p-5 lg:p-5.5 flex flex-col justify-between shadow-xs transition-colors relative">
              <div>
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-primary uppercase tracking-wider">
                    NEW MERCHANT APPLICATION
                  </span>
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground font-medium">
                    <Clock className="size-3 sm:size-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>About 5–10 minutes</span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-3.5">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground tracking-tight">
                    Start Your Merchant Application
                  </h2>
                  <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                    Complete your contact details, provide your business information, upload the required documents, and review your application before submission.
                  </p>
                </div>

                {/* 3-Stage Connected Onboarding Preview */}
                <div className="mt-3 sm:mt-3.5 rounded-lg border border-border bg-muted/30 p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Application Stages</span>
                    <span className="text-foreground font-mono font-medium text-[11px]">9 Steps Total</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Stage 01 */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold shrink-0 mt-0.5">
                        01
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground">Contact & Business Details</div>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Verify email and mobile number, then enter business profile information.
                        </p>
                      </div>
                    </div>

                    {/* Stage 02 */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-md bg-muted border border-border text-foreground text-[10px] sm:text-xs font-bold shrink-0 mt-0.5">
                        02
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground">KYC, KYB & Bank Details</div>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Provide applicable identity & company info, add registered address, and submit settlement bank details.
                        </p>
                      </div>
                    </div>

                    {/* Stage 03 */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-md bg-muted border border-border text-foreground text-[10px] sm:text-xs font-bold shrink-0 mt-0.5">
                        03
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground">Review & Submit</div>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Review all provided details, submit application, and track progress on the status timeline.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supporting capability badges */}
                {/* <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
                    <CheckCircle2 className="size-3 sm:size-3.5 text-primary" aria-hidden="true" />
                    Auto-save progress
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
                    <CheckCircle2 className="size-3 sm:size-3.5 text-primary" aria-hidden="true" />
                    Resume application
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
                    <CheckCircle2 className="size-3 sm:size-3.5 text-primary" aria-hidden="true" />
                    Simulated verification workflow
                  </span>
                </div> */}
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 sm:mt-4 space-y-2 pt-1">
                <Link href="/onboarding" className="block w-full">
                  <Button className="w-full h-9.5 sm:h-10 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-2xs">
                    <span>Start Merchant Onboarding</span>
                    <ArrowRight className="size-3.5 sm:size-4" aria-hidden="true" />
                  </Button>
                </Link>

                <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                  <span className="text-muted-foreground">Already started an application?</span>
                  <Link
                    href="/onboarding/status"
                    className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline underline-offset-4"
                  >
                    <span>Check application status</span>
                    <ChevronRight className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border bg-background/90 py-2.5 sm:py-3 px-4 sm:px-6 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <span className="font-semibold text-foreground font-mono text-[11px] sm:text-xs">RTTMT Merchant Onboarding</span>
          <p className="text-muted-foreground text-[10px] sm:text-[11px]">
            Submit your business information securely and track your application status.
          </p>
        </div>
      </footer>
    </div>
  );
}
