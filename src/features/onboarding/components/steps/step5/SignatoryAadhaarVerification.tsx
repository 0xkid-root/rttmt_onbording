"use client";

import React from "react";
import {
  IdCard,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "../../common/VerificationBadge";

interface SignatoryAadhaarVerificationProps {
  idDocumentNumber: string;
  isIdVerified: boolean;
  isAadhaarVerifying: boolean;
  aadhaarFeedback: string | null;
  aadhaarVerificationError: string | null;
  isKycVerified: boolean;
  onAadhaarChange: (raw: string) => void;
  onVerifyAadhaar: () => void;
  stepErrors: Record<string, string>;
}

export function SignatoryAadhaarVerification({
  idDocumentNumber,
  isIdVerified,
  isAadhaarVerifying,
  aadhaarFeedback,
  aadhaarVerificationError,
  isKycVerified,
  onAadhaarChange,
  onVerifyAadhaar,
  stepErrors,
}: SignatoryAadhaarVerificationProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="aadhaarNumber">
          Aadhaar Number (12 digits / masked) <span className="text-destructive">*</span>
        </Label>
        {isIdVerified && (
          <VerificationBadge status="VERIFIED" label="Verified" size="sm" />
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <IdCard className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="aadhaarNumber"
            maxLength={14}
            value={idDocumentNumber}
            onChange={(e) => onAadhaarChange(e.target.value)}
            placeholder="XXXX XXXX 9034"
            className="pl-9 font-mono text-sm uppercase"
            aria-invalid={Boolean(
              stepErrors["idDocumentNumber"] || aadhaarVerificationError
            )}
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
          variant={isIdVerified ? "outline" : "default"}
          onClick={onVerifyAadhaar}
          disabled={isAadhaarVerifying || !idDocumentNumber.trim()}
          className="shrink-0 h-10 px-4"
          aria-busy={isAadhaarVerifying}
        >
          {isAadhaarVerifying ? (
            <>
              <RefreshCw className="mr-2 size-3.5 animate-spin" />
              Verifying Aadhaar
            </>
          ) : isIdVerified ? (
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

      {/* Accessible Messages & Feedback */}
      {stepErrors["idDocumentNumber"] && (
        <p
          id="idDocumentNumber-error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {stepErrors["idDocumentNumber"]}
        </p>
      )}

      {aadhaarFeedback && (
        <div
          className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5"
          role="status"
        >
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

      {stepErrors["isKycVerified"] && !isKycVerified && (
        <p
          id="isKycVerified-error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {stepErrors["isKycVerified"]}
        </p>
      )}
    </div>
  );
}
