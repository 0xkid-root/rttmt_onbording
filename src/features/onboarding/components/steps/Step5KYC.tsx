"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { VerificationBadge } from "../common/VerificationBadge";
import { useSignatoryKyc } from "../../hooks/useSignatoryKyc";
import { SignatoryPersonalDetails } from "./step5/SignatoryPersonalDetails";
import { SignatoryPanVerification } from "./step5/SignatoryPanVerification";
import { SignatoryAadhaarVerification } from "./step5/SignatoryAadhaarVerification";
import { SignatoryDocumentUploads } from "./step5/SignatoryDocumentUploads";

export function Step5KYC() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step5;
  const entityType = formData.step3.entityType;

  const {
    getSignatoryRoleLabel,
    identityUploadedCount,
    isIdentityUploadsComplete,
    isAddressUploadsComplete,
    isPanDocUploaded,
    handleFieldChange,
    handlePanChange,
    handleAadhaarChange,
    handlePanFileChange,
    handleIdentityFileChange,
    handleAddressFileChange,
    handleVerifyPan,
    handleVerifyAadhaar,
    isValidPanFormat,
    isNameMatching,
    isPanVerifying,
    panFeedback,
    panVerificationError,
    isAadhaarVerifying,
    aadhaarFeedback,
    aadhaarVerificationError,
  } = useSignatoryKyc({
    data,
    entityType,
    updateStepData,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Authorized Signatory KYC Verification
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Identify and verify the primary representative or {getSignatoryRoleLabel().toLowerCase()} who exercises operational authority.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Signatory Identity & Contact Information Form Card */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <UserCheck className="size-4 text-primary" />
              Signatory Identity & Contact Information
            </h3>
            <VerificationBadge
              status={
                isPanVerifying || isAadhaarVerifying
                  ? "PENDING"
                  : data.isKycVerified
                    ? "VERIFIED"
                    : panVerificationError || aadhaarVerificationError
                      ? "FAILED"
                      : data.isPanVerified || data.isIdVerified
                        ? "PENDING"
                        : "NOT_STARTED"
              }
              label={
                isPanVerifying || isAadhaarVerifying
                  ? "Verifying..."
                  : data.isKycVerified
                    ? "KYC Verified"
                    : data.isPanVerified && !data.isIdVerified
                      ? "PAN Verified • Aadhaar Pending"
                      : !data.isPanVerified && data.isIdVerified
                        ? "Aadhaar Verified • PAN Pending"
                        : panVerificationError || aadhaarVerificationError
                          ? "Verification Incomplete"
                          : "Pending Verification"
              }
              size="sm"
            />
          </div>

          {/* Verification requirement indicator */}
          {(!data.isPanVerified || !data.isIdVerified) && (
            <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>
                Independent verification required for both documents:
              </span>
              <div className="flex items-center gap-3">
                <span className={data.isPanVerified ? "text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1" : "text-foreground font-medium"}>
                  {data.isPanVerified ? "✓ PAN Verified" : "• Personal PAN"}
                </span>
                <span className={data.isIdVerified ? "text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1" : "text-foreground font-medium"}>
                  {data.isIdVerified ? "✓ Aadhaar Verified" : "• Aadhaar Card"}
                </span>
              </div>
            </div>
          )}

          {/* Legal Name & Designation */}
          <SignatoryPersonalDetails
            signatoryName={data.signatoryName}
            designation={data.designation}
            signatoryEmail={data.signatoryEmail}
            signatoryPhone={data.signatoryPhone}
            roleLabel={getSignatoryRoleLabel()}
            retrievedDirectors={formData.step3.retrievedDirectors}
            onFieldChange={handleFieldChange}
            stepErrors={stepErrors}
          />

          {/* Personal PAN verification section */}
          <SignatoryPanVerification
            personalPan={data.personalPan}
            isPanVerified={Boolean(data.isPanVerified)}
            panVerifiedName={data.panVerifiedName}
            signatoryName={data.signatoryName}
            isPanVerifying={isPanVerifying}
            panFeedback={panFeedback}
            panVerificationError={panVerificationError}
            isNameMatching={isNameMatching}
            onPanChange={handlePanChange}
            onVerifyPan={handleVerifyPan}
            isValidPanFormat={isValidPanFormat}
            stepErrors={stepErrors}
          />

          {/* Aadhaar verification section */}
          <SignatoryAadhaarVerification
            idDocumentNumber={data.idDocumentNumber}
            isIdVerified={Boolean(data.isIdVerified)}
            isAadhaarVerifying={isAadhaarVerifying}
            aadhaarFeedback={aadhaarFeedback}
            aadhaarVerificationError={aadhaarVerificationError}
            isKycVerified={Boolean(data.isKycVerified)}
            onAadhaarChange={handleAadhaarChange}
            onVerifyAadhaar={handleVerifyAadhaar}
            stepErrors={stepErrors}
          />
        </div>

        {/* Dynamic KYC Document Uploads Section */}
        <SignatoryDocumentUploads
          data={data}
          isPanDocUploaded={isPanDocUploaded}
          isIdentityUploadsComplete={isIdentityUploadsComplete}
          identityUploadedCount={identityUploadedCount}
          isAddressUploadsComplete={isAddressUploadsComplete}
          onPanFileChange={handlePanFileChange}
          onIdentityFileChange={handleIdentityFileChange}
          onAddressFileChange={handleAddressFileChange}
          stepErrors={stepErrors}
        />
      </div>
    </div>
  );
}
