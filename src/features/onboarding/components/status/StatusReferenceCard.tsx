"use client";

import React from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusReferenceCardProps {
  referenceId: string;
  formattedSubmissionDate: string;
  copied: boolean;
  onCopyRef: () => void;
}

export function StatusReferenceCard({
  referenceId,
  formattedSubmissionDate,
  copied,
  onCopyRef,
}: StatusReferenceCardProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 print:border-border print:bg-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Application Reference Identifier
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-primary print:text-lg">
              {referenceId}
            </span>
            <div className="print:hidden">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCopyRef}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                aria-label={
                  copied
                    ? "Application Reference ID copied to clipboard"
                    : "Copy Application Reference ID"
                }
              >
                {copied ? (
                  <Check
                    className="size-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
            {/* Dedicated live region for screen readers */}
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? `Reference ID ${referenceId} copied to clipboard.` : ""}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground sm:text-right">
          <span>Submitted On:</span>
          <p className="font-semibold text-foreground">{formattedSubmissionDate}</p>
        </div>
      </div>

      <div className="rounded-md border border-border/80 bg-background/80 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <span>
            <strong>Sandbox Evaluation Notice:</strong> This merchant application was
            processed in RTTMT’s sandbox test environment. All automated checks, registry
            simulations, and KYC/KYB reviews are for demonstration and evaluation only.
            No real banking, regulatory, or external registry queries have run.
          </span>
          <p className="text-[11px] text-muted-foreground/90">
            Notice: The application reference ID is a tracking reference only and does
            not grant authentication, authorization, or account access.
          </p>
        </div>
      </div>
    </div>
  );
}
