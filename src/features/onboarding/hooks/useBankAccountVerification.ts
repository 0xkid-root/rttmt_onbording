"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { formatIfsc } from "../utils/formatters";
import { lookupIfsc, verifyBankAccount } from "../services/verificationService";
import { Step7BankAccountData } from "../types";

export const IFSC_FORMAT_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

interface UseBankAccountVerificationProps {
  data: Step7BankAccountData;
  updateStepData: (stepKey: "step7", data: Partial<Step7BankAccountData>) => void;
  legalEntityName: string;
}

export function useBankAccountVerification({
  data,
  updateStepData,
  legalEntityName,
}: UseBankAccountVerificationProps) {
  // Verification & lookup states
  const [isLookingUpIfsc, setIsLookingUpIfsc] = useState(false);
  const [ifscLookupError, setIfscLookupError] = useState<string | null>(null);
  const [isPennyDropRunning, setIsPennyDropRunning] = useState(false);
  const [pennyDropError, setPennyDropError] = useState<string | null>(null);

  // Concurrency & stale protection refs
  const verificationRequestIdRef = useRef(0);
  const verificationAbortControllerRef = useRef<AbortController | null>(null);
  const ifscLookupRequestIdRef = useRef(0);
  const ifscAbortControllerRef = useRef<AbortController | null>(null);

  // Helper to invalidate ongoing or past verification when bank details change
  const invalidateVerification = useCallback(() => {
    if (verificationAbortControllerRef.current) {
      verificationAbortControllerRef.current.abort();
      verificationAbortControllerRef.current = null;
    }
    verificationRequestIdRef.current += 1;
    setIsPennyDropRunning(false);
    setPennyDropError(null);
    updateStepData("step7", {
      isBankVerified: false,
      bankVerificationDetails: undefined,
    });
  }, [updateStepData]);

  // Handle IFSC input change with race-condition & format protection
  const handleIfscChange = useCallback(
    (raw: string) => {
      const formatted = formatIfsc(raw).toUpperCase().slice(0, 11);

      // Cancel in-flight lookup
      if (ifscAbortControllerRef.current) {
        ifscAbortControllerRef.current.abort();
        ifscAbortControllerRef.current = null;
      }

      invalidateVerification();

      // If IFSC is cleared or shortened, reset resolved bank/branch
      if (formatted.length < 11) {
        setIfscLookupError(null);
        setIsLookingUpIfsc(false);
        updateStepData("step7", {
          ifscCode: formatted,
          bankName: "",
          branchName: "",
        });
        return;
      }

      // Set value and validate format before triggering lookup
      updateStepData("step7", { ifscCode: formatted });

      if (!IFSC_FORMAT_REGEX.test(formatted)) {
        setIfscLookupError(
          "Invalid format: 4 letters, '0', then 6 alphanumeric characters (e.g., HDFC0000001)."
        );
        setIsLookingUpIfsc(false);
        return;
      }

      setIfscLookupError(null);
      setIsLookingUpIfsc(true);

      const currentLookupId = ++ifscLookupRequestIdRef.current;
      const controller = new AbortController();
      ifscAbortControllerRef.current = controller;

      lookupIfsc(formatted, { signal: controller.signal })
        .then((info) => {
          if (currentLookupId !== ifscLookupRequestIdRef.current) return;
          if (info) {
            updateStepData("step7", {
              bankName: info.bankName,
              branchName: `${info.branchName}, ${info.city}`,
            });
            setIfscLookupError(null);
          } else {
            setIfscLookupError(
              "IFSC not found in directory. You can enter the bank name manually below."
            );
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          if (currentLookupId !== ifscLookupRequestIdRef.current) return;
          setIfscLookupError("IFSC lookup timed out. You may enter bank details manually.");
        })
        .finally(() => {
          if (currentLookupId === ifscLookupRequestIdRef.current) {
            setIsLookingUpIfsc(false);
          }
        });
    },
    [invalidateVerification, updateStepData]
  );

  // Masked account number helper for secure display in result cards
  const maskedAccountNumber = useMemo(() => {
    const acc = (data.accountNumber || "").trim();
    if (!acc) return "••••";
    const last4 = acc.length >= 4 ? acc.slice(-4) : acc;
    return `••••••••${last4}`;
  }, [data.accountNumber]);

  // Account match checking
  const isAccountMatch = Boolean(
    data.accountNumber &&
      data.confirmAccountNumber &&
      data.accountNumber === data.confirmAccountNumber
  );

  const canRunVerification = Boolean(
    !isPennyDropRunning &&
      data.accountHolderName.trim().length >= 3 &&
      data.accountNumber.length >= 9 &&
      isAccountMatch &&
      data.ifscCode.length === 11 &&
      IFSC_FORMAT_REGEX.test(data.ifscCode)
  );

  // Execute Simulated Bank Account Verification with snapshot & cancellation protection
  const handleRunPennyDrop = useCallback(async () => {
    if (isPennyDropRunning) return;

    // Field-level prerequisite checks
    if (!data.accountHolderName.trim()) {
      setPennyDropError("Please enter the legal bank account holder name.");
      return;
    }
    if (!data.accountNumber || data.accountNumber.length < 9) {
      setPennyDropError("Please enter a valid bank account number (9 to 18 digits).");
      return;
    }
    if (data.accountNumber !== data.confirmAccountNumber) {
      setPennyDropError("Bank account numbers do not match.");
      return;
    }
    if (!data.ifscCode || !IFSC_FORMAT_REGEX.test(data.ifscCode)) {
      setPennyDropError("Please enter a valid 11-character IFSC code before verifying.");
      return;
    }

    // Cancel any previous verification in-flight
    if (verificationAbortControllerRef.current) {
      verificationAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    verificationAbortControllerRef.current = abortController;

    const currentRequestId = ++verificationRequestIdRef.current;
    const requestSnapshot = JSON.stringify({
      accountHolderName: data.accountHolderName.trim(),
      accountNumber: data.accountNumber.trim(),
      confirmAccountNumber: data.confirmAccountNumber.trim(),
      ifscCode: data.ifscCode.trim().toUpperCase(),
      accountType: data.accountType,
    });

    setIsPennyDropRunning(true);
    setPennyDropError(null);

    try {
      const result = await verifyBankAccount(
        data.accountNumber,
        data.ifscCode,
        data.accountHolderName || legalEntityName,
        { signal: abortController.signal }
      );

      // Verify that this response has not been superseded by a newer request or user edit
      const currentSnapshot = JSON.stringify({
        accountHolderName: data.accountHolderName.trim(),
        accountNumber: data.accountNumber.trim(),
        confirmAccountNumber: data.confirmAccountNumber.trim(),
        ifscCode: data.ifscCode.trim().toUpperCase(),
        accountType: data.accountType,
      });

      if (
        currentRequestId !== verificationRequestIdRef.current ||
        requestSnapshot !== currentSnapshot
      ) {
        return; // Stale async response discarded
      }

      if (result.isVerified) {
        updateStepData("step7", {
          isBankVerified: true,
          bankName: result.bankName || data.bankName,
          branchName: result.branchName || data.branchName,
          bankVerificationDetails: result,
        });
        setPennyDropError(null);
      } else {
        updateStepData("step7", {
          isBankVerified: false,
          bankVerificationDetails: undefined,
        });
        setPennyDropError(
          result.notes || "Simulated verification: Bank account could not be validated."
        );
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // Cancelled intentionally
      }
      if (currentRequestId !== verificationRequestIdRef.current) return;
      updateStepData("step7", {
        isBankVerified: false,
        bankVerificationDetails: undefined,
      });
      setPennyDropError("Simulated bank verification check timed out. Please retry.");
    } finally {
      if (currentRequestId === verificationRequestIdRef.current) {
        setIsPennyDropRunning(false);
      }
    }
  }, [
    data.accountHolderName,
    data.accountNumber,
    data.confirmAccountNumber,
    data.ifscCode,
    data.accountType,
    data.bankName,
    data.branchName,
    isPennyDropRunning,
    legalEntityName,
    updateStepData,
  ]);

  return {
    isLookingUpIfsc,
    ifscLookupError,
    isPennyDropRunning,
    pennyDropError,
    maskedAccountNumber,
    isAccountMatch,
    canRunVerification,
    invalidateVerification,
    handleIfscChange,
    handleRunPennyDrop,
  };
}
