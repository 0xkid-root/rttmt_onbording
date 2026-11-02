"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { OtpVerificationDialog } from "../common/OtpVerificationDialog";
import { Step1AccountData } from "../../types";
import { ContactVerificationFields } from "./step1/ContactVerificationFields";
import { PasswordCredentialsFields } from "./step1/PasswordCredentialsFields";

export function Step1AccountVerification() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step1;

  const [otpModalState, setOtpModalState] = useState<{
    isOpen: boolean;
    type: "EMAIL" | "PHONE";
    target: string;
  }>({
    isOpen: false,
    type: "EMAIL",
    target: "",
  });

  const handleUpdate = (updates: Partial<Step1AccountData>) => {
    updateStepData("step1", updates);
  };

  const handleOpenEmailOtp = () => {
    if (!data.email || !data.email.includes("@")) return;
    setOtpModalState({
      isOpen: true,
      type: "EMAIL",
      target: data.email,
    });
  };

  const handleOpenPhoneOtp = () => {
    if (!data.phone || data.phone.length < 10) return;
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
        {/* Contact Information (Email & Phone Verification) */}
        <ContactVerificationFields
          data={data}
          onUpdate={handleUpdate}
          onOpenEmailOtp={handleOpenEmailOtp}
          onOpenPhoneOtp={handleOpenPhoneOtp}
          stepErrors={stepErrors}
        />

        {/* Credentials & Password Strength */}
        <PasswordCredentialsFields
          data={data}
          onUpdate={handleUpdate}
          stepErrors={stepErrors}
        />

        {/* Terms and Conditions */}
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
            <p className="text-xs font-medium text-destructive mt-1.5" role="alert">
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
