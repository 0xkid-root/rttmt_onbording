import { UploadedDocument } from "../types";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateUploadedFile(file: File): FileValidationResult {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Unsupported file type. Please upload a PDF, PNG, JPG, or WEBP file.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: "File size exceeds 5MB limit. Please compress or select a smaller file.",
    };
  }

  return { isValid: true };
}

export function createMockUploadedDoc(
  file: File,
  documentType: string
): UploadedDocument {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
    status: "PENDING",
    documentType,
    fileUrl: URL.createObjectURL(file),
  };
}

/**
 * Revokes a temporary DOM object URL to prevent memory leaks in the browser session.
 */
export function revokeDocumentBlobUrl(fileUrl?: string): void {
  if (
    typeof URL !== "undefined" &&
    typeof URL.revokeObjectURL === "function" &&
    fileUrl &&
    fileUrl.startsWith("blob:")
  ) {
    try {
      URL.revokeObjectURL(fileUrl);
    } catch {
      // Safe fallback if already revoked or invalid
    }
  }
}

/**
 * Sanitizes an uploaded document for persistent browser storage (e.g. localStorage).
 * Strips temporary in-memory blob URLs that become invalid once the session expires.
 */
export function sanitizeDocumentForStorage(
  doc?: UploadedDocument
): UploadedDocument | undefined {
  if (!doc) return undefined;
  const { fileUrl, ...rest } = doc;
  return {
    ...rest,
    fileUrl: fileUrl && !fileUrl.startsWith("blob:") ? fileUrl : undefined,
  };
}

