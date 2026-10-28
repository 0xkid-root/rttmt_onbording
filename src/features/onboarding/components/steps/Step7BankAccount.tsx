"use client";

import React from "react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { VerificationBadge } from "../common/VerificationBadge";
import { useBankAccountVerification } from "../../hooks/useBankAccountVerification";
import { BankAccountForm } from "./step7/BankAccountForm";
import { BankVerificationCard } from "./step7/BankVerificationCard";

export function Step7BankAccount() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step7;
  const entityType = formData.step3.entityType;
  const legalEntityName = formData.step3.legalEntityName || formData.step2.brandName;
  const isProprietor = entityType === "SOLE_PROPRIETORSHIP";

  const {
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
  } = useBankAccountVerification({
    data,
    updateStepData,
    legalEntityName,
  });

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
            label={
              data.isBankVerified
                ? "Bank Account Verified (Demo)"
                : "Verification Required"
            }
            size="sm"
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide the bank account where merchant transaction settlements and payout
          disbursements will be credited.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Account Information */}
        <BankAccountForm
          data={data}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
          legalEntityName={legalEntityName}
          isProprietor={isProprietor}
          isAccountMatch={isAccountMatch}
          isLookingUpIfsc={isLookingUpIfsc}
          ifscLookupError={ifscLookupError}
          handleIfscChange={handleIfscChange}
          invalidateVerification={invalidateVerification}
        />

        {/* Section 2: Simulated Penny-Drop Verification */}
        <BankVerificationCard
          data={data}
          canRunVerification={canRunVerification}
          isPennyDropRunning={isPennyDropRunning}
          pennyDropError={pennyDropError}
          maskedAccountNumber={maskedAccountNumber}
          stepErrors={stepErrors}
          handleRunPennyDrop={handleRunPennyDrop}
        />
      </div>
    </div>
  );
}
