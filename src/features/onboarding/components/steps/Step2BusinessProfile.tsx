"use client";

import React, { useMemo, useEffect } from "react";
import { Globe, Smartphone, IndianRupee, Layers, Briefcase, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { BUSINESS_CATEGORIES, MONTHLY_VOLUME_TIERS } from "../../mocks/options";
import { validateAndNormalizeWebUrl } from "../../utils/formatters";

export function Step2BusinessProfile() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step2;

  // Selected category's subcategories
  const availableSubcategories = useMemo(() => {
    if (!data.businessCategory) return [];
    const found = BUSINESS_CATEGORIES.find((c) => c.category === data.businessCategory);
    return found ? found.subcategories : [];
  }, [data.businessCategory]);

  // Ensure selected subcategory belongs to currently selected business category
  useEffect(() => {
    if (data.businessCategory && data.subCategory) {
      if (availableSubcategories.length > 0 && !availableSubcategories.includes(data.subCategory)) {
        updateStepData("step2", { subCategory: "" });
      }
    }
  }, [data.businessCategory, data.subCategory, availableSubcategories, updateStepData]);

  const handleWebsiteBlur = () => {
    if (!data.websiteUrl || !data.websiteUrl.trim()) return;
    const res = validateAndNormalizeWebUrl(data.websiteUrl);
    if (res.isValid && res.normalizedUrl) {
      updateStepData("step2", { websiteUrl: res.normalizedUrl });
    }
  };

  const handleMobileAppBlur = () => {
    if (!data.mobileAppUrl || !data.mobileAppUrl.trim()) return;
    const res = validateAndNormalizeWebUrl(data.mobileAppUrl);
    if (res.isValid && res.normalizedUrl) {
      updateStepData("step2", { mobileAppUrl: res.normalizedUrl });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Business & Operating Profile
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide your commercial trading identity, industry classification, and transaction volume forecasts.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Brand Name & Categorization */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Briefcase className="size-4 text-primary" />
            Trading Identity & Categorization
          </h3>

          <div className="space-y-1.5">
            <Label htmlFor="brandName">
              Business / Brand / Operating Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brandName"
              value={data.brandName}
              onChange={(e) => updateStepData("step2", { brandName: e.target.value })}
              placeholder="e.g. RTTMT Pay, SwiftCart, NexaCloud"
              aria-invalid={!!stepErrors["brandName"]}
              aria-describedby={stepErrors["brandName"] ? "brandName-error" : undefined}
            />

            {stepErrors["brandName"] && (
              <p id="brandName-error" className="text-xs font-medium text-destructive" role="alert">
                {stepErrors["brandName"]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="businessCategory">
                Business Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.businessCategory}
                onValueChange={(val) => {
                  updateStepData("step2", {
                    businessCategory: val || "",
                    subCategory: "", // reset subcategory on change
                  });
                }}
              >
                <SelectTrigger
                  id="businessCategory"
                  className="w-full"
                  aria-invalid={!!stepErrors["businessCategory"]}
                  aria-describedby={
                    stepErrors["businessCategory"] ? "businessCategory-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select primary industry" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepErrors["businessCategory"] && (
                <p id="businessCategory-error" className="text-xs font-medium text-destructive" role="alert">
                  {stepErrors["businessCategory"]}
                </p>
              )}
            </div>

            {/* Subcategory */}
            <div className="space-y-1.5">
              <Label htmlFor="subCategory">
                Industry Subcategory <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.subCategory}
                onValueChange={(val) => updateStepData("step2", { subCategory: val || "" })}
                disabled={!data.businessCategory}
              >
                <SelectTrigger
                  id="subCategory"
                  className="w-full"
                  aria-invalid={!!stepErrors["subCategory"]}
                  aria-describedby={
                    stepErrors["subCategory"] ? "subCategory-error" : undefined
                  }
                >
                  <SelectValue
                    placeholder={
                      data.businessCategory
                        ? "Select subcategory / MCC"
                        : "Select category first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepErrors["subCategory"] && (
                <p id="subCategory-error" className="text-xs font-medium text-destructive" role="alert">
                  {stepErrors["subCategory"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Digital Presence: Website & Mobile App */}
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
                  onChange={(e) => updateStepData("step2", { websiteUrl: e.target.value })}
                  onBlur={handleWebsiteBlur}
                  placeholder="https://yourdomain.com"
                  className="pl-9"
                  aria-invalid={!!stepErrors["websiteUrl"]}
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
                  onChange={(e) => updateStepData("step2", { mobileAppUrl: e.target.value })}
                  onBlur={handleMobileAppBlur}
                  placeholder="https://play.google.com/store/apps/..."
                  className="pl-9"
                  aria-invalid={!!stepErrors["mobileAppUrl"]}
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
                updateStepData("step2", { businessDescription: e.target.value.slice(0, 1000) })
              }
              placeholder="Describe the nature of products, software, or services sold, delivery timelines, pricing model, and customer fulfillment flow..."
              aria-invalid={!!stepErrors["businessDescription"]}
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

        {/* Financial Metrics & Processing Projections */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Layers className="size-4 text-primary" />
            Transaction Velocity & Volume Forecast
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Monthly Volume */}
            <div className="space-y-1.5">
              <Label htmlFor="expectedMonthlyVolume">
                Expected Monthly Volume <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.expectedMonthlyVolume}
                onValueChange={(val) =>
                  updateStepData("step2", { expectedMonthlyVolume: val || "" })
                }
              >
                <SelectTrigger
                  id="expectedMonthlyVolume"
                  className="w-full"
                  aria-invalid={!!stepErrors["expectedMonthlyVolume"]}
                  aria-describedby={
                    stepErrors["expectedMonthlyVolume"]
                      ? "expectedMonthlyVolume-error"
                      : undefined
                  }
                >
                  <SelectValue placeholder="Select anticipated monthly tier" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHLY_VOLUME_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepErrors["expectedMonthlyVolume"] && (
                <p
                  id="expectedMonthlyVolume-error"
                  className="text-xs font-medium text-destructive"
                  role="alert"
                >
                  {stepErrors["expectedMonthlyVolume"]}
                </p>
              )}
            </div>

            {/* Average Transaction Value (ATV) */}
            <div className="space-y-1.5">
              <Label htmlFor="averageTransactionValue">
                Average Transaction Value (ATV in ₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="averageTransactionValue"
                  type="number"
                  min={1}
                  step={1}
                  value={data.averageTransactionValue}
                  onChange={(e) =>
                    updateStepData("step2", {
                      averageTransactionValue: e.target.value,
                    })
                  }
                  placeholder="e.g. 2500"
                  className="pl-9"
                  aria-invalid={!!stepErrors["averageTransactionValue"]}
                  aria-describedby={
                    stepErrors["averageTransactionValue"]
                      ? "averageTransactionValue-error averageTransactionValue-desc"
                      : "averageTransactionValue-desc"
                  }
                />
              </div>
              <p id="averageTransactionValue-desc" className="text-[11px] text-muted-foreground">
                Average ticket size per successful payment order.
              </p>
              {stepErrors["averageTransactionValue"] && (
                <p
                  id="averageTransactionValue-error"
                  className="text-xs font-medium text-destructive"
                  role="alert"
                >
                  {stepErrors["averageTransactionValue"]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
