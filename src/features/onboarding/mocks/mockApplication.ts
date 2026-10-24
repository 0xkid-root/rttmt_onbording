import { ApplicationSubmissionRecord } from "../types";
import { SAMPLE_DEMO_FORM_DATA } from "./initialData";

export const SAMPLE_SUBMITTED_APPLICATION: ApplicationSubmissionRecord = {
  referenceId: "RTTMT-APP-2026-94812",
  applicationStatus: "UNDER_REVIEW",
  submittedAt: new Date().toISOString(),
  merchantName: "RTTMT Pay",
  legalEntityName: "RTTMT Technologies Private Limited",
  entityType: "PRIVATE_LIMITED",
  contactEmail: "compliance@rttmt.com",
  contactPhone: "+91 9876543210",
  formData: SAMPLE_DEMO_FORM_DATA,
  timeline: [
    {
      id: "demo-step-received",
      event: "Application Received (Demo)",
      description: "Merchant onboarding application packet received and logged into RTTMT demonstration intake queue.",
      timestamp: "Today, 10:30 AM",
      status: "COMPLETED",
    },
    {
      id: "demo-step-format",
      event: "Format & Structure Validation (Simulated)",
      description: "Simulated PAN-GSTIN format consistency check and business identity syntax validation.",
      timestamp: "Today, 10:32 AM",
      status: "COMPLETED",
    },
    {
      id: "demo-step-intake",
      event: "Document Intake Verification (Demo)",
      description: "Document checklist completeness and file integrity verified for demonstration evaluation.",
      timestamp: "Today, 10:35 AM",
      status: "COMPLETED",
    },
    {
      id: "demo-step-settlement",
      event: "Settlement Account Structure Validation (Simulated)",
      description: "Simulated IFSC directory routing check and account number format verification.",
      timestamp: "Today, 10:36 AM",
      status: "COMPLETED",
    },
    {
      id: "demo-step-compliance",
      event: "Compliance Review & Risk Profiling (Demo)",
      description: "Simulated risk tier assessment and merchant profile evaluation in progress.",
      timestamp: "In Progress (Estimated: 1–2 business days)",
      status: "CURRENT",
    },
    {
      id: "demo-step-approval",
      event: "Final Merchant Approval & Credential Issuance",
      description: "Pending simulated underwriting sign-off, demo MID activation, and sandbox API key provisioning.",
      timestamp: "Pending",
      status: "PENDING",
    },
  ],
};
