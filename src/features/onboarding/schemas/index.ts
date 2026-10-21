import { z } from "zod";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Document schema
export const uploadedDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  uploadedAt: z.string(),
  status: z.enum(["NOT_STARTED", "PENDING", "VERIFIED", "FAILED"]),
  documentType: z.string(),
  fileUrl: z.string().optional(),
  error: z.string().optional(),
});

// Step 1: Account Verification Schema
export const step1AccountSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid work email address"),
    isEmailVerified: z.boolean().refine((val) => val === true, {
      message: "Please complete mock OTP verification for your email address",
    }),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(PHONE_REGEX, "Enter a valid 10-digit Indian mobile number"),
    isPhoneVerified: z.boolean().refine((val) => val === true, {
      message: "Please complete mock OTP verification for your mobile number",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service & Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Step 2: Business Profile Schema
export const step2BusinessProfileSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(2, "Brand or operating name must be at least 2 characters")
    .max(100, "Brand name cannot exceed 100 characters"),
  businessCategory: z.string().min(1, "Please select a business category"),
  subCategory: z.string().min(1, "Please select an industry subcategory"),
  websiteUrl: z
    .string()
    .trim()
    .min(1, "Business website URL is required")
    .url("Enter a valid URL (e.g., https://example.com)"),
  mobileAppUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Please enter a valid app store link or leave empty",
    }),
  businessDescription: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters describing your goods or services")
    .max(1000, "Description cannot exceed 1000 characters"),
  expectedMonthlyVolume: z
    .string()
    .min(1, "Please select your expected monthly volume tier"),
  averageTransactionValue: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Average transaction value must be a positive amount in INR",
    }),
});

// Step 3: Company Details Schema
export const step3CompanyDetailsSchema = z
  .object({
    legalEntityName: z
      .string()
      .trim()
      .min(3, "Legal entity name must be at least 3 characters")
      .max(150, "Legal name cannot exceed 150 characters"),
    entityType: z.enum([
      "SOLE_PROPRIETORSHIP",
      "PRIVATE_LIMITED",
      "PUBLIC_LIMITED",
      "LLP",
      "PARTNERSHIP",
      "TRUST_NGO",
    ]),
    incorporationDate: z
      .string()
      .min(1, "Date of incorporation/registration is required")
      .refine((date) => !isNaN(Date.parse(date)) && new Date(date) <= new Date(), {
        message: "Incorporation date cannot be in the future",
      }),
    panNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(PAN_REGEX, "Enter a valid 10-character PAN (e.g., AAACA7823K)"),
    gstin: z.string().trim().toUpperCase().optional(),
    hasNoGstDeclaration: z.boolean().optional(),
    registrationNumber: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // If corporate entity, CIN or LLPIN or Reg is required
    if (
      ["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(data.entityType) &&
      (!data.registrationNumber || data.registrationNumber.trim().length < 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationNumber"],
        message: "Corporate Identification Number (CIN) is required for company entities",
      });
    }

    if (
      data.entityType === "LLP" &&
      (!data.registrationNumber || data.registrationNumber.trim().length < 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationNumber"],
        message: "LLPIN is required for Limited Liability Partnerships",
      });
    }

    // GSTIN validation: required for companies/LLP, optional for Sole Prop if declaration checked
    if (!data.hasNoGstDeclaration) {
      if (!data.gstin || !GSTIN_REGEX.test(data.gstin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstin"],
          message:
            "Enter a valid 15-character GSTIN (or check below if exempt by turnover)",
        });
      }
    }
  });

// Step 4: Business Address Schema
const addressObjectSchema = z.object({
  line1: z.string().trim().min(5, "Address Line 1 must be at least 5 characters"),
  line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().min(1, "Please select a state"),
  postalCode: z
    .string()
    .trim()
    .regex(PINCODE_REGEX, "Enter a valid 6-digit Indian PIN code"),
  country: z.string().default("India"),
});

export const step4BusinessAddressSchema = z
  .object({
    registeredAddress: addressObjectSchema,
    isOperatingAddressSame: z.boolean(),
    operatingAddress: addressObjectSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isOperatingAddressSame) {
      if (!data.operatingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operatingAddress", "line1"],
          message: "Operating address is required when different from registered address",
        });
        return;
      }
      const result = addressObjectSchema.safeParse(data.operatingAddress);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ["operatingAddress", ...issue.path],
          });
        });
      }
    }
  });

// Step 5: KYC Schema
export const step5KYCSchema = z.object({
  signatoryName: z
    .string()
    .trim()
    .min(3, "Authorized signatory's full legal name is required"),
  designation: z.string().trim().min(2, "Designation / Role is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const dob = new Date(date);
      if (isNaN(dob.getTime())) return false;
      const ageDiff = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age >= 18;
    }, "Signatory must be at least 18 years of age"),
  personalPan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, "Enter a valid 10-character personal PAN"),
  idDocumentType: z.enum(["AADHAAR", "PASSPORT", "VOTER_ID"]),
  idDocumentNumber: z
    .string()
    .trim()
    .min(4, "Document identity number is required"),
  signatoryEmail: z.string().trim().email("Valid email address is required"),
  signatoryPhone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Enter a valid 10-digit mobile number"),
  identityProofDocument: uploadedDocumentSchema.optional(),
  addressProofDocument: uploadedDocumentSchema.optional(),
  isKycVerified: z.boolean().refine((val) => val === true, {
    message: "Identity verification must be simulated and marked verified",
  }),
});

// Step 6: KYB Schema
export const beneficialOwnerSchema = z.object({
  name: z.string().trim().min(2, "Beneficial owner full name is required"),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, "Enter valid 10-character PAN"),
  percentageHolding: z
    .number()
    .min(1, "Holding percentage must be at least 1%")
    .max(100, "Holding percentage cannot exceed 100%"),
  isPep: z.boolean(),
});

export const step6KYBSchema = z
  .object({
    entityType: z.enum([
      "SOLE_PROPRIETORSHIP",
      "PRIVATE_LIMITED",
      "PUBLIC_LIMITED",
      "LLP",
      "PARTNERSHIP",
      "TRUST_NGO",
    ]),
    businessRegistrationDoc: uploadedDocumentSchema.optional(),
    constitutionalDoc: uploadedDocumentSchema.optional(),
    boardResolutionDoc: uploadedDocumentSchema.optional(),
    companyPanDoc: uploadedDocumentSchema.optional(),
    gstCertificateDoc: uploadedDocumentSchema.optional(),
    beneficialOwners: z.array(beneficialOwnerSchema),
    hasNoUboDeclaration: z.boolean(),
    isKybVerified: z.boolean().refine((val) => val === true, {
      message: "Please complete simulated KYB document check before proceeding",
    }),
  })
  .superRefine((data, ctx) => {
    // Check that at least one business registration document is uploaded
    if (!data.businessRegistrationDoc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessRegistrationDoc"],
        message: "Primary business registration / establishment document is required",
      });
    }

    // Beneficial ownership declaration check for corporate entities
    if (
      ["PRIVATE_LIMITED", "PUBLIC_LIMITED", "LLP", "PARTNERSHIP"].includes(
        data.entityType
      )
    ) {
      if (!data.hasNoUboDeclaration && data.beneficialOwners.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasNoUboDeclaration"],
          message:
            "Add at least one beneficial owner (holding >10%) or check the declaration",
        });
      }
    }
  });

// Step 7: Settlement Bank Account Schema
export const step7BankAccountSchema = z
  .object({
    accountHolderName: z
      .string()
      .trim()
      .min(3, "Bank account holder name is required"),
    accountNumber: z
      .string()
      .trim()
      .regex(/^\d{9,18}$/, "Bank account number must be between 9 and 18 digits"),
    confirmAccountNumber: z.string().trim().min(1, "Confirm your account number"),
    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(IFSC_REGEX, "Enter a valid 11-character IFSC code (e.g., HDFC0000001)"),
    accountType: z.enum(["CURRENT", "SAVINGS"]),
    bankName: z.string().min(1, "Bank name could not be resolved from IFSC"),
    branchName: z.string().min(1, "Branch name is required"),
    isBankVerified: z.boolean().refine((val) => val === true, {
      message: "Please perform mock penny-drop verification for this bank account",
    }),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Bank account numbers do not match",
    path: ["confirmAccountNumber"],
  });

// Step 8: Compliance & Declarations Schema
export const step8ComplianceSchema = z.object({
  refundPolicyUrl: z
    .string()
    .trim()
    .min(1, "Refund and cancellation policy URL is required")
    .url("Enter a valid URL"),
  termsOfServiceUrl: z
    .string()
    .trim()
    .min(1, "Customer Terms of Service URL is required")
    .url("Enter a valid URL"),
  privacyPolicyUrl: z
    .string()
    .trim()
    .min(1, "Privacy policy URL is required")
    .url("Enter a valid URL"),
  grievanceEmail: z
    .string()
    .trim()
    .email("Enter a valid grievance/support contact email"),
  grievancePhone: z
    .string()
    .trim()
    .min(8, "Enter a valid contact phone or helpline"),
  restrictedBusinessDeclaration: z.boolean().refine((val) => val === true, {
    message: "You must confirm non-involvement in restricted or prohibited merchant categories",
  }),
  pepDeclaration: z.boolean().refine((val) => val === true, {
    message: "Please declare PEP (Politically Exposed Persons) compliance",
  }),
  fatcaConsent: z.boolean().refine((val) => val === true, {
    message: "FATCA / CRS tax residency confirmation is required",
  }),
  creditCheckConsent: z.boolean().refine((val) => val === true, {
    message: "Consent for RTTMT automated transaction monitoring & risk evaluation is required",
  }),
});

// Step 9: Review & Submit Schema
export const step9ReviewSchema = z.object({
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the statutory merchant declaration before submitting",
  }),
  authorizedSignatoryConfirmation: z.boolean().refine((val) => val === true, {
    message: "Authorized signatory confirmation is mandatory",
  }),
});

export const stepSchemas = {
  step1: step1AccountSchema,
  step2: step2BusinessProfileSchema,
  step3: step3CompanyDetailsSchema,
  step4: step4BusinessAddressSchema,
  step5: step5KYCSchema,
  step6: step6KYBSchema,
  step7: step7BankAccountSchema,
  step8: step8ComplianceSchema,
  step9: step9ReviewSchema,
} as const;
