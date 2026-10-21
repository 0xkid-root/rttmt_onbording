"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ApplicationSubmissionRecord } from "../types";
import { getSubmittedApplication } from "../services/storageService";
import { SAMPLE_SUBMITTED_APPLICATION } from "../mocks/mockApplication";
import { OnboardingHeader } from "./OnboardingHeader";

export function OnboardingStatusScreen() {
  const [application, setApplication] = useState<ApplicationSubmissionRecord>(
    SAMPLE_SUBMITTED_APPLICATION
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = getSubmittedApplication();
      if (saved) {
        setApplication(saved);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyRef = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(application.referenceId);
      setCopied(true);
      toast.success("Reference ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <OnboardingHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/onboarding"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" /> Back to Onboarding
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              Application Status & Verification Timeline
            </h1>
          </div>

          <Badge
            variant="outline"
            className="self-start sm:self-auto border-warning/30 bg-warning/10 text-warning font-semibold px-3 py-1 text-xs"
          >
            <Clock className="mr-1.5 size-3.5 animate-spin" />
            {application.applicationStatus === "UNDER_REVIEW"
              ? "UNDER REVIEW (SIMULATED)"
              : application.applicationStatus}
          </Badge>
        </div>

        {/* Reference ID & Simulation Disclaimer Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Application Reference Identifier
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
                  {application.referenceId}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleCopyRef}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground sm:text-right">
              <span>Submitted On:</span>
              <p className="font-semibold text-foreground">
                {new Date(application.submittedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border/80 bg-background/80 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Sandbox Demonstration Notice:</strong> This merchant application was processed in RTTMT’s sandbox test environment. All automated checks, registry simulations, and KYC/KYB reviews are for evaluation only.
            </span>
          </div>
        </div>

        {/* Verification Timeline Stepper */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Automated Underwriting & Verification Pipeline
            </h2>
            <span className="text-xs text-muted-foreground">Automated SLA: ~2 Hours</span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:bottom-2 before:left-[11px] sm:before:left-[15px] before:top-2 before:w-[2px] before:bg-border">
            {application.timeline.map((item, idx) => {
              const isCompleted = item.status === "COMPLETED";
              const isCurrent = item.status === "CURRENT";

              return (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Dot / Icon */}
                  <div
                    className={`absolute -left-[30px] sm:-left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-success text-success-foreground ring-4 ring-success/15"
                        : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="size-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3
                        className={`text-sm ${
                          isCompleted
                            ? "font-semibold text-foreground"
                            : isCurrent
                            ? "font-bold text-primary"
                            : "font-medium text-muted-foreground"
                        }`}
                      >
                        {item.event}
                      </h3>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Merchant Application Summary Card */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Applicant Profile Summary
            </h2>
            <Link href="/onboarding">
              <Button variant="outline" size="xs" className="text-xs">
                <RotateCcw className="mr-1 size-3" /> Edit Application
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Brand Name</span>
              <span className="font-medium text-foreground">{application.merchantName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Legal Entity</span>
              <span className="font-medium text-foreground">{application.legalEntityName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Constitution</span>
              <span className="font-medium text-foreground">{application.entityType}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Contact Email</span>
              <span className="font-medium text-foreground truncate block">
                {application.contactEmail || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
              <span className="font-medium text-foreground">{application.contactPhone || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Settlement Bank</span>
              <span className="font-medium text-foreground">
                {application.formData.step7.bankName || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">PAN</span>
              <span className="font-mono font-medium text-foreground">
                {application.formData.step3.panNumber || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">GSTIN</span>
              <span className="font-mono font-medium text-foreground">
                {application.formData.step3.gstin || "Exempt"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link href="/onboarding">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Start Another Onboarding Application
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info("Download Simulated", {
                description: "Application summary packet PDF generated in demo mode.",
              })
            }
            className="text-xs"
          >
            <FileText className="mr-1.5 size-3.5" />
            Download Summary PDF (Simulated)
          </Button>
        </div>
      </main>
    </div>
  );
}
