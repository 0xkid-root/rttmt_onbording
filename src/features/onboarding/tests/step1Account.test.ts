import assert from "node:assert";
import { step1AccountSchema } from "../schemas";
import {
  isOfficialCompanyEmail,
  isValidIndianMobileNumber,
} from "../utils/formatters";

console.log("🚀 Starting RTTMT Step 1 Official Email & Aadhaar Mobile Test Suite...\n");

// Test 1: Disallow Personal / Free Webmail Domains
console.log("▶ Test 1: Disallow Personal / Free Webmail Domains");
const disallowedSamples = [
  "merchant@gmail.com",
  "founder@googlemail.com",
  "billing@yahoo.com",
  "admin@yahoo.co.in",
  "ops@hotmail.com",
  "ceo@outlook.com",
  "support@rediffmail.com",
  "contact@icloud.com",
  "info@proton.me",
  "legal@zoho.com",
];

for (const email of disallowedSamples) {
  const result = isOfficialCompanyEmail(email);
  assert.strictEqual(
    result.isValid,
    false,
    `Personal domain email "${email}" must be rejected`
  );
  assert.ok(
    result.error?.includes("Personal email domain"),
    `Error message for "${email}" must mention personal email restriction`
  );
}
console.log("  ✓ All personal/free webmail domains successfully rejected.\n");

// Test 2: Allow Official Corporate / Company Domains
console.log("▶ Test 2: Allow Official Corporate / Company Domains");
const corporateSamples = [
  "compliance@rttmt.com",
  "aditya.rao@rttmt.com",
  "finance@tata.com",
  "operations@infosys.in",
  "support@paytm.co",
  "accounts@startup.io",
  "founder@zerodha.tech",
];

for (const email of corporateSamples) {
  const result = isOfficialCompanyEmail(email);
  assert.strictEqual(
    result.isValid,
    true,
    `Corporate email "${email}" must be accepted`
  );
  assert.ok(result.domain, `Corporate email "${email}" should return recognized domain`);
}
console.log("  ✓ Official corporate domains successfully accepted.\n");

// Test 3: Aadhaar-Linked Mobile Format & Validity
console.log("▶ Test 3: Aadhaar-Linked Mobile Format & Validity");
// Valid Indian mobile numbers starting with 6, 7, 8, or 9
const validMobiles = [
  "9876543210",
  "8123456789",
  "7012345678",
  "6234567890",
  "+91 9876543210",
  "09876543210",
];

for (const mobile of validMobiles) {
  const res = isValidIndianMobileNumber(mobile);
  assert.strictEqual(
    res.isValid,
    true,
    `Mobile number "${mobile}" must be recognized as valid Indian mobile`
  );
}

// Invalid mobile numbers
const invalidMobiles = [
  "1234567890", // Invalid prefix
  "4987654321", // Invalid prefix
  "98765", // Less than 10 digits
  "9999999999", // Repetitive dummy digits
  "0000000000", // Repetitive dummy digits
  "1234567890123", // Too long
  "", // Empty
];

for (const mobile of invalidMobiles) {
  const res = isValidIndianMobileNumber(mobile);
  assert.strictEqual(
    res.isValid,
    false,
    `Invalid mobile number "${mobile}" must be rejected`
  );
}
console.log("  ✓ Aadhaar-linked mobile number validation checks verified.\n");

// Test 4: Full Step 1 Schema Validation Integration
console.log("▶ Test 4: Full Step 1 Schema Validation Integration");

const validStep1Payload = {
  email: "compliance@rttmt.com",
  isEmailVerified: true,
  phone: "9876543210",
  isPhoneVerified: true,
  password: "Password@123",
  confirmPassword: "Password@123",
  agreeToTerms: true,
};

const validResult = step1AccountSchema.safeParse(validStep1Payload);
assert.strictEqual(
  validResult.success,
  true,
  "Valid Step 1 payload with official email and Aadhaar phone must parse"
);

// Payload with personal @gmail.com email
const personalEmailPayload = {
  ...validStep1Payload,
  email: "test.merchant@gmail.com",
};
const personalResult = step1AccountSchema.safeParse(personalEmailPayload);
assert.strictEqual(
  personalResult.success,
  false,
  "Step 1 payload with @gmail.com must be rejected by schema"
);
const emailError = personalResult.error?.issues.find((i) => i.path.includes("email"));
assert.ok(emailError, "Must contain email error issue");
assert.ok(
  emailError.message.includes("official company email"),
  "Email error must instruct to provide official company email"
);

// Payload with invalid mobile
const invalidPhonePayload = {
  ...validStep1Payload,
  phone: "1234567890",
};
const phoneResult = step1AccountSchema.safeParse(invalidPhonePayload);
assert.strictEqual(
  phoneResult.success,
  false,
  "Step 1 payload with invalid mobile must be rejected by schema"
);
const phoneError = phoneResult.error?.issues.find((i) => i.path.includes("phone"));
assert.ok(phoneError, "Must contain phone error issue");

console.log("  ✓ Step 1 schema enforces official email and Aadhaar mobile.\n");

console.log("🎉 ALL STEP 1 OFFICIAL EMAIL & AADHAAR MOBILE TESTS PASSED SUCCESSFULLY!");
