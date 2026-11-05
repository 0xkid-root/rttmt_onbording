/**
 * Unit Test Suite for Document Management, Lifecycle & Storage Sanitization
 * Tests:
 * 1. File type validation (Allowed: PDF, JPEG, PNG, WEBP; Disallowed: EXE, SVG, TXT, etc.)
 * 2. File size limit enforcement (<= 5MB allowed, > 5MB rejected)
 * 3. Safe object URL lifecycle management (revocation utility)
 * 4. Document sanitization for local storage (stripping dead blob URLs, preserving metadata)
 * 5. Entity-specific required document validation
 */

import assert from "node:assert/strict";
import {
  validateUploadedFile,
  revokeDocumentBlobUrl,
  sanitizeDocumentForStorage,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
} from "../utils/documentHelpers";
import { areRequiredKybDocsUploaded } from "../config/kybDocuments";
import { UploadedDocument } from "../types";

console.log("\n🚀 Starting RTTMT Document Management & Lifecycle Test Suite...\n");

// Mock File helper for Node environment
function createMockFile(name: string, type: string, sizeBytes: number): File {
  return {
    name,
    type,
    size: sizeBytes,
    lastModified: Date.now(),
    arrayBuffer: async () => new ArrayBuffer(0),
    slice: () => new Blob(),
    stream: () => ({} as ReadableStream),
    text: async () => "",
  } as unknown as File;
}

// ----------------------------------------------------------------------------
// Test 1: File Type Validation
// ----------------------------------------------------------------------------
console.log("▶ Test 1: File Type Validation (MIME enforcement)");

assert.strictEqual(ALLOWED_FILE_TYPES.length, 4, "Must define exactly 4 allowed MIME types");
assert.ok(ALLOWED_FILE_TYPES.includes("application/pdf"), "PDF must be in allowed list");

const validPdf = createMockFile("registration_cert.pdf", "application/pdf", 1024 * 500);
const validPng = createMockFile("pan_card.png", "image/png", 1024 * 300);
const validJpeg = createMockFile("board_res.jpeg", "image/jpeg", 1024 * 400);
const validWebp = createMockFile("cheque.webp", "image/webp", 1024 * 250);

assert.strictEqual(validateUploadedFile(validPdf).isValid, true, "PDF must be accepted");
assert.strictEqual(validateUploadedFile(validPng).isValid, true, "PNG must be accepted");
assert.strictEqual(validateUploadedFile(validJpeg).isValid, true, "JPEG must be accepted");
assert.strictEqual(validateUploadedFile(validWebp).isValid, true, "WEBP must be accepted");

// Disallowed file types
const disallowedExe = createMockFile("malicious.exe", "application/x-msdownload", 1024);
const disallowedSvg = createMockFile("vector.svg", "image/svg+xml", 1024);
const disallowedTxt = createMockFile("notes.txt", "text/plain", 1024);
const disallowedZip = createMockFile("archive.zip", "application/zip", 1024);

const resExe = validateUploadedFile(disallowedExe);
assert.strictEqual(resExe.isValid, false, "EXE must be rejected");
assert.match(resExe.error || "", /Unsupported file type/, "Appropriate error message for EXE");

const resSvg = validateUploadedFile(disallowedSvg);
assert.strictEqual(resSvg.isValid, false, "SVG must be rejected (potential XSS vector)");

const resTxt = validateUploadedFile(disallowedTxt);
assert.strictEqual(resTxt.isValid, false, "Plain text must be rejected");

const resZip = validateUploadedFile(disallowedZip);
assert.strictEqual(resZip.isValid, false, "Zip files must be rejected");

console.log("  ✓ Supported MIME types accepted; dangerous and unapproved file formats rejected.");

// ----------------------------------------------------------------------------
// Test 2: File Size Validation (5MB boundary)
// ----------------------------------------------------------------------------
console.log("\n▶ Test 2: File Size Boundary Enforcement");

const withinLimitFile = createMockFile("doc.pdf", "application/pdf", MAX_FILE_SIZE_BYTES);
assert.strictEqual(validateUploadedFile(withinLimitFile).isValid, true, "5MB exact size must be valid");

const overLimitFile = createMockFile("oversized.pdf", "application/pdf", MAX_FILE_SIZE_BYTES + 1);
const resOverLimit = validateUploadedFile(overLimitFile);
assert.strictEqual(resOverLimit.isValid, false, "File over 5MB must be rejected");
assert.match(resOverLimit.error || "", /exceeds 5MB limit/, "Clear error message for oversized file");

console.log("  ✓ 5MB maximum file size boundary strictly enforced.");

// ----------------------------------------------------------------------------
// Test 3: Temporary Blob URL Revocation
// ----------------------------------------------------------------------------
console.log("\n▶ Test 3: Safe Blob URL Revocation Lifecycle");

let revokedUrl: string | null = null;
const originalRevoke = (globalThis as unknown as { URL: { revokeObjectURL?: (u: string) => void } }).URL.revokeObjectURL;

// Mock URL.revokeObjectURL
(globalThis as unknown as { URL: { revokeObjectURL: (u: string) => void } }).URL.revokeObjectURL = (url: string) => {
  revokedUrl = url;
};

// Revoking a blob URL calls revokeObjectURL
revokeDocumentBlobUrl("blob:http://localhost:3000/1234-5678");
assert.strictEqual(revokedUrl, "blob:http://localhost:3000/1234-5678", "Blob URL should be revoked");

// Non-blob or undefined URLs should not trigger revokeObjectURL
revokedUrl = null;
revokeDocumentBlobUrl("https://storage.rttmt.com/files/doc.pdf");
assert.strictEqual(revokedUrl, null, "Remote HTTPS URL should not trigger revokeObjectURL");

revokeDocumentBlobUrl(undefined);
assert.strictEqual(revokedUrl, null, "Undefined URL should not trigger revokeObjectURL");

// Restore
if (originalRevoke) {
  (globalThis as unknown as { URL: { revokeObjectURL: (u: string) => void } }).URL.revokeObjectURL = originalRevoke;
}

console.log("  ✓ Blob URL revocation utility cleans up in-memory references safely.");

// ----------------------------------------------------------------------------
// Test 4: Document Sanitization for Persistent Storage
// ----------------------------------------------------------------------------
console.log("\n▶ Test 4: Document Storage Sanitization");

const mockUploadedDocWithBlob: UploadedDocument = {
  id: "doc-test-1",
  name: "gst_certificate.pdf",
  size: 204800,
  type: "application/pdf",
  uploadedAt: new Date().toISOString(),
  status: "PENDING",
  documentType: "gstCertificateDoc",
  fileUrl: "blob:http://localhost:3000/blob-id-9999",
};

const sanitized = sanitizeDocumentForStorage(mockUploadedDocWithBlob);
assert.ok(sanitized, "Sanitized doc must exist");
assert.strictEqual(sanitized?.name, "gst_certificate.pdf", "Metadata preserved");
assert.strictEqual(sanitized?.size, 204800, "Size preserved");
assert.strictEqual(sanitized?.fileUrl, undefined, "Dead blob URL must be stripped before storage");

const mockDocWithRemoteUrl: UploadedDocument = {
  id: "doc-test-2",
  name: "passport.jpg",
  size: 102400,
  type: "image/jpeg",
  uploadedAt: new Date().toISOString(),
  status: "VERIFIED",
  documentType: "identityDoc",
  fileUrl: "https://s3.ap-south-1.amazonaws.com/rttmt-docs/passport.jpg",
};

const sanitizedRemote = sanitizeDocumentForStorage(mockDocWithRemoteUrl);
assert.strictEqual(
  sanitizedRemote?.fileUrl,
  "https://s3.ap-south-1.amazonaws.com/rttmt-docs/passport.jpg",
  "Persistent remote storage URLs must be preserved"
);

assert.strictEqual(sanitizeDocumentForStorage(undefined), undefined, "Undefined doc returns undefined");

console.log("  ✓ Temporary blob URLs stripped from persistent drafts while remote URLs and metadata are preserved.");

// ----------------------------------------------------------------------------
// Test 5: Entity-specific Document Requirement Checks
// ----------------------------------------------------------------------------
console.log("\n▶ Test 5: Required vs Optional Document Completeness");

const dummyDoc: UploadedDocument = {
  id: "dummy-1",
  name: "doc.pdf",
  size: 1000,
  type: "application/pdf",
  uploadedAt: new Date().toISOString(),
  status: "PENDING",
  documentType: "businessRegistrationDoc",
};

// Private Limited: Incomplete when only businessRegistrationDoc is provided
const pvtLtdIncomplete = areRequiredKybDocsUploaded(
  {
    entityType: "PRIVATE_LIMITED",
    businessRegistrationDoc: dummyDoc,
    beneficialOwners: [],
    hasNoUboDeclaration: false,
    isKybVerified: false,
    kybVerificationStatus: "NOT_STARTED",
  },
  true,
  false
);
assert.strictEqual(
  pvtLtdIncomplete.isComplete,
  false,
  "Private Limited requires constitutional doc, board resolution, and company PAN as well"
);

// Private Limited: Complete when all mandatory docs are present
const pvtLtdComplete = areRequiredKybDocsUploaded(
  {
    entityType: "PRIVATE_LIMITED",
    businessRegistrationDoc: dummyDoc,
    constitutionalDoc: dummyDoc,
    boardResolutionDoc: dummyDoc,
    companyPanDoc: dummyDoc,
    gstCertificateDoc: dummyDoc,
    beneficialOwners: [],
    hasNoUboDeclaration: false,
    isKybVerified: false,
    kybVerificationStatus: "NOT_STARTED",
  },
  true, // hasGstRegistration
  false // isGstExempt
);
assert.strictEqual(pvtLtdComplete.isComplete, true, "Private Limited is complete when all required docs are present");

// GST exempt Sole Proprietorship: Should not require GST certificate or company PAN
const gstExemptSoleProp = areRequiredKybDocsUploaded(
  {
    entityType: "SOLE_PROPRIETORSHIP",
    businessRegistrationDoc: dummyDoc,
    boardResolutionDoc: dummyDoc,
    beneficialOwners: [],
    hasNoUboDeclaration: false,
    isKybVerified: false,
    kybVerificationStatus: "NOT_STARTED",
  },
  false, // hasGstRegistration: false
  true   // isGstExempt: true
);
assert.strictEqual(
  gstExemptSoleProp.isComplete,
  true,
  "Sole Proprietorship with GST exemption does not require GST certificate"
);

console.log("  ✓ Entity-specific document requirements and GST exemption states accurately evaluated.");

console.log("\n🎉 ALL DOCUMENT MANAGEMENT & LIFECYCLE TESTS PASSED SUCCESSFULLY!\n");
