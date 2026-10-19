"use client";

import React, { useState } from "react";
import { Landmark, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
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

export function Step7BankAccount() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step7;
  const entityType = formData.step3.entityType;
  const legalEntityName = formData.step3.legalEntityName || formData.step2.brandName;

  const [isLookingUpIfsc, setIsLookingUpIfsc] = useState(false);
  const [isPennyDropRunning, setIsPennyDropRunning] = useState(false);
  const [pennyDropError, setPennyDropError] = useState<string | null>(null);

  const isProprietor = entityType === "SOLE_PROPRIETORSHIP";

  const handleIfscChange = async (raw: string) => {
    const formatted = formatIfsc(raw);
    updateStepData("step7", {
      ifscCode: formatted,
      isBankVerified: false,
      bankVerificationDetails: undefined,
    });

    if (formatted.length === 11) {
      setIsLookingUpIfsc(true);
      try {
        const info = await lookupIfsc(formatted);
        if (info) {
          updateStepData("step7", {
            bankName: info.bankName,
            branchName: `${info.branchName}, ${info.city}`,
          });
        }
      } finally {
        setIsLookingUpIfsc(false);
      }
    }
  };

  const handleRunPennyDrop = async () => {
    if (!data.accountNumber || !data.ifscCode) {
      setPennyDropError("Please enter account number and valid IFSC code first.");
      return;
    }

    if (data.accountNumber !== data.confirmAccountNumber) {
      setPennyDropError("Bank account numbers do not match.");
      return;
    }

    setIsPennyDropRunning(true);
    setPennyDropError(null);

    try {
      const result = await verifyBankAccount(
        data.accountNumber,
        data.ifscCode,
        data.accountHolderName || legalEntityName
      );

      if (result.isVerified) {
        updateStepData("step7", {
          isBankVerified: true,
          bankName: result.bankName,
          branchName: result.branchName,
          bankVerificationDetails: result,
        });
      }
    } catch {
      setPennyDropError("Simulated penny-drop service timed out. Please retry.");
    } finally {
      setIsPennyDropRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Settlement Bank Account Details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect the commercial bank account where daily transaction settlements and funds will be deposited.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Landmark className="size-4 text-primary" />
              Primary Settlement Bank Details
            </h3>
            <VerificationBadge
              status={data.isBankVerified}
              label={data.isBankVerified ? "Account Verified (Penny-Drop)" : "Verification Required"}
              size="sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accountHolderName">
              Bank Account Holder Legal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountHolderName"
              value={data.accountHolderName}
              onChange={(e) =>
                updateStepData("step7", {
                  accountHolderName: e.target.value,
                  isBankVerified: false,
                })
              }
              placeholder={legalEntityName || "Acme Technologies Private Limited"}
            />
            <p className="text-[11px] text-muted-foreground">
              Must match with the legal entity name on corporate tax/ROC records.
            </p>
            {stepErrors["accountHolderName"] && (
              <p className="text-xs font-medium text-destructive">
                {stepErrors["accountHolderName"]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Account Number */}
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber">
                Bank Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountNumber"
                type="password"
                maxLength={18}
                value={data.accountNumber}
                onChange={(e) =>
                  updateStepData("step7", {
                    accountNumber: e.target.value.replace(/[^0-9]/g, ""),
                    isBankVerified: false,
                  })
                }
                placeholder="Enter 9 to 18-digit account number"
                className="font-mono text-sm tracking-wider"
              />
              {stepErrors["accountNumber"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["accountNumber"]}
                </p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmAccountNumber">
                Confirm Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmAccountNumber"
                type="text"
                maxLength={18}
                value={data.confirmAccountNumber}
                onChange={(e) =>
                  updateStepData("step7", {
                    confirmAccountNumber: e.target.value.replace(/[^0-9]/g, ""),
                    isBankVerified: false,
                  })
                }
                placeholder="Re-enter bank account number"
                className="font-mono text-sm tracking-wider"
              />
              {stepErrors["confirmAccountNumber"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["confirmAccountNumber"]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* IFSC Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ifscCode">
                  IFSC Code <span className="text-destructive">*</span>
                </Label>
                {isLookingUpIfsc && (
                  <span className="text-[11px] text-primary flex items-center gap-1">
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
              />
              {stepErrors["ifscCode"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["ifscCode"]}</p>
              )}
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <Label htmlFor="bankName">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankName"
                value={data.bankName}
                onChange={(e) => updateStepData("step7", { bankName: e.target.value })}
                placeholder="Resolved from IFSC"
              />
              {stepErrors["bankName"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["bankName"]}</p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-1.5">
              <Label htmlFor="accountType">
                Account Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.accountType}
                onValueChange={(val) => {
                  if (val) {
                    updateStepData("step7", {
                      accountType: val as "CURRENT" | "SAVINGS",
                      isBankVerified: false,
                    });
                  }
                }}
              >
                <SelectTrigger id="accountType" className="w-full">
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

          {data.branchName && (
            <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <Info className="size-3.5 text-primary shrink-0" />
              <span>
                Resolved Branch Location: <strong className="text-foreground">{data.branchName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Simulated Penny Drop Verification Box */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                NPCI / IMPS Penny-Drop Verification
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulates a reverse ₹1.00 credit to confirm active bank status and verify account holder legal name.
              </p>
            </div>

            <Button
              type="button"
              variant={data.isBankVerified ? "outline" : "default"}
              size="sm"
              onClick={handleRunPennyDrop}
              disabled={
                isPennyDropRunning ||
                !data.accountNumber ||
                !data.confirmAccountNumber ||
                data.ifscCode.length < 11
              }
              className="shrink-0"
            >
              {isPennyDropRunning ? (
                <>
                  <RefreshCw className="mr-2 size-3.5 animate-spin" />
                  Testing Penny Drop...
                </>
              ) : data.isBankVerified ? (
                <>
                  <CheckCircle2 className="mr-2 size-3.5 text-emerald-600" />
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

          {/* Verification Result Card */}
          {data.isBankVerified && data.bankVerificationDetails && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Simulated Penny-Drop Match Confirmed (NPCI Sandbox)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-muted-foreground">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Bank
                  </span>
                  <span>{data.bankVerificationDetails.bankName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Branch
                  </span>
                  <span>{data.bankVerificationDetails.branchName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Name Match
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    100% Exact Match
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-foreground">
                    Ref Number
                  </span>
                  <span className="font-mono text-[11px]">
                    {data.bankVerificationDetails.pennyDropReference}
                  </span>
                </div>
              </div>
            </div>
          )}

          {pennyDropError && (
            <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertCircle className="size-3.5" />
              <span>{pennyDropError}</span>
            </div>
          )}

          {stepErrors["isBankVerified"] && !data.isBankVerified && (
            <p className="text-xs font-medium text-destructive">{stepErrors["isBankVerified"]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
