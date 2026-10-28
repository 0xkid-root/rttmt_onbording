"use client";

import React, { useState } from "react";
import {
  Edit2,
  Building2,
  UserCheck,
  Landmark,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "../../common/VerificationBadge";
import {
  formatCurrencyINR,
  maskPan,
  maskBankAccount,
  formatGstinDisplay,
} from "../../../utils/formatters";
import { OnboardingFormData } from "../../../types";

interface ReviewSummaryCardsProps {
  formData: OnboardingFormData;
  goToStep: (stepNumber: number) => void;
}

export function ReviewSummaryCards({
  formData,
  goToStep,
}: ReviewSummaryCardsProps) {
  const [showPan, setShowPan] = useState(false);

  return (
    <>
      {/* Section 1: Account & Credentials */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Account & Security Credentials
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => goToStep(1)}
            className="text-xs text-primary"
          >
            <Edit2 className="mr-1 size-3" /> Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Work Email</span>
            <span className="font-medium text-foreground">{formData.step1.email || "—"}</span>
            <div className="pt-1">
              <VerificationBadge status={formData.step1.isEmailVerified} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Mobile Number</span>
            <span className="font-medium text-foreground">
              {formData.step1.phone ? `+91 ${formData.step1.phone}` : "—"}
            </span>
            <div className="pt-1">
              <VerificationBadge status={formData.step1.isPhoneVerified} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Agreement Consent</span>
            <span className="font-medium text-foreground">
              {formData.step1.agreeToTerms ? "Accepted" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Business Profile */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              2
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Commercial Profile & Forecasts
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => goToStep(2)}
            className="text-xs text-primary"
          >
            <Edit2 className="mr-1 size-3" /> Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Brand Name</span>
            <span className="font-medium text-foreground">{formData.step2.brandName || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Category / Industry</span>
            <span className="font-medium text-foreground">
              {formData.step2.businessCategory || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Website URL</span>
            {formData.step2.websiteUrl ? (
              <a
                href={formData.step2.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {formData.step2.websiteUrl}
              </a>
            ) : (
              <span className="font-medium text-foreground">—</span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Expected Monthly Volume</span>
            <span className="font-medium text-foreground">
              {formData.step2.expectedMonthlyVolume || "—"}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground block text-[11px]">Subcategory / MCC</span>
            <span className="font-medium text-foreground">{formData.step2.subCategory || "—"}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground block text-[11px]">Average Order Value (ATV)</span>
            <span className="font-medium text-foreground">
              {formData.step2.averageTransactionValue
                ? formatCurrencyINR(formData.step2.averageTransactionValue)
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Section 3 & 4: Company Details & Address */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Entity Legal Details & Address
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(3)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> Entity
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(4)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> Address
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Legal Entity Name</span>
            <span className="font-medium text-foreground">
              {formData.step3.legalEntityName || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Constitution</span>
            <span className="font-medium text-foreground">{formData.step3.entityType}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Entity PAN</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-foreground">
                {maskPan(formData.step3.panNumber, showPan)}
              </span>
              {formData.step3.panNumber && (
                <button
                  type="button"
                  onClick={() => setShowPan((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                  title={showPan ? "Mask PAN" : "Reveal PAN"}
                  aria-label={showPan ? "Mask PAN" : "Reveal PAN"}
                >
                  {showPan ? (
                    <EyeOff className="size-3 text-muted-foreground" />
                  ) : (
                    <Eye className="size-3 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">GSTIN</span>
            <span className="font-mono font-semibold text-foreground">
              {formatGstinDisplay(
                formData.step3.gstin,
                formData.step3.hasNoGstDeclaration,
                formData.step6.isGstExempt
              )}
            </span>
          </div>
          <div className="sm:col-span-4">
            <span className="text-muted-foreground block text-[11px]">Registered Address</span>
            <span className="font-medium text-foreground">
              {formData.step4.registeredAddress.line1},{" "}
              {formData.step4.registeredAddress.line2 && `${formData.step4.registeredAddress.line2}, `}
              {formData.step4.registeredAddress.city},{" "}
              {formData.step4.registeredAddress.state} - {formData.step4.registeredAddress.postalCode}
            </span>
          </div>
        </div>
      </div>

      {/* Section 5 & 6: KYC & KYB Status */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Signatory KYC & Corporate Charters
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(5)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> KYC
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(6)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> KYB
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Signatory Name</span>
            <span className="font-medium text-foreground">
              {formData.step5.signatoryName || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Role / Designation</span>
            <span className="font-medium text-foreground">{formData.step5.designation || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Signatory KYC Status</span>
            <VerificationBadge status={formData.step5.isKycVerified} size="sm" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Corporate KYB Status</span>
            <VerificationBadge status={formData.step6.isKybVerified} size="sm" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Registration Document</span>
            <span className="font-medium text-foreground truncate block">
              {formData.step6.businessRegistrationDoc?.name || "Missing"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Beneficial Owners</span>
            <span className="font-medium text-foreground">
              {formData.step6.hasNoUboDeclaration
                ? "Widely Held (Exempt)"
                : `${formData.step6.beneficialOwners.length} declared`}
            </span>
          </div>
        </div>
      </div>

      {/* Section 7 & 8: Bank Account & Compliance */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Settlement Account & Policy URLs
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(7)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> Bank
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(8)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> Policies
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Bank Name</span>
            <span className="font-medium text-foreground">{formData.step7.bankName || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Account Type</span>
            <span className="font-medium text-foreground">{formData.step7.accountType}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Account Number</span>
            <span className="font-mono font-semibold text-foreground">
              {maskBankAccount(formData.step7.accountNumber) || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">IFSC Code</span>
            <span className="font-mono font-semibold text-foreground">
              {formData.step7.ifscCode || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Bank Status</span>
            <VerificationBadge status={formData.step7.isBankVerified} size="sm" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">PEP Declaration</span>
            <span className="font-medium text-foreground">
              {formData.step8.pepStatus === "NO"
                ? "No PEP Disclosed"
                : formData.step8.pepStatus === "YES"
                ? "PEP Declared"
                : formData.step8.pepStatus === "UNKNOWN"
                ? "Pending Determination"
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Tax Residency</span>
            <span className="font-medium text-foreground">
              {formData.step8.taxResidency === "INDIA_ONLY"
                ? "India Resident"
                : formData.step8.taxResidency === "OTHER"
                ? `Foreign (${formData.step8.taxResidencyCountry || "Declared"})`
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Grievance Contact</span>
            <span className="font-medium text-foreground">
              {formData.step8.grievanceEmail || "—"}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground block text-[11px]">Refund Policy URL</span>
            {formData.step8.refundPolicyUrl ? (
              <a
                href={formData.step8.refundPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {formData.step8.refundPolicyUrl}
              </a>
            ) : (
              <span className="font-medium text-foreground">—</span>
            )}
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground block text-[11px]">Terms of Service URL</span>
            {formData.step8.termsOfServiceUrl ? (
              <a
                href={formData.step8.termsOfServiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {formData.step8.termsOfServiceUrl}
              </a>
            ) : (
              <span className="font-medium text-foreground">—</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
