"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { ComputedTimelineStep } from "../../utils/statusHelpers";

interface StatusTimelineCardProps {
  timeline: ComputedTimelineStep[];
}

export function StatusTimelineCard({ timeline }: StatusTimelineCardProps) {
  return (
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
        {timeline.map((step, idx) => {
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
  );
}
