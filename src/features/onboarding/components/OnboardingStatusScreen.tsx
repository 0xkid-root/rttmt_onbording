"use client";

import React from "react";
import { OnboardingHeader } from "./OnboardingHeader";
import { useApplicationStatus } from "../hooks/useApplicationStatus";
import { StatusLoadingSkeleton } from "./status/StatusLoadingSkeleton";
import { StatusEmptyState } from "./status/StatusEmptyState";
import { StatusHeader } from "./status/StatusHeader";
import { StatusReferenceCard } from "./status/StatusReferenceCard";
import { StatusAlertBanner } from "./status/StatusAlertBanner";
import { StatusTimelineCard } from "./status/StatusTimelineCard";
import { ApplicantProfileSummary } from "./status/ApplicantProfileSummary";
import { StatusBottomActions } from "./status/StatusBottomActions";

export function OnboardingStatusScreen() {
  const {
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
  } = useApplicationStatus();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <OnboardingHeader />
      </div>

      {/* 1. Loading State */}
      {isLoading && <StatusLoadingSkeleton />}

      {/* 2. Empty State (No Saved Application) */}
      {!isLoading && !application && (
        <StatusEmptyState onLoadDemo={handleLoadDemoApplication} />
      )}

      {/* 3. Populated Application State */}
      {!isLoading && application && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6 print:p-0 print:space-y-4">
          {/* Top Breadcrumb, Title & Status */}
          <StatusHeader
            isDemoMode={isDemoMode}
            statusConfig={statusConfig}
            currentStatus={application.applicationStatus}
            onExitDemo={handleExitDemoMode}
            onSwitchStatus={handleSwitchStatus}
          />

          {/* Reference ID & Honest Sandbox Notice Card */}
          <StatusReferenceCard
            referenceId={application.referenceId}
            formattedSubmissionDate={formattedSubmissionDate}
            copied={copied}
            onCopyRef={handleCopyRef}
          />

          {/* Status-Specific Notification Banners */}
          <StatusAlertBanner
            status={application.applicationStatus || "UNDER_REVIEW"}
            onEditApplication={handleEditApplication}
          />

          {/* Verification Timeline Stepper */}
          <StatusTimelineCard timeline={computedTimeline} />

          {/* Merchant Application Summary Card */}
          <ApplicantProfileSummary
            application={application}
            operatingLocation={operatingLocation}
            onEditApplication={handleEditApplication}
          />

          {/* Bottom Action Controls */}
          <StatusBottomActions
            onStartNewApplication={handleStartNewApplication}
            onPrintSummary={handlePrintSummary}
            onDemoPdfDownload={handleDemoPdfDownload}
          />
        </main>
      )}
    </div>
  );
}
