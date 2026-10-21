import { ApplicationSubmissionRecord, OnboardingFormData } from "../types";
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

    // Merge with default data to guarantee all schema properties are present
    const merged: OnboardingFormData = {
      ...DEFAULT_ONBOARDING_FORM_DATA,
      ...parsed.formData,
      step1: {
        ...DEFAULT_ONBOARDING_FORM_DATA.step1,
        ...parsed.formData.step1,
        password: "",
        confirmPassword: "",
      },
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
        event: "Application Received & Logged",
        description: "Merchant onboarding packet received and assigned reference ID.",
        timestamp: "Just now",
        status: "COMPLETED",
      },
      {
        event: "Automated Registry & Fraud Screening",
        description: "Checking MCA/ROC records, PAN status, and sanction watchlists.",
        timestamp: "In Progress",
        status: "CURRENT",
      },
      {
        event: "Risk Underwriting & Document Audit",
        description: "Review of compliance policies, website terms, and entity documents.",
        timestamp: "Estimated: 2 hours",
        status: "PENDING",
      },
      {
        event: "Settlement Account Activation & Live MID",
        description: "Issuance of production API secret keys and merchant dashboard access.",
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
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load submitted application:", err);
    return null;
  }
}
