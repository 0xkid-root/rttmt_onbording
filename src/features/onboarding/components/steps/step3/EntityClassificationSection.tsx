"use client";

import React, { useState, useCallback } from "react";
import {
  Building2,
  Calendar,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Users,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_TYPE_OPTIONS } from "../../../mocks/options";
import { Step3CompanyDetailsData, BusinessEntityType } from "../../../types";
import { lookupCompanyByCinOrLlpin } from "../../../services/verificationService";

interface EntityClassificationSectionProps {
  data: Step3CompanyDetailsData;
  onUpdate: (updates: Partial<Step3CompanyDetailsData>) => void;
  stepErrors: Record<string, string>;
  maxDate: string;
}

export function EntityClassificationSection({
  data,
  onUpdate,
  stepErrors,
  maxDate,
}: EntityClassificationSectionProps) {
  const [isVerifyingRegistry, setIsVerifyingRegistry] = useState(false);
  const [registryError, setRegistryError] = useState<string | null>(null);

  const currentEntityConfig = ENTITY_TYPE_OPTIONS.find(
    (e) => e.value === data.entityType
  );

  const isCorporate = ["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(data.entityType);
  const isLlp = data.entityType === "LLP";
  const isPartnership = data.entityType === "PARTNERSHIP";
  const isSoleProp = data.entityType === "SOLE_PROPRIETORSHIP";
  const isRegistryEligible = isCorporate || isLlp;

  // Custom label and helper based on entity constitution
  const registrationLabel = isCorporate
    ? "CIN (Corporate Identity Number)"
    : isLlp
    ? "LLPIN (LLP Identification Number)"
    : isPartnership
    ? "RoF Registration / Firm Deed Reference"
    : isSoleProp
    ? "Trade License / Udyam MSME / Shop & Est Number"
    : "Registration Identifier";

  const dateLabel = isSoleProp
    ? "Date of Business Commencement"
    : isPartnership
    ? "Date of Partnership Deed / Registration"
    : "Date of Incorporation / Registration";

  const registrationPlaceholder = isCorporate
    ? "U72900MH2021PTC358912"
    : isLlp
    ? "AAJ-8491"
    : isPartnership
    ? "MH-P-2023-9182 (Optional)"
    : isSoleProp
    ? "UDYAM-MH-01-0029341 (Optional)"
    : "Enter registration identifier";

  const isRequiredRegistration = isCorporate || isLlp;

  // Execute Simulated CIN / LLPIN Registry Verification & Director Retrieval
  const handleVerifyRegistry = useCallback(async () => {
    if (!data.registrationNumber || !data.registrationNumber.trim()) {
      setRegistryError(
        isCorporate
          ? "Please enter a valid 21-character CIN before verifying."
          : "Please enter a valid LLPIN before verifying."
      );
      return;
    }

    setIsVerifyingRegistry(true);
    setRegistryError(null);

    try {
      const result = await lookupCompanyByCinOrLlpin(
        data.registrationNumber,
        data.entityType
      );

      if (result && result.verified) {
        onUpdate({
          isRegistryVerified: true,
          registryVerificationStatus: "VERIFIED",
          companyStatus: result.companyStatus,
          retrievedDirectors: result.directors,
          legalEntityName: data.legalEntityName || result.legalEntityName,
          incorporationDate: data.incorporationDate || result.incorporationDate,
          panNumber: data.panNumber || result.panNumber,
        });
        setRegistryError(null);
      } else {
        setRegistryError(
          `Unable to verify ${isCorporate ? "CIN" : "LLPIN"} with simulated MCA records. You can enter details manually.`
        );
      }
    } catch {
      setRegistryError("Registry verification timed out. Please retry or enter details manually.");
    } finally {
      setIsVerifyingRegistry(false);
    }
  }, [data.registrationNumber, data.entityType, data.legalEntityName, data.incorporationDate, data.panNumber, isCorporate, onUpdate]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
      {/* Business Constitution / Entity Type */}
      <div className="space-y-1.5">
        <Label htmlFor="entityType" className="text-sm font-semibold">
          Business Constitution / Entity Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.entityType}
          onValueChange={(val) => {
            if (val && val !== data.entityType) {
              onUpdate({
                entityType: val as BusinessEntityType,
                registrationNumber: "",
                isRegistryVerified: false,
                registryVerificationStatus: "NOT_STARTED",
                retrievedDirectors: [],
                companyStatus: undefined,
              });
              setRegistryError(null);
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

      {/* Corporate / Entity Registration Identifier with MCA Lookup for Companies & LLPs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="registrationNumber">
            {registrationLabel}{" "}
            {isRequiredRegistration ? (
              <span className="text-destructive">*</span>
            ) : (
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            )}
          </Label>
          {data.isRegistryVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="size-3" />
              MCA Registry Verified
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="registrationNumber"
            value={data.registrationNumber || ""}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              onUpdate({
                registrationNumber: val,
                isRegistryVerified: false,
                registryVerificationStatus: "NOT_STARTED",
              });
              setRegistryError(null);
            }}
            placeholder={registrationPlaceholder}
            className="font-mono text-sm uppercase flex-1"
            aria-invalid={Boolean(stepErrors["registrationNumber"] || registryError)}
            aria-describedby={
              stepErrors["registrationNumber"] ? "registrationNumber-error" : undefined
            }
          />

          {isRegistryEligible && (
            <Button
              type="button"
              variant={data.isRegistryVerified ? "outline" : "default"}
              size="sm"
              onClick={handleVerifyRegistry}
              disabled={isVerifyingRegistry || !data.registrationNumber?.trim()}
              className="h-10 px-4 shrink-0 font-medium"
            >
              {isVerifyingRegistry ? (
                <>
                  <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                  Verifying...
                </>
              ) : data.isRegistryVerified ? (
                <>
                  <ShieldCheck className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Re-Verify
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-1.5 size-3.5" />
                  Verify with MCA
                </>
              )}
            </Button>
          )}
        </div>

        {currentEntityConfig?.helperText && (
          <p className="text-[11px] text-muted-foreground">
            {currentEntityConfig.helperText}
          </p>
        )}

        {registryError && (
          <div
            role="alert"
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 pt-0.5"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{registryError}</span>
          </div>
        )}

        {stepErrors["registrationNumber"] && (
          <p id="registrationNumber-error" role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["registrationNumber"]}
          </p>
        )}
      </div>

      {/* Verified Registry Details & Retrieved Directors Card */}
      {data.isRegistryVerified && data.retrievedDirectors && data.retrievedDirectors.length > 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-emerald-700 dark:text-emerald-300 font-semibold border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Statutory Entity Records Retrieved from MCA Registry (Simulated)</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-background/80 border border-emerald-500/30 text-muted-foreground">
              Status: {data.companyStatus || "ACTIVE"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                Retrieved {isLlp ? "Designated Partners" : "Directors"} ({data.retrievedDirectors.length})
              </span>
              <span className="text-[11px]">
                MCA Verified &bull; No manual DIN entry needed
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 pt-1">
              {data.retrievedDirectors.map((director, idx) => (
                <div
                  key={idx}
                  className="rounded border border-border/80 bg-background/80 p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-xs">{director.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      DIN: {director.din}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{director.designation}</span>
                    {director.appointedDate && (
                      <span>Since {director.appointedDate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground pt-1">
              Note: MCA registry records confirmed. Individual KYC verification is only required for the authorized signatory in Step 5.
            </p>
          </div>
        </div>
      )}

      {/* Legal Entity Name */}
      <div className="space-y-1.5">
        <Label htmlFor="legalEntityName">
          Legal Entity Name (As per PAN / Registry) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="legalEntityName"
            value={data.legalEntityName}
            onChange={(e) => onUpdate({ legalEntityName: e.target.value })}
            placeholder={
              isSoleProp
                ? "e.g. Aditya Enterprises"
                : isPartnership
                ? "e.g. Acme Associates"
                : isLlp
                ? "e.g. Acme Logistics LLP"
                : "e.g. Acme Technologies Private Limited"
            }
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

      {/* Incorporation Date */}
      <div className="space-y-1.5">
        <Label htmlFor="incorporationDate">
          {dateLabel} <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="incorporationDate"
            type="date"
            max={maxDate}
            value={data.incorporationDate}
            onChange={(e) => onUpdate({ incorporationDate: e.target.value })}
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
    </div>
  );
}
