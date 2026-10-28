"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface RestrictedBusinessDeclarationProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function RestrictedBusinessDeclaration({
  checked,
  onCheckedChange,
  error,
}: RestrictedBusinessDeclarationProps) {
  return (
    <div
      className={`rounded-lg border p-3.5 transition-colors space-y-1.5 ${
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-muted/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id="restrictedBusinessDeclaration"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          className="mt-0.5"
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? "restrictedBusinessDeclaration-error" : undefined
          }
        />
        <div className="space-y-1">
          <Label
            htmlFor="restrictedBusinessDeclaration"
            className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert className="size-3.5 text-warning shrink-0" />
            Prohibited & Restricted Merchant Activity Declaration{" "}
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            We affirm that our business does not engage in, facilitate, or settle
            transactions for prohibited goods or services.
          </p>
        </div>
      </div>
      {error && (
        <p
          id="restrictedBusinessDeclaration-error"
          role="alert"
          className="text-xs font-medium text-destructive pl-7"
        >
          {error}
        </p>
      )}
    </div>
  );
}
