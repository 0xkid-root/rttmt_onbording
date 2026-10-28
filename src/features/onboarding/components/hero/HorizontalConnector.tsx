"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HorizontalConnectorProps {
  isActive: boolean;
  isPassed: boolean;
}

export function HorizontalConnector({
  isActive,
  isPassed,
}: HorizontalConnectorProps) {
  return (
    <div
      className="flex items-center justify-center w-6 lg:w-10 shrink-0 relative"
      aria-hidden="true"
    >
      <svg className="w-full h-5 overflow-visible" viewBox="0 0 36 20">
        <line
          x1="0"
          y1="10"
          x2="32"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />

        <line
          x1="0"
          y1="10"
          x2="32"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 3"
          className={cn(
            "transition-colors duration-300",
            isActive
              ? "text-primary animate-flow-dash"
              : isPassed
              ? "text-primary/60"
              : "text-border"
          )}
        />

        <polygon
          points="28,6 34,10 28,14"
          className={cn(
            "transition-colors duration-300",
            isActive || isPassed ? "fill-primary" : "fill-border"
          )}
        />
      </svg>
    </div>
  );
}
