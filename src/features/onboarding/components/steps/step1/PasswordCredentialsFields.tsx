"use client";

import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Step1AccountData } from "../../../types";

interface PasswordCredentialsFieldsProps {
  data: Step1AccountData;
  onUpdate: (updates: Partial<Step1AccountData>) => void;
  stepErrors: Record<string, string>;
}

export function PasswordCredentialsFields({
  data,
  onUpdate,
  stepErrors,
}: PasswordCredentialsFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => onUpdate({ password: e.target.value })}
              placeholder="••••••••••••"
              className="pr-10 h-9.5 text-sm"
              aria-invalid={Boolean(stepErrors["password"])}
              aria-describedby={stepErrors["password"] ? "password-error" : undefined}
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
            <p id="password-error" role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["password"]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={data.confirmPassword}
              onChange={(e) => onUpdate({ confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="pr-10 h-9.5 text-sm"
              aria-invalid={Boolean(stepErrors["confirmPassword"])}
              aria-describedby={stepErrors["confirmPassword"] ? "confirmPassword-error" : undefined}
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
            <p
              id="confirmPassword-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors["confirmPassword"]}
            </p>
          )}
        </div>
      </div>

      {/* Password Strength Indicator */}
      {data.password && (
        <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Password Strength</span>
            <span
              className={cn(
                "font-semibold",
                passwordScore <= 2 && "text-destructive",
                passwordScore === 3 && "text-amber-500",
                passwordScore === 4 && "text-blue-500",
                passwordScore === 5 && "text-emerald-500"
              )}
            >
              {passwordScore <= 2 && "Weak"}
              {passwordScore === 3 && "Fair"}
              {passwordScore === 4 && "Good"}
              {passwordScore === 5 && "Strong"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-full flex-1 transition-all duration-300",
                  i <= passwordScore
                    ? passwordScore <= 2
                      ? "bg-destructive"
                      : passwordScore === 3
                        ? "bg-amber-500"
                        : passwordScore === 4
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                    : "bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          {/* Rules Checklist */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
            {passwordRules.map((rule, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] transition-colors",
                  rule.valid
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex size-3.5 items-center justify-center rounded-full text-[9px]",
                    rule.valid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {rule.valid ? <Check className="size-2.5" /> : "•"}
                </div>
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
