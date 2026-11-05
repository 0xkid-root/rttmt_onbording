"use client";

import React from "react";
import { IdCard, CheckCircle2 } from "lucide-react";
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
  isPanDocUploaded: boolean;
  isIdentityUploadsComplete: boolean;
  identityUploadedCount: number;
  isAddressUploadsComplete: boolean;
  onPanFileChange: (doc?: UploadedDocument) => void;
  onIdentityFileChange: (slotId: "front" | "back", doc?: UploadedDocument) => void;
  onAddressFileChange: (doc?: UploadedDocument) => void;
  stepErrors: Record<string, string>;
}

export function SignatoryDocumentUploads({
  data,
  isPanDocUploaded,
  identityUploadedCount,
  isAddressUploadsComplete,
  onPanFileChange,
  onIdentityFileChange,
  onAddressFileChange,
  stepErrors,
}: SignatoryDocumentUploadsProps) {
  const totalUploaded =
    identityUploadedCount +
    (isPanDocUploaded ? 1 : 0) +
    (isAddressUploadsComplete ? 1 : 0);
  const isAllComplete = totalUploaded === 4;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-5">
      {/* Unified Section Header with Progress Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <IdCard className="size-4 text-primary" />
            Signatory KYC Document Uploads
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload clear copies of identity, tax, and residential address documents. PDF, PNG, JPG, or WEBP up to 5MB.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAllComplete ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
              <CheckCircle2 className="size-3" />
              All Documents Uploaded
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border shrink-0">
              {totalUploaded} of 4 uploaded
            </span>
          )}
        </div>
      </div>

      {/* Balanced 2x2 Document Upload Grid */}
      <div className="grid gap-4 sm:grid-cols-2 items-stretch">
        {/* Slot 1: Aadhaar Card Front */}
        <DocumentUploadBox
          label="Aadhaar Card Front"
          sideBadge="Front Side"
          required
          documentType="AADHAAR_FRONT"
          document={
            data.identityProofFiles?.front || data.identityProofDocument
          }
          onDocumentChange={(doc) => onIdentityFileChange("front", doc)}
          error={
            stepErrors["identityProof_front"] ||
            stepErrors["identityProofDocument"]
          }
        />

        {/* Slot 2: Aadhaar Card Back */}
        <DocumentUploadBox
          label="Aadhaar Card Back"
          sideBadge="Back Side"
          required
          documentType="AADHAAR_BACK"
          document={data.identityProofFiles?.back}
          onDocumentChange={(doc) => onIdentityFileChange("back", doc)}
          error={stepErrors["identityProof_back"]}
        />

        {/* Slot 3: Signatory Personal PAN Card */}
        <DocumentUploadBox
          label="Signatory PAN Card (Front Copy)"
          sideBadge="Mandatory"
          required
          documentType="PERSONAL_PAN"
          document={data.panCardDocument}
          onDocumentChange={onPanFileChange}
          error={stepErrors["panCardDocument"]}
        />

        {/* Slot 4: Address Proof (Electricity / Utility Bill) */}
        <DocumentUploadBox
          label="Address Proof (Electricity / Utility Bill)"
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
  );
}
