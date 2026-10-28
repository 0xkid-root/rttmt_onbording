import React from "react";
import {
  MailCheck,
  Briefcase,
  Building2,
  FileCheck2,
  Landmark,
  ClipboardCheck,
} from "lucide-react";

export interface WorkflowStage {
  id: number;
  stepNumber: string;
  wizardSteps: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 1,
    stepNumber: "01",
    wizardSteps: "Step 1",
    title: "Contact Details",
    description: "Verify your email and mobile number.",
    icon: MailCheck,
  },
  {
    id: 2,
    stepNumber: "02",
    wizardSteps: "Step 2",
    title: "Business Details",
    description: "Enter your business information.",
    icon: Briefcase,
  },
  {
    id: 3,
    stepNumber: "03",
    wizardSteps: "Steps 3–4",
    title: "Company & Address",
    description: "Provide registration and address details.",
    icon: Building2,
  },
  {
    id: 4,
    stepNumber: "04",
    wizardSteps: "Steps 5–6",
    title: "KYC & KYB",
    description: "Upload required identity and business documents.",
    icon: FileCheck2,
  },
  {
    id: 5,
    stepNumber: "05",
    wizardSteps: "Step 7",
    title: "Bank Details",
    description: "Provide your settlement account information.",
    icon: Landmark,
  },
  {
    id: 6,
    stepNumber: "06",
    wizardSteps: "Steps 8–9",
    title: "Review & Submit",
    description: "Review and submit your application.",
    icon: ClipboardCheck,
  },
];
