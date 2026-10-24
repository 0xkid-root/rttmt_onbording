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
