"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatusLoadingSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6"
    >
      <span className="sr-only">
        Loading application status and verification timeline...
      </span>
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
  );
}
