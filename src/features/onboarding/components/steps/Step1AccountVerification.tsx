"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { OtpVerificationDialog } from "../common/OtpVerificationDialog";
import { VerificationBadge } from "../common/VerificationBadge";
import { formatPhoneNumber } from "../../utils/formatters";

export function Step1AccountVerification() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step1;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpModalState, setOtpModalState] = useState<{
    isOpen: boolean;
    type: "EMAIL" | "PHONE";
    target: string;
  }>({
    isOpen: false,
    type: "EMAIL",
    target: "",
  });

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength(data.password || "");

  const handleOpenEmailOtp = () => {
    if (!data.email || !data.email.includes("@")) {
      return;
    }
    setOtpModalState({
      isOpen: true,
      type: "EMAIL",
      target: data.email,
    });
  };

  const handleOpenPhoneOtp = () => {
    if (!data.phone || data.phone.length < 10) {
      return;
    }
    setOtpModalState({
      isOpen: true,
      type: "PHONE",
      target: `+91 ${data.phone}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Account & Contact Verification
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your primary RTTMT merchant master credentials and verify your contact details.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email Address & Verification */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Work Email Address <span className="text-destructive">*</span>
                </Label>
                <VerificationBadge
                  status={data.isEmailVerified}
                  label={data.isEmailVerified ? "Email Verified" : "Verification Required"}
                  size="sm"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) =>
                    updateStepData("step1", {
                      email: e.target.value,
                      isEmailVerified: false,
                    })
                  }
                  placeholder="merchant.admin@company.com"
                  className="pl-9"
                  disabled={data.isEmailVerified}
                />
              </div>
            </div>

            <div className="shrink-0">
              {data.isEmailVerified ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateStepData("step1", { isEmailVerified: false })}
                  className="w-full sm:w-auto text-xs text-muted-foreground"
                >
                  Change Email
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenEmailOtp}
                  disabled={!data.email || !data.email.includes("@")}
                  className="w-full sm:w-auto font-medium"
                >
                  <ShieldCheck className="mr-1.5 size-4" />
                  Verify Email OTP
                </Button>
              )}
            </div>
          </div>

          {stepErrors["email"] && (
            <p className="text-xs font-medium text-destructive">{stepErrors["email"]}</p>
          )}
          {stepErrors["isEmailVerified"] && !data.isEmailVerified && (
            <p className="text-xs font-medium text-destructive">
              {stepErrors["isEmailVerified"]}
            </p>
          )}
        </div>

        {/* Mobile Phone Number & Verification */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Official Mobile Number <span className="text-destructive">*</span>
                </Label>
                <VerificationBadge
                  status={data.isPhoneVerified}
                  label={data.isPhoneVerified ? "Mobile Verified" : "Verification Required"}
                  size="sm"
                />
              </div>
              <div className="relative flex">
                <div className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground font-medium">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  value={data.phone}
                  onChange={(e) =>
                    updateStepData("step1", {
                      phone: formatPhoneNumber(e.target.value),
                      isPhoneVerified: false,
                    })
                  }
                  placeholder="98765 43210"
                  className="rounded-l-none"
                  disabled={data.isPhoneVerified}
                />
              </div>
            </div>

            <div className="shrink-0">
              {data.isPhoneVerified ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateStepData("step1", { isPhoneVerified: false })}
                  className="w-full sm:w-auto text-xs text-muted-foreground"
                >
                  Change Mobile
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenPhoneOtp}
                  disabled={!data.phone || data.phone.length < 10}
                  className="w-full sm:w-auto font-medium"
                >
                  <ShieldCheck className="mr-1.5 size-4" />
                  Verify Mobile OTP
                </Button>
              )}
            </div>
          </div>

          {stepErrors["phone"] && (
            <p className="text-xs font-medium text-destructive">{stepErrors["phone"]}</p>
          )}
          {stepErrors["isPhoneVerified"] && !data.isPhoneVerified && (
            <p className="text-xs font-medium text-destructive">
              {stepErrors["isPhoneVerified"]}
            </p>
          )}
        </div>

        {/* Password & Security Credentials */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="size-4 text-primary" />
            Security & Login Credentials
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">
                Account Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => updateStepData("step1", { password: e.target.value })}
                  placeholder="••••••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {stepErrors["password"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["password"]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={data.confirmPassword}
                  onChange={(e) =>
                    updateStepData("step1", { confirmPassword: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {stepErrors["confirmPassword"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["confirmPassword"]}
                </p>
              )}
            </div>
          </div>

          {/* Password Requirements Checklist */}
          {data.password && (
            <div className="space-y-2 pt-1 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Password strength:</span>
                <span className="font-semibold text-foreground">
                  {passwordScore <= 2 ? "Weak" : passwordScore <= 4 ? "Good" : "Strong"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`rounded-full transition-colors ${
                      passwordScore >= lvl
                        ? passwordScore <= 2
                          ? "bg-warning"
                          : passwordScore <= 4
                          ? "bg-info"
                          : "bg-success"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground pt-1">
                <span className={data.password.length >= 8 ? "text-success flex items-center font-medium" : ""}>
                  <Check className="size-3 mr-1 inline" /> At least 8 characters
                </span>
                <span className={/[A-Z]/.test(data.password) ? "text-success flex items-center font-medium" : ""}>
                  <Check className="size-3 mr-1 inline" /> 1 Uppercase letter
                </span>
                <span className={/[0-9]/.test(data.password) ? "text-success flex items-center font-medium" : ""}>
                  <Check className="size-3 mr-1 inline" /> 1 Number
                </span>
                <span className={/[^A-Za-z0-9]/.test(data.password) ? "text-success flex items-center font-medium" : ""}>
                  <Check className="size-3 mr-1 inline" /> 1 Special character
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Terms of Service Acceptance */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2 shadow-2xs">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreeToTerms"
              checked={data.agreeToTerms}
              onCheckedChange={(checked) =>
                updateStepData("step1", { agreeToTerms: checked === true })
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="agreeToTerms"
                className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <span className="font-semibold text-primary underline underline-offset-2">
                  RTTMT Merchant Agreement
                </span>
                ,{" "}
                <span className="font-semibold text-primary underline underline-offset-2">
                  Terms of Service
                </span>
                , and{" "}
                <span className="font-semibold text-primary underline underline-offset-2">
                  Privacy Policy
                </span>
                . I acknowledge that RTTMT operates automated transaction threat monitoring and AML compliance screening.
              </Label>
            </div>
          </div>
          {stepErrors["agreeToTerms"] && (
            <p className="text-xs font-medium text-destructive">{stepErrors["agreeToTerms"]}</p>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      <OtpVerificationDialog
        isOpen={otpModalState.isOpen}
        onClose={() =>
          setOtpModalState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        type={otpModalState.type}
        target={otpModalState.target}
        onSuccess={() => {
          if (otpModalState.type === "EMAIL") {
            updateStepData("step1", { isEmailVerified: true });
          } else {
            updateStepData("step1", { isPhoneVerified: true });
          }
        }}
      />
    </div>
  );
}
