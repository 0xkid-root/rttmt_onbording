"use client";

import React from "react";
import {
  Edit2,
  AlertTriangle,
  Send,
  Building2,
  UserCheck,
  Landmark,
  Scale,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { VerificationBadge } from "../common/VerificationBadge";
import { formatCurrencyINR } from "../../utils/formatters";

export function Step9ReviewSubmit() {
  const {
    formData,
    goToStep,
    validateStep,
    updateStepData,
    stepErrors,
    submit,
    isSubmitting,
  } = useOnboarding();

  const data = formData.step9;

  // Check validation status of each step
  const stepStatuses = [
    { num: 1, label: "Account Credentials", valid: validateStep(1).isValid },
    { num: 2, label: "Business Profile", valid: validateStep(2).isValid },
    { num: 3, label: "Company Identifiers", valid: validateStep(3).isValid },
    { num: 4, label: "Operating Address", valid: validateStep(4).isValid },
    { num: 5, label: "Signatory KYC", valid: validateStep(5).isValid },
    { num: 6, label: "Corporate KYB", valid: validateStep(6).isValid },
    { num: 7, label: "Settlement Account", valid: validateStep(7).isValid },
    { num: 8, label: "Policies & Compliance", valid: validateStep(8).isValid },
  ];

  const hasAnyIncompleteStep = stepStatuses.some((s) => !s.valid);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Review Application & Submit
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Carefully review all merchant information, documents, and declarations before final submission.
        </p>
      </div>

      {/* Incomplete steps warning banner if any */}
      {hasAnyIncompleteStep && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Attention: The following sections require completion before submission:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {stepStatuses
              .filter((s) => !s.valid)
              .map((s) => (
                <Button
                  key={s.num}
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => goToStep(s.num)}
                  className="h-6 text-[11px] border-warning/40 text-warning hover:bg-warning/20"
                >
                  <Edit2 className="mr-1 size-3" />
                  Step {s.num}: {s.label}
                </Button>
              ))}
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Section 1: Account & Credentials */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3">
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
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3">
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
              <a
                href={formData.step2.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {formData.step2.websiteUrl || "—"}
              </a>
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
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Entity Legal Details & Address
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => goToStep(3)}
              className="text-xs text-primary"
            >
              <Edit2 className="mr-1 size-3" /> Edit
            </Button>
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
              <span className="font-mono font-semibold text-foreground">
                {formData.step3.panNumber || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">GSTIN</span>
              <span className="font-mono font-semibold text-foreground">
                {formData.step3.gstin || (formData.step3.hasNoGstDeclaration ? "Exempt" : "—")}
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
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3">
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
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3">
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
              <span className="text-muted-foreground block text-[11px]">IFSC Code</span>
              <span className="font-mono font-semibold text-foreground">
                {formData.step7.ifscCode || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Bank Status</span>
              <VerificationBadge status={formData.step7.isBankVerified} size="sm" />
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground block text-[11px]">Refund Policy URL</span>
              <a
                href={formData.step8.refundPolicyUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {formData.step8.refundPolicyUrl || "—"}
              </a>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground block text-[11px]">Grievance Contact</span>
              <span className="font-medium text-foreground">
                {formData.step8.grievanceEmail || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Final Affirmations & Submission Checkboxes */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Scale className="size-4 text-primary" />
            Statutory Final Declarations
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="declarationAccepted"
                checked={data.declarationAccepted}
                onCheckedChange={(checked) =>
                  updateStepData("step9", { declarationAccepted: checked === true })
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="declarationAccepted"
                className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
              >
                I hereby declare that the particulars given above are true, correct, and complete to the best of my knowledge and belief. I agree to promptly notify RTTMT of any material change in business activity, ownership structure, or banking details.
              </Label>
            </div>
            {stepErrors["declarationAccepted"] && (
              <p className="text-xs font-medium text-destructive pl-7">
                {stepErrors["declarationAccepted"]}
              </p>
            )}

            <div className="flex items-start gap-3">
              <Checkbox
                id="authorizedSignatoryConfirmation"
                checked={data.authorizedSignatoryConfirmation}
                onCheckedChange={(checked) =>
                  updateStepData("step9", {
                    authorizedSignatoryConfirmation: checked === true,
                  })
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="authorizedSignatoryConfirmation"
                className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
              >
                I confirm that I am the duly authorized signatory/director empowered to execute this merchant onboarding application on behalf of{" "}
                <strong className="text-foreground">
                  {formData.step3.legalEntityName || formData.step2.brandName || "the Entity"}
                </strong>
                .
              </Label>
            </div>
            {stepErrors["authorizedSignatoryConfirmation"] && (
              <p className="text-xs font-medium text-destructive pl-7">
                {stepErrors["authorizedSignatoryConfirmation"]}
              </p>
            )}
          </div>
        </div>

        {/* Final Submit Application Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Upon submission, your application will enter automated underwriting and status tracking.
          </p>

          <Button
            type="button"
            size="lg"
            onClick={submit}
            disabled={isSubmitting || !data.declarationAccepted || !data.authorizedSignatoryConfirmation}
            className="w-full sm:w-auto font-semibold px-8"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Submit Application for Review
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
