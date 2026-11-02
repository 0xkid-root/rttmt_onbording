"use client";

import React from "react";
import { Layers, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHLY_VOLUME_TIERS } from "../../../mocks/options";
import { Step2BusinessProfileData } from "../../../types";

interface OperationsProfileSectionProps {
  data: Step2BusinessProfileData;
  onUpdate: (updates: Partial<Step2BusinessProfileData>) => void;
  stepErrors: Record<string, string>;
}

export function OperationsProfileSection({
  data,
  onUpdate,
  stepErrors,
}: OperationsProfileSectionProps) {
  return (
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
            onValueChange={(val) => onUpdate({ expectedMonthlyVolume: val || "" })}
          >
            <SelectTrigger
              id="expectedMonthlyVolume"
              className="w-full"
              aria-invalid={Boolean(stepErrors["expectedMonthlyVolume"])}
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
                onUpdate({
                  averageTransactionValue: e.target.value,
                })
              }
              placeholder="e.g. 2500"
              className="pl-9"
              aria-invalid={Boolean(stepErrors["averageTransactionValue"])}
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
  );
}
