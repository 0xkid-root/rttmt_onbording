"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login Successful (Simulated)", {
        description: "Redirecting to RTTMT merchant application...",
      });
      router.push("/onboarding");
    }, 800);
  };

  const handleUseDemo = () => {
    setEmail("compliance@rttmt.com");
    setPassword("Password@123");
    toast.info("Demo credentials populated.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/onboarding" className="inline-flex items-center gap-2.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="size-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-xl text-foreground font-mono">
                  RTTMT
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Merchant Portal
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Real-Time Transaction Threat Gateway
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground pt-3">
            Sign in to Merchant Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Access your transaction velocity analytics, risk scorecards, and settlement logs.
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span>Simulated Sandbox Login</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleUseDemo}
            className="h-6 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            Fill Demo Login
          </Button>
        </div>

        {/* Login Form Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="loginEmail">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="loginPassword">Password</Label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Password Reset Simulated", {
                      description: "Reset instructions dispatched to email.",
                    })
                  }
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full font-semibold">
              {isLoading ? "Signing in..." : "Sign In to Portal"}
              {!isLoading && <ArrowRight className="ml-1.5 size-4" />}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground">
            Don’t have an RTTMT merchant account?{" "}
            <Link
              href="/onboarding"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Start Merchant Onboarding
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Protected by RTTMT 256-bit TLS Gateway</span>
        </div>
      </div>
    </div>
  );
}
