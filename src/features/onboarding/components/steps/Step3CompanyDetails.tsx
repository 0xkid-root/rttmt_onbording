"use client";

import React from "react";
import { Building2, Calendar, CreditCard, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { ENTITY_TYPE_OPTIONS } from "../../mocks/options";
import { BusinessEntityType } from "../../types";
import { formatPan, formatGstin } from "../../utils/formatters";

export function Step3CompanyDetails() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step3;

  const currentEntityConfig = ENTITY_TYPE_OPTIONS.find(
    (e) => e.value === data.entityType
  );

  const isCorporate = ["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(data.entityType);
  const isLlp = data.entityType === "LLP";
  const isGstinRequired = isCorporate || isLlp;

  // Local date in YYYY-MM-DD format to prevent timezone offset bugs with future date limit
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Legal Entity & Statutory Identifiers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the statutory registration records corresponding to your tax filings and corporate registrar.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Entity Classification & Registration */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="entityType" className="text-sm font-semibold">
              Business Constitution / Entity Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.entityType}
              onValueChange={(val) => {
                if (val && val !== data.entityType) {
                  updateStepData("step3", {
                    entityType: val as BusinessEntityType,
                    registrationNumber: "",
                  });
                }
              }}
            >
              <SelectTrigger
                id="entityType"
                className="w-full"
                aria-invalid={Boolean(stepErrors["entityType"])}
                aria-describedby={stepErrors["entityType"] ? "entityType-error" : undefined}
              >
                <SelectValue placeholder="Select business constitution" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-semibold text-foreground">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stepErrors["entityType"] && (
              <p id="entityType-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["entityType"]}
              </p>
            )}
          </div>

          {/* Legal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="legalEntityName">
              Legal Entity Name (As per PAN / Registry) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="legalEntityName"
                value={data.legalEntityName}
                onChange={(e) =>
                  updateStepData("step3", { legalEntityName: e.target.value })
                }
                placeholder="e.g. Acme Technologies Private Limited"
                className="pl-9"
                aria-invalid={Boolean(stepErrors["legalEntityName"])}
                aria-describedby={stepErrors["legalEntityName"] ? "legalEntityName-error" : undefined}
              />
            </div>

            {stepErrors["legalEntityName"] && (
              <p id="legalEntityName-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["legalEntityName"]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Incorporation Date */}
            <div className="space-y-1.5">
              <Label htmlFor="incorporationDate">
                Date of Incorporation / Registration <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="incorporationDate"
                  type="date"
                  max={maxDate}
                  value={data.incorporationDate}
                  onChange={(e) =>
                    updateStepData("step3", { incorporationDate: e.target.value })
                  }
                  className="pl-9"
                  aria-invalid={Boolean(stepErrors["incorporationDate"])}
                  aria-describedby={stepErrors["incorporationDate"] ? "incorporationDate-error" : undefined}
                />
              </div>
              {stepErrors["incorporationDate"] && (
                <p id="incorporationDate-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["incorporationDate"]}
                </p>
              )}
            </div>

            {/* Corporate / Entity Registration Identifier */}
            <div className="space-y-1.5">
              <Label htmlFor="registrationNumber">
                {currentEntityConfig?.cinLabel || "Registration Identifier"}{" "}
                {currentEntityConfig?.isRequiredRegistration ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                )}
              </Label>
              <Input
                id="registrationNumber"
                value={data.registrationNumber || ""}
                onChange={(e) =>
                  updateStepData("step3", { registrationNumber: e.target.value.toUpperCase() })
                }
                placeholder={currentEntityConfig?.placeholder || "Enter registration identifier"}
                className="font-mono text-sm uppercase"
                aria-invalid={Boolean(stepErrors["registrationNumber"])}
                aria-describedby={
                  stepErrors["registrationNumber"] ? "registrationNumber-error" : undefined
                }
              />

              {stepErrors["registrationNumber"] && (
                <p id="registrationNumber-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["registrationNumber"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Tax Identifiers (PAN & GSTIN) */}
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
                onChange={(e) =>
                  updateStepData("step3", { panNumber: formatPan(e.target.value) })
                }
                placeholder="e.g. AAACA7823K"
                className="font-mono text-sm tracking-wider uppercase"
                aria-invalid={Boolean(stepErrors["panNumber"])}
                aria-describedby={
                  stepErrors["panNumber"] ? "panNumber-error" : undefined
                }
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
                onChange={(e) =>
                  updateStepData("step3", { gstin: formatGstin(e.target.value) })
                }
                placeholder="27AAACA7823K1Z5"
                className="font-mono text-sm tracking-wider uppercase"
                aria-invalid={Boolean(stepErrors["gstin"])}
                aria-describedby={
                  stepErrors["gstin"] ? "gstin-error" : undefined
                }
              />
              {stepErrors["gstin"] && (
                <p id="gstin-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["gstin"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Required Documents (Informational Checklist) */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="size-4 text-primary" />
              <span>Required Documents &mdash; {currentEntityConfig?.label || "Entity"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Informational overview &bull; Uploads collected in Step 6 (KYB)
            </span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 text-muted-foreground pt-1">
            {currentEntityConfig?.requiredKybDocs.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground/70 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
