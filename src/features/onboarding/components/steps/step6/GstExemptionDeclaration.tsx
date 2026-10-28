"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GstExemptionDeclarationProps {
  hasGstInStep3: boolean;
  gstin?: string;
  isGstExempt: boolean;
  onToggleGstExempt: (exempt: boolean) => void;
}

export function GstExemptionDeclaration({
  hasGstInStep3,
  gstin,
  isGstExempt,
  onToggleGstExempt,
}: GstExemptionDeclarationProps) {
  return (
    <>
      {/* GST Status indicator badge */}
      {hasGstInStep3 ? (
        <span className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
          GSTIN: {gstin}
        </span>
      ) : isGstExempt ? (
        <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full">
          Statutory GST Exemption
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full">
          Unregistered (Below Threshold)
        </span>
      )}

      {/* Optional GST Exemption declaration for merchants without Step 3 GSTIN */}
      {!hasGstInStep3 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs w-full">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="gst-exemption-toggle"
              checked={isGstExempt}
              onCheckedChange={(checked) => onToggleGstExempt(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label
                htmlFor="gst-exemption-toggle"
                className="font-semibold text-foreground cursor-pointer block text-xs"
              >
                Declare Statutory GST Exemption (Supplies Exclusively Exempt Goods/Services)
              </Label>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Check this if the business operates exclusively in exempt categories under
                Section 23 of CGST Act. Otherwise, business is treated as unregistered below
                turnover threshold (₹40L goods / ₹20L services). In both cases, GST Certificate
                is optional and will not block verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
