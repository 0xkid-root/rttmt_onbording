"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPan, formatGstin } from "../../../utils/formatters";
import { Step3CompanyDetailsData } from "../../../types";

interface StatutoryTaxIdentifiersSectionProps {
  data: Step3CompanyDetailsData;
  onUpdate: (updates: Partial<Step3CompanyDetailsData>) => void;
  stepErrors: Record<string, string>;
  isGstinRequired: boolean;
}

export function StatutoryTaxIdentifiersSection({
  data,
  onUpdate,
  stepErrors,
  isGstinRequired,
}: StatutoryTaxIdentifiersSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <CreditCard className="size-4 text-primary" />
        Tax Identification Numbers (Income Tax & GST)
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* PAN */}
        <div className="space-y-1.5">
          <Label htmlFor="panNumber">
            Business / Entity PAN <span className="text-destructive">*</span>
          </Label>
          <Input
            id="panNumber"
            maxLength={10}
            value={data.panNumber}
            onChange={(e) => onUpdate({ panNumber: formatPan(e.target.value) })}
            placeholder="e.g. AAACA7823K"
            className="font-mono text-sm tracking-wider uppercase"
            aria-invalid={Boolean(stepErrors["panNumber"])}
            aria-describedby={stepErrors["panNumber"] ? "panNumber-error" : undefined}
          />
          {stepErrors["panNumber"] && (
            <p id="panNumber-error" role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["panNumber"]}
            </p>
          )}
        </div>

        {/* GSTIN */}
        <div className="space-y-1.5">
          <Label htmlFor="gstin">
            GSTIN (Goods & Services Tax Identifier){" "}
            {isGstinRequired ? (
              <span className="text-destructive">*</span>
            ) : (
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            )}
          </Label>
          <Input
            id="gstin"
            maxLength={15}
            value={data.gstin || ""}
            onChange={(e) => onUpdate({ gstin: formatGstin(e.target.value) })}
            disabled={Boolean(data.hasNoGstDeclaration)}
            placeholder={
              data.hasNoGstDeclaration
                ? "Exemption self-declared (GSTIN not applicable)"
                : "27AAACA7823K1Z5"
            }
            className="font-mono text-sm tracking-wider uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            aria-invalid={Boolean(stepErrors["gstin"])}
            aria-describedby={stepErrors["gstin"] ? "gstin-error" : undefined}
          />
          {stepErrors["gstin"] && (
            <p id="gstin-error" role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["gstin"]}
            </p>
          )}

          {/* Conditional GST Exemption Declaration for Non-Corporate Entities */}
          {!isGstinRequired && (
            <div className="flex items-start gap-2 pt-1.5">
              <Checkbox
                id="hasNoGstDeclaration"
                checked={Boolean(data.hasNoGstDeclaration)}
                onCheckedChange={(checked) => {
                  const isChecked = Boolean(checked);
                  onUpdate({
                    hasNoGstDeclaration: isChecked,
                    ...(isChecked ? { gstin: "" } : {}),
                  });
                }}
                className="mt-0.5"
              />
              <div className="grid gap-0.5 leading-none">
                <Label
                  htmlFor="hasNoGstDeclaration"
                  className="text-xs font-normal text-muted-foreground cursor-pointer select-none leading-relaxed"
                >
                  Entity claims statutory GST exemption (e.g. turnover below registration threshold or dealing in exempt supplies)
                </Label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
