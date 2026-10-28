"use client";

import React from "react";
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TaxResidencyStatus, Step8ComplianceData } from "../../../types";

interface TaxResidencySectionProps {
  taxResidency?: TaxResidencyStatus;
  taxResidencyCountry?: string;
  foreignTaxIdNumber?: string;
  updateStepData: (stepKey: "step8", data: Partial<Step8ComplianceData>) => void;
  stepErrors: Record<string, string>;
}

export function TaxResidencySection({
  taxResidency,
  taxResidencyCountry,
  foreignTaxIdNumber,
  updateStepData,
  stepErrors,
}: TaxResidencySectionProps) {
  return (
    <div
      className={`rounded-lg border p-3.5 transition-colors space-y-3 ${
        taxResidency ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Globe className="size-3.5 text-primary shrink-0" />
            Entity Tax Residency <span className="text-destructive">*</span>
          </Label>
          <span className="text-[10px] text-muted-foreground">Income Tax Act</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Declare the entity&apos;s tax residence jurisdiction for statutory
          withholding and tax reporting.
        </p>
      </div>

      <RadioGroup
        value={taxResidency}
        onValueChange={(val) =>
          updateStepData("step8", { taxResidency: val as TaxResidencyStatus })
        }
        className="grid gap-2 sm:grid-cols-2 pt-1"
        aria-invalid={Boolean(stepErrors["taxResidency"])}
        aria-describedby={stepErrors["taxResidency"] ? "taxResidency-error" : undefined}
      >
        <Label
          htmlFor="tax-india"
          className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
            taxResidency === "INDIA_ONLY"
              ? "border-primary bg-background shadow-xs font-medium"
              : "border-border/70 hover:bg-background/60"
          }`}
        >
          <RadioGroupItem value="INDIA_ONLY" id="tax-india" className="mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-foreground">India Only</span>
            <span className="text-[11px] text-muted-foreground block">
              Tax resident exclusively of India.
            </span>
          </div>
        </Label>

        <Label
          htmlFor="tax-other"
          className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
            taxResidency === "OTHER"
              ? "border-primary bg-background shadow-xs font-medium"
              : "border-border/70 hover:bg-background/60"
          }`}
        >
          <RadioGroupItem value="OTHER" id="tax-other" className="mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-foreground">Foreign / Multiple</span>
            <span className="text-[11px] text-muted-foreground block">
              Tax resident outside or in addition to India.
            </span>
          </div>
        </Label>
      </RadioGroup>

      {stepErrors["taxResidency"] && (
        <p id="taxResidency-error" role="alert" className="text-xs font-medium text-destructive">
          {stepErrors["taxResidency"]}
        </p>
      )}

      {/* Conditional Foreign Tax Fields */}
      {taxResidency === "OTHER" && (
        <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <Label htmlFor="taxResidencyCountry" className="text-xs font-medium text-foreground">
              Primary Foreign Country / Jurisdiction <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxResidencyCountry"
              value={taxResidencyCountry || ""}
              onChange={(e) => updateStepData("step8", { taxResidencyCountry: e.target.value })}
              placeholder="e.g. United States, Singapore, UK"
              className="text-xs"
              aria-invalid={Boolean(stepErrors["taxResidencyCountry"])}
              aria-describedby={
                stepErrors["taxResidencyCountry"] ? "taxResidencyCountry-error" : undefined
              }
            />
            {stepErrors["taxResidencyCountry"] && (
              <p
                id="taxResidencyCountry-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {stepErrors["taxResidencyCountry"]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="foreignTaxIdNumber" className="text-xs font-medium text-foreground">
              Foreign Tax ID / TIN <span className="text-destructive">*</span>
            </Label>
            <Input
              id="foreignTaxIdNumber"
              value={foreignTaxIdNumber || ""}
              onChange={(e) => updateStepData("step8", { foreignTaxIdNumber: e.target.value })}
              placeholder="e.g. US SSN/EIN, UTR, or local TIN"
              className="text-xs"
              aria-invalid={Boolean(stepErrors["foreignTaxIdNumber"])}
              aria-describedby={
                stepErrors["foreignTaxIdNumber"] ? "foreignTaxIdNumber-error" : undefined
              }
            />
            {stepErrors["foreignTaxIdNumber"] && (
              <p
                id="foreignTaxIdNumber-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {stepErrors["foreignTaxIdNumber"]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
