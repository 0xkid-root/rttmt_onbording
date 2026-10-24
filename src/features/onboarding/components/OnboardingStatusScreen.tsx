"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  XCircle,
  Landmark,
  LogOut,
  Globe,
  MapPin,
  FileEdit,
  Printer,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ApplicationSubmissionRecord,
  ApplicationStatus,
  BusinessEntityType,
} from "../types";
import {
  getSubmittedApplication,
  saveDraftToStorage,
  clearDraftFromStorage,
} from "../services/storageService";
import { SAMPLE_SUBMITTED_APPLICATION } from "../mocks/mockApplication";
import { OnboardingHeader } from "./OnboardingHeader";
import {
  maskPan,
  maskBankAccount,
  formatGstinDisplay,
  formatSubmissionDateTime,
  formatTimelineTimestamp,
} from "../utils/formatters";

const ENTITY_TYPE_LABELS: Record<BusinessEntityType, string> = {
  PRIVATE_LIMITED: "Private Limited Company (Pvt Ltd)",
  PUBLIC_LIMITED: "Public Limited Company",
  LLP: "Limited Liability Partnership (LLP)",
  PARTNERSHIP: "Partnership Firm",
  SOLE_PROPRIETORSHIP: "Sole Proprietorship",
  TRUST_NGO: "Trust / Non-Profit / NGO",
};

interface StatusConfig {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
  summaryMessage: string;
}

/**
 * Validates that candidate application data conforms safely to the ApplicationSubmissionRecord schema.
 * Rejects corrupt or incomplete objects to avoid runtime exceptions.
 */
function isValidApplicationRecord(
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
function getApplicationStatusConfig(
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
        icon: <CheckCircle2 className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "Your merchant application has been approved. Live payment settlement capabilities and sandbox API credentials are ready.",
      };
    case "ACTION_REQUIRED":
      return {
        label: `Action Required${suffix}`,
        badgeClass:
          "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold",
        icon: <AlertCircle className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "Clarification or updated business documentation is required by our underwriting team to proceed with review.",
      };
    case "REJECTED":
      return {
        label: `Rejected${suffix}`,
        badgeClass:
          "border-destructive/30 bg-destructive/10 text-destructive font-semibold",
        icon: <XCircle className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "This application could not be approved based on our simulated underwriting parameters.",
      };
    case "IN_SCRUTINY":
      return {
        label: `In Scrutiny${suffix}`,
        badgeClass:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold",
        icon: <Clock className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "Your file is undergoing enhanced document audit and compliance verification in our simulated queue.",
      };
    case "SUBMITTED":
      return {
        label: `Submitted${suffix}`,
        badgeClass:
          "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold",
        icon: <CheckCircle2 className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "Your merchant onboarding application packet has been received and logged into our queue.",
      };
    case "DRAFT":
      return {
        label: `Draft Incomplete${suffix}`,
        badgeClass:
          "border-border bg-muted/40 text-muted-foreground font-semibold",
        icon: <FileText className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "Application packet has not been formally submitted yet. You can resume and complete the remaining steps.",
      };
    case "UNDER_REVIEW":
    default:
      return {
        label: `Under Review${suffix}`,
        badgeClass:
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
        icon: <Clock className="mr-1.5 size-3.5 shrink-0" aria-hidden="true" />,
        summaryMessage:
          "Your application has been received and is queued for underwriting verification.",
      };
  }
}

interface ComputedTimelineStep {
  id: string;
  event: string;
  description: string;
  displayStatus: "COMPLETED" | "CURRENT" | "ACTION_REQUIRED" | "FAILED" | "PENDING";
  displayTimestamp: string;
}

export function OnboardingStatusScreen() {
  const router = useRouter();

  const [application, setApplication] = useState<ApplicationSubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPanRevealed, setIsPanRevealed] = useState<boolean>(false);

  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe loading of saved application from persistent storage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = getSubmittedApplication();
        if (isValidApplicationRecord(saved)) {
          setApplication(saved);
          setIsDemoMode(false);
        } else {
          setApplication(null);
        }
      } catch (err) {
        console.warn("Failed to retrieve saved application from storage:", err);
        setApplication(null);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup copy feedback timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Asynchronous clipboard copy handler with fallback and accessibility
  const handleCopyRef = useCallback(async () => {
    if (!application?.referenceId) return;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(application.referenceId);
      } else {
        // Fallback for non-secure contexts or legacy browsers
        const textArea = document.createElement("textarea");
        textArea.value = application.referenceId;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.setAttribute("aria-hidden", "true");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error("execCommand copy returned false");
        }
      }

      setCopied(true);
      toast.success("Application Reference ID copied to clipboard");
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy Reference ID. Please select and copy manually.");
    }
  }, [application]);

  // Safe submission date formatting with IST timezone
  const formattedSubmissionDate = useMemo(() => {
    return formatSubmissionDateTime(application?.submittedAt);
  }, [application]);

  // Sensitive PAN masking (business PAN or signatory personal PAN fallback)
  const maskedPan = useMemo(() => {
    const rawPan =
      application?.formData?.step3?.panNumber ||
      application?.formData?.step5?.personalPan;
    return maskPan(rawPan, isPanRevealed);
  }, [application, isPanRevealed]);

  // Sensitive Settlement Bank Account masking (never exposes full number)
  const maskedAccountNumber = useMemo(() => {
    return maskBankAccount(application?.formData?.step7?.accountNumber);
  }, [application]);

  // Accurate GSTIN display logic (respects both Step 3 declaration and Step 6 exemption)
  const gstinDisplay = useMemo(() => {
    return formatGstinDisplay(
      application?.formData?.step3?.gstin,
      application?.formData?.step3?.hasNoGstDeclaration,
      application?.formData?.step6?.isGstExempt
    );
  }, [application]);

  // Status visual configuration
  const statusConfig = useMemo(() => {
    return getApplicationStatusConfig(
      application?.applicationStatus || "UNDER_REVIEW",
      isDemoMode
    );
  }, [application, isDemoMode]);

  // Computed timeline items keeping status badge and milestone steps consistent
  const computedTimeline = useMemo<ComputedTimelineStep[]>(() => {
    if (!application?.timeline || !Array.isArray(application.timeline)) {
      return [];
    }

    const appStatus = application.applicationStatus || "UNDER_REVIEW";

    return application.timeline.map((item, idx) => {
      const stableId =
        item.id ||
        `step-${idx}-${item.event.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

      if (appStatus === "APPROVED") {
        return {
          id: stableId,
          event: item.event,
          description: item.description,
          displayStatus: "COMPLETED",
          displayTimestamp:
            item.timestamp === "Pending"
              ? "Completed (Simulated)"
              : formatTimelineTimestamp(item.timestamp),
        };
      }

      if (appStatus === "REJECTED") {
        if (item.status === "CURRENT") {
          return {
            id: stableId,
            event: item.event,
            description: item.description,
            displayStatus: "FAILED",
            displayTimestamp: "Review Concluded (Not Approved)",
          };
        }
        if (item.status === "COMPLETED") {
          return {
            id: stableId,
            event: item.event,
            description: item.description,
            displayStatus: "COMPLETED",
            displayTimestamp: formatTimelineTimestamp(item.timestamp),
          };
        }
        return {
          id: stableId,
          event: item.event,
          description: item.description,
          displayStatus: "PENDING",
          displayTimestamp: "Cancelled",
        };
      }

      if (appStatus === "ACTION_REQUIRED") {
        if (item.status === "CURRENT") {
          return {
            id: stableId,
            event: item.event,
            description: item.description,
            displayStatus: "ACTION_REQUIRED",
            displayTimestamp: "Clarification Requested",
          };
        }
        if (item.status === "COMPLETED") {
          return {
            id: stableId,
            event: item.event,
            description: item.description,
            displayStatus: "COMPLETED",
            displayTimestamp: formatTimelineTimestamp(item.timestamp),
          };
        }
        return {
          id: stableId,
          event: item.event,
          description: item.description,
          displayStatus: "PENDING",
          displayTimestamp: formatTimelineTimestamp(item.timestamp),
        };
      }

      // UNDER_REVIEW, IN_SCRUTINY, SUBMITTED, DRAFT
      return {
        id: stableId,
        event: item.event,
        description: item.description,
        displayStatus: item.status,
        displayTimestamp: formatTimelineTimestamp(item.timestamp),
      };
    });
  }, [application]);

  // Operating address location string
  const operatingLocation = useMemo(() => {
    const addr =
      application?.formData?.step4?.operatingAddress ||
      application?.formData?.step4?.registeredAddress;
    if (!addr) return null;
    const parts = [addr.city, addr.state, addr.postalCode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [application]);

  // Navigation handlers
  const handleEditApplication = useCallback(() => {
    if (application?.formData) {
      saveDraftToStorage(application.formData, 9);
      toast.info("Application loaded into draft for revision.", {
        description: "You can modify your details in the wizard and resubmit.",
      });
    }
    router.push("/onboarding");
  }, [application, router]);

  const handleStartNewApplication = useCallback(() => {
    clearDraftFromStorage();
    router.push("/onboarding");
  }, [router]);

  const handleLoadDemoApplication = useCallback(() => {
    setApplication(SAMPLE_SUBMITTED_APPLICATION);
    setIsDemoMode(true);
    toast.info("Demonstration application record loaded.", {
      description: "Previewing sample merchant evaluation profile.",
    });
  }, []);

  const handleExitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    const saved = getSubmittedApplication();
    if (isValidApplicationRecord(saved)) {
      setApplication(saved);
      toast.info("Returned to your saved application.");
    } else {
      setApplication(null);
      toast.info("Exited demo preview mode.");
    }
  }, []);

  const handlePrintSummary = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  const handleDemoPdfDownload = useCallback(() => {
    toast.info("Demo Feature: Compiled Dossier PDF Export", {
      description:
        "Official compiled merchant dossier PDF export is simulated in this evaluation environment. Use 'Print Summary' to generate an actual PDF copy via browser print.",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <OnboardingHeader />
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <main
          role="status"
          aria-busy="true"
          className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6"
        >
          <span className="sr-only">Loading application status and verification timeline...</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-60" />
            <div className="space-y-4 pl-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
      )}

      {/* 2. Empty State (No Saved Application) */}
      {!isLoading && !application && (
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex flex-col justify-center items-center my-auto">
          <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center w-full space-y-5 shadow-xs">
            <div className="mx-auto size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FileText className="size-7 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-foreground">No Submitted Application Found</h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You have not submitted a merchant onboarding application in this browser session,
                or your previous submission was cleared. You can start a new onboarding application
                or preview a sample submission in demo mode.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto">
                  <ArrowLeft className="mr-1.5 size-3.5" /> Start Merchant Onboarding
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDemoApplication}
                className="w-full sm:w-auto"
              >
                <Sparkles className="mr-1.5 size-3.5 text-primary" /> View Demo Application
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* 3. Populated Application State */}
      {!isLoading && application && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6 print:p-0 print:space-y-4">
          {/* Top Breadcrumb & Status */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 print:hidden">
                <Link
                  href="/onboarding"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="size-3.5" /> Back to Onboarding
                </Link>
                {isDemoMode && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider py-0 px-2 font-mono">
                    Demo Mode Active
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1 print:text-xl">
                Application Status & Verification Timeline
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isDemoMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleExitDemoMode}
                  className="text-xs h-7 text-muted-foreground hover:text-foreground print:hidden"
                >
                  <LogOut className="mr-1 size-3" /> Exit Demo
                </Button>
              )}
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs ${statusConfig.badgeClass}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Interactive Demo Status Switcher (Visible in Demo Mode Only) */}
          {isDemoMode && (
            <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs flex flex-wrap items-center gap-2 print:hidden">
              <span className="font-semibold text-muted-foreground text-[11px] flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                Preview Simulated Status:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    "UNDER_REVIEW",
                    "IN_SCRUTINY",
                    "ACTION_REQUIRED",
                    "APPROVED",
                    "REJECTED",
                  ] as const
                ).map((st) => (
                  <Button
                    key={st}
                    type="button"
                    variant={application.applicationStatus === st ? "default" : "outline"}
                    size="xs"
                    onClick={() => {
                      setApplication((prev) =>
                        prev ? { ...prev, applicationStatus: st } : null
                      );
                      toast.info(`Simulated Status switched to ${st.replace(/_/g, " ")}`);
                    }}
                    className="h-6 text-[10px] px-2 py-0"
                  >
                    {st.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Reference ID & Honest Sandbox Notice Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 print:border-border print:bg-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Application Reference Identifier
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-primary print:text-lg">
                    {application.referenceId}
                  </span>
                  <div className="print:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyRef}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={
                        copied
                          ? "Application Reference ID copied to clipboard"
                          : "Copy Application Reference ID"
                      }
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  {/* Dedicated live region for screen readers */}
                  <span className="sr-only" role="status" aria-live="polite">
                    {copied ? `Reference ID ${application.referenceId} copied to clipboard.` : ""}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground sm:text-right">
                <span>Submitted On:</span>
                <p className="font-semibold text-foreground">{formattedSubmissionDate}</p>
              </div>
            </div>

            <div className="rounded-md border border-border/80 bg-background/80 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <span>
                  <strong>Sandbox Evaluation Notice:</strong> This merchant application was processed in RTTMT’s sandbox test environment. All automated checks, registry simulations, and KYC/KYB reviews are for demonstration and evaluation only. No real banking, regulatory, or external registry queries have run.
                </span>
                <p className="text-[11px] text-muted-foreground/90">
                  Notice: The application reference ID is a tracking reference only and does not grant authentication, authorization, or account access.
                </p>
              </div>
            </div>
          </div>

          {/* Status-Specific Notification Banners */}
          {application.applicationStatus === "ACTION_REQUIRED" && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Underwriting Action Required</strong>
                  <span>Our compliance review team requires additional clarification or document updates before progressing your application.</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditApplication}
                className="shrink-0 text-xs border-rose-500/30 hover:bg-rose-500/20 print:hidden"
              >
                <FileEdit className="mr-1.5 size-3.5" />
                Resolve Requirements
              </Button>
            </div>
          )}

          {application.applicationStatus === "REJECTED" && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5">
              <XCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Application Status: Not Approved</strong>
                <span>This application could not be approved based on our simulated underwriting policy criteria. You may submit a new application with updated business details.</span>
              </div>
            </div>
          )}

          {application.applicationStatus === "APPROVED" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Application Approved (Simulated)</strong>
                <span>All verification checks and simulated underwriting milestones have passed. Your merchant portal access and test MID are provisioned.</span>
              </div>
            </div>
          )}

          {application.applicationStatus === "IN_SCRUTINY" && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
              <Clock className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Enhanced Scrutiny Queue</strong>
                <span>Your application file is undergoing secondary compliance review and manual document verification in our simulated queue.</span>
              </div>
            </div>
          )}

          {/* Verification Timeline Stepper */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-7 space-y-5 print:border-border print:bg-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                Application Review Timeline (Demo)
              </h2>
              <span className="text-xs text-muted-foreground">
                Standard Review: 1–2 Business Days (Simulated)
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:bottom-2 before:left-[11px] sm:before:left-[15px] before:top-2 before:w-[2px] before:bg-border">
              {computedTimeline.map((step, idx) => {
                const isCompleted = step.displayStatus === "COMPLETED";
                const isFailed = step.displayStatus === "FAILED";
                const isActionReq = step.displayStatus === "ACTION_REQUIRED";
                const isCurrent = step.displayStatus === "CURRENT";

                return (
                  <div key={step.id} className="relative flex items-start gap-3">
                    {/* Status Dot with semantic icons and static indicators (no clock spin) */}
                    <div
                      className={`absolute -left-[30px] sm:-left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white dark:bg-emerald-500 ring-4 ring-emerald-500/15"
                          : isFailed
                          ? "bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
                          : isActionReq
                          ? "bg-rose-600 text-white ring-4 ring-rose-500/20"
                          : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      ) : isFailed ? (
                        <XCircle className="size-3.5" aria-hidden="true" />
                      ) : isActionReq ? (
                        <AlertCircle className="size-3.5" aria-hidden="true" />
                      ) : isCurrent ? (
                        <Clock className="size-3.5" aria-hidden="true" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3
                          className={`text-sm ${
                            isCompleted
                              ? "font-semibold text-foreground"
                              : isFailed
                              ? "font-semibold text-destructive"
                              : isActionReq
                              ? "font-semibold text-rose-600 dark:text-rose-400"
                              : isCurrent
                              ? "font-bold text-primary"
                              : "font-medium text-muted-foreground"
                          }`}
                        >
                          {step.event}
                        </h3>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {step.displayTimestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merchant Application Summary Card */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-7 space-y-4 print:border-border print:bg-transparent">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" aria-hidden="true" />
                Applicant Profile Summary
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditApplication}
                className="text-xs h-7 print:hidden"
              >
                <RotateCcw className="mr-1 size-3" /> Edit Application
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Brand Name</span>
                <span className="font-medium text-foreground">
                  {application.merchantName || application.formData?.step2?.brandName || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Legal Entity</span>
                <span className="font-medium text-foreground">
                  {application.legalEntityName || application.formData?.step3?.legalEntityName || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Constitution</span>
                <span className="font-medium text-foreground">
                  {ENTITY_TYPE_LABELS[application.entityType] ||
                    application.entityType?.replace(/_/g, " ") ||
                    "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Business Category</span>
                <span className="font-medium text-foreground truncate block">
                  {application.formData?.step2?.businessCategory
                    ? `${application.formData.step2.businessCategory}${
                        application.formData.step2.subCategory
                          ? ` • ${application.formData.step2.subCategory}`
                          : ""
                      }`
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Contact Email</span>
                <span className="font-medium text-foreground truncate block">
                  {application.contactEmail || application.formData?.step1?.email || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Contact Phone</span>
                <span className="font-medium text-foreground">
                  {application.contactPhone || application.formData?.step1?.phone || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
                  <Landmark className="size-3" aria-hidden="true" /> Settlement Bank
                </span>
                <div>
                  <span className="font-medium text-foreground block">
                    {application.formData?.step7?.bankName || "—"}
                  </span>
                  {maskedAccountNumber && (
                    <span className="font-mono text-[11px] text-muted-foreground block">
                      {maskedAccountNumber}
                    </span>
                  )}
                  {application.formData?.step7?.accountType && (
                    <span className="text-[10px] text-muted-foreground/80 block">
                      {application.formData.step7.accountType === "CURRENT"
                        ? "Current Account"
                        : "Savings Account"}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Business PAN</span>
                <div className="flex items-center gap-1.5 font-mono font-medium text-foreground">
                  <span>{maskedPan}</span>
                  {(application.formData?.step3?.panNumber ||
                    application.formData?.step5?.personalPan) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPanRevealed((prev) => !prev)}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground print:hidden"
                      aria-label={isPanRevealed ? "Hide business PAN" : "Reveal business PAN"}
                      aria-pressed={isPanRevealed}
                    >
                      {isPanRevealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">GSTIN</span>
                <span className="font-mono font-medium text-foreground">{gstinDisplay}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
                  <UserCheck className="size-3" aria-hidden="true" /> Authorized Signatory
                </span>
                <span className="font-medium text-foreground truncate block">
                  {application.formData?.step5?.signatoryName
                    ? `${application.formData.step5.signatoryName}${
                        application.formData.step5.designation
                          ? ` (${application.formData.step5.designation})`
                          : ""
                      }`
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
                  <Globe className="size-3" aria-hidden="true" /> Website / App URL
                </span>
                <span className="font-medium text-foreground truncate block">
                  {application.formData?.step2?.websiteUrl ||
                    application.formData?.step2?.mobileAppUrl ||
                    "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] font-medium flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" /> Operating Location
                </span>
                <span className="font-medium text-foreground truncate block">
                  {operatingLocation || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleStartNewApplication}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Start Another Onboarding Application
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintSummary}
                className="text-xs"
              >
                <Printer className="mr-1.5 size-3.5 text-muted-foreground" />
                Print Application Summary
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDemoPdfDownload}
                className="text-xs"
              >
                <FileText className="mr-1.5 size-3.5" />
                Download Dossier PDF (Demo Simulation)
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
