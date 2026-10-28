"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { WorkflowStage } from "./workflowStages";

interface MobileStageCardProps {
  stage: WorkflowStage;
  isActive: boolean;
  onSelect: () => void;
}

export function MobileStageCard({ stage, isActive, onSelect }: MobileStageCardProps) {
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
        "w-full relative rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer select-none",
        "bg-background/95 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-primary shadow-xs ring-1 ring-primary/20"
          : "border-border/80 hover:border-border"
      )}
    >
      {/* Top Input Handle */}
      <div
        className={cn(
          "absolute -top-1.5 left-1/2 -translate-x-1/2 size-2.5 rounded-full border-2 border-background transition-colors",
          isActive ? "bg-primary" : "bg-border"
        )}
        aria-hidden="true"
      />

      {/* Bottom Output Handle */}
      <div
        className={cn(
          "absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-2.5 rounded-full border-2 border-background transition-colors",
          isActive ? "bg-primary" : "bg-border"
        )}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "rounded-lg p-2 shrink-0 transition-colors mt-0.5",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted border border-border text-foreground"
          )}
        >
          <Icon className="size-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
              Stage {stage.stepNumber} · {stage.wizardSteps}
            </span>
            {isActive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {stage.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {stage.description}
          </p>
        </div>
      </div>
    </div>
  );
}
