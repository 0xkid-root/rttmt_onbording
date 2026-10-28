"use client";

import React from "react";
import { CheckSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface TransactionMonitoringConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function TransactionMonitoringConsent({
  checked,
  onCheckedChange,
  error,
}: TransactionMonitoringConsentProps) {
  return (
    <div
      className={`rounded-lg border p-3.5 transition-colors space-y-1.5 ${
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-muted/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id="transactionMonitoringConsent"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          className="mt-0.5"
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? "transactionMonitoringConsent-error" : undefined
          }
        />
        <div className="space-y-1">
          <Label
            htmlFor="transactionMonitoringConsent"
            className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
          >
            <CheckSquare className="size-3.5 text-primary shrink-0" />
            Consent for Real-Time Transaction Monitoring & Threat Intelligence{" "}
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Consent to automated transaction monitoring, suspicious velocity scanning,
            and commercial registry checks for risk evaluation. (Authorizes automated
            platform monitoring; does not perform external credit rating queries).
          </p>
        </div>
      </div>
      {error && (
        <p
          id="transactionMonitoringConsent-error"
          role="alert"
          className="text-xs font-medium text-destructive pl-7"
        >
          {error}
        </p>
      )}
    </div>
  );
}
