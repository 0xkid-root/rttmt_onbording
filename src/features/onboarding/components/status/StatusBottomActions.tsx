"use client";

import React from "react";
import { ArrowLeft, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusBottomActionsProps {
  onStartNewApplication: () => void;
  onPrintSummary: () => void;
  onDemoPdfDownload: () => void;
}

export function StatusBottomActions({
  onStartNewApplication,
  onPrintSummary,
  onDemoPdfDownload,
}: StatusBottomActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onStartNewApplication}
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
          onClick={onPrintSummary}
          className="text-xs"
        >
          <Printer className="mr-1.5 size-3.5 text-muted-foreground" />
          Print Application Summary
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDemoPdfDownload}
          className="text-xs"
        >
          <FileText className="mr-1.5 size-3.5" />
          Download Dossier PDF (Demo Simulation)
        </Button>
      </div>
    </div>
  );
}
