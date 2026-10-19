"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Lock, 
  Building2, 
  FileCheck2, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Activity,
  FileClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OnboardingWelcomeHero() {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 -right-20 -z-10 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 -z-10 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">RTMT</span>
                <span className="rounded bg-blue-950/80 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
                  MERCHANT ONBOARDING
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Real-Time Transaction Threat Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Gateway Live v2.4</span>
            </div>

            <Link href="/onboarding/status">
              <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white text-xs h-9">
                <FileClock className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                Check Status
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area: Two Animated Cards */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-6xl">
          {/* Section Subhead */}
          <div className="text-center mb-5 sm:mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/40 px-3.5 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Official Merchant Onboarding Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Launch Your <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">RTMT Merchant Account</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              No existing credentials needed. Register your business entity and configure instant transaction threat filtering in minutes.
            </p>
          </div>

          {/* Side-by-Side Animated Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-stretch">
            
            {/* Card 1: Features & Information (Left Side Animated Card) */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between shadow-2xl shadow-blue-950/20 hover:border-slate-700 transition-all duration-500 animate-float-slow group">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">Enterprise Threat Architecture</h2>
                      <p className="text-xs text-slate-400">Zero-latency security & instant clearing</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-500/30 bg-blue-950/30 text-blue-400 text-[11px] font-mono">
                    RTMT PROTOCOL
                  </Badge>
                </div>

                {/* Animated Feature Rows */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3.5 transition-all hover:border-blue-500/30 hover:bg-slate-900/80">
                    <div className="mt-0.5 rounded-md bg-indigo-500/10 p-1.5 text-indigo-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">Real-Time Threat Filtering</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Sub-10ms anomaly analysis, velocity monitoring, and automated chargeback neutralization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3.5 transition-all hover:border-blue-500/30 hover:bg-slate-900/80">
                    <div className="mt-0.5 rounded-md bg-blue-500/10 p-1.5 text-blue-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">Automated KYB & Registry Verification</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Instant corporate cross-referencing against national registries with automated OCR document parsing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3.5 transition-all hover:border-blue-500/30 hover:bg-slate-900/80">
                    <div className="mt-0.5 rounded-md bg-emerald-500/10 p-1.5 text-emerald-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">Bank-Grade Settlement Rails</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Direct-to-bank settlement integrations with T+0/T+1 payout flexibility and compliance audits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Ticker */}
              <div className="mt-8 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-slate-950/50 p-2.5 border border-slate-800/50">
                  <div className="text-lg font-bold text-white tracking-tight">99.99%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Gateway Uptime</div>
                </div>
                <div className="rounded-lg bg-slate-950/50 p-2.5 border border-slate-800/50">
                  <div className="text-lg font-bold text-emerald-400 tracking-tight">&lt; 4 mins</div>
                  <div className="text-[11px] text-slate-400 font-medium">Avg Verification</div>
                </div>
                <div className="rounded-lg bg-slate-950/50 p-2.5 border border-slate-800/50">
                  <div className="text-lg font-bold text-blue-400 tracking-tight">Level 1</div>
                  <div className="text-[11px] text-slate-400 font-medium">PCI-DSS Security</div>
                </div>
              </div>
            </div>

            {/* Card 2: Start Your Onboarding (Right Side Animated Card) */}
            <div className="lg:col-span-6 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between shadow-2xl shadow-blue-500/10 hover:border-blue-400/60 transition-all duration-500 animate-float-delayed relative overflow-hidden group">
              {/* Subtle top glow line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500" />

              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    New Application
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>~5 - 7 mins</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Start Your Onboarding
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Set up your merchant identity, verify business ownership, and activate sandbox access in 9 streamlined steps.
                  </p>
                </div>

                {/* 3-Stage Progress Blueprint Preview */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Onboarding Journey</span>
                    <span className="text-blue-400 font-mono">9 Steps</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">1</div>
                        <span>Account & Business Profile</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">2</div>
                        <span>KYC & Corporate KYB Clearance</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">OCR Match</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">3</div>
                        <span>Settlement Rails & Final Review</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Instant Key</span>
                    </div>
                  </div>
                </div>

                {/* Highlight badges */}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2.5 py-1 text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    Auto-save progress
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2.5 py-1 text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    No credit card needed
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2.5 py-1 text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    Sandbox simulation ready
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <Link href="/onboarding" className="block w-full">
                  <Button className="w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 group/btn">
                    <span>Start Merchant Onboarding</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Already started an application?</span>
                  <Link 
                    href="/onboarding/status"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4"
                  >
                    <span>Check status & resume</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Assurance */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            Protected by RTMT 256-bit TLS Gateway
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
