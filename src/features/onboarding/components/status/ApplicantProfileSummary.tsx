"use client";

import React, { useState } from "react";
import {
  Building2,
  RotateCcw,
  Landmark,
  Eye,
  EyeOff,
  UserCheck,
  Globe,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationSubmissionRecord } from "../../types";
import { ENTITY_TYPE_LABELS } from "../../utils/statusHelpers";
import {
  maskPan,
  maskBankAccount,
  formatGstinDisplay,
} from "../../utils/formatters";

interface ApplicantProfileSummaryProps {
  application: ApplicationSubmissionRecord;
  operatingLocation: string | null;
  onEditApplication: () => void;
}

export function ApplicantProfileSummary({
  application,
  operatingLocation,
  onEditApplication,
}: ApplicantProfileSummaryProps) {
  const [isPanRevealed, setIsPanRevealed] = useState<boolean>(false);

  // Masked bank account
  const maskedAccountNumber = maskBankAccount(
    application.formData?.step7?.accountNumber
  );

  // Masked PAN
  const rawPan =
    application.formData?.step3?.panNumber ||
    application.formData?.step5?.personalPan;
  const maskedPan = maskPan(rawPan, isPanRevealed);

  // Accurate GSTIN display logic
  const gstinDisplay = formatGstinDisplay(
    application.formData?.step3?.gstin,
    application.formData?.step3?.hasNoGstDeclaration,
    application.formData?.step6?.isGstExempt
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-7 space-y-4 print:border-border print:bg-transparent">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building2 className="size-4 text-primary" aria-hidden="true" />
          Applicant Profile Summary
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditApplication}
          className="text-xs h-7 print:hidden"
        >
          <RotateCcw className="mr-1 size-3" /> Edit Application
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Brand Name
          </span>
          <span className="font-medium text-foreground">
            {application.merchantName ||
              application.formData?.step2?.brandName ||
              "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Legal Entity
          </span>
          <span className="font-medium text-foreground">
            {application.legalEntityName ||
              application.formData?.step3?.legalEntityName ||
              "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Constitution
          </span>
          <span className="font-medium text-foreground">
            {ENTITY_TYPE_LABELS[application.entityType] ||
              application.entityType?.replace(/_/g, " ") ||
              "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Business Category
          </span>
          <span className="font-medium text-foreground truncate block">
            {application.formData?.step2?.businessCategory
              ? `${application.formData.step2.businessCategory}${
                  application.formData.step2.subCategory
                    ? ` • ${application.formData.step2.subCategory}`
                    : ""
                }`
              : "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Contact Email
          </span>
          <span className="font-medium text-foreground truncate block">
            {application.contactEmail ||
              application.formData?.step1?.email ||
              "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Contact Phone
          </span>
          <span className="font-medium text-foreground">
            {application.contactPhone ||
              application.formData?.step1?.phone ||
              "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
            <Landmark className="size-3" aria-hidden="true" /> Settlement Bank
          </span>
          <div>
            <span className="font-medium text-foreground block">
              {application.formData?.step7?.bankName || "—"}
            </span>
            {maskedAccountNumber && (
              <span className="font-mono text-[11px] text-muted-foreground block">
                {maskedAccountNumber}
              </span>
            )}
            {application.formData?.step7?.accountType && (
              <span className="text-[10px] text-muted-foreground/80 block">
                {application.formData.step7.accountType === "CURRENT"
                  ? "Current Account"
                  : "Savings Account"}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            Business PAN
          </span>
          <div className="flex items-center gap-1.5 font-mono font-medium text-foreground">
            <span>{maskedPan}</span>
            {(application.formData?.step3?.panNumber ||
              application.formData?.step5?.personalPan) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPanRevealed((prev) => !prev)}
                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground print:hidden"
                aria-label={
                  isPanRevealed ? "Hide business PAN" : "Reveal business PAN"
                }
                aria-pressed={isPanRevealed}
              >
                {isPanRevealed ? (
                  <EyeOff className="size-3" />
                ) : (
                  <Eye className="size-3" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium">
            GSTIN
          </span>
          <span className="font-mono font-medium text-foreground">
            {gstinDisplay}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
            <UserCheck className="size-3" aria-hidden="true" /> Authorized Signatory
          </span>
          <span className="font-medium text-foreground truncate block">
            {application.formData?.step5?.signatoryName
              ? `${application.formData.step5.signatoryName}${
                  application.formData.step5.designation
                    ? ` (${application.formData.step5.designation})`
                    : ""
                }`
              : "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
            <Globe className="size-3" aria-hidden="true" /> Website / App URL
          </span>
          <span className="font-medium text-foreground truncate block">
            {application.formData?.step2?.websiteUrl ||
              application.formData?.step2?.mobileAppUrl ||
              "—"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
            <MapPin className="size-3" aria-hidden="true" /> Operating Location
          </span>
          <span className="font-medium text-foreground truncate block">
            {operatingLocation || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
