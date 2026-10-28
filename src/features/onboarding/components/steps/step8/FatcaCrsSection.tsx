"use client";

import React from "react";
import { CheckSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FatcaCrsClassification, Step8ComplianceData } from "../../../types";

interface FatcaCrsSectionProps {
  fatcaCrsClassification?: FatcaCrsClassification;
  fatcaCrsGiinOrTin?: string;
  fatcaSelfCertificationConfirmed?: boolean;
  updateStepData: (stepKey: "step8", data: Partial<Step8ComplianceData>) => void;
  stepErrors: Record<string, string>;
}

export function FatcaCrsSection({
  fatcaCrsClassification,
  fatcaCrsGiinOrTin,
  fatcaSelfCertificationConfirmed,
  updateStepData,
  stepErrors,
}: FatcaCrsSectionProps) {
  return (
    <div
      className={`rounded-lg border p-3.5 transition-colors space-y-3 ${
        fatcaSelfCertificationConfirmed
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-muted/20"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="fatcaCrsClassification"
            className="text-xs font-medium text-foreground flex items-center gap-1.5"
          >
            <CheckSquare className="size-3.5 text-primary shrink-0" />
            FATCA / CRS Classification & Self-Certification{" "}
            <span className="text-destructive">*</span>
          </Label>
          <span className="text-[10px] text-muted-foreground">
            Inter-Governmental Agreement
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Select the entity&apos;s classification under Foreign Account Tax Compliance
          Act (FATCA) and Common Reporting Standard (CRS).
        </p>
      </div>

      <div className="space-y-2">
        <Select
          value={fatcaCrsClassification}
          onValueChange={(val) =>
            updateStepData("step8", {
              fatcaCrsClassification: val as FatcaCrsClassification,
            })
          }
        >
          <SelectTrigger
            id="fatcaCrsClassification"
            className="w-full text-xs"
            aria-invalid={Boolean(stepErrors["fatcaCrsClassification"])}
            aria-describedby={
              stepErrors["fatcaCrsClassification"]
                ? "fatcaCrsClassification-error"
                : undefined
            }
          >
            <SelectValue placeholder="Select FATCA / CRS Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NON_REPORTABLE" className="text-xs">
              Non-Reportable Entity (Active Non-Financial Entity with no US controlling persons)
            </SelectItem>
            <SelectItem value="REPORTABLE_US" className="text-xs">
              US Specified Person or US Reportable Entity (FATCA)
            </SelectItem>
            <SelectItem value="REPORTABLE_OTHER" className="text-xs">
              Reportable under Common Reporting Standard (CRS) in other jurisdictions
            </SelectItem>
            <SelectItem value="EXEMPT" className="text-xs">
              Exempt Beneficial Owner / Active Financial Institution
            </SelectItem>
          </SelectContent>
        </Select>

        {stepErrors["fatcaCrsClassification"] && (
          <p
            id="fatcaCrsClassification-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {stepErrors["fatcaCrsClassification"]}
          </p>
        )}
      </div>

      {/* Conditional GIIN / Foreign TIN for reportable classification */}
      {(fatcaCrsClassification === "REPORTABLE_US" ||
        fatcaCrsClassification === "REPORTABLE_OTHER") && (
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <Label
            htmlFor="fatcaCrsGiinOrTin"
            className="text-xs font-medium text-foreground"
          >
            GIIN or Reporting TIN <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fatcaCrsGiinOrTin"
            value={fatcaCrsGiinOrTin || ""}
            onChange={(e) =>
              updateStepData("step8", { fatcaCrsGiinOrTin: e.target.value })
            }
            placeholder="Enter GIIN (Global Intermediary Identification Number) or foreign TIN"
            className="text-xs font-mono"
            aria-invalid={Boolean(stepErrors["fatcaCrsGiinOrTin"])}
            aria-describedby={
              stepErrors["fatcaCrsGiinOrTin"] ? "fatcaCrsGiinOrTin-error" : undefined
            }
          />
          {stepErrors["fatcaCrsGiinOrTin"] && (
            <p
              id="fatcaCrsGiinOrTin-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors["fatcaCrsGiinOrTin"]}
            </p>
          )}
        </div>
      )}

      {/* Mandatory Self-Certification Checkbox */}
      <div className="pt-2 border-t border-border/50 space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="fatcaSelfCertificationConfirmed"
            checked={fatcaSelfCertificationConfirmed}
            onCheckedChange={(checked) =>
              updateStepData("step8", {
                fatcaSelfCertificationConfirmed: checked === true,
              })
            }
            className="mt-0.5"
            aria-invalid={Boolean(stepErrors["fatcaSelfCertificationConfirmed"])}
            aria-describedby={
              stepErrors["fatcaSelfCertificationConfirmed"]
                ? "fatcaSelfCertificationConfirmed-error"
                : undefined
            }
          />
          <Label
            htmlFor="fatcaSelfCertificationConfirmed"
            className="text-xs font-medium text-foreground cursor-pointer leading-normal"
          >
            I hereby certify the FATCA / CRS classification and residency particulars
            provided above on behalf of the merchant entity.{" "}
            <span className="text-destructive">*</span>
          </Label>
        </div>
        {stepErrors["fatcaSelfCertificationConfirmed"] && (
          <p
            id="fatcaSelfCertificationConfirmed-error"
            role="alert"
            className="text-xs font-medium text-destructive pl-6"
          >
            {stepErrors["fatcaSelfCertificationConfirmed"]}
          </p>
        )}
      </div>
    </div>
  );
}
