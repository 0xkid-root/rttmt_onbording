"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusConfig } from "../../utils/statusHelpers";
import { ApplicationStatus } from "../../types";

interface StatusHeaderProps {
  isDemoMode: boolean;
  statusConfig: StatusConfig;
  currentStatus?: ApplicationStatus | string;
  onExitDemo: () => void;
  onSwitchStatus?: (status: ApplicationStatus) => void;
}

const DEMO_STATUS_LIST: ApplicationStatus[] = [
  "UNDER_REVIEW",
  "IN_SCRUTINY",
  "ACTION_REQUIRED",
  "APPROVED",
  "REJECTED",
];

export function StatusHeader({
  isDemoMode,
  statusConfig,
  currentStatus,
  onExitDemo,
  onSwitchStatus,
}: StatusHeaderProps) {
  return (
    <>
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
              <Badge
                variant="secondary"
                className="text-[10px] uppercase tracking-wider py-0 px-2 font-mono"
              >
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
              onClick={onExitDemo}
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
      {isDemoMode && onSwitchStatus && (
        <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs flex flex-wrap items-center gap-2 print:hidden">
          <span className="font-semibold text-muted-foreground text-[11px] flex items-center gap-1">
            <Sparkles className="size-3 text-primary" />
            Preview Simulated Status:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {DEMO_STATUS_LIST.map((st) => (
              <Button
                key={st}
                type="button"
                variant={currentStatus === st ? "default" : "outline"}
                size="xs"
                onClick={() => onSwitchStatus(st)}
                className="h-6 text-[10px] px-2 py-0"
              >
                {st.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
