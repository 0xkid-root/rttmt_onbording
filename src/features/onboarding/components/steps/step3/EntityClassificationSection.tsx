"use client";

import React from "react";
import { Building2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_TYPE_OPTIONS } from "../../../mocks/options";
import { Step3CompanyDetailsData, BusinessEntityType } from "../../../types";

interface EntityClassificationSectionProps {
  data: Step3CompanyDetailsData;
  onUpdate: (updates: Partial<Step3CompanyDetailsData>) => void;
  stepErrors: Record<string, string>;
  maxDate: string;
}

export function EntityClassificationSection({
  data,
  onUpdate,
  stepErrors,
  maxDate,
}: EntityClassificationSectionProps) {
  const currentEntityConfig = ENTITY_TYPE_OPTIONS.find(
    (e) => e.value === data.entityType
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
      {/* Business Constitution / Entity Type */}
      <div className="space-y-1.5">
        <Label htmlFor="entityType" className="text-sm font-semibold">
          Business Constitution / Entity Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.entityType}
          onValueChange={(val) => {
            if (val && val !== data.entityType) {
              onUpdate({
                entityType: val as BusinessEntityType,
                registrationNumber: "",
              });
            }
          }}
        >
          <SelectTrigger
            id="entityType"
            className="w-full"
            aria-invalid={Boolean(stepErrors["entityType"])}
            aria-describedby={stepErrors["entityType"] ? "entityType-error" : undefined}
          >
            <SelectValue placeholder="Select business constitution" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex flex-col text-left py-0.5">
                  <span className="font-semibold text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {stepErrors["entityType"] && (
          <p id="entityType-error" role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["entityType"]}
          </p>
        )}
      </div>

      {/* Legal Name */}
      <div className="space-y-1.5">
        <Label htmlFor="legalEntityName">
          Legal Entity Name (As per PAN / Registry) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="legalEntityName"
            value={data.legalEntityName}
            onChange={(e) => onUpdate({ legalEntityName: e.target.value })}
            placeholder="e.g. Acme Technologies Private Limited"
            className="pl-9"
            aria-invalid={Boolean(stepErrors["legalEntityName"])}
            aria-describedby={stepErrors["legalEntityName"] ? "legalEntityName-error" : undefined}
          />
        </div>
        {stepErrors["legalEntityName"] && (
          <p id="legalEntityName-error" role="alert" className="text-xs font-medium text-destructive">
            {stepErrors["legalEntityName"]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Incorporation Date */}
        <div className="space-y-1.5">
          <Label htmlFor="incorporationDate">
            Date of Incorporation / Registration <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="incorporationDate"
              type="date"
              max={maxDate}
              value={data.incorporationDate}
              onChange={(e) => onUpdate({ incorporationDate: e.target.value })}
              className="pl-9"
              aria-invalid={Boolean(stepErrors["incorporationDate"])}
              aria-describedby={stepErrors["incorporationDate"] ? "incorporationDate-error" : undefined}
            />
          </div>
          {stepErrors["incorporationDate"] && (
            <p id="incorporationDate-error" role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["incorporationDate"]}
            </p>
          )}
        </div>

        {/* Corporate / Entity Registration Identifier */}
        <div className="space-y-1.5">
          <Label htmlFor="registrationNumber">
            {currentEntityConfig?.cinLabel || "Registration Identifier"}{" "}
            {currentEntityConfig?.isRequiredRegistration ? (
              <span className="text-destructive">*</span>
            ) : (
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            )}
          </Label>
          <Input
            id="registrationNumber"
            value={data.registrationNumber || ""}
            onChange={(e) =>
              onUpdate({ registrationNumber: e.target.value.toUpperCase() })
            }
            placeholder={currentEntityConfig?.placeholder || "Enter registration identifier"}
            className="font-mono text-sm uppercase"
            aria-invalid={Boolean(stepErrors["registrationNumber"])}
            aria-describedby={
              stepErrors["registrationNumber"] ? "registrationNumber-error" : undefined
            }
          />
          {stepErrors["registrationNumber"] && (
            <p id="registrationNumber-error" role="alert" className="text-xs font-medium text-destructive">
              {stepErrors["registrationNumber"]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
