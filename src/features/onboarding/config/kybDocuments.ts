import { BusinessEntityType, Step6KYBData } from "../types";

export type KybDocCategory = "registration" | "constitutional" | "tax";

export type KybDocumentField =
  | "businessRegistrationDoc"
  | "constitutionalDoc"
  | "boardResolutionDoc"
  | "companyPanDoc"
  | "gstCertificateDoc";

export interface KybDocumentSpec {
  field: KybDocumentField;
  category: KybDocCategory;
  label: string;
  sideBadge: string;
  description?: string;
  required: boolean;
  documentType: string;
  isConditional?: boolean;
  conditionalNote?: string;
}

export interface EntityKybConfig {
  entityType: BusinessEntityType;
  entityLabel: string;
  uboThresholdPercent: number;
  isUboApplicable: boolean;
  uboExplanation: string;
  documents: KybDocumentSpec[];
}

/**
 * Returns the entity-specific KYB document and UBO requirements.
 * Ensures Sole Proprietorships are not burdened with corporate documents,
 * and GST certificate upload logic respects the merchant's GST registration status.
 */
export function getEntityKybConfig(
  entityType: BusinessEntityType,
  hasGstRegistration: boolean = false,
  isGstExempt: boolean = false
): EntityKybConfig {
  // If registered under GST, REG-06 is required and cannot be bypassed through contradictory status
  const isGstRequired = Boolean(hasGstRegistration);
  const gstSideBadge = isGstRequired
    ? "Mandatory (GSTIN)"
    : isGstExempt
    ? "Optional (Exempt)"
    : "Optional (Below Threshold)";
  const gstConditionalNote = isGstRequired
    ? "Mandatory for GST-registered entities."
    : isGstExempt
    ? "Optional for entities with declared statutory exemption (Section 23 CGST Act)."
    : "Optional if turnover is below statutory registration threshold.";

  switch (entityType) {
    case "PRIVATE_LIMITED":
    case "PUBLIC_LIMITED": {
      const isPublic = entityType === "PUBLIC_LIMITED";
      return {
        entityType,
        entityLabel: isPublic ? "Public Limited Company" : "Private Limited Company (Pvt Ltd)",
        uboThresholdPercent: 10,
        isUboApplicable: true,
        uboExplanation:
          "Under RBI & PMLA compliance guidelines, natural persons holding ≥ 10% equity voting rights or exercising effective controlling interest must be declared.",
        documents: [
          // 1. Business Registration
          {
            field: "businessRegistrationDoc",
            category: "registration",
            label: "Certificate of Incorporation (COI)",
            sideBadge: "MCA / ROC",
            required: true,
            documentType: "COI",
          },
          // 2. Constitutional & Authorization
          {
            field: "constitutionalDoc",
            category: "constitutional",
            label: "Memorandum & Articles (MOA / AOA)",
            sideBadge: "Statutory Charter",
            required: true,
            documentType: "MOA_AOA",
          },
          {
            field: "boardResolutionDoc",
            category: "constitutional",
            label: isPublic
              ? "Board Resolution with Authorized Director List"
              : "Board Resolution for Authorized Signatory",
            sideBadge: "Board Certified",
            required: true,
            documentType: "BOARD_RESOLUTION",
          },
          // 3. Tax Documents
          {
            field: "companyPanDoc",
            category: "tax",
            label: "Company Permanent Account Number (PAN)",
            sideBadge: "Entity PAN",
            required: true,
            documentType: "COMPANY_PAN",
          },
          {
            field: "gstCertificateDoc",
            category: "tax",
            label: "GST Registration Certificate (REG-06)",
            sideBadge: gstSideBadge,
            required: isGstRequired,
            isConditional: true,
            conditionalNote: gstConditionalNote,
            documentType: "GST_CERTIFICATE",
          },
        ],
      };
    }

    case "LLP":
      return {
        entityType,
        entityLabel: "Limited Liability Partnership (LLP)",
        uboThresholdPercent: 15,
        isUboApplicable: true,
        uboExplanation:
          "Under PMLA rules for LLPs, natural persons entitled to ≥ 15% of capital or profit shares, or exercising executive control as designated partners, must be declared.",
        documents: [
          // 1. Business Registration
          {
            field: "businessRegistrationDoc",
            category: "registration",
            label: "LLP Incorporation / Registration Certificate",
            sideBadge: "MCA / ROC",
            required: true,
            documentType: "LLP_COI",
          },
          // 2. Constitutional & Authorization
          {
            field: "constitutionalDoc",
            category: "constitutional",
            label: "Registered LLP Agreement & Amendments",
            sideBadge: "LLP Agreement",
            required: true,
            documentType: "LLP_AGREEMENT",
          },
          {
            field: "boardResolutionDoc",
            category: "constitutional",
            label: "Designated Partners Authorization Resolution",
            sideBadge: "Partner Authority",
            required: true,
            documentType: "LLP_AUTHORIZATION",
          },
          // 3. Tax Documents
          {
            field: "companyPanDoc",
            category: "tax",
            label: "LLP Permanent Account Number (PAN) Card",
            sideBadge: "LLP PAN",
            required: true,
            documentType: "LLP_PAN",
          },
          {
            field: "gstCertificateDoc",
            category: "tax",
            label: "GST Registration Certificate (REG-06)",
            sideBadge: gstSideBadge,
            required: isGstRequired,
            isConditional: true,
            conditionalNote: gstConditionalNote,
            documentType: "GST_CERTIFICATE",
          },
        ],
      };

    case "PARTNERSHIP":
      return {
        entityType,
        entityLabel: "Partnership Firm",
        uboThresholdPercent: 15,
        isUboApplicable: true,
        uboExplanation:
          "Under PMLA rules for partnership firms, natural persons holding ≥ 15% share of capital or profits must be disclosed as beneficial owners.",
        documents: [
          // 1. Business Registration
          {
            field: "businessRegistrationDoc",
            category: "registration",
            label: "Registrar of Firms (RoF) Certificate / Trade Registry",
            sideBadge: "RoF Registry",
            required: true,
            documentType: "ROF_CERTIFICATE",
          },
          // 2. Constitutional & Authorization
          {
            field: "constitutionalDoc",
            category: "constitutional",
            label: "Registered Partnership Deed",
            sideBadge: "Firm Deed",
            required: true,
            documentType: "PARTNERSHIP_DEED",
          },
          {
            field: "boardResolutionDoc",
            category: "constitutional",
            label: "Partners Authority Letter / Power of Attorney",
            sideBadge: "Partner Authority",
            required: true,
            documentType: "PARTNERSHIP_AUTHORIZATION",
          },
          // 3. Tax Documents
          {
            field: "companyPanDoc",
            category: "tax",
            label: "Partnership Firm PAN Card Copy",
            sideBadge: "Firm PAN",
            required: true,
            documentType: "FIRM_PAN",
          },
          {
            field: "gstCertificateDoc",
            category: "tax",
            label: "GST Registration Certificate (REG-06)",
            sideBadge: gstSideBadge,
            required: isGstRequired,
            isConditional: true,
            conditionalNote: gstConditionalNote,
            documentType: "GST_CERTIFICATE",
          },
        ],
      };

    case "SOLE_PROPRIETORSHIP":
      return {
        entityType,
        entityLabel: "Sole Proprietorship",
        uboThresholdPercent: 100,
        isUboApplicable: false,
        uboExplanation:
          "Sole Proprietorship has 100% indivisible individual ownership. The verified signatory in Step 5 KYC represents the sole beneficial owner.",
        documents: [
          // 1. Business Registration
          {
            field: "businessRegistrationDoc",
            category: "registration",
            label: "MSME Udyam Registration or Shop & Establishment License",
            sideBadge: "Trade License / Udyam",
            required: true,
            documentType: "PROPRIETORSHIP_REG_DOC",
          },
          // 2. Authorization / Authority Declaration
          {
            field: "boardResolutionDoc",
            category: "constitutional",
            label: "Proprietor Business Existence Declaration",
            sideBadge: "Proprietor Letterhead",
            required: true,
            documentType: "PROPRIETOR_DECLARATION",
          },
          // 3. Tax Documents (No separate company PAN — uses Personal PAN; GST conditional)
          {
            field: "gstCertificateDoc",
            category: "tax",
            label: "GST Registration Certificate (REG-06)",
            sideBadge: gstSideBadge,
            required: isGstRequired,
            isConditional: true,
            conditionalNote: gstConditionalNote,
            documentType: "GST_CERTIFICATE",
          },
        ],
      };

    case "TRUST_NGO":
    default:
      return {
        entityType,
        entityLabel: "Trust / Society / Section 8 NGO",
        uboThresholdPercent: 10,
        isUboApplicable: true,
        uboExplanation:
          "Authors, trustees, and individuals exercising ultimate effective control over the trust or society assets must be disclosed.",
        documents: [
          // 1. Business Registration
          {
            field: "businessRegistrationDoc",
            category: "registration",
            label: "Registered Trust Deed / Society Registration Certificate",
            sideBadge: "Charity Commissioner",
            required: true,
            documentType: "TRUST_DEED_OR_REG",
          },
          // 2. Constitutional & Authorization
          {
            field: "constitutionalDoc",
            category: "constitutional",
            label: "Trust Bylaws / Society Rules & Regulations",
            sideBadge: "Bylaws",
            required: true,
            documentType: "TRUST_BYLAWS",
          },
          {
            field: "boardResolutionDoc",
            category: "constitutional",
            label: "Trustees Resolution for Authorized Signatory",
            sideBadge: "Trustee Authority",
            required: true,
            documentType: "TRUSTEE_RESOLUTION",
          },
          // 3. Tax Documents
          {
            field: "companyPanDoc",
            category: "tax",
            label: "Entity PAN Card Copy",
            sideBadge: "Entity PAN",
            required: true,
            documentType: "TRUST_PAN",
          },
          {
            field: "gstCertificateDoc",
            category: "tax",
            label: "12A / 80G Certificate or GST Certificate",
            sideBadge: "Tax Exemption / Proof",
            required: false,
            isConditional: true,
            conditionalNote: "Optional if applicable.",
            documentType: "TRUST_TAX_PROOF",
          },
        ],
      };
  }
}

export interface SectionCompletionStats {
  totalRequired: number;
  uploadedRequired: number;
  isComplete: boolean;
}

export interface KybDocumentCompletionResult {
  isComplete: boolean;
  totalRequired: number;
  uploadedRequired: number;
  missingFields: KybDocumentField[];
  missingLabels: string[];
  sections: {
    registration: SectionCompletionStats;
    constitutional: SectionCompletionStats;
    tax: SectionCompletionStats;
  };
}

/**
 * Checks whether all required documents for an entity are uploaded in Step6KYBData.
 * Returns overall and section-level completion stats.
 */
export function areRequiredKybDocsUploaded(
  data: Step6KYBData,
  hasGstRegistration: boolean = false,
  isGstExempt: boolean = false
): KybDocumentCompletionResult {
  const config = getEntityKybConfig(data.entityType, hasGstRegistration, isGstExempt);
  const requiredDocs = config.documents.filter((d) => d.required);

  const missingFields: KybDocumentField[] = [];
  const missingLabels: string[] = [];

  const sections: KybDocumentCompletionResult["sections"] = {
    registration: { totalRequired: 0, uploadedRequired: 0, isComplete: true },
    constitutional: { totalRequired: 0, uploadedRequired: 0, isComplete: true },
    tax: { totalRequired: 0, uploadedRequired: 0, isComplete: true },
  };

  // Populate section totals
  for (const doc of config.documents) {
    if (doc.required) {
      sections[doc.category].totalRequired++;
      const isUploaded = Boolean(data[doc.field]?.id);
      if (isUploaded) {
        sections[doc.category].uploadedRequired++;
      } else {
        missingFields.push(doc.field);
        missingLabels.push(doc.label);
      }
    }
  }

  // Calculate isComplete flags per section
  for (const cat of ["registration", "constitutional", "tax"] as const) {
    sections[cat].isComplete =
      sections[cat].totalRequired === 0 ||
      sections[cat].uploadedRequired === sections[cat].totalRequired;
  }

  const totalRequired = requiredDocs.length;
  const uploadedRequired = totalRequired - missingFields.length;

  return {
    isComplete: missingFields.length === 0,
    totalRequired,
    uploadedRequired,
    missingFields,
    missingLabels,
    sections,
  };
}
