"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationStatus } from "../../types";

interface VerificationBadgeProps {
  status: VerificationStatus | boolean;
  label?: string;
  size?: "sm" | "default";
}

export function VerificationBadge({
  status,
  label,
  size = "default",
}: VerificationBadgeProps) {
  const isVerified = status === true || status === "VERIFIED";
  const isPending = status === "PENDING";
  const isFailed = status === "FAILED";

  if (isVerified) {
    return (
      <Badge
        variant="outline"
        className={`border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium ${
          size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <CheckCircle2 className="mr-1 size-3.5 text-emerald-600 dark:text-emerald-400" />
        {label || "Verified"}
      </Badge>
    );
  }

  if (isPending) {
    return (
      <Badge
        variant="outline"
        className={`border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium ${
          size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <Clock className="mr-1 size-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
        {label || "Verifying..."}
      </Badge>
    );
  }

  if (isFailed) {
    return (
      <Badge
        variant="outline"
        className={`border-destructive/30 bg-destructive/10 text-destructive font-medium ${
          size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <AlertCircle className="mr-1 size-3.5" />
        {label || "Verification Failed"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`border-border bg-muted/50 text-muted-foreground font-medium ${
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      <ShieldCheck className="mr-1 size-3.5 text-muted-foreground/70" />
      {label || "Pending Verification"}
    </Badge>
  );
}
