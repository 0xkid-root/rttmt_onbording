"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusEmptyStateProps {
  onLoadDemo: () => void;
}

export function StatusEmptyState({ onLoadDemo }: StatusEmptyStateProps) {
  return (
    <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex flex-col justify-center items-center my-auto">
      <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center w-full space-y-5 shadow-xs">
        <div className="mx-auto size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <FileText className="size-7 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-foreground">
            No Submitted Application Found
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You have not submitted a merchant onboarding application in this browser session,
            or your previous submission was cleared. You can start a new onboarding application
            or preview a sample submission in demo mode.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="mr-1.5 size-3.5" /> Start Merchant Onboarding
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadDemo}
            className="w-full sm:w-auto"
          >
            <Sparkles className="mr-1.5 size-3.5 text-primary" /> View Demo Application
          </Button>
        </div>
      </div>
    </main>
  );
}
