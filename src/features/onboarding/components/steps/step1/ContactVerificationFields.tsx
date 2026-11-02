"use client";

import React from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "../../common/VerificationBadge";
import { formatPhoneNumber } from "../../../utils/formatters";
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
  return (
    <div className="space-y-4">
      {/* Row 1 — Work Email */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Work Email <span className="text-destructive">*</span>
          </Label>
          {data.isEmailVerified && (
            <VerificationBadge status={true} label="Verified" size="sm" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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
              placeholder="merchant.admin@company.com"
              className="pl-9 h-9.5 text-sm"
              disabled={data.isEmailVerified}
              aria-invalid={Boolean(stepErrors["email"] || (stepErrors["isEmailVerified"] && !data.isEmailVerified))}
              aria-describedby={stepErrors["email"] ? "email-error" : undefined}
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
              disabled={!data.email || !data.email.includes("@")}
              className="h-9.5 px-4 font-medium shrink-0"
            >
              <ShieldCheck className="mr-1.5 size-4" />
              Verify Email
            </Button>
          )}
        </div>
        {stepErrors["email"] && (
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          {data.isPhoneVerified && (
            <VerificationBadge status={true} label="Verified" size="sm" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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
              aria-invalid={Boolean(stepErrors["phone"] || (stepErrors["isPhoneVerified"] && !data.isPhoneVerified))}
              aria-describedby={stepErrors["phone"] ? "phone-error" : undefined}
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
              disabled={!data.phone || data.phone.length < 10}
              className="h-9.5 px-4 font-medium shrink-0"
            >
              <ShieldCheck className="mr-1.5 size-4" />
              Verify Mobile
            </Button>
          )}
        </div>
        {stepErrors["phone"] && (
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
