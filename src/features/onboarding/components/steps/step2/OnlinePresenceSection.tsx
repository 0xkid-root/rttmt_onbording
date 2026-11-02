"use client";

import React from "react";
import { Globe, Smartphone, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateAndNormalizeWebUrl } from "../../../utils/formatters";
import { Step2BusinessProfileData } from "../../../types";

interface OnlinePresenceSectionProps {
  data: Step2BusinessProfileData;
  onUpdate: (updates: Partial<Step2BusinessProfileData>) => void;
  stepErrors: Record<string, string>;
}

export function OnlinePresenceSection({
  data,
  onUpdate,
  stepErrors,
}: OnlinePresenceSectionProps) {
  const handleWebsiteBlur = () => {
    if (!data.websiteUrl || !data.websiteUrl.trim()) return;
    const res = validateAndNormalizeWebUrl(data.websiteUrl);
    if (res.isValid && res.normalizedUrl) {
      onUpdate({ websiteUrl: res.normalizedUrl });
    }
  };

  const handleMobileAppBlur = () => {
    if (!data.mobileAppUrl || !data.mobileAppUrl.trim()) return;
    const res = validateAndNormalizeWebUrl(data.mobileAppUrl);
    if (res.isValid && res.normalizedUrl) {
      onUpdate({ mobileAppUrl: res.normalizedUrl });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Globe className="size-4 text-primary" />
        Digital Presence & Customer Touchpoints
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="websiteUrl">
            Website URL <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="websiteUrl"
              type="url"
              value={data.websiteUrl}
              onChange={(e) => onUpdate({ websiteUrl: e.target.value })}
              onBlur={handleWebsiteBlur}
              placeholder="https://yourdomain.com"
              className="pl-9"
              aria-invalid={Boolean(stepErrors["websiteUrl"])}
              aria-describedby={stepErrors["websiteUrl"] ? "websiteUrl-error" : undefined}
            />
          </div>
          {stepErrors["websiteUrl"] && (
            <p id="websiteUrl-error" className="text-xs font-medium text-destructive" role="alert">
              {stepErrors["websiteUrl"]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobileAppUrl">Mobile App URL (Optional)</Label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="mobileAppUrl"
              type="url"
              value={data.mobileAppUrl || ""}
              onChange={(e) => onUpdate({ mobileAppUrl: e.target.value })}
              onBlur={handleMobileAppBlur}
              placeholder="https://play.google.com/store/apps/..."
              className="pl-9"
              aria-invalid={Boolean(stepErrors["mobileAppUrl"])}
              aria-describedby={stepErrors["mobileAppUrl"] ? "mobileAppUrl-error" : undefined}
            />
          </div>
          {stepErrors["mobileAppUrl"] && (
            <p id="mobileAppUrl-error" className="text-xs font-medium text-destructive" role="alert">
              {stepErrors["mobileAppUrl"]}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="businessDescription" className="flex items-center gap-1.5">
          <FileText className="size-3.5 text-muted-foreground" />
          Detailed Business & Product Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="businessDescription"
          rows={3}
          maxLength={1000}
          value={data.businessDescription}
          onChange={(e) =>
            onUpdate({ businessDescription: e.target.value.slice(0, 1000) })
          }
          placeholder="Describe the nature of products, software, or services sold, delivery timelines, pricing model, and customer fulfillment flow..."
          aria-invalid={Boolean(stepErrors["businessDescription"])}
          aria-describedby={
            stepErrors["businessDescription"]
              ? "businessDescription-error businessDescription-count"
              : "businessDescription-count"
          }
        />
        <div
          id="businessDescription-count"
          className="flex justify-between text-[11px] text-muted-foreground"
          aria-live="polite"
        >
          <span>{data.businessDescription.length} / 1000</span>
        </div>
        {stepErrors["businessDescription"] && (
          <p
            id="businessDescription-error"
            className="text-xs font-medium text-destructive"
            role="alert"
          >
            {stepErrors["businessDescription"]}
          </p>
        )}
      </div>
    </div>
  );
}
