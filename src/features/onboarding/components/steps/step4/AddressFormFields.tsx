"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_STATES } from "../../../mocks/options";
import { formatPostalCode } from "../../../utils/formatters";
import { AddressDetails } from "../../../types";

interface AddressFormFieldsProps {
  prefix: "registeredAddress" | "operatingAddress";
  fieldIdPrefix: "reg" | "op";
  title: string;
  icon: LucideIcon;
  address: AddressDetails;
  onChange: (field: keyof AddressDetails, value: string) => void;
  stepErrors: Record<string, string>;
  line1Placeholder?: string;
  line2Placeholder?: string;
  landmarkPlaceholder?: string;
}

export function AddressFormFields({
  prefix,
  fieldIdPrefix,
  title,
  icon: Icon,
  address,
  onChange,
  stepErrors,
  line1Placeholder = "Unit, building, premises",
  line2Placeholder = "Street, area, locality",
  landmarkPlaceholder = "Nearby landmark (optional)",
}: AddressFormFieldsProps) {
  const line1Key = `${prefix}.line1`;
  const cityKey = `${prefix}.city`;
  const stateKey = `${prefix}.state`;
  const postalCodeKey = `${prefix}.postalCode`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {/* Address Line 1 */}
        <div className="space-y-1.5">
          <Label htmlFor={`${fieldIdPrefix}Line1`}>
            Address Line 1 (Premises / Building / Flat) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${fieldIdPrefix}Line1`}
            value={address.line1 || ""}
            onChange={(e) => onChange("line1", e.target.value)}
            placeholder={line1Placeholder}
            aria-invalid={Boolean(stepErrors[line1Key])}
            aria-describedby={stepErrors[line1Key] ? `${fieldIdPrefix}Line1-error` : undefined}
          />
          {stepErrors[line1Key] && (
            <p
              id={`${fieldIdPrefix}Line1-error`}
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors[line1Key]}
            </p>
          )}
        </div>

        {/* Address Line 2 & Landmark */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}Line2`}>Address Line 2 (Street / Area)</Label>
            <Input
              id={`${fieldIdPrefix}Line2`}
              value={address.line2 || ""}
              onChange={(e) => onChange("line2", e.target.value)}
              placeholder={line2Placeholder}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}Landmark`}>Landmark (Optional)</Label>
            <Input
              id={`${fieldIdPrefix}Landmark`}
              value={address.landmark || ""}
              onChange={(e) => onChange("landmark", e.target.value)}
              placeholder={landmarkPlaceholder}
            />
          </div>
        </div>

        {/* City, State, PIN Code */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}City`}>
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${fieldIdPrefix}City`}
              value={address.city || ""}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="e.g. Mumbai"
              aria-invalid={Boolean(stepErrors[cityKey])}
              aria-describedby={stepErrors[cityKey] ? `${fieldIdPrefix}City-error` : undefined}
            />
            {stepErrors[cityKey] && (
              <p
                id={`${fieldIdPrefix}City-error`}
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {stepErrors[cityKey]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}State`}>
              State / Union Territory <span className="text-destructive">*</span>
            </Label>
            <Select
              value={address.state || ""}
              onValueChange={(val) => onChange("state", val || "")}
            >
              <SelectTrigger
                id={`${fieldIdPrefix}State`}
                className="w-full"
                aria-invalid={Boolean(stepErrors[stateKey])}
                aria-describedby={stepErrors[stateKey] ? `${fieldIdPrefix}State-error` : undefined}
              >
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {INDIAN_STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stepErrors[stateKey] && (
              <p
                id={`${fieldIdPrefix}State-error`}
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {stepErrors[stateKey]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}PostalCode`}>
              PIN Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${fieldIdPrefix}PostalCode`}
              maxLength={6}
              inputMode="numeric"
              value={address.postalCode || ""}
              onChange={(e) => onChange("postalCode", formatPostalCode(e.target.value))}
              placeholder="e.g. 400013"
              aria-invalid={Boolean(stepErrors[postalCodeKey])}
              aria-describedby={
                stepErrors[postalCodeKey] ? `${fieldIdPrefix}PostalCode-error` : undefined
              }
            />
            {stepErrors[postalCodeKey] && (
              <p
                id={`${fieldIdPrefix}PostalCode-error`}
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {stepErrors[postalCodeKey]}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
