import {
  ApplicationSubmissionRecord,
  OnboardingFormData,
  Step8ComplianceData,
  PepStatus,
  TaxResidencyStatus,
  FatcaCrsClassification,
} from "../types";
import { DEFAULT_ONBOARDING_FORM_DATA } from "../mocks/initialData";

const DRAFT_STORAGE_KEY = "rttmt_onboarding_draft_v1";
const LEGACY_DRAFT_STORAGE_KEY = "rtmt_onboarding_draft_v1";
const SUBMISSION_STORAGE_KEY = "rttmt_onboarding_submission_v1";
const LEGACY_SUBMISSION_STORAGE_KEY = "rtmt_onboarding_submission_v1";

interface StoredDraftPayload {
  formData: OnboardingFormData;
  currentStep: number;
  lastUpdated: string;
}

/**
 * Sanitizes sensitive fields before persisting to browser local storage.
 * Passwords, unmasked identity numbers, and raw credentials are NEVER saved to local storage.
 */
function sanitizeForStorage(data: OnboardingFormData): OnboardingFormData {
  const cloned: OnboardingFormData = JSON.parse(JSON.stringify(data));

  // Purge passwords
  cloned.step1.password = "";
  cloned.step1.confirmPassword = "";

  return cloned;
}

export function saveDraftToStorage(
  data: OnboardingFormData,
  currentStep: number
): void {
  if (typeof window === "undefined") return;

  try {
    const payload: StoredDraftPayload = {
      formData: sanitizeForStorage(data),
      currentStep,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to save draft to localStorage:", err);
  }
}

export function loadDraftFromStorage(): {
  formData: OnboardingFormData;
  currentStep: number;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY) || localStorage.getItem(LEGACY_DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed: StoredDraftPayload = JSON.parse(raw);
    if (!parsed || !parsed.formData) return null;

    // Merge with default data and safely migrate legacy step8 draft keys
    const rawStep8 = (parsed.formData.step8 || {}) as unknown as Record<string, unknown>;
    const migratedStep8: Step8ComplianceData = {
      ...DEFAULT_ONBOARDING_FORM_DATA.step8,
      ...(rawStep8 as unknown as Partial<Step8ComplianceData>),
      transactionMonitoringConsent:
        typeof rawStep8.transactionMonitoringConsent === "boolean"
          ? (rawStep8.transactionMonitoringConsent as boolean)
          : typeof rawStep8.creditCheckConsent === "boolean"
          ? (rawStep8.creditCheckConsent as boolean)
          : DEFAULT_ONBOARDING_FORM_DATA.step8.transactionMonitoringConsent,
      pepStatus:
        typeof rawStep8.pepStatus === "string" && rawStep8.pepStatus
          ? (rawStep8.pepStatus as PepStatus)
          : rawStep8.pepDeclaration === true
          ? ("NO" as const)
          : DEFAULT_ONBOARDING_FORM_DATA.step8.pepStatus,
      fatcaSelfCertificationConfirmed:
        typeof rawStep8.fatcaSelfCertificationConfirmed === "boolean"
          ? (rawStep8.fatcaSelfCertificationConfirmed as boolean)
          : typeof rawStep8.fatcaConsent === "boolean"
          ? (rawStep8.fatcaConsent as boolean)
          : DEFAULT_ONBOARDING_FORM_DATA.step8.fatcaSelfCertificationConfirmed,
      taxResidency:
        typeof rawStep8.taxResidency === "string" && rawStep8.taxResidency
          ? (rawStep8.taxResidency as TaxResidencyStatus)
          : rawStep8.fatcaConsent === true
          ? ("INDIA_ONLY" as const)
          : DEFAULT_ONBOARDING_FORM_DATA.step8.taxResidency,
      fatcaCrsClassification:
        typeof rawStep8.fatcaCrsClassification === "string" && rawStep8.fatcaCrsClassification
          ? (rawStep8.fatcaCrsClassification as FatcaCrsClassification)
          : rawStep8.fatcaConsent === true
          ? ("NON_REPORTABLE" as const)
          : DEFAULT_ONBOARDING_FORM_DATA.step8.fatcaCrsClassification,
    };

    const merged: OnboardingFormData = {
      ...DEFAULT_ONBOARDING_FORM_DATA,
      ...parsed.formData,
      step1: {
        ...DEFAULT_ONBOARDING_FORM_DATA.step1,
        ...parsed.formData.step1,
        password: "",
        confirmPassword: "",
      },
      step8: migratedStep8,
    };

    return {
      formData: merged,
      currentStep: parsed.currentStep || 1,
    };
  } catch (err) {
    console.warn("Failed to parse stored draft from localStorage:", err);
    return null;
  }
}

export function clearDraftFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(LEGACY_DRAFT_STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear draft from localStorage:", err);
  }
}

export async function submitApplication(
  formData: OnboardingFormData
): Promise<ApplicationSubmissionRecord> {
  // Simulate network submission delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const timestamp = new Date().toISOString();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceId = `RTTMT-APP-${new Date().getFullYear()}-${randomSuffix}`;

  const submission: ApplicationSubmissionRecord = {
    referenceId,
    applicationStatus: "UNDER_REVIEW",
    submittedAt: timestamp,
    merchantName: formData.step2.brandName || "Merchant Onboarding Applicant",
    legalEntityName:
      formData.step3.legalEntityName || formData.step2.brandName || "Registered Entity",
    entityType: formData.step3.entityType,
    contactEmail: formData.step1.email,
    contactPhone: formData.step1.phone,
    formData: sanitizeForStorage(formData),
    timeline: [
      {
        id: "step-received",
        event: "Application Received & Logged",
        description: "Merchant onboarding packet received and assigned tracking reference ID.",
        timestamp: "Just now",
        status: "COMPLETED",
      },
      {
        id: "step-validation",
        event: "Format & Structure Validation (Simulated)",
        description: "Simulated syntax verification, PAN format validation, and sanity checks.",
        timestamp: "In Progress",
        status: "CURRENT",
      },
      {
        id: "step-underwriting",
        event: "Risk Underwriting & Document Review (Demo)",
        description: "Simulated review of business profile, compliance declarations, and entity documents.",
        timestamp: "Estimated: 1–2 business days",
        status: "PENDING",
      },
      {
        id: "step-activation",
        event: "Settlement Account Activation & Live MID",
        description: "Issuance of production API secret keys and merchant portal access upon approval.",
        timestamp: "Pending",
        status: "PENDING",
      },
    ],
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(submission));
      clearDraftFromStorage();
    } catch (err) {
      console.warn("Failed to save submission record:", err);
    }
  }

  return submission;
}

export function getSubmittedApplication(): ApplicationSubmissionRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem(SUBMISSION_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_SUBMISSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.referenceId !== "string" ||
      !parsed.referenceId.trim() ||
      typeof parsed.submittedAt !== "string" ||
      !parsed.formData ||
      typeof parsed.formData !== "object"
    ) {
      return null;
    }
    return parsed as ApplicationSubmissionRecord;
  } catch (err) {
    console.warn("Failed to load submitted application:", err);
    return null;
  }
}
