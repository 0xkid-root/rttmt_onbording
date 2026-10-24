"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  IdCard,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  MapPin,
  FileCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { DocumentUploadBox } from "../common/DocumentUploadBox";
import { VerificationBadge } from "../common/VerificationBadge";
import {
  formatPan,
  formatPhoneNumber,
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

const AADHAAR_SLOTS = [
  {
    id: "front" as const,
    sideBadge: "Front Side",
    label: "Aadhaar Card Front",
  },
  {
    id: "back" as const,
    sideBadge: "Back Side",
    label: "Aadhaar Card Back",
  },
];

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

          {/* Row 1 — Two columns: Full Legal Name & Designation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="signatoryName">
                Full Legal Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="signatoryName"
                value={data.signatoryName}
                onChange={(e) => handleFieldChange({ signatoryName: e.target.value })}
                placeholder="e.g. Aditya Vikram Rao"
                aria-invalid={Boolean(stepErrors["signatoryName"])}
                aria-describedby={stepErrors["signatoryName"] ? "signatoryName-error" : undefined}
              />
              {stepErrors["signatoryName"] && (
                <p id="signatoryName-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["signatoryName"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="designation">
                Designation / Position in Entity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="designation"
                value={data.designation}
                onChange={(e) => handleFieldChange({ designation: e.target.value })}
                placeholder={`e.g. ${getSignatoryRoleLabel()}`}
                aria-invalid={Boolean(stepErrors["designation"])}
                aria-describedby={stepErrors["designation"] ? "designation-error" : undefined}
              />
              {stepErrors["designation"] && (
                <p id="designation-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["designation"]}
                </p>
              )}
            </div>
          </div>

          {/* Row 2 — Personal PAN: Input on left (flex-1), Button on right (shrink-0), horizontal on desktop, stacked on mobile */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="personalPan">
                Personal PAN <span className="text-destructive">*</span>
              </Label>
              {data.isPanVerified && (
                <VerificationBadge status="VERIFIED" label="Verified" size="sm" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <CreditCard className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="personalPan"
                  maxLength={10}
                  value={data.personalPan}
                  onChange={(e) => handlePanChange(e.target.value)}
                  placeholder="BKNPR4821E"
                  className="pl-9 font-mono text-sm uppercase tracking-wider"
                  aria-invalid={Boolean(stepErrors["personalPan"] || panVerificationError)}
                  aria-describedby={
                    stepErrors["personalPan"]
                      ? "personalPan-error"
                      : panVerificationError
                        ? "pan-verification-error"
                        : undefined
                  }
                />
              </div>

              <Button
                type="button"
                variant={data.isPanVerified ? "outline" : "default"}
                onClick={handleVerifyPan}
                disabled={isPanVerifying || !isValidPanFormat(data.personalPan)}
                className="shrink-0 h-10 px-4"
                aria-busy={isPanVerifying}
              >
                {isPanVerifying ? (
                  <>
                    <RefreshCw className="mr-2 size-3.5 animate-spin" />
                    Verifying PAN
                  </>
                ) : data.isPanVerified ? (
                  <>
                    <ShieldCheck className="mr-2 size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Re-Verify PAN
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 size-3.5" />
                    Verify PAN
                  </>
                )}
              </Button>
            </div>

            {/* Row 2 Accessible Messages & Feedback */}
            {stepErrors["personalPan"] && (
              <p id="personalPan-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["personalPan"]}
              </p>
            )}

            {panVerificationError && (
              <div
                id="pan-verification-error"
                className="flex items-center gap-1.5 text-xs text-destructive font-medium pt-0.5"
                role="alert"
              >
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{panVerificationError}</span>
              </div>
            )}

            {/* PAN Verification Success State & Name Comparison Review Panel */}
            {data.isPanVerified && data.panVerifiedName && (
              <div className="mt-2.5 rounded-lg border border-border bg-muted/40 p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>{panFeedback || "Simulated PAN verification successful."}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium bg-muted px-1.5 py-0.5 rounded border border-border">
                    Simulated / Demo Provider
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border/60">
                  <div className="rounded-md bg-background/90 p-2.5 border border-border/60 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">
                      Verified PAN Holder Name (Provider Record)
                    </span>
                    <span className="font-mono font-semibold text-foreground text-xs block">
                      {data.panVerifiedName}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Status: Active & Registered (Simulated Demo Check)
                    </span>
                  </div>

                  <div className="rounded-md bg-background/90 p-2.5 border border-border/60 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">
                      Signatory Full Legal Name
                    </span>
                    <span className="font-semibold text-foreground text-xs block truncate">
                      {data.signatoryName || "— (Please enter full legal name above)"}
                    </span>
                    <div className="pt-0.5">
                      {isNameMatching === true && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="size-3" />
                          Names match correctly
                        </span>
                      )}
                      {isNameMatching === false && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                          <AlertCircle className="size-3" />
                          Name discrepancy — review signatory name against PAN card
                        </span>
                      )}
                      {isNameMatching === null && (
                        <span className="text-[11px] text-muted-foreground">
                          Enter signatory legal name above to verify match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 3 — Aadhaar Number: Input on left (flex-1), Button on right (shrink-0), horizontal on desktop, stacked on mobile */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="aadhaarNumber">
                Aadhaar Number (12 digits / masked) <span className="text-destructive">*</span>
              </Label>
              {data.isIdVerified && (
                <VerificationBadge status="VERIFIED" label="Verified" size="sm" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <IdCard className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="aadhaarNumber"
                  maxLength={14}
                  value={data.idDocumentNumber}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="XXXX XXXX 9034"
                  className="pl-9 font-mono text-sm uppercase"
                  aria-invalid={Boolean(stepErrors["idDocumentNumber"] || aadhaarVerificationError)}
                  aria-describedby={
                    stepErrors["idDocumentNumber"]
                      ? "idDocumentNumber-error"
                      : aadhaarVerificationError
                        ? "aadhaar-verification-error"
                        : undefined
                  }
                />
              </div>

              <Button
                type="button"
                variant={data.isIdVerified ? "outline" : "default"}
                onClick={handleVerifyAadhaar}
                disabled={isAadhaarVerifying || !data.idDocumentNumber.trim()}
                className="shrink-0 h-10 px-4"
                aria-busy={isAadhaarVerifying}
              >
                {isAadhaarVerifying ? (
                  <>
                    <RefreshCw className="mr-2 size-3.5 animate-spin" />
                    Verifying Aadhaar
                  </>
                ) : data.isIdVerified ? (
                  <>
                    <ShieldCheck className="mr-2 size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Re-Verify Aadhaar
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 size-3.5" />
                    Verify Aadhaar
                  </>
                )}
              </Button>
            </div>

            {/* Row 3 Accessible Messages & Feedback */}
            {stepErrors["idDocumentNumber"] && (
              <p id="idDocumentNumber-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["idDocumentNumber"]}
              </p>
            )}

            {aadhaarFeedback && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5" role="status">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>{aadhaarFeedback}</span>
              </div>
            )}

            {aadhaarVerificationError && (
              <div
                id="aadhaar-verification-error"
                className="flex items-center gap-1.5 text-xs text-destructive font-medium pt-0.5"
                role="alert"
              >
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{aadhaarVerificationError}</span>
              </div>
            )}

            {stepErrors["isKycVerified"] && !data.isKycVerified && (
              <p id="isKycVerified-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["isKycVerified"]}
              </p>
            )}
          </div>

          {/* Row 4 — Two columns: Signatory Official Email & Signatory Direct Mobile */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="signatoryEmail">
                Signatory Official Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="signatoryEmail"
                  type="email"
                  value={data.signatoryEmail}
                  onChange={(e) => handleFieldChange({ signatoryEmail: e.target.value })}
                  placeholder="signatory@company.com"
                  className="pl-9"
                  aria-invalid={Boolean(stepErrors["signatoryEmail"])}
                  aria-describedby={stepErrors["signatoryEmail"] ? "signatoryEmail-error" : undefined}
                />
              </div>
              {stepErrors["signatoryEmail"] && (
                <p id="signatoryEmail-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["signatoryEmail"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signatoryPhone">
                Signatory Direct Mobile <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="signatoryPhone"
                  maxLength={10}
                  inputMode="numeric"
                  value={data.signatoryPhone}
                  onChange={(e) =>
                    handleFieldChange({
                      signatoryPhone: formatPhoneNumber(e.target.value),
                    })
                  }
                  placeholder="98765 43210"
                  className="pl-9"
                  aria-invalid={Boolean(stepErrors["signatoryPhone"])}
                  aria-describedby={stepErrors["signatoryPhone"] ? "signatoryPhone-error" : undefined}
                />
              </div>
              {stepErrors["signatoryPhone"] && (
                <p id="signatoryPhone-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["signatoryPhone"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic KYC Document Uploads Section */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <IdCard className="size-4 text-primary" />
              Signatory KYC Document Uploads
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Upload clear, readable copies of valid identity and residential address documents. PDF, PNG, JPG, or WEBP up to 5MB.
            </p>
          </div>

          <div className="space-y-6">
            {/* Card 1: Identity Proof Document Section (Aadhaar Card only) */}
            <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Identity Proof (Aadhaar Card) <span className="text-destructive">*</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isIdentityUploadsComplete ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="size-3" />
                      Complete
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border shrink-0">
                      {identityUploadedCount} of {AADHAAR_SLOTS.length} uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Aadhaar Upload Slots: Front & Back */}
              <div className="grid gap-4 sm:grid-cols-2">
                {AADHAAR_SLOTS.map((slot) => {
                  const currentDoc =
                    data.identityProofFiles?.[slot.id] ||
                    (slot.id === "front" ? data.identityProofDocument : undefined);
                  const slotError =
                    stepErrors[`identityProof_${slot.id}`] ||
                    (slot.id === "front" ? stepErrors["identityProofDocument"] : undefined);

                  return (
                    <DocumentUploadBox
                      key={`identity-aadhaar-${slot.id}`}
                      label={slot.label}
                      sideBadge={slot.sideBadge}
                      required
                      documentType={`AADHAAR_${slot.id.toUpperCase()}`}
                      document={currentDoc}
                      onDocumentChange={(doc) => handleIdentityFileChange(slot.id, doc)}
                      error={slotError}
                    />
                  );
                })}
              </div>
            </div>

            {/* Card 2: Address Proof Document Section (Electricity / Utility Bill only) */}
            <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Address Proof (Electricity / Utility Bill) <span className="text-destructive">*</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAddressUploadsComplete ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="size-3" />
                      Complete
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border shrink-0">
                      0 of 1 uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Single Utility Bill Upload Slot */}
              <div className="grid gap-4 sm:grid-cols-1">
                <DocumentUploadBox
                  label="Electricity / Utility Bill"
                  sideBadge="Latest Bill"
                  required
                  documentType="UTILITY_BILL"
                  document={data.addressProofFiles?.front || data.addressProofDocument}
                  onDocumentChange={handleAddressFileChange}
                  error={stepErrors["addressProof_front"] || stepErrors["addressProofDocument"]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
