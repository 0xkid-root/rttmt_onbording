"use client";

import React, { useMemo } from "react";
import { Mail, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "../../common/VerificationBadge";
import {
  formatPhoneNumber,
  isOfficialCompanyEmail,
  isValidIndianMobileNumber,
} from "../../../utils/formatters";
import { Step1AccountData } from "../../../types";

interface ContactVerificationFieldsProps {
  data: Step1AccountData;
  onUpdate: (updates: Partial<Step1AccountData>) => void;
  onOpenEmailOtp: () => void;
  onOpenPhoneOtp: () => void;
  stepErrors: Record<string, string>;
}

export function ContactVerificationFields({
  data,
  onUpdate,
  onOpenEmailOtp,
  onOpenPhoneOtp,
  stepErrors,
}: ContactVerificationFieldsProps) {
  // Real-time evaluation of official company domain
  const emailValidation = useMemo(() => {
    if (!data.email || !data.email.trim()) return null;
    return isOfficialCompanyEmail(data.email);
  }, [data.email]);

  // Real-time evaluation of Aadhaar mobile eligibility
  const phoneValidation = useMemo(() => {
    if (!data.phone || !data.phone.trim()) return null;
    return isValidIndianMobileNumber(data.phone);
  }, [data.phone]);

  const isEmailOtpEligible = Boolean(emailValidation?.isValid);
  const isPhoneOtpEligible = Boolean(phoneValidation?.isValid);

  return (
    <div className="space-y-4">
      {/* Row 1 — Work Email */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Work Email <span className="text-destructive">*</span>
          </Label>
          {data.isEmailVerified && (
            <VerificationBadge status={true} label="Verified" size="sm" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Official company email ID (e.g. name@company.com)
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) =>
                onUpdate({
                  email: e.target.value,
                  isEmailVerified: false,
                })
              }
              placeholder="name@company.com"
              className="pl-9 h-9.5 text-sm"
              disabled={data.isEmailVerified}
              aria-invalid={Boolean(
                stepErrors["email"] ||
                  (stepErrors["isEmailVerified"] && !data.isEmailVerified) ||
                  (emailValidation && !emailValidation.isValid)
              )}
              aria-describedby={
                stepErrors["email"]
                  ? "email-error"
                  : emailValidation && !emailValidation.isValid
                  ? "email-warning"
                  : undefined
              }
            />
          </div>
          {data.isEmailVerified ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ isEmailVerified: false })}
              className="h-9.5 px-3.5 text-xs text-muted-foreground shrink-0"
            >
              Change Email
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onOpenEmailOtp}
              disabled={!isEmailOtpEligible}
              className="h-9.5 px-4 font-medium shrink-0"
            >
              <ShieldCheck className="mr-1.5 size-4" />
              Verify Email
            </Button>
          )}
        </div>

        {/* Real-time personal webmail warning */}
        {!data.isEmailVerified && emailValidation && !emailValidation.isValid && (
          <p id="email-warning" role="alert" className="text-xs font-medium text-destructive flex items-center gap-1.5 pt-0.5">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>Personal email (@{emailValidation.domain || "webmail"}) not allowed. Please use your company email ID.</span>
          </p>
        )}

        {/* Valid corporate domain indicator */}
        {!data.isEmailVerified && emailValidation?.isValid && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>Official company email recognized.</span>
          </p>
        )}

        {stepErrors["email"] && !emailValidation?.error && (
          <p id="email-error" role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["email"]}
          </p>
        )}
        {stepErrors["isEmailVerified"] && !data.isEmailVerified && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["isEmailVerified"]}
          </p>
        )}
      </div>

      {/* Row 2 — Mobile Number */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          {data.isPhoneVerified && (
            <VerificationBadge status={true} label="Verified" size="sm" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Primary mobile number for account authentication and OTP alerts
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
          <div className="relative flex flex-1">
            <div className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground font-medium select-none h-9.5">
              +91
            </div>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) =>
                onUpdate({
                  phone: formatPhoneNumber(e.target.value),
                  isPhoneVerified: false,
                })
              }
              placeholder="98765 43210"
              className="rounded-l-none h-9.5 text-sm"
              disabled={data.isPhoneVerified}
              aria-invalid={Boolean(
                stepErrors["phone"] ||
                  (stepErrors["isPhoneVerified"] && !data.isPhoneVerified) ||
                  (phoneValidation && !phoneValidation.isValid)
              )}
              aria-describedby={
                stepErrors["phone"]
                  ? "phone-error"
                  : phoneValidation && !phoneValidation.isValid
                  ? "phone-warning"
                  : undefined
              }
            />
          </div>
          {data.isPhoneVerified ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ isPhoneVerified: false })}
              className="h-9.5 px-3.5 text-xs text-muted-foreground shrink-0"
            >
              Change Mobile
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onOpenPhoneOtp}
              disabled={!isPhoneOtpEligible}
              className="h-9.5 px-4 font-medium shrink-0"
            >
              <ShieldCheck className="mr-1.5 size-4" />
              Verify Mobile
            </Button>
          )}
        </div>

        {/* Real-time mobile validation feedback */}
        {!data.isPhoneVerified && phoneValidation && !phoneValidation.isValid && (
          <p id="phone-warning" role="alert" className="text-xs font-medium text-destructive flex items-center gap-1.5 pt-0.5">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{phoneValidation.error}</span>
          </p>
        )}

        {/* Valid Aadhaar-ready mobile indicator */}
        {!data.isPhoneVerified && phoneValidation?.isValid && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>Valid 10-digit mobile.</span>
          </p>
        )}

        {stepErrors["phone"] && !phoneValidation?.error && (
          <p id="phone-error" role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["phone"]}
          </p>
        )}
        {stepErrors["isPhoneVerified"] && !data.isPhoneVerified && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["isPhoneVerified"]}
          </p>
        )}
      </div>
    </div>
  );
}
