"use client";

import { useState, useRef, useMemo } from "react";
import { formatPan, formatAadhaarInput } from "../utils/formatters";
import {
  simulatePanVerification,
  simulateIdVerification,
} from "../services/verificationService";
import {
  Step5KYCData,
  UploadedDocument,
  BusinessEntityType,
} from "../types";
import { AADHAAR_SLOTS } from "../components/steps/step5/SignatoryDocumentUploads";

interface UseSignatoryKycParams {
  data: Step5KYCData;
  entityType: BusinessEntityType;
  updateStepData: (stepKey: "step5", data: Partial<Step5KYCData>) => void;
}

export function useSignatoryKyc({
  data,
  entityType,
  updateStepData,
}: UseSignatoryKycParams) {
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
    if (isPanVerifying) return;
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
          panVerifiedName: result.registeredName || data.signatoryName,
          panVerificationStatus: "VERIFIED",
          isKycVerified: isBothVerified && isIdUploadsDone && isAddrUploadsDone,
        });

        setPanFeedback(
          result.notes || `Simulated PAN check passed for ${result.registeredName}`
        );
        setPanVerificationError(null);
      } else {
        updateStepData("step5", {
          isPanVerified: false,
          panVerificationStatus: "FAILED",
          isKycVerified: false,
        });
        setPanVerificationError(
          result?.notes || "Personal PAN verification failed. Please check the PAN number."
        );
        setPanFeedback(null);
      }
    } catch {
      if (currentRequestId !== panRequestIdRef.current) return;
      updateStepData("step5", {
        isPanVerified: false,
        panVerificationStatus: "FAILED",
        isKycVerified: false,
      });
      setPanVerificationError("Verification service timed out. Please try again.");
      setPanFeedback(null);
    } finally {
      if (currentRequestId === panRequestIdRef.current) {
        setIsPanVerifying(false);
      }
    }
  };

  // Execute independent Aadhaar verification
  const handleVerifyAadhaar = async () => {
    if (isAadhaarVerifying) return;
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
      const result = await simulateIdVerification(data.idDocumentNumber, "AADHAAR");

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
          result?.notes || "Aadhaar verification failed. Please check entered details and retry."
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
      setAadhaarVerificationError("Verification gateway unreachable. Please try again.");
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

  return {
    getSignatoryRoleLabel,
    identityUploadedCount,
    isIdentityUploadsComplete,
    isAddressUploadsComplete,
    handleFieldChange,
    handlePanChange,
    handleAadhaarChange,
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
  };
}
