"use client";

import React from "react";
import { IdCard, FileCheck, MapPin, CheckCircle2 } from "lucide-react";
import { DocumentUploadBox } from "../../common/DocumentUploadBox";
import { Step5KYCData, UploadedDocument } from "../../../types";

export const AADHAAR_SLOTS = [
  {
    id: "front" as const,
    sideBadge: "Front Side",
    label: "Aadhaar Card Front",
  },
  {
    id: "back" as const,
    sideBadge: "Back Side",
    label: "Aadhaar Card Back",
  },
];

interface SignatoryDocumentUploadsProps {
  data: Step5KYCData;
  isIdentityUploadsComplete: boolean;
  identityUploadedCount: number;
  isAddressUploadsComplete: boolean;
  onIdentityFileChange: (slotId: "front" | "back", doc?: UploadedDocument) => void;
  onAddressFileChange: (doc?: UploadedDocument) => void;
  stepErrors: Record<string, string>;
}

export function SignatoryDocumentUploads({
  data,
  isIdentityUploadsComplete,
  identityUploadedCount,
  isAddressUploadsComplete,
  onIdentityFileChange,
  onAddressFileChange,
  stepErrors,
}: SignatoryDocumentUploadsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <IdCard className="size-4 text-primary" />
          Signatory KYC Document Uploads
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Upload clear, readable copies of valid identity and residential address
          documents. PDF, PNG, JPG, or WEBP up to 5MB.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Identity Proof Document Section (Aadhaar Card only) */}
        <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="size-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Identity Proof (Aadhaar Card) <span className="text-destructive">*</span>
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isIdentityUploadsComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                  <CheckCircle2 className="size-3" />
                  Complete
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border shrink-0">
                  {identityUploadedCount} of {AADHAAR_SLOTS.length} uploaded
                </span>
              )}
            </div>
          </div>

          {/* Aadhaar Upload Slots: Front & Back */}
          <div className="grid gap-4 sm:grid-cols-2">
            {AADHAAR_SLOTS.map((slot) => {
              const currentDoc =
                data.identityProofFiles?.[slot.id] ||
                (slot.id === "front" ? data.identityProofDocument : undefined);
              const slotError =
                stepErrors[`identityProof_${slot.id}`] ||
                (slot.id === "front" ? stepErrors["identityProofDocument"] : undefined);

              return (
                <DocumentUploadBox
                  key={`identity-aadhaar-${slot.id}`}
                  label={slot.label}
                  sideBadge={slot.sideBadge}
                  required
                  documentType={`AADHAAR_${slot.id.toUpperCase()}`}
                  document={currentDoc}
                  onDocumentChange={(doc) => onIdentityFileChange(slot.id, doc)}
                  error={slotError}
                />
              );
            })}
          </div>
        </div>

        {/* Card 2: Address Proof Document Section (Electricity / Utility Bill only) */}
        <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Address Proof (Electricity / Utility Bill){" "}
                <span className="text-destructive">*</span>
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAddressUploadsComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                  <CheckCircle2 className="size-3" />
                  Complete
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border shrink-0">
                  0 of 1 uploaded
                </span>
              )}
            </div>
          </div>

          {/* Single Utility Bill Upload Slot */}
          <div className="grid gap-4 sm:grid-cols-1">
            <DocumentUploadBox
              label="Electricity / Utility Bill"
              sideBadge="Latest Bill"
              required
              documentType="UTILITY_BILL"
              document={
                data.addressProofFiles?.front || data.addressProofDocument
              }
              onDocumentChange={onAddressFileChange}
              error={
                stepErrors["addressProof_front"] ||
                stepErrors["addressProofDocument"]
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
