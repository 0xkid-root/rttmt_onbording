"use client";

import React, { useState, useRef, useMemo } from "react";
import { UserCheck } from "lucide-react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { VerificationBadge } from "../common/VerificationBadge";
import {
  formatPan,
  formatAadhaarInput,
} from "../../utils/formatters";
import {
  simulatePanVerification,
  simulateIdVerification,
} from "../../services/verificationService";
import {
  Step5KYCData,
  UploadedDocument,
} from "../../types";
import { SignatoryPersonalDetails } from "./step5/SignatoryPersonalDetails";
import { SignatoryPanVerification } from "./step5/SignatoryPanVerification";
import { SignatoryAadhaarVerification } from "./step5/SignatoryAadhaarVerification";
import {
  SignatoryDocumentUploads,
  AADHAAR_SLOTS,
} from "./step5/SignatoryDocumentUploads";

export function Step5KYC() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step5;
  const entityType = formData.step3.entityType;

  // Independent verification states for PAN
  const [isPanVerifying, setIsPanVerifying] = useState(false);
  const [panFeedback, setPanFeedback] = useState<string | null>(null);
  const [panVerificationError, setPanVerificationError] = useState<string | null>(null);
  const panRequestIdRef = useRef(0);

  // Independent verification states for Aadhaar
  const [isAadhaarVerifying, setIsAadhaarVerifying] = useState(false);
  const [aadhaarFeedback, setAadhaarFeedback] = useState<string | null>(null);
  const [aadhaarVerificationError, setAadhaarVerificationError] = useState<string | null>(null);
  const aadhaarRequestIdRef = useRef(0);

  const getSignatoryRoleLabel = () => {
    if (entityType === "SOLE_PROPRIETORSHIP") return "Sole Proprietor";
    if (entityType === "LLP") return "Designated Partner";
    if (["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(entityType))
      return "Director / Authorized Signatory";
    if (entityType === "PARTNERSHIP") return "Managing Partner";
    return "Authorized Trustee / Signatory";
  };

  // Counts of completed slots for status indicators (with fallback for legacy drafts)
  const identityUploadedCount = AADHAAR_SLOTS.filter(
    (s) =>
      Boolean(
        data.identityProofFiles?.[s.id]?.id ||
          (s.id === "front" && data.identityProofDocument?.id)
      )
  ).length;
  const isIdentityUploadsComplete = identityUploadedCount === AADHAAR_SLOTS.length;

  const isAddressUploadsComplete = Boolean(
    data.addressProofFiles?.front?.id || data.addressProofDocument?.id
  );

  // General field change handler for non-identity fields
  const handleFieldChange = (updates: Partial<Step5KYCData>) => {
    updateStepData("step5", updates);
  };

  // PAN change handler: invalidates previous PAN verification and overall KYC, preserves Aadhaar verification
  const handlePanChange = (rawValue: string) => {
    const formatted = formatPan(rawValue);
    panRequestIdRef.current += 1;
    setIsPanVerifying(false);
    setPanFeedback(null);
    setPanVerificationError(null);

    updateStepData("step5", {
      personalPan: formatted,
      isPanVerified: false,
      panVerifiedName: undefined,
      panVerificationStatus: "NOT_STARTED",
      isKycVerified: false,
    });
  };

  // Aadhaar document number change: invalidates previous Aadhaar verification and overall KYC, preserves PAN verification
  const handleAadhaarChange = (rawValue: string) => {
    const formatted = formatAadhaarInput(rawValue);
    aadhaarRequestIdRef.current += 1;
    setIsAadhaarVerifying(false);
    setAadhaarFeedback(null);
    setAadhaarVerificationError(null);

    updateStepData("step5", {
      idDocumentType: "AADHAAR",
      idDocumentNumber: formatted,
      isIdVerified: false,
      idVerificationStatus: "NOT_STARTED",
      isKycVerified: false,
    });
  };

  // Identity proof file upload handler for specific side (front or back of Aadhaar)
  const handleIdentityFileChange = (
    slotId: "front" | "back",
    doc?: UploadedDocument
  ) => {
    const currentFiles = { ...(data.identityProofFiles || {}) };
    if (!currentFiles.front && data.identityProofDocument) {
      currentFiles.front = data.identityProofDocument;
    }

    if (doc) {
      currentFiles[slotId] = doc;
    } else {
      delete currentFiles[slotId];
    }

    const primaryDoc = currentFiles.front || currentFiles.back;

    const isIdUploadsDone = AADHAAR_SLOTS.every((s) =>
      s.id === slotId ? Boolean(doc?.id) : Boolean(currentFiles[s.id]?.id)
    );
    const isAddrUploadsDone = Boolean(
      data.addressProofFiles?.front?.id || data.addressProofDocument?.id
    );
    const bothVerified = Boolean(data.isPanVerified && data.isIdVerified);

    updateStepData("step5", {
      identityProofFiles: currentFiles,
      identityProofDocument: primaryDoc,
      isKycVerified: bothVerified && isIdUploadsDone && isAddrUploadsDone,
    });
  };

  // Address proof file upload handler (Utility Bill / Electricity Bill)
  const handleAddressFileChange = (doc?: UploadedDocument) => {
    const currentFiles = { ...(data.addressProofFiles || {}) };
    if (doc) {
      currentFiles.front = doc;
    } else {
      delete currentFiles.front;
    }

    const isIdUploadsDone = AADHAAR_SLOTS.every((s) =>
      Boolean(
        data.identityProofFiles?.[s.id]?.id ||
          (s.id === "front" && data.identityProofDocument?.id)
      )
    );
    const isAddrUploadsDone = Boolean(doc?.id);
    const bothVerified = Boolean(data.isPanVerified && data.isIdVerified);

    updateStepData("step5", {
      addressDocumentType: "UTILITY_BILL",
      addressProofFiles: currentFiles,
      addressProofDocument: doc || undefined,
      isKycVerified: bothVerified && isIdUploadsDone && isAddrUploadsDone,
    });
  };

  const isValidPanFormat = (pan: string) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test((pan || "").trim());

  // Execute independent PAN verification
  const handleVerifyPan = async () => {
    if (isPanVerifying) return; // Prevent duplicate requests
    const panClean = (data.personalPan || "").trim();

    if (!isValidPanFormat(panClean)) {
      setPanVerificationError(
        "Please enter a valid 10-character Personal PAN (e.g. BKNPR4821E) before verifying."
      );
      return;
    }

    const currentRequestId = ++panRequestIdRef.current;
    setIsPanVerifying(true);
    setPanFeedback(null);
    setPanVerificationError(null);

    try {
      const result = await simulatePanVerification(panClean, data.signatoryName);

      // Prevent stale async response
      if (currentRequestId !== panRequestIdRef.current) return;

      if (result && result.verified) {
        const isBothVerified = Boolean(data.isIdVerified);
        const isIdUploadsDone = AADHAAR_SLOTS.every((s) =>
          Boolean(
            data.identityProofFiles?.[s.id]?.id ||
              (s.id === "front" && data.identityProofDocument?.id)
          )
        );
        const isAddrUploadsDone = Boolean(
          data.addressProofFiles?.front?.id || data.addressProofDocument?.id
        );

        updateStepData("step5", {
          isPanVerified: true,
          panVerifiedName: result.registeredName,
          panVerificationStatus: "VERIFIED",
          isKycVerified: isBothVerified && isIdUploadsDone && isAddrUploadsDone,
        });
        setPanFeedback(result.notes || "Simulated PAN record verified (Demo Check).");
        setPanVerificationError(null);
      } else {
        updateStepData("step5", {
          isPanVerified: false,
          panVerifiedName: undefined,
          panVerificationStatus: "FAILED",
          isKycVerified: false,
        });
        setPanVerificationError(
          result.notes || "Simulated PAN verification failed. Please check the PAN number and retry."
        );
        setPanFeedback(null);
      }
    } catch {
      if (currentRequestId !== panRequestIdRef.current) return;
      updateStepData("step5", {
        isPanVerified: false,
        panVerifiedName: undefined,
        panVerificationStatus: "FAILED",
        isKycVerified: false,
      });
      setPanVerificationError("Simulated PAN verification timed out. Please retry.");
      setPanFeedback(null);
    } finally {
      if (currentRequestId === panRequestIdRef.current) {
        setIsPanVerifying(false);
      }
    }
  };

  // Execute independent Aadhaar verification
  const handleVerifyAadhaar = async () => {
    if (isAadhaarVerifying) return; // Prevent duplicate requests
    if (!data.idDocumentNumber) {
      setAadhaarVerificationError("Please enter your 12-digit Aadhaar number before verifying.");
      return;
    }

    const docClean = data.idDocumentNumber.trim().replace(/[\s-]/g, "");
    if (!/^(?:[xX]{8}\d{4}|\d{12})$/.test(docClean)) {
      setAadhaarVerificationError(
        "Please enter a valid 12-digit Aadhaar number or masked format (e.g. XXXX XXXX 9034)."
      );
      return;
    }

    const currentRequestId = ++aadhaarRequestIdRef.current;
    setIsAadhaarVerifying(true);
    setAadhaarFeedback(null);
    setAadhaarVerificationError(null);

    try {
      const result = await simulateIdVerification(
        data.idDocumentNumber,
        "AADHAAR"
      );

      if (currentRequestId !== aadhaarRequestIdRef.current) return;

      if (result && result.verified) {
        const isBothVerified = Boolean(data.isPanVerified);
        const isIdUploadsDone = AADHAAR_SLOTS.every((s) =>
          Boolean(
            data.identityProofFiles?.[s.id]?.id ||
              (s.id === "front" && data.identityProofDocument?.id)
          )
        );
        const isAddrUploadsDone = Boolean(
          data.addressProofFiles?.front?.id || data.addressProofDocument?.id
        );

        updateStepData("step5", {
          idDocumentType: "AADHAAR",
          isIdVerified: true,
          idVerificationStatus: "VERIFIED",
          isKycVerified: isBothVerified && isIdUploadsDone && isAddrUploadsDone,
        });
        setAadhaarFeedback(result.notes || "Simulated Aadhaar verification passed.");
        setAadhaarVerificationError(null);
      } else {
        updateStepData("step5", {
          isIdVerified: false,
          idVerificationStatus: "FAILED",
          isKycVerified: false,
        });
        setAadhaarVerificationError(
          "Simulated Aadhaar verification failed. Please check entered details and retry."
        );
        setAadhaarFeedback(null);
      }
    } catch {
      if (currentRequestId !== aadhaarRequestIdRef.current) return;
      updateStepData("step5", {
        isIdVerified: false,
        idVerificationStatus: "FAILED",
        isKycVerified: false,
      });
      setAadhaarVerificationError("Simulated Aadhaar verification timed out. Please retry.");
      setAadhaarFeedback(null);
    } finally {
      if (currentRequestId === aadhaarRequestIdRef.current) {
        setIsAadhaarVerifying(false);
      }
    }
  };

  // Compare signatory full legal name against provider-returned PAN name
  const isNameMatching = useMemo(() => {
    if (!data.panVerifiedName || !data.signatoryName) return null;
    const cleanSignatory = data.signatoryName.trim().toUpperCase().replace(/\s+/g, " ");
    const cleanPanName = data.panVerifiedName.trim().toUpperCase().replace(/\s+/g, " ");
    return cleanSignatory === cleanPanName;
  }, [data.panVerifiedName, data.signatoryName]);

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
          isIdentityUploadsComplete={isIdentityUploadsComplete}
          identityUploadedCount={identityUploadedCount}
          isAddressUploadsComplete={isAddressUploadsComplete}
          onIdentityFileChange={handleIdentityFileChange}
          onAddressFileChange={handleAddressFileChange}
          stepErrors={stepErrors}
        />
      </div>
    </div>
  );
}
