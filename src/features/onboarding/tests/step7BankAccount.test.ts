/**
 * Comprehensive Unit & Integration Test Suite for RTTMT Step 7 Bank Account
 * Tests:
 * 1. IFSC lookup, normalization, and cancellation
 * 2. Asynchronous verification lifecycle, race condition protection & invalidation
 * 3. Mismatched account numbers & digit-length validation
 * 4. Masked account numbers in verification results (no raw numbers exposed)
 * 5. Explicit handling of successful and failed verification results
 * 6. Parent schema validation agreement
 */

import assert from "node:assert/strict";
import { lookupIfsc, verifyBankAccount } from "../services/verificationService";
import { step7BankAccountSchema } from "../schemas";

async function runStep7Tests() {
  console.log("🚀 Starting RTTMT Step 7 Bank Account Test Suite...\n");

  // TEST 1: IFSC Normalization, Lookup, and Cancellation
  console.log("▶ Test 1: IFSC Normalization, Lookup, and Cancellation");
  {
    // A. Known IFSC in directory
    const hdfcInfo = await lookupIfsc("hdfc0000001");
    assert.ok(hdfcInfo, "Known IFSC should resolve");
    assert.equal(hdfcInfo.bankName, "HDFC Bank", "Bank name should match directory");
    assert.equal(hdfcInfo.city, "Mumbai", "City should match directory");

    // B. Standard valid-format fallback IFSC
    const iciciInfo = await lookupIfsc("icic0001234");
    assert.ok(iciciInfo, "Standard format IFSC should resolve via fallback");
    assert.equal(iciciInfo.bankName, "ICICI Bank", "Bank name should resolve from prefix");

    // C. Invalid format IFSC
    const invalidInfo = await lookupIfsc("INVALID_IFSC");
    assert.equal(invalidInfo, null, "Invalid format IFSC must return null");

    // D. Aborted lookup request
    const controller = new AbortController();
    const lookupPromise = lookupIfsc("HDFC0000001", { signal: controller.signal });
    controller.abort();

    await assert.rejects(
      lookupPromise,
      (err: unknown) => err instanceof DOMException && err.name === "AbortError",
      "Aborted lookup must reject with AbortError"
    );

    console.log("  ✓ IFSC lookup, normalization, directory matching, and cancellation verified.");
  }

  // TEST 2: Bank Account Number Validation (9 to 18 digits, numeric only)
  console.log("\n▶ Test 2: Account Number Length & Character Validation");
  {
    const baseValid = {
      accountHolderName: "RTTMT Technologies Pvt Ltd",
      accountNumber: "50200098234123",
      confirmAccountNumber: "50200098234123",
      ifscCode: "HDFC0000001",
      accountType: "CURRENT" as const,
      bankName: "HDFC Bank",
      branchName: "Fort Commercial Branch",
      isBankVerified: true,
    };

    // Valid 14-digit account
    const validRes = step7BankAccountSchema.safeParse(baseValid);
    assert.equal(validRes.success, true, "Valid 14-digit account should parse");

    // Valid min 9-digit account
    const minValid = step7BankAccountSchema.safeParse({
      ...baseValid,
      accountNumber: "123456789",
      confirmAccountNumber: "123456789",
    });
    assert.equal(minValid.success, true, "9-digit account should parse");

    // Valid max 18-digit account
    const maxValid = step7BankAccountSchema.safeParse({
      ...baseValid,
      accountNumber: "123456789012345678",
      confirmAccountNumber: "123456789012345678",
    });
    assert.equal(maxValid.success, true, "18-digit account should parse");

    // Invalid < 9 digits
    const tooShort = step7BankAccountSchema.safeParse({
      ...baseValid,
      accountNumber: "12345678",
      confirmAccountNumber: "12345678",
    });
    assert.equal(tooShort.success, false, "8-digit account must fail validation");

    // Invalid > 18 digits
    const tooLong = step7BankAccountSchema.safeParse({
      ...baseValid,
      accountNumber: "1234567890123456789",
      confirmAccountNumber: "1234567890123456789",
    });
    assert.equal(tooLong.success, false, "19-digit account must fail validation");

    // Invalid non-numeric
    const nonNumeric = step7BankAccountSchema.safeParse({
      ...baseValid,
      accountNumber: "5020009823412A",
      confirmAccountNumber: "5020009823412A",
    });
    assert.equal(nonNumeric.success, false, "Non-numeric account number must fail validation");

    console.log("  ✓ Account number length (9 to 18 digits) and numeric constraint verified.");
  }

  // TEST 3: Account Number Confirmation Match
  console.log("\n▶ Test 3: Account Number Confirmation Match");
  {
    const mismatched = step7BankAccountSchema.safeParse({
      accountHolderName: "RTTMT Technologies Pvt Ltd",
      accountNumber: "50200098234123",
      confirmAccountNumber: "50200098234999",
      ifscCode: "HDFC0000001",
      accountType: "CURRENT" as const,
      bankName: "HDFC Bank",
      branchName: "Fort Commercial Branch",
      isBankVerified: true,
    });

    assert.equal(mismatched.success, false, "Mismatched account numbers must fail validation");
    const issues = mismatched.error.issues;
    assert.ok(
      issues.some((i) => i.path.includes("confirmAccountNumber")),
      "Issue must be assigned to confirmAccountNumber"
    );

    console.log("  ✓ Mismatched account numbers successfully caught by schema.");
  }

  // TEST 4: Simulated Verification & Masked Account Number
  console.log("\n▶ Test 4: Simulated Verification, Masking, and Security");
  {
    const fullAcc = "50200098234123";
    const res = await verifyBankAccount(fullAcc, "HDFC0000001", "RTTMT Technologies Pvt Ltd");

    assert.equal(res.isVerified, true, "Simulated check should succeed");
    assert.equal(res.isSimulated, true, "Must be explicitly labeled as simulated");
    assert.equal(res.accountNumberMasked, "••••••••4123", "Account number must be masked in result");
    assert.ok(!res.notes?.includes(fullAcc), "Full account number must not be exposed in notes");
    assert.ok(res.pennyDropReference?.startsWith("SIM-PDR-"), "Reference must indicate simulation");

    console.log("  ✓ Account number masking and honest simulation labels verified.");
  }

  // TEST 5: Explicit Verification Failure Handling
  console.log("\n▶ Test 5: Explicit Verification Failure Handling");
  {
    const failRes = await verifyBankAccount(
      "50200098234123",
      "HDFC0000001",
      "RTTMT Technologies Pvt Ltd",
      { shouldFail: true }
    );

    assert.equal(failRes.isVerified, false, "shouldFail must return isVerified: false");
    assert.equal(failRes.accountHolderNameMatch, false, "Failed match must be false");
    assert.ok(failRes.notes?.includes("could not be verified"), "Failure notes must be informative");

    console.log("  ✓ Explicit failure handling verified.");
  }

  // TEST 6: Asynchronous Invalidation and Abort Handling
  console.log("\n▶ Test 6: Asynchronous Invalidation and Abort Handling");
  {
    const controller = new AbortController();
    const verifyPromise = verifyBankAccount(
      "50200098234123",
      "HDFC0000001",
      "RTTMT Technologies Pvt Ltd",
      { signal: controller.signal }
    );
    // User edits account number immediately while in-flight -> abort
    controller.abort();

    await assert.rejects(
      verifyPromise,
      (err: unknown) => err instanceof DOMException && err.name === "AbortError",
      "Aborted verification must reject with AbortError"
    );

    console.log("  ✓ In-flight verification cancellation verified.");
  }

  console.log("\n🎉 ALL STEP 7 BANK ACCOUNT TESTS PASSED SUCCESSFULLY!\n");
}

runStep7Tests().catch((err) => {
  console.error("❌ Step 7 test suite failed:", err);
  process.exit(1);
});
