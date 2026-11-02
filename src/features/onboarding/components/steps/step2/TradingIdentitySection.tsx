"use client";

import React, { useMemo, useEffect } from "react";
import { Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS_CATEGORIES } from "../../../mocks/options";
import { Step2BusinessProfileData } from "../../../types";

interface TradingIdentitySectionProps {
  data: Step2BusinessProfileData;
  onUpdate: (updates: Partial<Step2BusinessProfileData>) => void;
  stepErrors: Record<string, string>;
}

export function TradingIdentitySection({
  data,
  onUpdate,
  stepErrors,
}: TradingIdentitySectionProps) {
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
        onUpdate({ subCategory: "" });
      }
    }
  }, [data.businessCategory, data.subCategory, availableSubcategories, onUpdate]);

  return (
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
          onChange={(e) => onUpdate({ brandName: e.target.value })}
          placeholder="e.g. RTTMT Pay, SwiftCart, NexaCloud"
          aria-invalid={Boolean(stepErrors["brandName"])}
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
              onUpdate({
                businessCategory: val || "",
                subCategory: "", // reset subcategory on category change
              });
            }}
          >
            <SelectTrigger
              id="businessCategory"
              className="w-full"
              aria-invalid={Boolean(stepErrors["businessCategory"])}
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
            onValueChange={(val) => onUpdate({ subCategory: val || "" })}
            disabled={!data.businessCategory}
          >
            <SelectTrigger
              id="subCategory"
              className="w-full"
              aria-invalid={Boolean(stepErrors["subCategory"])}
              aria-describedby={stepErrors["subCategory"] ? "subCategory-error" : undefined}
            >
              <SelectValue
                placeholder={
                  data.businessCategory ? "Select subcategory / MCC" : "Select category first"
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
  );
}
