"use client";

import React from "react";
import { AlertCircle, XCircle, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "../../types";

interface StatusAlertBannerProps {
  status: ApplicationStatus | string;
  onEditApplication: () => void;
}

export function StatusAlertBanner({
  status,
  onEditApplication,
}: StatusAlertBannerProps) {
  if (status === "ACTION_REQUIRED") {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Underwriting Action Required</strong>
            <span>
              Our compliance review team requires additional clarification or document
              updates before progressing your application.
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditApplication}
          className="shrink-0 text-xs border-rose-500/30 hover:bg-rose-500/20 print:hidden"
        >
          <FileEdit className="mr-1.5 size-3.5" />
          Resolve Requirements
        </Button>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5">
        <XCircle className="size-4 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">Application Status: Not Approved</strong>
          <span>
            This application could not be approved based on our simulated underwriting
            policy criteria. You may submit a new application with updated business details.
          </span>
        </div>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
        <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">Application Approved (Simulated)</strong>
          <span>
            All verification checks and simulated underwriting milestones have passed.
            Your merchant portal access and test MID are provisioned.
          </span>
        </div>
      </div>
    );
  }

  if (status === "IN_SCRUTINY") {
    return (
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
        <Clock className="size-4 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">Enhanced Scrutiny Queue</strong>
          <span>
            Your application file is undergoing secondary compliance review and manual
            document verification in our simulated queue.
          </span>
        </div>
      </div>
    );
  }

  return null;
}
