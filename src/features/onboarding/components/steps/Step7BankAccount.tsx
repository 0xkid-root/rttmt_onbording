"use client";

import React, { useState, useRef, useId, useMemo, useCallback } from "react";
import {
  Landmark,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
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
import { useOnboarding } from "../../hooks/OnboardingContext";
import { VerificationBadge } from "../common/VerificationBadge";
import { formatIfsc } from "../../utils/formatters";
import { lookupIfsc, verifyBankAccount } from "../../services/verificationService";

const IFSC_FORMAT_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function Step7BankAccount() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step7;
  const entityType = formData.step3.entityType;
  const legalEntityName = formData.step3.legalEntityName || formData.step2.brandName;

  // Masking states
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);

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

  const isProprietor = entityType === "SOLE_PROPRIETORSHIP";

  const accountTypeSelectId = useId();

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
  const handleIfscChange = (raw: string) => {
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
      setIfscLookupError("Invalid format: 4 letters, '0', then 6 alphanumeric characters (e.g., HDFC0000001).");
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
          setIfscLookupError("IFSC not found in directory. You can enter the bank name manually below.");
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
  };

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
  const handleRunPennyDrop = async () => {
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

      if (currentRequestId !== verificationRequestIdRef.current || requestSnapshot !== currentSnapshot) {
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
        setPennyDropError(result.notes || "Simulated verification: Bank account could not be validated.");
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
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Settlement Bank Account Details
          </h2>
          <VerificationBadge
            status={data.isBankVerified ? "VERIFIED" : "NOT_STARTED"}
            label={data.isBankVerified ? "Bank Account Verified (Demo)" : "Verification Required"}
            size="sm"
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide the bank account where merchant transaction settlements and payout disbursements will be credited.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Account Information */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Landmark className="size-4 text-primary" />
              Primary Settlement Bank Details
            </h3>
            {data.isBankVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="size-3" />
                Verified
              </span>
            )}
          </div>

          {/* Account Holder Name */}
          <div className="space-y-1.5">
            <Label htmlFor="accountHolderName" className="text-xs sm:text-sm">
              Bank Account Holder Legal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountHolderName"
              value={data.accountHolderName}
              onChange={(e) => {
                invalidateVerification();
                updateStepData("step7", {
                  accountHolderName: e.target.value,
                });
              }}
              placeholder={legalEntityName || "Legal Name as on Bank Records"}
              aria-invalid={Boolean(stepErrors["accountHolderName"])}
              aria-describedby={
                stepErrors["accountHolderName"]
                  ? "accountHolderName-error"
                  : undefined
              }
            />

            {stepErrors["accountHolderName"] && (
              <p id="accountHolderName-error" role="alert" className="text-xs font-medium text-destructive">
                {stepErrors["accountHolderName"]}
              </p>
            )}
          </div>

          {/* Account Numbers (Masked with Show/Hide toggle) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Account Number */}
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber" className="text-xs sm:text-sm">
                Bank Account Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="accountNumber"
                  type={showAccountNumber ? "text" : "password"}
                  maxLength={18}
                  value={data.accountNumber}
                  onChange={(e) => {
                    invalidateVerification();
                    updateStepData("step7", {
                      accountNumber: e.target.value.replace(/[^0-9]/g, ""),
                    });
                  }}
                  placeholder="Enter 9 to 18-digit account number"
                  className="font-mono text-sm tracking-wider pr-10"
                  aria-invalid={Boolean(stepErrors["accountNumber"])}
                  aria-describedby={stepErrors["accountNumber"] ? "accountNumber-error" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccountNumber((prev) => !prev)}
                  className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  aria-label={showAccountNumber ? "Hide account number" : "Show account number"}
                >
                  {showAccountNumber ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
              {stepErrors["accountNumber"] && (
                <p id="accountNumber-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["accountNumber"]}
                </p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmAccountNumber" className="text-xs sm:text-sm">
                Confirm Account Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmAccountNumber"
                  type={showConfirmAccountNumber ? "text" : "password"}
                  maxLength={18}
                  value={data.confirmAccountNumber}
                  onChange={(e) => {
                    invalidateVerification();
                    updateStepData("step7", {
                      confirmAccountNumber: e.target.value.replace(/[^0-9]/g, ""),
                    });
                  }}
                  placeholder="Re-enter bank account number"
                  className="font-mono text-sm tracking-wider pr-10"
                  aria-invalid={Boolean(stepErrors["confirmAccountNumber"] || (data.confirmAccountNumber && !isAccountMatch))}
                  aria-describedby={stepErrors["confirmAccountNumber"] ? "confirmAccountNumber-error" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmAccountNumber((prev) => !prev)}
                  className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmAccountNumber ? "Hide confirmation account number" : "Show confirmation account number"}
                >
                  {showConfirmAccountNumber ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
              {data.confirmAccountNumber && !isAccountMatch && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  Bank account numbers do not match.
                </p>
              )}
              {stepErrors["confirmAccountNumber"] && (
                <p id="confirmAccountNumber-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["confirmAccountNumber"]}
                </p>
              )}
            </div>
          </div>

          {/* IFSC, Bank Name, Account Type */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* IFSC Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ifscCode" className="text-xs sm:text-sm">
                  IFSC Code <span className="text-destructive">*</span>
                </Label>
                {isLookingUpIfsc && (
                  <span className="text-[11px] text-primary flex items-center gap-1 font-medium">
                    <RefreshCw className="size-3 animate-spin" /> Looking up...
                  </span>
                )}
              </div>
              <Input
                id="ifscCode"
                maxLength={11}
                value={data.ifscCode}
                onChange={(e) => handleIfscChange(e.target.value)}
                placeholder="e.g. HDFC0000001"
                className="font-mono text-sm uppercase tracking-wider"
                aria-invalid={Boolean(stepErrors["ifscCode"] || ifscLookupError)}
                aria-describedby={
                  stepErrors["ifscCode"]
                    ? "ifscCode-error"
                    : ifscLookupError
                    ? "ifscLookup-error"
                    : undefined
                }
              />
              {ifscLookupError && (
                <p id="ifscLookup-error" role="alert" className="text-[11px] text-amber-600 dark:text-amber-400">
                  {ifscLookupError}
                </p>
              )}
              {stepErrors["ifscCode"] && (
                <p id="ifscCode-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["ifscCode"]}
                </p>
              )}
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-xs sm:text-sm">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankName"
                value={data.bankName}
                onChange={(e) => {
                  invalidateVerification();
                  updateStepData("step7", { bankName: e.target.value });
                }}
                placeholder="Resolved from IFSC or enter name"
                aria-invalid={Boolean(stepErrors["bankName"])}
                aria-describedby={stepErrors["bankName"] ? "bankName-error" : undefined}
              />
              {stepErrors["bankName"] && (
                <p id="bankName-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["bankName"]}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-1.5">
              <Label htmlFor={accountTypeSelectId} className="text-xs sm:text-sm">
                Account Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.accountType}
                onValueChange={(val) => {
                  if (val) {
                    invalidateVerification();
                    updateStepData("step7", {
                      accountType: val as "CURRENT" | "SAVINGS",
                    });
                  }
                }}
              >
                <SelectTrigger id={accountTypeSelectId} className="w-full">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current Account (Standard)</SelectItem>
                  {isProprietor && (
                    <SelectItem value="SAVINGS">
                      Savings Account (Proprietorship only)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 2: Simulated Penny-Drop Verification */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Simulated Bank Account Verification
              </h3>
            </div>

            <Button
              type="button"
              variant={data.isBankVerified ? "outline" : "default"}
              size="sm"
              onClick={handleRunPennyDrop}
              disabled={isPennyDropRunning || !canRunVerification}
              className="shrink-0 h-9"
              aria-busy={isPennyDropRunning}
            >
              {isPennyDropRunning ? (
                <>
                  <RefreshCw className="mr-2 size-3.5 animate-spin" />
                  Verifying Account...
                </>
              ) : data.isBankVerified ? (
                <>
                  <CheckCircle2 className="mr-2 size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Re-Verify Account
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-3.5" />
                  Verify Bank Account
                </>
              )}
            </Button>
          </div>

          {/* Verification Result Card (Honest Demo Simulation) */}
          {data.isBankVerified && data.bankVerificationDetails && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Simulated Bank Verification Cleared</span>
                </div>
                <span className="text-[10px] uppercase tracking-wide bg-background/80 px-2 py-0.5 rounded border border-border text-muted-foreground font-semibold">
                  Demo Simulation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-muted-foreground">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Bank
                  </span>
                  <span>{data.bankVerificationDetails.bankName || data.bankName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Branch
                  </span>
                  <span>{data.bankVerificationDetails.branchName || data.branchName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Account
                  </span>
                  <span className="font-mono">{maskedAccountNumber}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Simulated Reference
                  </span>
                  <span className="font-mono text-[11px]">
                    {data.bankVerificationDetails.pennyDropReference || "SIM-PDR-PENDING"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Error */}
          {pennyDropError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Bank Verification Issue</span>
                <span>{pennyDropError}</span>
              </div>
            </div>
          )}

          {stepErrors["isBankVerified"] && !data.isBankVerified && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["isBankVerified"]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
