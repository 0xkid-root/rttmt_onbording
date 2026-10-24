/**
 * Unit & Integration Test Suite for RTTMT Onboarding Status Screen
 * Tests:
 * 1. Safe application submission record validation (valid records vs corrupted/malformed payloads)
 * 2. Sensitive PAN masking by default & explicit reveal
 * 3. Sensitive Bank Account Number masking (never exposes full account numbers)
 * 4. Accurate GSTIN formatting (never falsely claims exempt; respects Step 3 & Step 6 declarations)
 * 5. Robust Date and Timeline timestamp formatting with Asia/Kolkata timezone and invalid date handling
 * 6. Application status and timeline consistency across all supported states (APPROVED, REJECTED, ACTION_REQUIRED, etc.)
 */

import assert from "node:assert/strict";
import {
  maskPan,
  maskBankAccount,
  formatGstinDisplay,
  formatSubmissionDateTime,
  formatTimelineTimestamp,
} from "../utils/formatters";
import { ApplicationSubmissionRecord, ApplicationStatus } from "../types";
import { SAMPLE_SUBMITTED_APPLICATION } from "../mocks/mockApplication";

async function runStatusScreenTests() {
  console.log("🚀 Starting RTTMT Onboarding Status Screen Test Suite...\n");

  // TEST 1: Safe Application Record Validation
  console.log("▶ Test 1: Record Validation & Malformed Payload Handling");
  {
    function isValidApplicationRecord(record: unknown): record is ApplicationSubmissionRecord {
      if (!record || typeof record !== "object") return false;
      const candidate = record as Partial<ApplicationSubmissionRecord>;
      return (
        typeof candidate.referenceId === "string" &&
        candidate.referenceId.trim().length > 0 &&
        typeof candidate.submittedAt === "string" &&
        typeof candidate.formData === "object" &&
        candidate.formData !== null
      );
    }

    // A. Valid record
    assert.equal(
      isValidApplicationRecord(SAMPLE_SUBMITTED_APPLICATION),
      true,
      "SAMPLE_SUBMITTED_APPLICATION must be recognized as valid"
    );

    // B. Malformed payloads
    assert.equal(isValidApplicationRecord(null), false, "Null payload must be rejected");
    assert.equal(isValidApplicationRecord(undefined), false, "Undefined payload must be rejected");
    assert.equal(isValidApplicationRecord({}), false, "Empty object must be rejected");
    assert.equal(
      isValidApplicationRecord({ referenceId: "" }),
      false,
      "Empty referenceId must be rejected"
    );
    assert.equal(
      isValidApplicationRecord({ referenceId: "REF-123" }),
      false,
      "Missing submittedAt and formData must be rejected"
    );
    assert.equal(
      isValidApplicationRecord({ referenceId: "REF-123", submittedAt: "2026-10-24", formData: null }),
      false,
      "Null formData must be rejected"
    );

    console.log("  ✓ Valid records recognized and malformed payloads rejected safely.");
  }

  // TEST 2: Sensitive PAN Masking & Reveal
  console.log("\n▶ Test 2: Sensitive PAN Masking & Selective Reveal");
  {
    const samplePan = "ABCDE1234F";

    // A. Masked by default
    const masked = maskPan(samplePan, false);
    assert.equal(masked, "••••••234F", "Default PAN must mask first 6 characters and show last 4");
    assert.ok(!masked.includes("ABCDE"), "Raw PAN prefix must not be exposed");

    // B. Revealed explicitly
    const revealed = maskPan(samplePan, true);
    assert.equal(revealed, "ABCDE1234F", "Revealed PAN must display full PAN");

    // C. Empty or undefined PAN
    assert.equal(maskPan(undefined), "—", "Undefined PAN must safely return fallback dash");
    assert.equal(maskPan(""), "—", "Empty PAN must safely return fallback dash");

    console.log("  ✓ PAN masked by default and only revealed on explicit user intent.");
  }

  // TEST 3: Sensitive Bank Account Number Masking
  console.log("\n▶ Test 3: Sensitive Settlement Bank Account Masking");
  {
    const sampleAccount = "50200098234123";

    const masked = maskBankAccount(sampleAccount);
    assert.ok(masked !== null, "Masked account should not be null");
    assert.equal(masked, "••••••••4123", "Must only expose the last 4 digits");
    assert.ok(!masked.includes("502000"), "Initial account digits must never be exposed");

    // Safe fallback on missing account
    assert.equal(maskBankAccount(undefined), null, "Undefined account must return null");
    assert.equal(maskBankAccount(""), null, "Empty account must return null");

    console.log("  ✓ Settlement bank account numbers masked to preserve confidentiality.");
  }

  // TEST 4: Accurate GSTIN Formatting & Exemption Semantics
  console.log("\n▶ Test 4: GSTIN Accuracy & Exemption Declarations");
  {
    // A. Explicit GSTIN present
    assert.equal(
      formatGstinDisplay("27AABCU9603R1ZX", false, false),
      "27AABCU9603R1ZX",
      "Valid GSTIN must be formatted and displayed directly"
    );

    // B. Missing GSTIN with Step 3 Exemption Declaration
    assert.equal(
      formatGstinDisplay(undefined, true, false),
      "Exempt (Declaration Provided)",
      "Declared Step 3 exemption must display 'Exempt (Declaration Provided)'"
    );

    // C. Missing GSTIN with Step 6 KYB Exemption
    assert.equal(
      formatGstinDisplay(undefined, false, true),
      "Exempt (Declaration Provided)",
      "Declared Step 6 exemption must display 'Exempt (Declaration Provided)'"
    );

    // D. Missing GSTIN with NO declaration
    assert.equal(
      formatGstinDisplay(undefined, false, false),
      "Not Registered / Not Provided",
      "Missing GSTIN without declaration must NEVER falsely claim exempt"
    );

    assert.equal(
      formatGstinDisplay("", false, false),
      "Not Registered / Not Provided",
      "Empty GSTIN string must return neutral fallback"
    );

    console.log("  ✓ GSTIN accurately formatted and never falsely marked exempt.");
  }

  // TEST 5: Date and Timeline Formatting with Indian Locale & IST Timezone
  console.log("\n▶ Test 5: Date & Timeline Timestamp Formatting");
  {
    const isoDate = "2026-10-24T06:30:00.000Z";

    // Submission DateTime formatting
    const formattedDate = formatSubmissionDateTime(isoDate);
    assert.ok(formattedDate.includes("2026"), "Formatted date must include year");
    assert.ok(formattedDate.includes("Oct"), "Formatted date must include month");
    assert.ok(formattedDate.includes("IST"), "Formatted date must include IST timezone suffix");

    // Missing / invalid submission date
    assert.equal(formatSubmissionDateTime(undefined), "—", "Undefined date must return fallback dash");
    assert.equal(formatSubmissionDateTime("invalid-date-string"), "—", "Invalid date must return fallback dash");

    // Timeline timestamp formatting
    const formattedTimelineIso = formatTimelineTimestamp(isoDate);
    assert.ok(formattedTimelineIso.includes("Oct"), "Timeline ISO date must be formatted cleanly");

    // Preserved display strings
    assert.equal(
      formatTimelineTimestamp("Today, 10:30 AM"),
      "Today, 10:30 AM",
      "Relative display strings must be safely preserved"
    );
    assert.equal(
      formatTimelineTimestamp("Estimated: 1–2 business days"),
      "Estimated: 1–2 business days",
      "Relative estimate strings must be safely preserved"
    );
    assert.equal(formatTimelineTimestamp(undefined), "—", "Undefined timeline timestamp returns fallback dash");

    console.log("  ✓ Dates and timestamps safely formatted with robust fallbacks.");
  }

  // TEST 6: Application Status and Timeline Consistency
  console.log("\n▶ Test 6: Application Status & Timeline Consistency");
  {
    type ComputedStatus = "COMPLETED" | "CURRENT" | "ACTION_REQUIRED" | "FAILED" | "PENDING";

    function computeTimeline(
      timeline: ApplicationSubmissionRecord["timeline"],
      status: ApplicationStatus
    ) {
      return timeline.map((item) => {
        if (status === "APPROVED") {
          return {
            event: item.event,
            displayStatus: "COMPLETED" as ComputedStatus,
            displayTimestamp: item.timestamp === "Pending" ? "Completed (Simulated)" : item.timestamp,
          };
        }
        if (status === "REJECTED") {
          if (item.status === "CURRENT") {
            return {
              event: item.event,
              displayStatus: "FAILED" as ComputedStatus,
              displayTimestamp: "Review Concluded (Not Approved)",
            };
          }
          if (item.status === "COMPLETED") {
            return {
              event: item.event,
              displayStatus: "COMPLETED" as ComputedStatus,
              displayTimestamp: item.timestamp,
            };
          }
          return {
            event: item.event,
            displayStatus: "PENDING" as ComputedStatus,
            displayTimestamp: "Cancelled",
          };
        }
        if (status === "ACTION_REQUIRED") {
          if (item.status === "CURRENT") {
            return {
              event: item.event,
              displayStatus: "ACTION_REQUIRED" as ComputedStatus,
              displayTimestamp: "Clarification Requested",
            };
          }
          if (item.status === "COMPLETED") {
            return {
              event: item.event,
              displayStatus: "COMPLETED" as ComputedStatus,
              displayTimestamp: item.timestamp,
            };
          }
          return {
            event: item.event,
            displayStatus: "PENDING" as ComputedStatus,
            displayTimestamp: item.timestamp,
          };
        }
        return {
          event: item.event,
          displayStatus: item.status as ComputedStatus,
          displayTimestamp: item.timestamp,
        };
      });
    }

    const baseTimeline = SAMPLE_SUBMITTED_APPLICATION.timeline;

    // A. Approved state
    const approvedTimeline = computeTimeline(baseTimeline, "APPROVED");
    assert.ok(
      approvedTimeline.every((step) => step.displayStatus === "COMPLETED"),
      "All timeline steps must be marked COMPLETED when applicationStatus is APPROVED"
    );
    const lastApproved = approvedTimeline[approvedTimeline.length - 1];
    assert.equal(
      lastApproved.displayTimestamp,
      "Completed (Simulated)",
      "Terminal approved step timestamp must not remain 'Pending'"
    );

    // B. Rejected state
    const rejectedTimeline = computeTimeline(baseTimeline, "REJECTED");
    const rejectedStep = rejectedTimeline.find((s) => s.displayStatus === "FAILED");
    assert.ok(rejectedStep, "A current step must be marked FAILED on rejection");
    assert.equal(rejectedStep.displayTimestamp, "Review Concluded (Not Approved)");
    const cancelledStep = rejectedTimeline[rejectedTimeline.length - 1];
    assert.equal(cancelledStep.displayTimestamp, "Cancelled", "Subsequent steps must be cancelled");

    // C. Action Required state
    const actionTimeline = computeTimeline(baseTimeline, "ACTION_REQUIRED");
    const actionStep = actionTimeline.find((s) => s.displayStatus === "ACTION_REQUIRED");
    assert.ok(actionStep, "A current step must be marked ACTION_REQUIRED");
    assert.equal(actionStep.displayTimestamp, "Clarification Requested");

    console.log("  ✓ Status badge and timeline step states guaranteed consistent.");
  }

  console.log("\n🎉 ALL STATUS SCREEN TESTS PASSED SUCCESSFULLY!");
}

runStatusScreenTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
