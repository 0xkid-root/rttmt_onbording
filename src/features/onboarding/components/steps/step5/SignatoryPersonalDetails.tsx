"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from "../../../utils/formatters";
import { Step5KYCData } from "../../../types";

interface SignatoryPersonalDetailsProps {
  signatoryName: string;
  designation: string;
  signatoryEmail: string;
  signatoryPhone: string;
  roleLabel: string;
  onFieldChange: (updates: Partial<Step5KYCData>) => void;
  stepErrors: Record<string, string>;
}

export function SignatoryPersonalDetails({
  signatoryName,
  designation,
  signatoryEmail,
  signatoryPhone,
  roleLabel,
  onFieldChange,
  stepErrors,
}: SignatoryPersonalDetailsProps) {
  return (
    <>
      {/* Row 1 — Two columns: Full Legal Name & Designation */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="signatoryName">
            Full Legal Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signatoryName"
            value={signatoryName}
            onChange={(e) => onFieldChange({ signatoryName: e.target.value })}
            placeholder="e.g. Aditya Vikram Rao"
            aria-invalid={Boolean(stepErrors["signatoryName"])}
            aria-describedby={
              stepErrors["signatoryName"] ? "signatoryName-error" : undefined
            }
          />
          {stepErrors["signatoryName"] && (
            <p
              id="signatoryName-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors["signatoryName"]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="designation">
            Designation / Position in Entity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="designation"
            value={designation}
            onChange={(e) => onFieldChange({ designation: e.target.value })}
            placeholder={`e.g. ${roleLabel}`}
            aria-invalid={Boolean(stepErrors["designation"])}
            aria-describedby={
              stepErrors["designation"] ? "designation-error" : undefined
            }
          />
          {stepErrors["designation"] && (
            <p
              id="designation-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors["designation"]}
            </p>
          )}
        </div>
      </div>

      {/* Official Email & Direct Mobile */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="signatoryEmail">
            Signatory Official Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signatoryEmail"
              type="email"
              value={signatoryEmail}
              onChange={(e) => onFieldChange({ signatoryEmail: e.target.value })}
              placeholder="signatory@company.com"
              className="pl-9"
              aria-invalid={Boolean(stepErrors["signatoryEmail"])}
              aria-describedby={
                stepErrors["signatoryEmail"] ? "signatoryEmail-error" : undefined
              }
            />
          </div>
          {stepErrors["signatoryEmail"] && (
            <p
              id="signatoryEmail-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors["signatoryEmail"]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signatoryPhone">
            Signatory Direct Mobile <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signatoryPhone"
              maxLength={10}
              inputMode="numeric"
              value={signatoryPhone}
              onChange={(e) =>
                onFieldChange({
                  signatoryPhone: formatPhoneNumber(e.target.value),
                })
              }
              placeholder="98765 43210"
              className="pl-9"
              aria-invalid={Boolean(stepErrors["signatoryPhone"])}
              aria-describedby={
                stepErrors["signatoryPhone"] ? "signatoryPhone-error" : undefined
              }
            />
          </div>
          {stepErrors["signatoryPhone"] && (
            <p
              id="signatoryPhone-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {stepErrors["signatoryPhone"]}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
