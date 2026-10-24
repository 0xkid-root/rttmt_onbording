"use client";

import React, { useState, useMemo } from "react";
import { Mail, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { OtpVerificationDialog } from "../common/OtpVerificationDialog";
import { VerificationBadge } from "../common/VerificationBadge";
import { formatPhoneNumber } from "../../utils/formatters";
import { cn } from "@/lib/utils";

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

  // Detailed password rules matching schema requirements
  const passwordRules = useMemo(() => {
    const pwd = data.password || "";
    return [
      { label: "At least 8 characters", valid: pwd.length >= 8 },
      { label: "One uppercase letter", valid: /[A-Z]/.test(pwd) },
      { label: "One lowercase letter", valid: /[a-z]/.test(pwd) },
      { label: "One number", valid: /[0-9]/.test(pwd) },
      { label: "One special character", valid: /[^A-Za-z0-9]/.test(pwd) },
    ];
  }, [data.password]);

  const passwordScore = useMemo(() => {
    return passwordRules.filter((r) => r.valid).length;
  }, [passwordRules]);

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
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Create Your Account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify your contact details and set a password.
        </p>
      </div>

      {/* Form Fields Container */}
      <div className="space-y-4">
        {/* Row 1 — Work Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Work Email
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
                  updateStepData("step1", {
                    email: e.target.value,
                    isEmailVerified: false,
                  })
                }
                placeholder="merchant.admin@company.com"
                className="pl-9 h-9.5 text-sm"
                disabled={data.isEmailVerified}
              />
            </div>
            {data.isEmailVerified ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateStepData("step1", { isEmailVerified: false })}
                className="h-9.5 px-3.5 text-xs text-muted-foreground shrink-0"
              >
                Change Email
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleOpenEmailOtp}
                disabled={!data.email || !data.email.includes("@")}
                className="h-9.5 px-4 font-medium shrink-0"
              >
                <ShieldCheck className="mr-1.5 size-4" />
                Verify Email
              </Button>
            )}
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

        {/* Row 2 — Mobile Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Mobile Number
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
                  updateStepData("step1", {
                    phone: formatPhoneNumber(e.target.value),
                    isPhoneVerified: false,
                  })
                }
                placeholder="98765 43210"
                className="rounded-l-none h-9.5 text-sm"
                disabled={data.isPhoneVerified}
              />
            </div>
            {data.isPhoneVerified ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateStepData("step1", { isPhoneVerified: false })}
                className="h-9.5 px-3.5 text-xs text-muted-foreground shrink-0"
              >
                Change Mobile
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleOpenPhoneOtp}
                disabled={!data.phone || data.phone.length < 10}
                className="h-9.5 px-4 font-medium shrink-0"
              >
                <ShieldCheck className="mr-1.5 size-4" />
                Verify Mobile
              </Button>
            )}
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

        {/* Row 3 — Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => updateStepData("step1", { password: e.target.value })}
                placeholder="••••••••••••"
                className="pr-10 h-9.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {stepErrors["password"] && (
              <p className="text-xs font-medium text-destructive">{stepErrors["password"]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm Password
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
                className="pr-10 h-9.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

        {/* Row 4 — Password Strength & Requirements */}
        <div className="space-y-2 pt-0.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Password strength:</span>
            <span
              className={cn(
                "font-semibold",
                !data.password
                  ? "text-muted-foreground"
                  : passwordScore <= 2
                  ? "text-warning"
                  : "text-success"
              )}
            >
              {!data.password
                ? "Not entered"
                : passwordScore <= 2
                ? "Weak"
                : passwordScore <= 4
                ? "Good"
                : "Strong"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={cn(
                  "rounded-full transition-colors",
                  passwordScore >= lvl
                    ? passwordScore <= 2
                      ? "bg-warning"
                      : "bg-success"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 pt-0.5 text-[11px]">
            {passwordRules.map((rule) => (
              <span
                key={rule.label}
                className={cn(
                  "flex items-center transition-colors",
                  rule.valid ? "text-success font-medium" : "text-muted-foreground"
                )}
              >
                {rule.valid ? (
                  <Check className="mr-1.5 size-3.5 text-success shrink-0" />
                ) : (
                  <span className="mr-1.5 size-3.5 flex items-center justify-center text-muted-foreground/50 shrink-0 text-xs">
                    ○
                  </span>
                )}
                {rule.label}
              </span>
            ))}
          </div>
        </div>

        {/* Row 5 — Terms and Conditions */}
        <div className="pt-2">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="agreeToTerms"
              checked={data.agreeToTerms}
              onCheckedChange={(checked) =>
                updateStepData("step1", { agreeToTerms: checked === true })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="agreeToTerms"
              className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <span className="font-semibold text-foreground">
                Merchant Agreement
              </span>
              ,{" "}
              <span className="font-semibold text-foreground">
                Terms of Service
              </span>
              , and{" "}
              <span className="font-semibold text-foreground">
                Privacy Policy
              </span>
              .
            </Label>
          </div>
          {stepErrors["agreeToTerms"] && (
            <p className="text-xs font-medium text-destructive mt-1.5">
              {stepErrors["agreeToTerms"]}
            </p>
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
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
