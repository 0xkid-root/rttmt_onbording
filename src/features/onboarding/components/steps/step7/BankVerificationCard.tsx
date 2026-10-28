"use client";

import React from "react";
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Step7BankAccountData } from "../../../types";

interface BankVerificationCardProps {
  data: Step7BankAccountData;
  canRunVerification: boolean;
  isPennyDropRunning: boolean;
  pennyDropError: string | null;
  maskedAccountNumber: string;
  stepErrors: Record<string, string>;
  handleRunPennyDrop: () => void;
}

export function BankVerificationCard({
  data,
  canRunVerification,
  isPennyDropRunning,
  pennyDropError,
  maskedAccountNumber,
  stepErrors,
  handleRunPennyDrop,
}: BankVerificationCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            Simulated Bank Account Verification
          </h3>
        </div>

        <Button
          type="button"
          variant={data.isBankVerified ? "outline" : "default"}
          size="sm"
          onClick={handleRunPennyDrop}
          disabled={isPennyDropRunning || !canRunVerification}
          className="shrink-0 h-9"
          aria-busy={isPennyDropRunning}
        >
          {isPennyDropRunning ? (
            <>
              <RefreshCw className="mr-2 size-3.5 animate-spin" />
              Verifying Account...
            </>
          ) : data.isBankVerified ? (
            <>
              <CheckCircle2 className="mr-2 size-3.5 text-emerald-600 dark:text-emerald-400" />
              Re-Verify Account
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 size-3.5" />
              Verify Bank Account
            </>
          )}
        </Button>
      </div>

      {/* Verification Result Card (Honest Demo Simulation) */}
      {data.isBankVerified && data.bankVerificationDetails && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Simulated Bank Verification Cleared</span>
            </div>
            <span className="text-[10px] uppercase tracking-wide bg-background/80 px-2 py-0.5 rounded border border-border text-muted-foreground font-semibold">
              Demo Simulation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-muted-foreground">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-foreground">
                Bank
              </span>
              <span>
                {data.bankVerificationDetails.bankName || data.bankName}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-foreground">
                Branch
              </span>
              <span>
                {data.bankVerificationDetails.branchName || data.branchName}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-foreground">
                Account
              </span>
              <span className="font-mono">{maskedAccountNumber}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-foreground">
                Simulated Reference
              </span>
              <span className="font-mono text-[11px]">
                {data.bankVerificationDetails.pennyDropReference ||
                  "SIM-PDR-PENDING"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Verification Error */}
      {pennyDropError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">Bank Verification Issue</span>
            <span>{pennyDropError}</span>
          </div>
        </div>
      )}

      {stepErrors["isBankVerified"] && !data.isBankVerified && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {stepErrors["isBankVerified"]}
        </p>
      )}
    </div>
  );
}
