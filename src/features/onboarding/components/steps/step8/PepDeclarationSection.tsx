"use client";

import React from "react";
import { CheckSquare, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PepStatus, Step8ComplianceData } from "../../../types";

interface PepDeclarationSectionProps {
  pepStatus?: PepStatus;
  pepDetails?: string;
  updateStepData: (stepKey: "step8", data: Partial<Step8ComplianceData>) => void;
  stepErrors: Record<string, string>;
}

export function PepDeclarationSection({
  pepStatus,
  pepDetails,
  updateStepData,
  stepErrors,
}: PepDeclarationSectionProps) {
  return (
    <div
      className={`rounded-lg border p-3.5 transition-colors space-y-3 ${
        pepStatus ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <CheckSquare className="size-3.5 text-primary shrink-0" />
            Politically Exposed Persons (PEP) Compliance{" "}
            <span className="text-destructive">*</span>
          </Label>
          <span className="text-[10px] text-muted-foreground">FATF / PMLA standard</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Are any directors, partners, key managerial personnel, or beneficial owners
          Politically Exposed Persons (PEP) or immediate family members of a PEP?
        </p>
      </div>

      {/* Structured Options (YES / NO / UNKNOWN) */}
      <RadioGroup
        value={pepStatus}
        onValueChange={(val) =>
          updateStepData("step8", { pepStatus: val as PepStatus })
        }
        className="grid gap-2 sm:grid-cols-3 pt-1"
        aria-invalid={Boolean(stepErrors["pepStatus"])}
        aria-describedby={stepErrors["pepStatus"] ? "pepStatus-error" : undefined}
      >
        <Label
          htmlFor="pep-no"
          className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
            pepStatus === "NO"
              ? "border-primary bg-background shadow-xs font-medium"
              : "border-border/70 hover:bg-background/60"
          }`}
        >
          <RadioGroupItem value="NO" id="pep-no" className="mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-foreground">No PEP</span>
            <span className="text-[11px] text-muted-foreground block">
              No individuals associated are PEPs.
            </span>
          </div>
        </Label>

        <Label
          htmlFor="pep-yes"
          className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
            pepStatus === "YES"
              ? "border-primary bg-background shadow-xs font-medium"
              : "border-border/70 hover:bg-background/60"
          }`}
        >
          <RadioGroupItem value="YES" id="pep-yes" className="mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-foreground">Yes — Disclose</span>
            <span className="text-[11px] text-muted-foreground block">
              PEP association is disclosed below.
            </span>
          </div>
        </Label>

        <Label
          htmlFor="pep-unknown"
          className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
            pepStatus === "UNKNOWN"
              ? "border-primary bg-background shadow-xs font-medium"
              : "border-border/70 hover:bg-background/60"
          }`}
        >
          <RadioGroupItem value="UNKNOWN" id="pep-unknown" className="mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-foreground">Pending Inquiry</span>
            <span className="text-[11px] text-muted-foreground block">
              Status is actively under verification.
            </span>
          </div>
        </Label>
      </RadioGroup>

      {stepErrors["pepStatus"] && (
        <p id="pepStatus-error" role="alert" className="text-xs font-medium text-destructive">
          {stepErrors["pepStatus"]}
        </p>
      )}

      {/* Conditional Disclosure Field for YES */}
      {pepStatus === "YES" && (
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <Label htmlFor="pepDetails" className="text-xs font-medium text-foreground">
            PEP Disclosure Particulars <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="pepDetails"
            rows={2}
            value={pepDetails || ""}
            onChange={(e) => updateStepData("step8", { pepDetails: e.target.value })}
            placeholder="Enter full name of individual, public/political office held, jurisdiction, and relationship to the merchant entity..."
            className="text-xs"
            aria-invalid={Boolean(stepErrors["pepDetails"])}
            aria-describedby={stepErrors["pepDetails"] ? "pepDetails-error" : undefined}
          />
          {stepErrors["pepDetails"] && (
            <p id="pepDetails-error" role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["pepDetails"]}
            </p>
          )}
        </div>
      )}

      {/* Conditional Disclosure & Notice for UNKNOWN */}
      {pepStatus === "UNKNOWN" && (
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Compliance Notice: Applications with undetermined PEP status require
              secondary enhanced compliance review by the onboarding team prior to
              final approval.
            </span>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pepDetails" className="text-xs font-medium text-foreground">
              Pending Determination Particulars <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pepDetails"
              value={pepDetails || ""}
              onChange={(e) => updateStepData("step8", { pepDetails: e.target.value })}
              placeholder="Explain why PEP determination is pending or under active inquiry..."
              className="text-xs"
              aria-invalid={Boolean(stepErrors["pepDetails"])}
              aria-describedby={stepErrors["pepDetails"] ? "pepDetails-error" : undefined}
            />
            {stepErrors["pepDetails"] && (
              <p id="pepDetails-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["pepDetails"]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
