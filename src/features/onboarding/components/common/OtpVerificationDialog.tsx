"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_OTP_CODE, verifyEmailOtp, verifyPhoneOtp } from "../../services/otpService";

interface OtpVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "EMAIL" | "PHONE";
  target: string;
  onSuccess: () => void;
}

export function OtpVerificationDialog({
  isOpen,
  onClose,
  type,
  target,
  onSuccess,
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setOtp("");
        setErrorMessage(null);
        setCountdown(30);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setErrorMessage("Please enter all 6 digits of the OTP code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result =
        type === "EMAIL"
          ? await verifyEmailOtp(target, otp)
          : await verifyPhoneOtp(target, otp);

      if (result.verified) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFillDemo = () => {
    setOtp(DEMO_OTP_CODE);
    setErrorMessage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <ShieldCheck className="size-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Verify {type === "EMAIL" ? "Email Address" : "Mobile Number"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to{" "}
            <span className="font-semibold text-foreground">{target}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Demo Hint Banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span>
              Simulated sandbox OTP code is <strong className="font-mono text-sm text-primary">{DEMO_OTP_CODE}</strong>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleFillDemo}
            className="h-6 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            Auto-Fill Demo
          </Button>
        </div>

        {/* OTP Input */}
        <div className="space-y-3 py-2">
          <div className="flex justify-center">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setOtp(val);
                setErrorMessage(null);
              }}
              placeholder="• • • • • •"
              className="h-12 w-48 text-center font-mono text-2xl tracking-[0.5em] font-semibold"
              autoFocus
            />
          </div>

          {errorMessage && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-destructive font-medium">
              <AlertCircle className="size-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            {countdown > 0 ? (
              <span>Resend code in <strong className="text-foreground">{countdown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={() => setCountdown(30)}
                className="text-primary hover:underline font-medium"
              >
                Resend OTP Code
              </button>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={otp.length < 6 || isVerifying}
            className="font-medium"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Verify & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
