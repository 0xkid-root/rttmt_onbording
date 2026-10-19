import { ApplicationSubmissionRecord } from "../types";
import { SAMPLE_DEMO_FORM_DATA } from "./initialData";

export const SAMPLE_SUBMITTED_APPLICATION: ApplicationSubmissionRecord = {
  referenceId: "RTMT-APP-2026-94812",
  applicationStatus: "UNDER_REVIEW",
  submittedAt: new Date().toISOString(),
  merchantName: "Aura Pay",
  legalEntityName: "Aura FinTech Technologies Private Limited",
  entityType: "PRIVATE_LIMITED",
  contactEmail: "compliance@aurafintech.io",
  contactPhone: "+91 9876543210",
  formData: SAMPLE_DEMO_FORM_DATA,
  timeline: [
    {
      event: "Application Submitted",
      description: "Merchant onboarding application received and logged into RTMT intake pipeline.",
      timestamp: "Today, 10:30 AM",
      status: "COMPLETED",
    },
    {
      event: "Automated Data Validation & Registry Checks",
      description: "MCA company registry, MCA CIN validation, and PAN-GSTIN matching completed successfully.",
      timestamp: "Today, 10:32 AM",
      status: "COMPLETED",
    },
    {
      event: "Document Forensic & OCR Verification",
      description: "Automated tamper-detection, Aadhaar/Passport OCR, and signature verification.",
      timestamp: "Today, 10:35 AM",
      status: "COMPLETED",
    },
    {
      event: "Penny-Drop Bank Account Verification",
      description: "Automated NPCI / IMPS ₹1.00 reverse penny-drop verification confirmed active account holder name match.",
      timestamp: "Today, 10:36 AM",
      status: "COMPLETED",
    },
    {
      event: "Underwriting & Risk Scoring Analysis",
      description: "RTMT ML risk-scoring model assessing transaction patterns, website compliance, and merchant risk profile.",
      timestamp: "In Progress (Estimated SLA: ~2 hours)",
      status: "CURRENT",
    },
    {
      event: "Final Merchant Approval & API Key Provisioning",
      description: "Issuance of live MID, merchant portal activation credentials, and API secret keys.",
      timestamp: "Pending",
      status: "PENDING",
    },
  ],
};
