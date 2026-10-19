"use client";

import React from "react";
import { Building2, Calendar, CreditCard, FileCheck, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const isProprietorship = data.entityType === "SOLE_PROPRIETORSHIP";

  const getCinPlaceholder = () => {
    if (isCorporate) return "U72900MH2021PTC358912";
    if (isLlp) return "AAJ-8491";
    if (isProprietorship) return "UDYAM-MH-01-0029341";
    return "REG-2024-89124";
  };

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
        {/* Entity Classification */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="entityType" className="text-sm font-semibold">
              Business Constitution / Entity Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.entityType}
              onValueChange={(val) => {
                if (val) {
                  updateStepData("step3", {
                    entityType: val as BusinessEntityType,
                    registrationNumber: "",
                  });
                }
              }}
            >
              <SelectTrigger id="entityType" className="w-full">
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
              <p className="text-xs font-medium text-destructive">{stepErrors["entityType"]}</p>
            )}
          </div>

          {/* Legal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="legalEntityName">
              Legal Entity Name (As per PAN / Registry) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="legalEntityName"
                value={data.legalEntityName}
                onChange={(e) =>
                  updateStepData("step3", { legalEntityName: e.target.value })
                }
                placeholder="e.g. Acme Technologies Private Limited"
                className="pl-9"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Must match character-for-character with your MCA Certificate / Income Tax PAN records.
            </p>
            {stepErrors["legalEntityName"] && (
              <p className="text-xs font-medium text-destructive">
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
                  max={new Date().toISOString().split("T")[0]}
                  value={data.incorporationDate}
                  onChange={(e) =>
                    updateStepData("step3", { incorporationDate: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
              {stepErrors["incorporationDate"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["incorporationDate"]}
                </p>
              )}
            </div>

            {/* Corporate Registration Identifier */}
            <div className="space-y-1.5">
              <Label htmlFor="registrationNumber">
                {currentEntityConfig?.cinLabel || "Registration Identifier"}{" "}
                {(isCorporate || isLlp) && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="registrationNumber"
                value={data.registrationNumber || ""}
                onChange={(e) =>
                  updateStepData("step3", { registrationNumber: e.target.value.toUpperCase() })
                }
                placeholder={getCinPlaceholder()}
                className="font-mono text-sm uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                {isCorporate
                  ? "21-digit Corporate Identity Number issued by Registrar of Companies (ROC)."
                  : isLlp
                  ? "LLP Identification Number from Ministry of Corporate Affairs."
                  : "State trade license, MSME Udyam, or local registration reference."}
              </p>
              {stepErrors["registrationNumber"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["registrationNumber"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tax Identifiers: PAN & GSTIN */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
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
              <div className="relative">
                <Input
                  id="panNumber"
                  maxLength={10}
                  value={data.panNumber}
                  onChange={(e) =>
                    updateStepData("step3", { panNumber: formatPan(e.target.value) })
                  }
                  placeholder="e.g. AAACA7823K"
                  className="font-mono text-sm tracking-wider uppercase"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isProprietorship
                  ? "Personal PAN of the sole proprietor."
                  : "Company / Firm Permanent Account Number."}
              </p>
              {stepErrors["panNumber"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["panNumber"]}</p>
              )}
            </div>

            {/* GSTIN */}
            <div className="space-y-1.5">
              <Label htmlFor="gstin">
                GSTIN (Goods & Services Tax Identifier){" "}
                {!data.hasNoGstDeclaration && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="gstin"
                maxLength={15}
                disabled={data.hasNoGstDeclaration}
                value={data.gstin || ""}
                onChange={(e) =>
                  updateStepData("step3", { gstin: formatGstin(e.target.value) })
                }
                placeholder="27AAACA7823K1Z5"
                className="font-mono text-sm tracking-wider uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                15-digit GSTIN corresponding to entity state and PAN.
              </p>
              {stepErrors["gstin"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["gstin"]}</p>
              )}
            </div>
          </div>

          {/* GST Exemption Checkbox (Available for Proprietors / Low-turnover entities) */}
          <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="hasNoGstDeclaration"
                checked={data.hasNoGstDeclaration}
                onCheckedChange={(checked) =>
                  updateStepData("step3", {
                    hasNoGstDeclaration: checked === true,
                    gstin: checked === true ? "" : data.gstin,
                  })
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="hasNoGstDeclaration"
                className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
              >
                <strong>Exempt from GST Registration:</strong> My annual aggregate business turnover is below the statutory GST registration threshold (₹40 Lakhs for goods / ₹20 Lakhs for services), and I operate in an exempt or threshold-exempt merchant category.
              </Label>
            </div>
          </div>
        </div>

        {/* Dynamic Entity Requirements Notice */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <FileCheck className="size-4" />
            <span>Document Checklist for {currentEntityConfig?.label}:</span>
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2 text-muted-foreground pl-1">
            {currentEntityConfig?.requiredKybDocs.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-primary shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
