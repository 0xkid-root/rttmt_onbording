"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApplicationSubmissionRecord, ApplicationStatus } from "../types";
import {
  getSubmittedApplication,
  saveDraftToStorage,
  clearDraftFromStorage,
} from "../services/storageService";
import { SAMPLE_SUBMITTED_APPLICATION } from "../mocks/mockApplication";
import {
  formatSubmissionDateTime,
  formatTimelineTimestamp,
} from "../utils/formatters";
import {
  isValidApplicationRecord,
  getApplicationStatusConfig,
  ComputedTimelineStep,
} from "../utils/statusHelpers";

export function useApplicationStatus() {
  const router = useRouter();

  const [application, setApplication] = useState<ApplicationSubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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

  const handleSwitchStatus = useCallback((status: ApplicationStatus) => {
    setApplication((prev) => (prev ? { ...prev, applicationStatus: status } : null));
    toast.info(`Simulated Status switched to ${status.replace(/_/g, " ")}`);
  }, []);

  return {
    application,
    isLoading,
    isDemoMode,
    copied,
    handleCopyRef,
    statusConfig,
    computedTimeline,
    formattedSubmissionDate,
    operatingLocation,
    handleEditApplication,
    handleStartNewApplication,
    handleLoadDemoApplication,
    handleExitDemoMode,
    handlePrintSummary,
    handleDemoPdfDownload,
    handleSwitchStatus,
  };
}
