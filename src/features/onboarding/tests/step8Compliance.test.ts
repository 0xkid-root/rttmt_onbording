import assert from "node:assert";
import { step8ComplianceSchema } from "../schemas";
import { validateAndNormalizeWebUrl, getSafeBaseDomain } from "../utils/formatters";
import { Step8ComplianceData } from "../types";

console.log("🚀 Starting RTTMT Step 8 Compliance & Declarations Test Suite...\n");

const baseValidData: Step8ComplianceData = {
  refundPolicyUrl: "https://rttmt.com/refunds",
  termsOfServiceUrl: "https://rttmt.com/terms",
  privacyPolicyUrl: "https://rttmt.com/privacy",
  grievanceEmail: "grievance@rttmt.com",
  grievancePhone: "022-48921000",
  restrictedBusinessDeclaration: true,
  pepStatus: "NO",
  pepDetails: "",
  taxResidency: "INDIA_ONLY",
  taxResidencyCountry: "",
  foreignTaxIdNumber: "",
  fatcaCrsClassification: "NON_REPORTABLE",
  fatcaCrsGiinOrTin: "",
  fatcaSelfCertificationConfirmed: true,
  transactionMonitoringConsent: true,
};

// -------------------------------------------------------------
// Test 1: Complete Valid Compliance Data
// -------------------------------------------------------------
console.log("▶ Test 1: Valid Step 8 Compliance Submission");
{
  const parsed = step8ComplianceSchema.safeParse(baseValidData);
  assert.strictEqual(parsed.success, true, "Valid compliance data must pass schema validation");
  console.log("  ✓ Valid compliance payload parsed successfully.");
}

// -------------------------------------------------------------
// Test 2: Safe URL Validation and Normalization
// -------------------------------------------------------------
console.log("\n▶ Test 2: Safe URL Validation, Protocol Restriction & Normalization");
{
  // 1. Missing protocol auto-prepends https://
  const norm1 = validateAndNormalizeWebUrl("rttmt.com/refunds");
  assert.strictEqual(norm1.isValid, true);
  assert.strictEqual(norm1.normalizedUrl, "https://rttmt.com/refunds");

  // 2. Existing http and https are preserved
  const norm2 = validateAndNormalizeWebUrl("http://insecure.rttmt.com/terms");
  assert.strictEqual(norm2.isValid, true);
  assert.strictEqual(norm2.normalizedUrl, "http://insecure.rttmt.com/terms");

  const norm3 = validateAndNormalizeWebUrl("https://secure.rttmt.com/privacy");
  assert.strictEqual(norm3.isValid, true);
  assert.strictEqual(norm3.normalizedUrl, "https://secure.rttmt.com/privacy");

  // 3. Strict rejection of dangerous non-web schemes
  const normJs = validateAndNormalizeWebUrl("javascript:alert(1)");
  assert.strictEqual(normJs.isValid, false);
  assert.match(normJs.error || "", /Unsupported protocol \(javascript:\)/);

  const normData = validateAndNormalizeWebUrl("data:text/html,<script>alert(1)</script>");
  assert.strictEqual(normData.isValid, false);
  assert.match(normData.error || "", /Unsupported protocol \(data:\)/);

  // 4. Malformed URLs rejected by schema
  const invalidSchemaData = {
    ...baseValidData,
    refundPolicyUrl: "javascript:evil()",
  };
  const parsed = step8ComplianceSchema.safeParse(invalidSchemaData);
  assert.strictEqual(parsed.success, false, "javascript: scheme must fail schema");
  if (!parsed.success) {
    assert.strictEqual(parsed.error.issues[0].path[0], "refundPolicyUrl");
  }

  console.log("  ✓ URL normalization, scheme validation, and dangerous protocol rejection verified.");
}

// -------------------------------------------------------------
// Test 3: Safe Base Domain Extraction for Policy Suggestions
// -------------------------------------------------------------
console.log("\n▶ Test 3: Safe Base Domain Extraction");
{
  assert.strictEqual(
    getSafeBaseDomain("https://rttmt.com/merchants/v2"),
    "https://rttmt.com",
    "Must extract protocol and host without nested paths"
  );
  assert.strictEqual(
    getSafeBaseDomain("rttmt.com"),
    "https://rttmt.com",
    "Must prepend https:// before extracting host if protocol omitted"
  );
  assert.strictEqual(
    getSafeBaseDomain("http://localhost:3000/app"),
    "http://localhost:3000",
    "Must handle local ports correctly"
  );
  assert.strictEqual(
    getSafeBaseDomain("javascript:void(0)"),
    null,
    "Must return null for unsupported protocols"
  );
  assert.strictEqual(getSafeBaseDomain(""), null, "Must return null for empty website");
  console.log("  ✓ Base domain extraction logic and safety verified.");
}

// -------------------------------------------------------------
// Test 4: Structured PEP Declaration
// -------------------------------------------------------------
console.log("\n▶ Test 4: Structured PEP Declaration & Conditional Disclosures");
{
  // 1. Missing PEP status fails
  const missingPep = { ...baseValidData, pepStatus: "" };
  const p1 = step8ComplianceSchema.safeParse(missingPep);
  assert.strictEqual(p1.success, false, "Empty pepStatus must fail");

  // 2. PEP YES without disclosure fails
  const pepYesNoDetails = { ...baseValidData, pepStatus: "YES" as const, pepDetails: "" };
  const p2 = step8ComplianceSchema.safeParse(pepYesNoDetails);
  assert.strictEqual(p2.success, false, "pepStatus YES without pepDetails must fail");
  if (!p2.success) {
    assert.strictEqual(p2.error.issues[0].path[0], "pepDetails");
  }

  // 3. PEP YES with disclosure passes
  const pepYesWithDetails = {
    ...baseValidData,
    pepStatus: "YES" as const,
    pepDetails: "Director Jane Doe is an elected municipal representative.",
  };
  const p3 = step8ComplianceSchema.safeParse(pepYesWithDetails);
  assert.strictEqual(p3.success, true, "pepStatus YES with pepDetails must pass");

  // 4. PEP UNKNOWN without explanation fails
  const pepUnknownNoDetails = { ...baseValidData, pepStatus: "UNKNOWN" as const, pepDetails: "" };
  const p4 = step8ComplianceSchema.safeParse(pepUnknownNoDetails);
  assert.strictEqual(p4.success, false, "pepStatus UNKNOWN without explanation must fail");

  // 5. PEP UNKNOWN with explanation passes
  const pepUnknownWithDetails = {
    ...baseValidData,
    pepStatus: "UNKNOWN" as const,
    pepDetails: "Awaiting beneficial ownership confirmation from institutional holding trust.",
  };
  const p5 = step8ComplianceSchema.safeParse(pepUnknownWithDetails);
  assert.strictEqual(p5.success, true, "pepStatus UNKNOWN with explanation must pass");

  console.log("  ✓ Structured PEP disclosures (YES/NO/UNKNOWN) and conditional validations verified.");
}

// -------------------------------------------------------------
// Test 5: Independent Tax Residency
// -------------------------------------------------------------
console.log("\n▶ Test 5: Independent Tax Residency & Conditional Foreign Jurisdiction");
{
  // 1. Missing taxResidency fails
  const missingTax = { ...baseValidData, taxResidency: "" };
  const p1 = step8ComplianceSchema.safeParse(missingTax);
  assert.strictEqual(p1.success, false, "Empty taxResidency must fail");

  // 2. INDIA_ONLY passes without foreign details
  const indiaOnly = { ...baseValidData, taxResidency: "INDIA_ONLY" as const };
  const p2 = step8ComplianceSchema.safeParse(indiaOnly);
  assert.strictEqual(p2.success, true, "INDIA_ONLY tax residency passes");

  // 3. OTHER without foreign details fails
  const otherNoDetails = {
    ...baseValidData,
    taxResidency: "OTHER" as const,
    taxResidencyCountry: "",
    foreignTaxIdNumber: "",
  };
  const p3 = step8ComplianceSchema.safeParse(otherNoDetails);
  assert.strictEqual(p3.success, false, "OTHER taxResidency without country/TIN must fail");

  // 4. OTHER with foreign details passes
  const otherWithDetails = {
    ...baseValidData,
    taxResidency: "OTHER" as const,
    taxResidencyCountry: "United States",
    foreignTaxIdNumber: "12-3456789",
  };
  const p4 = step8ComplianceSchema.safeParse(otherWithDetails);
  assert.strictEqual(p4.success, true, "OTHER taxResidency with country/TIN passes");

  console.log("  ✓ Tax residency modeled independently with conditional foreign fields.");
}

// -------------------------------------------------------------
// Test 6: Independent FATCA / CRS Classification & Certification
// -------------------------------------------------------------
console.log("\n▶ Test 6: FATCA / CRS Classification & Certification");
{
  // 1. Missing classification fails
  const missingFatca = { ...baseValidData, fatcaCrsClassification: "" };
  const p1 = step8ComplianceSchema.safeParse(missingFatca);
  assert.strictEqual(p1.success, false, "Empty fatcaCrsClassification must fail");

  // 2. Reportable FATCA without GIIN/TIN fails
  const reportableNoGiin = {
    ...baseValidData,
    fatcaCrsClassification: "REPORTABLE_US" as const,
    fatcaCrsGiinOrTin: "",
  };
  const p2 = step8ComplianceSchema.safeParse(reportableNoGiin);
  assert.strictEqual(p2.success, false, "REPORTABLE_US without GIIN/TIN must fail");

  // 3. Reportable FATCA with GIIN passes
  const reportableWithGiin = {
    ...baseValidData,
    fatcaCrsClassification: "REPORTABLE_US" as const,
    fatcaCrsGiinOrTin: "98ABC1.99999.SL.840",
  };
  const p3 = step8ComplianceSchema.safeParse(reportableWithGiin);
  assert.strictEqual(p3.success, true, "REPORTABLE_US with GIIN must pass");

  // 4. Missing self-certification fails
  const noCertification = { ...baseValidData, fatcaSelfCertificationConfirmed: false };
  const p4 = step8ComplianceSchema.safeParse(noCertification);
  assert.strictEqual(p4.success, false, "Unconfirmed self-certification must fail");

  console.log("  ✓ FATCA/CRS classification and certification validations verified.");
}

// -------------------------------------------------------------
// Test 7: Renamed Transaction Monitoring Consent
// -------------------------------------------------------------
console.log("\n▶ Test 7: Renamed Transaction Monitoring Consent Enforcement");
{
  const missingConsent = { ...baseValidData, transactionMonitoringConsent: false };
  const p1 = step8ComplianceSchema.safeParse(missingConsent);
  assert.strictEqual(p1.success, false, "Unchecked transactionMonitoringConsent must fail");

  const validConsent = { ...baseValidData, transactionMonitoringConsent: true };
  const p2 = step8ComplianceSchema.safeParse(validConsent);
  assert.strictEqual(p2.success, true, "Checked transactionMonitoringConsent passes");

  console.log("  ✓ transactionMonitoringConsent renamed and strictly enforced.");
}

console.log("\n🎉 ALL STEP 8 COMPLIANCE TESTS PASSED SUCCESSFULLY!\n");
