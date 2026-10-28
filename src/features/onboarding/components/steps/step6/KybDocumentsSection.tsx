"use client";

import React from "react";
import { Building2, FileText, CreditCard, CheckCircle2 } from "lucide-react";
import { DocumentUploadBox } from "../../common/DocumentUploadBox";
import { KybDocumentSpec, KybDocumentField } from "../../../config/kybDocuments";
import { Step6KYBData, UploadedDocument } from "../../../types";
import { GstExemptionDeclaration } from "./GstExemptionDeclaration";

interface KybDocumentsSectionProps {
  data: Step6KYBData;
  registrationDocs: KybDocumentSpec[];
  constitutionalDocs: KybDocumentSpec[];
  taxDocs: KybDocumentSpec[];
  docStatus: {
    isComplete: boolean;
    sections: {
      registration: { isComplete: boolean; uploadedRequired: number; totalRequired: number };
      constitutional: { isComplete: boolean; uploadedRequired: number; totalRequired: number };
      tax: { isComplete: boolean; uploadedRequired: number; totalRequired: number };
    };
  };
  hasGstInStep3: boolean;
  isGstExempt: boolean;
  step3Gstin?: string;
  onDocChange: (field: KybDocumentField, doc?: UploadedDocument) => void;
  onToggleGstExempt: (exempt: boolean) => void;
  stepErrors: Record<string, string>;
}

export function KybDocumentsSection({
  data,
  registrationDocs,
  constitutionalDocs,
  taxDocs,
  docStatus,
  hasGstInStep3,
  isGstExempt,
  step3Gstin,
  onDocChange,
  onToggleGstExempt,
  stepErrors,
}: KybDocumentsSectionProps) {
  return (
    <>
      {/* SECTION 1: Business Registration Documents */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="size-4 text-primary" />
            1. Business Registration Documents
          </h3>
          {docStatus.sections.registration.isComplete ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="size-3" />
              Uploaded
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border shrink-0">
              {docStatus.sections.registration.totalRequired > 1
                ? `${docStatus.sections.registration.uploadedRequired} of ${docStatus.sections.registration.totalRequired} uploaded`
                : "Required"}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 items-stretch">
          {registrationDocs.map((spec) => (
            <DocumentUploadBox
              key={spec.field}
              label={spec.label}
              sideBadge={spec.sideBadge}
              required={spec.required}
              documentType={spec.documentType}
              document={data[spec.field]}
              onDocumentChange={(doc) => onDocChange(spec.field, doc)}
              error={stepErrors[spec.field]}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: Constitutional and Authorization Documents */}
      {constitutionalDocs.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              2. Constitutional and Authorization Documents
            </h3>
            {docStatus.sections.constitutional.isComplete ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="size-3" />
                Uploaded
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border shrink-0">
                {docStatus.sections.constitutional.uploadedRequired} of{" "}
                {docStatus.sections.constitutional.totalRequired} uploaded
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 items-stretch">
            {constitutionalDocs.map((spec) => (
              <DocumentUploadBox
                key={spec.field}
                label={spec.label}
                sideBadge={spec.sideBadge}
                required={spec.required}
                documentType={spec.documentType}
                document={data[spec.field]}
                onDocumentChange={(doc) => onDocChange(spec.field, doc)}
                error={stepErrors[spec.field]}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Company Tax Documents */}
      {taxDocs.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CreditCard className="size-4 text-primary" />
              3. Company Tax Documents
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              <GstExemptionDeclaration
                hasGstInStep3={hasGstInStep3}
                gstin={step3Gstin}
                isGstExempt={isGstExempt}
                onToggleGstExempt={onToggleGstExempt}
              />

              {docStatus.sections.tax.isComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="size-3" />
                  Uploaded
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border shrink-0">
                  {docStatus.sections.tax.uploadedRequired} of{" "}
                  {docStatus.sections.tax.totalRequired} uploaded
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 items-stretch">
            {taxDocs.map((spec) => (
              <DocumentUploadBox
                key={spec.field}
                label={spec.label}
                sideBadge={spec.sideBadge}
                required={spec.required}
                documentType={spec.documentType}
                document={data[spec.field]}
                onDocumentChange={(doc) => onDocChange(spec.field, doc)}
                error={stepErrors[spec.field]}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
