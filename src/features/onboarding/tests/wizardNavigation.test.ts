/**
 * Unit & Integration Test Suite for RTTMT Wizard Navigation & Submission Guards
 * Tests:
 * 1. Sequential forward navigation guard: prevents jumping ahead over unvalidated intermediate steps
 * 2. Unrestricted backward navigation
 * 3. Concurrent submission prevention: in-flight guard prevents duplicate application creation
 * 4. Step 3 GST exemption declaration & display integration with Step 6 and Step 9
 * 5. URL normalization and dangerous protocol rejection in Step 2 schema
 * 6. PII masking on Review & Submit screen (PAN and Bank Account Number)
 */

import assert from "node:assert/strict";
import { stepSchemas } from "../schemas";
import {
  DEFAULT_ONBOARDING_FORM_DATA,
  SAMPLE_DEMO_FORM_DATA,
} from "../mocks/initialData";
import {
  maskPan,
  maskBankAccount,
  formatGstinDisplay,
  validateAndNormalizeWebUrl,
} from "../utils/formatters";
import { OnboardingFormData, StepKey } from "../types";

// Helper function modeling wizard step validation
function validateStepHelper(
  formData: OnboardingFormData,
  stepNumber: number
): { isValid: boolean; errors: Record<string, string> } {
  const stepKey = `step${stepNumber}` as StepKey;
  const schema = stepSchemas[stepKey];
  const data = formData[stepKey];

  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const formattedErrors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = issue.message;
    }
  });

  return { isValid: false, errors: formattedErrors };
}

// Helper simulating wizard goToStep logic
function simulateGoToStep(
  formData: OnboardingFormData,
  currentStep: number,
  targetStep: number
): { finalStep: number; stoppedAtStep?: number; errors?: Record<string, string> } {
  if (targetStep < 1 || targetStep > 9) return { finalStep: currentStep };

  // Allow backward navigation freely
  if (targetStep < currentStep) {
    return { finalStep: targetStep };
  }

  // Validate all intermediate steps sequentially
  for (let i = currentStep; i < targetStep; i++) {
    const { isValid, errors } = validateStepHelper(formData, i);
    if (!isValid) {
      return {
        finalStep: i,
        stoppedAtStep: i,
        errors,
      };
    }
  }

  return { finalStep: targetStep };
}

// Helper simulating wizard submission guard
function createSubmissionController(mockSubmitFn: (data: OnboardingFormData) => Promise<{ id: string }>) {
  let isSubmitting = false;

  async function submit(formData: OnboardingFormData): Promise<{ id: string } | null> {
    if (isSubmitting) {
      return null; // Block duplicate in-flight invocation
    }
    isSubmitting = true;

    try {
      // Validate all steps before submitting
      for (let i = 1; i <= 9; i++) {
        const { isValid } = validateStepHelper(formData, i);
        if (!isValid) {
          return null;
        }
      }
      return await mockSubmitFn(formData);
    } finally {
      isSubmitting = false;
    }
  }

  return { submit };
}

async function runWizardNavigationTests() {
  console.log("🚀 Starting RTTMT Wizard Navigation & Submission Guards Test Suite...\n");

  // TEST 1: Forward Step-Jumping Blocked on Empty Form
  console.log("▶ Test 1: Forward Navigation Guard on Incomplete Steps");
  {
    const emptyForm = { ...DEFAULT_ONBOARDING_FORM_DATA };

    // A. Attempt to jump from Step 1 to Step 5 with empty form
    const nav1 = simulateGoToStep(emptyForm, 1, 5);
    assert.equal(nav1.finalStep, 1, "Must remain on Step 1 when Step 1 is invalid");
    assert.equal(nav1.stoppedAtStep, 1, "Must stop at Step 1");
    assert.ok(nav1.errors?.["email"], "Must return Step 1 validation errors");

    // B. Attempt to jump from Step 1 to Step 9
    const nav2 = simulateGoToStep(emptyForm, 1, 9);
    assert.equal(nav2.finalStep, 1, "Must block forward jump to Step 9 on empty form");

    // C. Step 1 is valid, but Step 2 is empty -> attempt jump to Step 6
    const partialForm: OnboardingFormData = {
      ...emptyForm,
      step1: { ...SAMPLE_DEMO_FORM_DATA.step1 },
    };
    const nav3 = simulateGoToStep(partialForm, 1, 6);
    assert.equal(nav3.finalStep, 2, "Must advance past Step 1 but stop at Step 2");
    assert.equal(nav3.stoppedAtStep, 2, "Must identify Step 2 as failing intermediate step");
    assert.ok(nav3.errors?.["brandName"], "Must return Step 2 errors");

    console.log("  ✓ Forward navigation strictly validates intermediate steps and blocks skipping.");
  }

  // TEST 2: Unrestricted Backward Navigation
  console.log("▶ Test 2: Unrestricted Backward Navigation");
  {
    const demoForm = { ...SAMPLE_DEMO_FORM_DATA };
    const navBack = simulateGoToStep(demoForm, 7, 2);
    assert.equal(navBack.finalStep, 2, "Backward navigation must succeed unconditionally");

    const navBackToStart = simulateGoToStep(demoForm, 9, 1);
    assert.equal(navBackToStart.finalStep, 1, "Backward jump to Step 1 must succeed");
    console.log("  ✓ Backward navigation is preserved without blocking.");
  }

  // TEST 3: Concurrent In-Flight Submission Guard
  console.log("▶ Test 3: Concurrent Submission Guard");
  {
    let backendSubmissionCount = 0;
    const mockSubmit = async () => {
      backendSubmissionCount++;
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { id: `ref_${Date.now()}` };
    };

    const controller = createSubmissionController(mockSubmit);

    // Trigger two rapid concurrent submission attempts (simulating double-click)
    const [result1, result2] = await Promise.all([
      controller.submit(SAMPLE_DEMO_FORM_DATA),
      controller.submit(SAMPLE_DEMO_FORM_DATA),
    ]);

    assert.equal(backendSubmissionCount, 1, "Backend submit function must be called exactly once");
    assert.ok(
      (result1 && !result2) || (!result1 && result2),
      "Exactly one submission call must succeed, while the concurrent call must return null"
    );

    console.log("  ✓ Synchronous in-flight guard prevents duplicate submission records.");
  }

  // TEST 4: Step 3 GST Exemption Declaration & Cross-Step Sync
  console.log("▶ Test 4: GST Exemption Declaration & Display");
  {
    // A. Explicit exemption declared (Sole Proprietor without GST)
    const exemptDisplay = formatGstinDisplay("", true, false);
    assert.equal(
      exemptDisplay,
      "Exempt (Declaration Provided)",
      "Explicit declaration must display exemption"
    );

    // B. Missing GSTIN with NO declaration
    const unregisteredDisplay = formatGstinDisplay("", false, false);
    assert.equal(
      unregisteredDisplay,
      "Not Registered / Not Provided",
      "Missing GSTIN without declaration must not be marked exempt"
    );

    // C. Valid GSTIN provided
    const gstinDisplay = formatGstinDisplay("27AAACA7823K1Z5", false, false);
    assert.equal(
      gstinDisplay,
      "27AAACA7823K1Z5",
      "Valid GSTIN must display normalized uppercase string"
    );

    console.log("  ✓ GST exemption vs absence is accurately distinguished.");
  }

  // TEST 5: Step 2 URL Validation & Scheme Enforcement
  console.log("▶ Test 5: Step 2 URL Validation & Protocol Security");
  {
    const step2Schema = stepSchemas.step2;

    // A. Plain domain input normalized to HTTPS
    const norm = validateAndNormalizeWebUrl("mybrand.com");
    assert.equal(norm.isValid, true, "Plain domain should be recognized as valid web URL");
    assert.equal(norm.normalizedUrl, "https://mybrand.com/", "Should prepend https://");

    // B. Valid step2 payload with plain domain normalized
    const validStep2 = step2Schema.safeParse({
      ...SAMPLE_DEMO_FORM_DATA.step2,
      websiteUrl: "mybrand.com",
    });
    assert.equal(validStep2.success, true, "Domain URL should pass Step 2 schema");

    // C. Rejection of dangerous schemes
    const dangerous1 = validateAndNormalizeWebUrl("javascript:alert(1)");
    assert.equal(dangerous1.isValid, false, "javascript: scheme must be rejected");

    const dangerous2 = validateAndNormalizeWebUrl("data:text/html,<script>alert(1)</script>");
    assert.equal(dangerous2.isValid, false, "data: scheme must be rejected");

    const invalidStep2 = step2Schema.safeParse({
      ...SAMPLE_DEMO_FORM_DATA.step2,
      websiteUrl: "javascript:void(0)",
    });
    assert.equal(invalidStep2.success, false, "Dangerous URL must fail Step 2 schema");

    console.log("  ✓ Step 2 URL validation enforces HTTP/HTTPS and rejects dangerous protocols.");
  }

  // TEST 6: Masking on Review & Status
  console.log("▶ Test 6: Sensitive PII Masking");
  {
    // PAN masking
    assert.equal(maskPan("AAACA7823K", false), "••••••823K", "PAN must be masked by default");
    assert.equal(maskPan("AAACA7823K", true), "AAACA7823K", "PAN revealed on demand");
    assert.equal(maskPan(""), "—", "Empty PAN displays dash");

    // Bank Account masking
    assert.equal(
      maskBankAccount("50200012345678"),
      "••••••••5678",
      "Account number must show only last 4 digits"
    );
    assert.equal(maskBankAccount(""), null, "Empty account returns null");

    console.log("  ✓ Sensitive PAN and bank account numbers are masked by default.");
  }

  console.log("\n🎉 ALL WIZARD NAVIGATION & SUBMISSION TESTS PASSED SUCCESSFULLY!\n");
}

runWizardNavigationTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
