"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { WorkflowStage } from "./workflowStages";

interface DesktopStageCardProps {
  stage: WorkflowStage;
  isActive: boolean;
  onSelect: () => void;
}

export function DesktopStageCard({ stage, isActive, onSelect }: DesktopStageCardProps) {
  const Icon = stage.icon;

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      className={cn(
        "flex-1 relative rounded-xl border p-3.5 lg:p-4 text-left transition-all duration-200 cursor-pointer select-none",
        "bg-background/95 hover:bg-background group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-primary shadow-xs ring-1 ring-primary/20"
          : "border-border/80 hover:border-border hover:shadow-2xs"
      )}
    >
      {/* Left Input Handle */}
      <div
        className={cn(
          "absolute -left-1.5 top-1/2 -translate-y-1/2 size-2.5 rounded-full border-2 border-background transition-colors",
          isActive ? "bg-primary" : "bg-border"
        )}
        aria-hidden="true"
      />

      {/* Right Output Handle */}
      <div
        className={cn(
          "absolute -right-1.5 top-1/2 -translate-y-1/2 size-2.5 rounded-full border-2 border-background transition-colors",
          isActive ? "bg-primary" : "bg-border"
        )}
        aria-hidden="true"
      />

      {/* Card Header: Step Pill, Reference & Icon */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-md font-mono text-[10px] font-bold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted border border-border text-muted-foreground"
            )}
          >
            {stage.stepNumber}
          </span>
          <span className="text-[10px] font-mono font-medium text-muted-foreground">
            {stage.wizardSteps}
          </span>
        </div>

        <div
          className={cn(
            "rounded-md p-1.5 transition-colors",
            isActive
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted/50 text-muted-foreground"
          )}
        >
          <Icon className="size-3.5 lg:size-4" />
        </div>
      </div>

      {/* Stage Title */}
      <h3 className="text-sm font-semibold tracking-tight text-foreground leading-snug">
        {stage.title}
      </h3>

      {/* Stage Description */}
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        {stage.description}
      </p>
    </div>
  );
}
