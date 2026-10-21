"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Lock, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Activity,
  FileClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function OnboardingWelcomeHero() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-x-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Background Subtle Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 -right-20 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 w-full border-b border-border bg-background/80 backdrop-blur-md px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Activity className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-foreground text-base font-mono">RTTMT</span>
                <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  MERCHANT ONBOARDING
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Real-Time Transaction Threat Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success font-medium">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-success" />
              </span>
              <span>Gateway Live v2.4</span>
            </div>

            <Link href="/onboarding/status">
              <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted text-xs h-8">
                <FileClock className="mr-1.5 size-3.5 text-muted-foreground" />
                Check Status
              </Button>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area: Two Animated Cards */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-6xl">
          {/* Section Subhead */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs mb-3">
              <Sparkles className="size-3.5 text-primary" />
              <span>Official Merchant Onboarding Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Launch Your <span className="underline decoration-primary/30 decoration-wavy decoration-2 underline-offset-8">RTTMT Merchant Account</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              No existing credentials needed. Complete your business verification, configure settlement rails, and obtain instant sandbox access in 9 streamlined steps.
            </p>
          </div>

          {/* Side-by-Side Animated Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Card 1: Features & Information (Left Side Animated Card) */}
            <div className="lg:col-span-6 rounded-2xl border border-border bg-card text-card-foreground p-5 sm:p-7 flex flex-col justify-between shadow-xs hover:border-foreground/20 transition-all duration-300 animate-float-slow">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary border border-primary/20">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Enterprise Threat Architecture</h2>
                      <p className="text-xs text-muted-foreground">Zero-latency security & instant clearing</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-border bg-muted text-foreground text-[11px] font-mono">
                    RTTMT PROTOCOL
                  </Badge>
                </div>

                {/* Feature Rows */}
                <div className="mt-5 space-y-3.5">
                  <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/60">
                    <div className="mt-0.5 rounded-md bg-info/10 p-1.5 text-info">
                      <Zap className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Real-Time Threat Filtering</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Sub-10ms anomaly analysis, velocity monitoring, and automated chargeback neutralization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/60">
                    <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Automated KYB & Registry Verification</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Instant corporate cross-referencing against national registries with automated OCR document parsing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/60">
                    <div className="mt-0.5 rounded-md bg-success/10 p-1.5 text-success">
                      <Lock className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Bank-Grade Settlement Rails</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Direct-to-bank settlement integrations with T+0/T+1 payout flexibility and compliance audits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Ticker */}
              <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <div className="text-lg font-bold text-foreground tracking-tight font-mono">99.99%</div>
                  <div className="text-[11px] text-muted-foreground font-medium">Gateway Uptime</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <div className="text-lg font-bold text-success tracking-tight font-mono">&lt; 4 mins</div>
                  <div className="text-[11px] text-muted-foreground font-medium">Avg Verification</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <div className="text-lg font-bold text-foreground tracking-tight font-mono">Level 1</div>
                  <div className="text-[11px] text-muted-foreground font-medium">PCI-DSS Security</div>
                </div>
              </div>
            </div>

            {/* Card 2: Start Your Onboarding (Right Side Animated Card) */}
            <div className="lg:col-span-6 rounded-2xl border-2 border-border bg-card text-card-foreground p-5 sm:p-7 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300 animate-float-delayed relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="size-3" />
                    New Merchant Application
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>~5 - 7 mins</span>
                  </div>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    Start Your Onboarding
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Set up your merchant identity, verify business ownership, and activate sandbox access in 9 streamlined steps.
                  </p>
                </div>

                {/* 3-Stage Progress Blueprint Preview */}
                <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Onboarding Journey</span>
                    <span className="text-foreground font-mono font-medium">9 Steps</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</div>
                        <span className="font-medium">Account & Business Profile</span>
                      </div>
                      <span className="text-[11px] text-success flex items-center gap-1 font-mono font-medium">
                        <CheckCircle2 className="size-3" /> Ready
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-full bg-muted border border-border text-foreground text-[10px] font-bold">2</div>
                        <span className="font-medium">KYC & Corporate KYB Clearance</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">OCR Match</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-full bg-muted border border-border text-foreground text-[10px] font-bold">3</div>
                        <span className="font-medium">Settlement Rails & Final Review</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">Instant Key</span>
                    </div>
                  </div>
                </div>

                {/* Highlight badges */}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-success" />
                    Auto-save progress
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-success" />
                    No credit card needed
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-success" />
                    Sandbox simulation ready
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Link href="/onboarding" className="block w-full">
                  <Button className="w-full h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group/btn">
                    <span>Start Merchant Onboarding</span>
                    <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Already started an application?</span>
                  <Link 
                    href="/onboarding/status"
                    className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline underline-offset-4"
                  >
                    <span>Check status & resume</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Assurance */}
      <footer className="relative z-10 w-full border-t border-border bg-background/80 py-4 px-6 text-center text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-muted-foreground" />
            Protected by RTTMT 256-bit TLS Gateway
          </span>
          <span>•</span>
          <span>PCI-DSS Level 1 Compliant</span>
          <span>•</span>
          <span>Automated KYB & KYC Verification Engine</span>
        </div>
      </footer>
    </div>
  );
}
