import React from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  ApplicationSubmissionRecord,
  ApplicationStatus,
  BusinessEntityType,
} from "../types";

export const ENTITY_TYPE_LABELS: Record<BusinessEntityType, string> = {
  PRIVATE_LIMITED: "Private Limited Company (Pvt Ltd)",
  PUBLIC_LIMITED: "Public Limited Company",
  LLP: "Limited Liability Partnership (LLP)",
  PARTNERSHIP: "Partnership Firm",
  SOLE_PROPRIETORSHIP: "Sole Proprietorship",
  TRUST_NGO: "Trust / Non-Profit / NGO",
};

export interface StatusConfig {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
  summaryMessage: string;
}

export interface ComputedTimelineStep {
  id: string;
  event: string;
  description: string;
  displayStatus: "COMPLETED" | "CURRENT" | "ACTION_REQUIRED" | "FAILED" | "PENDING";
  displayTimestamp: string;
}

/**
 * Validates that candidate application data conforms safely to the ApplicationSubmissionRecord schema.
 * Rejects corrupt or incomplete objects to avoid runtime exceptions.
 */
export function isValidApplicationRecord(
  record: unknown
): record is ApplicationSubmissionRecord {
  if (!record || typeof record !== "object") return false;
  const candidate = record as Partial<ApplicationSubmissionRecord>;
  return (
    typeof candidate.referenceId === "string" &&
    candidate.referenceId.trim().length > 0 &&
    typeof candidate.submittedAt === "string" &&
    typeof candidate.formData === "object" &&
    candidate.formData !== null
  );
}

/**
 * Returns consistent visual status configuration for all supported ApplicationStatus states.
 * No animated clock or spinner icons are used for terminal or static badges.
 */
export function getApplicationStatusConfig(
  status: ApplicationStatus | string,
  isDemo: boolean
): StatusConfig {
  const suffix = isDemo ? " (Demo)" : "";
  switch (status) {
    case "APPROVED":
      return {
        label: `Approved${suffix}`,
        badgeClass:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
        icon: React.createElement(CheckCircle2, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "Your merchant application has been approved. Live payment settlement capabilities and sandbox API credentials are ready.",
      };
    case "ACTION_REQUIRED":
      return {
        label: `Action Required${suffix}`,
        badgeClass:
          "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold",
        icon: React.createElement(AlertCircle, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "Clarification or updated business documentation is required by our underwriting team to proceed with review.",
      };
    case "REJECTED":
      return {
        label: `Rejected${suffix}`,
        badgeClass:
          "border-destructive/30 bg-destructive/10 text-destructive font-semibold",
        icon: React.createElement(XCircle, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "This application could not be approved based on our simulated underwriting parameters.",
      };
    case "IN_SCRUTINY":
      return {
        label: `In Scrutiny${suffix}`,
        badgeClass:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold",
        icon: React.createElement(Clock, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "Your file is undergoing enhanced document audit and compliance verification in our simulated queue.",
      };
    case "SUBMITTED":
      return {
        label: `Submitted${suffix}`,
        badgeClass:
          "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold",
        icon: React.createElement(CheckCircle2, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "Your merchant onboarding application packet has been received and logged into our queue.",
      };
    case "DRAFT":
      return {
        label: `Draft Incomplete${suffix}`,
        badgeClass:
          "border-border bg-muted/40 text-muted-foreground font-semibold",
        icon: React.createElement(FileText, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "Application packet has not been formally submitted yet. You can resume and complete the remaining steps.",
      };
    case "UNDER_REVIEW":
    default:
      return {
        label: `Under Review${suffix}`,
        badgeClass:
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
        icon: React.createElement(Clock, {
          className: "mr-1.5 size-3.5 shrink-0",
          "aria-hidden": "true",
        }),
        summaryMessage:
          "Your application has been received and is queued for underwriting verification.",
      };
  }
}
