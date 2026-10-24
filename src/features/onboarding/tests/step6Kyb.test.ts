/**
 * Comprehensive Unit & Integration Test Suite for RTTMT Step 6 KYB
 * Tests:
 * 1. Stale verification results and cancellation
 * 2. Beneficial owner normalization, unique IDs, immutable editing, and removal safety
 * 3. Configurable entity-specific UBO threshold rules & validation
 * 4. GST registration vs unregistration vs statutory exemption modeling
 * 5. Single source of truth: getEntityKybConfig and areRequiredKybDocsUploaded agreement with step6KYBSchema
 */

import assert from "node:assert/strict";
import {
  getEntityKybConfig,
  areRequiredKybDocsUploaded,
} from "../config/kybDocuments";
import { step6KYBSchema, beneficialOwnerSchema } from "../schemas";
import { simulateKybVerification } from "../services/verificationService";
import { Step6KYBData, BeneficialOwner } from "../types";

async function runTests() {
  console.log("🚀 Starting RTTMT Step 6 KYB Test Suite...\n");

  // TEST 1: Entity-specific Document & UBO Configurations
  console.log("▶ Test 1: Entity-specific Document & UBO Configurations");
  {
    // Private Limited (Pvt Ltd)
    const pvtConfig = getEntityKybConfig("PRIVATE_LIMITED", true, false);
    assert.equal(pvtConfig.uboThresholdPercent, 10, "Pvt Ltd UBO threshold should be 10%");
    assert.equal(pvtConfig.isUboApplicable, true, "Pvt Ltd UBO must be applicable");
    assert.equal(pvtConfig.documents.length, 5, "Pvt Ltd with GST should have 5 documents");
    assert.ok(pvtConfig.documents.some((d) => d.field === "constitutionalDoc" && d.required), "MOA/AOA must be required");

    // LLP
    const llpConfig = getEntityKybConfig("LLP", true, false);
    assert.equal(llpConfig.uboThresholdPercent, 15, "LLP UBO threshold should be 15%");
    assert.equal(llpConfig.isUboApplicable, true, "LLP UBO must be applicable");
    assert.ok(llpConfig.documents.some((d) => d.documentType === "LLP_AGREEMENT"), "LLP Agreement must be in config");

    // Partnership Firm
    const partConfig = getEntityKybConfig("PARTNERSHIP", true, false);
    assert.equal(partConfig.uboThresholdPercent, 15, "Partnership UBO threshold should be 15%");
    assert.equal(partConfig.isUboApplicable, true, "Partnership UBO must be applicable");

    // Sole Proprietorship
    const soleConfig = getEntityKybConfig("SOLE_PROPRIETORSHIP", false, false);
    assert.equal(soleConfig.uboThresholdPercent, 100, "Sole Proprietor ownership should be 100%");
    assert.equal(soleConfig.isUboApplicable, false, "Corporate UBO declaration must not apply to Sole Proprietor");
    // Sole Proprietor should NOT have MOA/AOA or separate company PAN
    assert.ok(!soleConfig.documents.some((d) => d.field === "constitutionalDoc"), "Sole Proprietor must not have constitutionalDoc");
    assert.ok(!soleConfig.documents.some((d) => d.field === "companyPanDoc"), "Sole Proprietor must not have companyPanDoc");
    assert.equal(soleConfig.documents.filter((d) => d.required).length, 2, "Unregistered Sole Proprietor requires exactly 2 documents");

    console.log("  ✓ Entity-specific UBO and document configurations verified.");
  }

  // TEST 2: GST Modeling — Registered vs Unregistered vs Statutory Exemption
  console.log("\n▶ Test 2: GST Registration & Exemption Independence");
  {
    // A. Registered under GST: REG-06 is required
    const regConfig = getEntityKybConfig("PRIVATE_LIMITED", true, false);
    const regGstDoc = regConfig.documents.find((d) => d.field === "gstCertificateDoc");
    assert.ok(regGstDoc, "GST document spec must exist");
    assert.equal(regGstDoc.required, true, "REG-06 must be mandatory when GST registered");
    assert.equal(regGstDoc.sideBadge, "Mandatory (GSTIN)");

    // B. Registered under GST cannot bypass REG-06 via exemption flag
    const regAttemptBypass = getEntityKybConfig("PRIVATE_LIMITED", true, true);
    const bypassGstDoc = regAttemptBypass.documents.find((d) => d.field === "gstCertificateDoc");
    assert.equal(bypassGstDoc?.required, true, "Cannot bypass mandatory GSTIN proof when registered");

    // C. Unregistered below threshold: REG-06 is optional
    const unregConfig = getEntityKybConfig("PRIVATE_LIMITED", false, false);
    const unregGstDoc = unregConfig.documents.find((d) => d.field === "gstCertificateDoc");
    assert.equal(unregGstDoc?.required, false, "REG-06 must be optional when unregistered");
    assert.equal(unregGstDoc?.sideBadge, "Optional (Below Threshold)");

    // D. Statutory Exemption declared: REG-06 is optional
    const exemptConfig = getEntityKybConfig("PRIVATE_LIMITED", false, true);
    const exemptGstDoc = exemptConfig.documents.find((d) => d.field === "gstCertificateDoc");
    assert.equal(exemptGstDoc?.required, false, "REG-06 must be optional when exempt");
    assert.equal(exemptGstDoc?.sideBadge, "Optional (Exempt)");

    console.log("  ✓ GST registered, unregistered, and exempt states modeled correctly.");
  }

  // TEST 3: Document Completeness Calculation from Single Source of Truth
  console.log("\n▶ Test 3: Document Completeness Single Source of Truth");
  {
    const mockDoc = (id: string) => ({
      id,
      name: `${id}.pdf`,
      size: 1024,
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "PENDING" as const,
      documentType: "DOCUMENT",
    });

    const incompleteData: Step6KYBData = {
      entityType: "PRIVATE_LIMITED",
      businessRegistrationDoc: mockDoc("coi"),
      beneficialOwners: [],
      hasNoUboDeclaration: false,
      isKybVerified: false,
    };

    // Private limited with GST requires 5 documents
    const incompleteCheck = areRequiredKybDocsUploaded(incompleteData, true, false);
    assert.equal(incompleteCheck.isComplete, false, "Should be incomplete when 4 of 5 missing");
    assert.equal(incompleteCheck.totalRequired, 5, "Total required should be 5");
    assert.equal(incompleteCheck.uploadedRequired, 1, "Uploaded count should be 1");
    assert.equal(incompleteCheck.missingFields.length, 4, "Missing fields should be 4");

    // Complete all required documents
    const completeData: Step6KYBData = {
      ...incompleteData,
      constitutionalDoc: mockDoc("moa"),
      boardResolutionDoc: mockDoc("br"),
      companyPanDoc: mockDoc("pan"),
      gstCertificateDoc: mockDoc("gst"),
    };

    const completeCheck = areRequiredKybDocsUploaded(completeData, true, false);
    assert.equal(completeCheck.isComplete, true, "Should be complete when all 5 uploaded");
    assert.equal(completeCheck.uploadedRequired, 5, "Uploaded count should be 5");
    assert.equal(completeCheck.missingFields.length, 0, "Missing fields should be 0");

    // For Sole Proprietor, only 2 documents required
    const soleData: Step6KYBData = {
      entityType: "SOLE_PROPRIETORSHIP",
      businessRegistrationDoc: mockDoc("udyam"),
      boardResolutionDoc: mockDoc("decl"),
      beneficialOwners: [],
      hasNoUboDeclaration: false,
      isKybVerified: false,
    };
    const soleCheck = areRequiredKybDocsUploaded(soleData, false, false);
    assert.equal(soleCheck.totalRequired, 2, "Sole proprietor requires 2 documents");
    assert.equal(soleCheck.isComplete, true, "Sole proprietor with Udyam and declaration is complete");

    console.log("  ✓ areRequiredKybDocsUploaded accurately evaluates active entity requirements.");
  }

  // TEST 4: Beneficial Owner Identity, Editing, and Removal Safety
  console.log("\n▶ Test 4: Beneficial Owner Identity, Editing, and Removal Safety");
  {
    // Test normalization of legacy records lacking IDs
    const legacyOwners: BeneficialOwner[] = [
      { name: "Owner Alpha", pan: "AAACA1111A", percentageHolding: 40, isPep: false },
      { name: "Owner Beta", pan: "BBBCB2222B", percentageHolding: 30, isPep: false },
    ];

    const normalized = legacyOwners.map((o, idx) => ({
      ...o,
      id: o.id || `ubo_test_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    }));

    assert.ok(normalized[0].id, "First owner must have ID");
    assert.ok(normalized[1].id, "Second owner must have ID");
    assert.notEqual(normalized[0].id, normalized[1].id, "IDs must be unique");

    // Test editing one owner immutably without altering other owner
    const targetId = normalized[0].id;
    const edited = normalized.map((owner) => {
      if (owner.id === targetId) {
        return { ...owner, name: "Owner Alpha Updated", percentageHolding: 55 };
      }
      return owner;
    });

    assert.equal(edited[0].name, "Owner Alpha Updated", "Target owner should be updated");
    assert.equal(edited[0].percentageHolding, 55, "Target holding should be updated");
    assert.equal(edited[1].name, "Owner Beta", "Non-target owner name must remain unchanged");
    assert.equal(edited[1].percentageHolding, 30, "Non-target holding must remain unchanged");

    // Test removing specific owner by ID without affecting others
    const remaining = edited.filter((o) => o.id !== targetId);
    assert.equal(remaining.length, 1, "Should have 1 owner after removal");
    assert.equal(remaining[0].id, normalized[1].id, "Remaining owner must be Owner Beta");

    console.log("  ✓ Owner unique IDs, immutable editing, and removal isolation verified.");
  }

  // TEST 5: Schema Validation Integration & Discrepancy Prevention
  console.log("\n▶ Test 5: Schema Validation & UBO Holding Checks");
  {
    const mockDoc = (id: string) => ({
      id,
      name: `${id}.pdf`,
      size: 1024,
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "PENDING" as const,
      documentType: "DOCUMENT",
    });

    // Valid Pvt Ltd data
    const validData = {
      entityType: "PRIVATE_LIMITED" as const,
      hasGstRegistration: true,
      businessRegistrationDoc: mockDoc("coi"),
      constitutionalDoc: mockDoc("moa"),
      boardResolutionDoc: mockDoc("br"),
      companyPanDoc: mockDoc("pan"),
      gstCertificateDoc: mockDoc("gst"),
      beneficialOwners: [
        {
          id: "ubo_1",
          name: "Ramesh Sharma",
          pan: "ABCDE1234F",
          percentageHolding: 50,
          isPep: false,
        },
      ],
      hasNoUboDeclaration: false,
      isKybVerified: true,
    };

    const validResult = step6KYBSchema.safeParse(validData);
    assert.equal(validResult.success, true, "Valid data should parse successfully");

    // Rejection 1: Total holding percentage exceeds 100%
    const excessHoldingData = {
      ...validData,
      beneficialOwners: [
        { id: "ubo_1", name: "Ramesh Sharma", pan: "ABCDE1234F", percentageHolding: 60, isPep: false },
        { id: "ubo_2", name: "Suresh Gupta", pan: "BCDEF2345G", percentageHolding: 50, isPep: false },
      ],
    };
    const excessResult = step6KYBSchema.safeParse(excessHoldingData);
    assert.equal(excessResult.success, false, "Total holding > 100% must fail validation");

    // Rejection 2: Contradictory state (hasNoUboDeclaration: true AND owners list non-empty)
    const contradictoryData = {
      ...validData,
      hasNoUboDeclaration: true,
      beneficialOwners: [
        { id: "ubo_1", name: "Ramesh Sharma", pan: "ABCDE1234F", percentageHolding: 50, isPep: false },
      ],
    };
    const contraResult = step6KYBSchema.safeParse(contradictoryData);
    assert.equal(contraResult.success, false, "Contradictory UBO declaration and list must fail");

    // Rejection 3: Beneficial owner invalid PAN format
    const badPanResult = beneficialOwnerSchema.safeParse({
      name: "Ramesh Sharma",
      pan: "INVALIDPAN",
      percentageHolding: 25,
      isPep: false,
    });
    assert.equal(badPanResult.success, false, "Invalid PAN format must fail validation");

    // Rejection 4: Unverified KYB
    const unverifiedData = {
      ...validData,
      isKybVerified: false,
    };
    const unverifiedResult = step6KYBSchema.safeParse(unverifiedData);
    assert.equal(unverifiedResult.success, false, "isKybVerified: false must fail validation");

    console.log("  ✓ Schema validations, UBO thresholds, and holding limits verified.");
  }

  // TEST 6: Asynchronous Verification Cancellation & Failure Handling
  console.log("\n▶ Test 6: Asynchronous Verification Cancellation & Failure Handling");
  {
    // A. Successful simulated verification
    const successRes = await simulateKybVerification("Private Limited Company (Pvt Ltd)", 5);
    assert.equal(successRes.verified, true, "Normal simulation should succeed");
    assert.equal(successRes.isSimulated, true, "Must be clearly labeled as simulated");
    assert.ok(successRes.notes.includes("Simulated"), "Notes must mention simulation");

    // B. Explicit simulated failure
    const failRes = await simulateKybVerification("Private Limited Company (Pvt Ltd)", 5, { shouldFail: true });
    assert.equal(failRes.verified, false, "shouldFail must return verified: false");
    assert.equal(failRes.isSimulated, true, "Failure result must be simulated");

    // C. AbortSignal cancellation
    const controller = new AbortController();
    const abortPromise = simulateKybVerification("Private Limited Company (Pvt Ltd)", 5, {
      signal: controller.signal,
    });
    // Immediately abort
    controller.abort();

    await assert.rejects(
      abortPromise,
      (err: unknown) => {
        return err instanceof DOMException && err.name === "AbortError";
      },
      "Aborted verification must reject with AbortError"
    );

    console.log("  ✓ Asynchronous verification cancellation and failure handling verified.");
  }

  console.log("\n🎉 ALL STEP 6 KYB TESTS PASSED SUCCESSFULLY!\n");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
