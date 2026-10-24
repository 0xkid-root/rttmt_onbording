"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OnboardingFormData, StepKey, ApplicationSubmissionRecord, BusinessEntityType } from "../types";
import { DEFAULT_ONBOARDING_FORM_DATA, SAMPLE_DEMO_FORM_DATA } from "../mocks/initialData";
import { stepSchemas } from "../schemas";
import {
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
  submitApplication,
} from "../services/storageService";

export interface WizardHookReturn {
  currentStep: number;
  totalSteps: number;
  formData: OnboardingFormData;
  completedSteps: Set<number>;
  isSubmitting: boolean;
  stepErrors: Record<string, string>;
  isLoaded: boolean;
  updateStepData: <K extends StepKey>(
    stepKey: K,
    data: Partial<OnboardingFormData[K]>
  ) => void;
  goToStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  saveDraft: () => void;
  loadDemoData: () => void;
  resetDraft: () => void;
  submit: () => Promise<ApplicationSubmissionRecord | null>;
  validateCurrentStep: () => boolean;
  validateStep: (stepNumber: number) => { isValid: boolean; errors: Record<string, string> };
}

export function useOnboardingWizard(): WizardHookReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_ONBOARDING_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize draft from localStorage if present
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadDraftFromStorage();
      if (saved) {
        setFormData(saved.formData);
        setCurrentStep(saved.currentStep || 1);
        toast.info("Resumed from your saved onboarding draft", {
          description: "Your previous progress has been restored.",
        });
      }
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Update specific step slice
  const updateStepData = useCallback(
    <K extends StepKey>(stepKey: K, data: Partial<OnboardingFormData[K]>) => {
      setFormData((prev) => {
        const next = {
          ...prev,
          [stepKey]: {
            ...prev[stepKey],
            ...data,
          },
        };
        // Auto-sync entityType and GST status changes from Step 3 to Step 6 with invalidation
        if (stepKey === "step3") {
          const s3Data = data as Partial<OnboardingFormData["step3"]>;
          if ("entityType" in s3Data && typeof s3Data.entityType === "string" && prev.step3.entityType !== s3Data.entityType) {
            next.step6.entityType = s3Data.entityType as BusinessEntityType;
            next.step6.isKybVerified = false;
            next.step6.kybVerificationStatus = "NOT_STARTED";
            next.step6.kybVerificationNotes = undefined;
          }

          if ("gstin" in s3Data || "hasNoGstDeclaration" in s3Data) {
            const hasGst = Boolean(
              ("gstin" in s3Data ? s3Data.gstin : prev.step3.gstin) &&
              !("hasNoGstDeclaration" in s3Data ? s3Data.hasNoGstDeclaration : prev.step3.hasNoGstDeclaration)
            );
            if (next.step6.hasGstRegistration !== hasGst) {
              next.step6.hasGstRegistration = hasGst;
              next.step6.isKybVerified = false;
              next.step6.kybVerificationStatus = "NOT_STARTED";
              next.step6.kybVerificationNotes = undefined;
            }
          }
        }
        return next;
      });

      // Clear any previous error when user edits
      setStepErrors({});
    },
    []
  );

  // Validate a specific step against its Zod schema
  const validateStep = useCallback(
    (stepNumber: number) => {
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
    },
    [formData]
  );

  // Validate active step
  const validateCurrentStep = useCallback(() => {
    const { isValid, errors } = validateStep(currentStep);
    setStepErrors(errors);

    if (!isValid) {
      const firstError = Object.values(errors)[0] || "Please fill in all required fields";
      toast.error("Form validation issue", {
        description: firstError,
      });
    }

    return isValid;
  }, [currentStep, validateStep]);

  // Compute set of all currently valid/completed steps
  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    for (let i = 1; i <= 9; i++) {
      if (validateStep(i).isValid) {
        set.add(i);
      }
    }
    return set;
  }, [validateStep]);

  // Navigate to specific step
  const goToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > 9) return;

      // Allow navigating backward freely
      if (step < currentStep) {
        setStepErrors({});
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // If jumping ahead, ensure current step is valid
      if (validateCurrentStep()) {
        setStepErrors({});
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep, validateCurrentStep]
  );

  // Next step
  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }

    if (currentStep < 9) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setStepErrors({});
      saveDraftToStorage(formData, next);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    return true;
  }, [currentStep, formData, validateCurrentStep]);

  // Previous step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setStepErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Save draft
  const saveDraft = useCallback(() => {
    saveDraftToStorage(formData, currentStep);
    toast.success("Draft Saved", {
      description: "Your progress is saved securely in your browser session.",
    });
  }, [formData, currentStep]);

  // Load demo data
  const loadDemoData = useCallback(() => {
    setFormData(SAMPLE_DEMO_FORM_DATA);
    setStepErrors({});
    saveDraftToStorage(SAMPLE_DEMO_FORM_DATA, currentStep);
    toast.success("Demo Data Loaded", {
      description: "Sample merchant details populated for testing.",
    });
  }, [currentStep]);

  // Reset draft
  const resetDraft = useCallback(() => {
    clearDraftFromStorage();
    setFormData(DEFAULT_ONBOARDING_FORM_DATA);
    setCurrentStep(1);
    setStepErrors({});
    toast.info("Draft Cleared", {
      description: "Started fresh onboarding application.",
    });
  }, []);

  // Submit complete application
  const submit = useCallback(async (): Promise<ApplicationSubmissionRecord | null> => {
    // Validate Step 9
    const step9Result = validateStep(9);
    if (!step9Result.isValid) {
      setStepErrors(step9Result.errors);
      toast.error("Please agree to the statutory declarations before submitting.");
      return null;
    }

    // Verify all steps are valid
    for (let i = 1; i <= 8; i++) {
      const res = validateStep(i);
      if (!res.isValid) {
        toast.error(`Step ${i} requires attention before submission.`, {
          description: Object.values(res.errors)[0],
        });
        setCurrentStep(i);
        setStepErrors(res.errors);
        return null;
      }
    }

    setIsSubmitting(true);
    try {
      const submission = await submitApplication(formData);
      toast.success("Application Submitted Successfully!", {
        description: `Reference ID: ${submission.referenceId}`,
      });
      router.push("/onboarding/status");
      return submission;
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Submission failed. Please retry.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router, validateStep]);

  return {
    currentStep,
    totalSteps: 9,
    formData,
    completedSteps,
    isSubmitting,
    stepErrors,
    isLoaded,
    updateStepData,
    goToStep,
    nextStep,
    prevStep,
    saveDraft,
    loadDemoData,
    resetDraft,
    submit,
    validateCurrentStep,
    validateStep,
  };
}
