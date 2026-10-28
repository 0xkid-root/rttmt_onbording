"use client";

import React from "react";
import {
  CreditCard,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "../../common/VerificationBadge";

interface SignatoryPanVerificationProps {
  personalPan: string;
  isPanVerified: boolean;
  panVerifiedName?: string;
  signatoryName: string;
  isPanVerifying: boolean;
  panFeedback: string | null;
  panVerificationError: string | null;
  isNameMatching: boolean | null;
  onPanChange: (raw: string) => void;
  onVerifyPan: () => void;
  isValidPanFormat: (pan: string) => boolean;
  stepErrors: Record<string, string>;
}

export function SignatoryPanVerification({
  personalPan,
  isPanVerified,
  panVerifiedName,
  signatoryName,
  isPanVerifying,
  panFeedback,
  panVerificationError,
  isNameMatching,
  onPanChange,
  onVerifyPan,
  isValidPanFormat,
  stepErrors,
}: SignatoryPanVerificationProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="personalPan">
          Personal PAN <span className="text-destructive">*</span>
        </Label>
        {isPanVerified && (
          <VerificationBadge status="VERIFIED" label="Verified" size="sm" />
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <CreditCard className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="personalPan"
            maxLength={10}
            value={personalPan}
            onChange={(e) => onPanChange(e.target.value)}
            placeholder="BKNPR4821E"
            className="pl-9 font-mono text-sm uppercase tracking-wider"
            aria-invalid={Boolean(stepErrors["personalPan"] || panVerificationError)}
            aria-describedby={
              stepErrors["personalPan"]
                ? "personalPan-error"
                : panVerificationError
                ? "pan-verification-error"
                : undefined
            }
          />
        </div>

        <Button
          type="button"
          variant={isPanVerified ? "outline" : "default"}
          onClick={onVerifyPan}
          disabled={isPanVerifying || !isValidPanFormat(personalPan)}
          className="shrink-0 h-10 px-4"
          aria-busy={isPanVerifying}
        >
          {isPanVerifying ? (
            <>
              <RefreshCw className="mr-2 size-3.5 animate-spin" />
              Verifying PAN
            </>
          ) : isPanVerified ? (
            <>
              <ShieldCheck className="mr-2 size-3.5 text-emerald-600 dark:text-emerald-400" />
              Re-Verify PAN
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 size-3.5" />
              Verify PAN
            </>
          )}
        </Button>
      </div>

      {/* Accessible Messages & Feedback */}
      {stepErrors["personalPan"] && (
        <p
          id="personalPan-error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {stepErrors["personalPan"]}
        </p>
      )}

      {panVerificationError && (
        <div
          id="pan-verification-error"
          className="flex items-center gap-1.5 text-xs text-destructive font-medium pt-0.5"
          role="alert"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{panVerificationError}</span>
        </div>
      )}

      {/* PAN Verification Success State & Name Comparison Review Panel */}
      {isPanVerified && panVerifiedName && (
        <div className="mt-2.5 rounded-lg border border-border bg-muted/40 p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>
                {panFeedback || "Simulated PAN verification successful."}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium bg-muted px-1.5 py-0.5 rounded border border-border">
              Simulated / Demo Provider
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border/60">
            <div className="rounded-md bg-background/90 p-2.5 border border-border/60 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">
                Verified PAN Holder Name (Provider Record)
              </span>
              <span className="font-mono font-semibold text-foreground text-xs block">
                {panVerifiedName}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Status: Active & Registered (Simulated Demo Check)
              </span>
            </div>

            <div className="rounded-md bg-background/90 p-2.5 border border-border/60 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">
                Signatory Full Legal Name
              </span>
              <span className="font-semibold text-foreground text-xs block truncate">
                {signatoryName || "— (Please enter full legal name above)"}
              </span>
              <div className="pt-0.5">
                {isNameMatching === true && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3" />
                    Names match correctly
                  </span>
                )}
                {isNameMatching === false && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                    <AlertCircle className="size-3" />
                    Name discrepancy — review signatory name against PAN card
                  </span>
                )}
                {isNameMatching === null && (
                  <span className="text-[11px] text-muted-foreground">
                    Enter signatory legal name above to verify match
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
