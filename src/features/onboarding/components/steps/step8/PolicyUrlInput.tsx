"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateAndNormalizeWebUrl } from "../../../utils/formatters";

interface PolicyUrlInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  onBlur: (val: string) => void;
  placeholder: string;
  errorMessage?: string;
  isRequired?: boolean;
}

export function PolicyUrlInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  errorMessage,
  isRequired = true,
}: PolicyUrlInputProps) {
  const validation = validateAndNormalizeWebUrl(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs sm:text-sm">
          {label} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {value && validation.isValid && validation.normalizedUrl && (
          <a
            href={validation.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Open link in new tab"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <Input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
      />
      {errorMessage && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
