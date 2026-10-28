"use client";

import React, { useState, useId } from "react";
import { Landmark, CheckCircle2, RefreshCw, Eye, EyeOff } from "lucide-react";
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
import { Step7BankAccountData } from "../../../types";

interface BankAccountFormProps {
  data: Step7BankAccountData;
  updateStepData: (stepKey: "step7", data: Partial<Step7BankAccountData>) => void;
  stepErrors: Record<string, string>;
  legalEntityName: string;
  isProprietor: boolean;
  isAccountMatch: boolean;
  isLookingUpIfsc: boolean;
  ifscLookupError: string | null;
  handleIfscChange: (raw: string) => void;
  invalidateVerification: () => void;
}

export function BankAccountForm({
  data,
  updateStepData,
  stepErrors,
  legalEntityName,
  isProprietor,
  isAccountMatch,
  isLookingUpIfsc,
  ifscLookupError,
  handleIfscChange,
  invalidateVerification,
}: BankAccountFormProps) {
  // Masking toggles for input visibility
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
  const accountTypeSelectId = useId();

  return (
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
            stepErrors["accountHolderName"] ? "accountHolderName-error" : undefined
          }
        />

        {stepErrors["accountHolderName"] && (
          <p
            id="accountHolderName-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
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
              aria-describedby={
                stepErrors["accountNumber"] ? "accountNumber-error" : undefined
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAccountNumber((prev) => !prev)}
              className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label={
                showAccountNumber ? "Hide account number" : "Show account number"
              }
            >
              {showAccountNumber ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>
          </div>
          {stepErrors["accountNumber"] && (
            <p
              id="accountNumber-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
              aria-invalid={Boolean(
                stepErrors["confirmAccountNumber"] ||
                  (data.confirmAccountNumber && !isAccountMatch)
              )}
              aria-describedby={
                stepErrors["confirmAccountNumber"]
                  ? "confirmAccountNumber-error"
                  : undefined
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmAccountNumber((prev) => !prev)}
              className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmAccountNumber
                  ? "Hide confirmation account number"
                  : "Show confirmation account number"
              }
            >
              {showConfirmAccountNumber ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>
          </div>
          {data.confirmAccountNumber && !isAccountMatch && (
            <p role="alert" className="text-xs font-medium text-destructive">
              Bank account numbers do not match.
            </p>
          )}
          {stepErrors["confirmAccountNumber"] && (
            <p
              id="confirmAccountNumber-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
            <p
              id="ifscLookup-error"
              role="alert"
              className="text-[11px] text-amber-600 dark:text-amber-400"
            >
              {ifscLookupError}
            </p>
          )}
          {stepErrors["ifscCode"] && (
            <p
              id="ifscCode-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
            aria-describedby={
              stepErrors["bankName"] ? "bankName-error" : undefined
            }
          />
          {stepErrors["bankName"] && (
            <p
              id="bankName-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
  );
}
