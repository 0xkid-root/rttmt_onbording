export type BusinessEntityType =
  | "SOLE_PROPRIETORSHIP"
  | "PRIVATE_LIMITED"
  | "PUBLIC_LIMITED"
  | "LLP"
  | "PARTNERSHIP"
  | "TRUST_NGO";

export type VerificationStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "VERIFIED"
  | "FAILED";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_SCRUTINY"
  | "ACTION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: VerificationStatus;
  documentType: string;
  fileUrl?: string;
  error?: string;
}

export interface BankVerificationResult {
  isVerified: boolean;
  isSimulated?: boolean;
  bankName: string;
  branchName: string;
  city: string;
  accountHolderNameMatch: boolean;
  verifiedAt?: string;
  pennyDropReference?: string;
  accountNumberMasked?: string;
  notes?: string;
}

// Step 1: Account Verification
export interface Step1AccountData {
  email: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Step 2: Business Profile
export interface Step2BusinessProfileData {
  brandName: string;
  businessCategory: string;
  subCategory: string;
  websiteUrl: string;
  mobileAppUrl?: string;
  businessDescription: string;
  expectedMonthlyVolume: string;
  averageTransactionValue: number | string;
}

// Step 3: Company Details
export interface Step3CompanyDetailsData {
  legalEntityName: string;
  entityType: BusinessEntityType;
  incorporationDate: string;
  panNumber: string;
  gstin?: string;
  hasNoGstDeclaration?: boolean;
  registrationNumber?: string; // CIN for Pvt/Public Ltd, LLPIN for LLP, Reg No for others
}

// Step 4: Business Address
export interface AddressDetails {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Step4BusinessAddressData {
  registeredAddress: AddressDetails;
  isOperatingAddressSame: boolean;
  operatingAddress?: AddressDetails;
}

export type IdentityDocumentType = "AADHAAR" | "PAN" | "PASSPORT" | "VOTER_ID";
export type AddressDocumentType = "PASSPORT" | "DRIVING_LICENSE" | "UTILITY_BILL";

export interface DocumentSideFiles {
  front?: UploadedDocument;
  back?: UploadedDocument;
}

// Step 5: KYC (Signatory / Director / Proprietor)
export interface Step5KYCData {
  signatoryName: string;
  designation: string;
  dateOfBirth?: string;
  personalPan: string;
  isPanVerified?: boolean;
  panVerifiedName?: string;
  panVerificationStatus?: "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
  idDocumentType: IdentityDocumentType;
  idDocumentNumber: string;
  isIdVerified?: boolean;
  idVerificationStatus?: "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
  signatoryEmail: string;
  signatoryPhone: string;

  // Dynamic multi-side document uploads
  identityProofFiles?: DocumentSideFiles;
  addressDocumentType?: AddressDocumentType;
  addressProofFiles?: DocumentSideFiles;

  // Backward-compatible single document references
  identityProofDocument?: UploadedDocument;
  addressProofDocument?: UploadedDocument;

  isKycVerified: boolean;
}

// Step 6: KYB (Entity-Specific Business Documents)
export interface BeneficialOwner {
  id?: string;
  name: string;
  pan: string;
  percentageHolding: number;
  isPep: boolean; // Politically exposed person
}

export interface Step6KYBData {
  entityType: BusinessEntityType;
  hasGstRegistration?: boolean; // Synced from Step 3 GSTIN registration state
  businessRegistrationDoc?: UploadedDocument; // COI / Shop Est / Partnership Deed
  constitutionalDoc?: UploadedDocument; // MOA/AOA / LLP Agreement
  boardResolutionDoc?: UploadedDocument; // Board resolution or authorization letter
  companyPanDoc?: UploadedDocument;
  gstCertificateDoc?: UploadedDocument;
  isGstExempt?: boolean;
  beneficialOwners: BeneficialOwner[];
  hasNoUboDeclaration: boolean;
  isKybVerified: boolean;
  kybVerificationStatus?: "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
  kybVerificationNotes?: string;
}

// Step 7: Settlement Bank Account
export interface Step7BankAccountData {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: "CURRENT" | "SAVINGS";
  bankName: string;
  branchName: string;
  isBankVerified: boolean;
  bankVerificationDetails?: BankVerificationResult;
}

// Step 8: Compliance & Declarations
export type PepStatus = "NO" | "YES" | "UNKNOWN" | "";
export type TaxResidencyStatus = "INDIA_ONLY" | "OTHER" | "";
export type FatcaCrsClassification =
  | "NON_REPORTABLE"
  | "REPORTABLE_US"
  | "REPORTABLE_OTHER"
  | "EXEMPT"
  | "";

export interface Step8ComplianceData {
  refundPolicyUrl: string;
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
  grievanceEmail: string;
  grievancePhone: string;
  restrictedBusinessDeclaration: boolean;

  // Structured PEP declaration
  pepStatus: PepStatus;
  pepDetails?: string;

  // Independent Tax Residency
  taxResidency: TaxResidencyStatus;
  taxResidencyCountry?: string;
  foreignTaxIdNumber?: string;

  // Independent FATCA / CRS Classification & Certification
  fatcaCrsClassification: FatcaCrsClassification;
  fatcaCrsGiinOrTin?: string;
  fatcaSelfCertificationConfirmed: boolean;

  // Transaction Monitoring Consent (renamed from creditCheckConsent)
  transactionMonitoringConsent: boolean;

  // Backward-compatibility alias for legacy draft payloads
  creditCheckConsent?: boolean;
}

// Step 9: Review & Submit
export interface Step9ReviewData {
  declarationAccepted: boolean;
  authorizedSignatoryConfirmation: boolean;
}

// Complete Consolidated Onboarding Form State
export interface OnboardingFormData {
  step1: Step1AccountData;
  step2: Step2BusinessProfileData;
  step3: Step3CompanyDetailsData;
  step4: Step4BusinessAddressData;
  step5: Step5KYCData;
  step6: Step6KYBData;
  step7: Step7BankAccountData;
  step8: Step8ComplianceData;
  step9: Step9ReviewData;
}

export type StepKey =
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "step5"
  | "step6"
  | "step7"
  | "step8"
  | "step9";

export interface StepConfig {
  id: StepKey;
  stepNumber: number;
  title: string;
  shortTitle: string;
  description: string;
}

export interface ApplicationSubmissionRecord {
  referenceId: string;
  applicationStatus: ApplicationStatus;
  submittedAt: string;
  merchantName: string;
  legalEntityName: string;
  entityType: BusinessEntityType;
  contactEmail: string;
  contactPhone: string;
  formData: OnboardingFormData;
  timeline: {
    id?: string;
    event: string;
    description: string;
    timestamp: string;
    status: "COMPLETED" | "CURRENT" | "PENDING";
  }[];
}
