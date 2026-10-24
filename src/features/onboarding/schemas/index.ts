import { z } from "zod";
import { BUSINESS_CATEGORIES } from "../mocks/options";
import { areRequiredKybDocsUploaded } from "../config/kybDocuments";
import { validateAndNormalizeWebUrl } from "../utils/formatters";

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
export const step2BusinessProfileSchema = z
  .object({
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
      .or(z.literal(""))
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
      .refine((val) => val !== "" && val !== undefined && val !== null, {
        message: "Average transaction value is required",
      })
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine((val) => !isNaN(val) && Number.isFinite(val) && val >= 1, {
        message: "Average transaction value must be at least ₹1",
      }),
  })
  .refine(
    (data) => {
      if (!data.businessCategory || !data.subCategory) return true;
      const foundCategory = BUSINESS_CATEGORIES.find((c) => c.category === data.businessCategory);
      if (!foundCategory) return false;
      return foundCategory.subcategories.includes(data.subCategory);
    },
    {
      message: "Selected subcategory does not belong to the chosen business category",
      path: ["subCategory"],
    }
  );

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
      .refine(
        (dateStr) => {
          if (!dateStr) return false;
          const parsed = new Date(dateStr);
          if (isNaN(parsed.getTime())) return false;
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return parsed <= today;
        },
        {
          message: "Incorporation date cannot be in the future",
        }
      ),
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
    const isCorporate = ["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(data.entityType);
    const isLlp = data.entityType === "LLP";

    // 1. Corporate / LLP registration number validation
    if (isCorporate) {
      if (!data.registrationNumber || data.registrationNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registrationNumber"],
          message: "Corporate Identification Number (CIN) is required for company entities",
        });
      } else if (!/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i.test(data.registrationNumber.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registrationNumber"],
          message: "Enter a valid 21-character CIN (e.g., U72900MH2021PTC358912)",
        });
      }
    } else if (isLlp) {
      if (!data.registrationNumber || data.registrationNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registrationNumber"],
          message: "LLPIN is required for Limited Liability Partnerships",
        });
      }
    }

    // 2. GSTIN validation: Required for corporate/LLP entities; optional for sole proprietors & trusts
    const isGstinRequired = isCorporate || isLlp;
    const gstinValue = (data.gstin || "").trim();

    if (isGstinRequired) {
      if (!gstinValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstin"],
          message: "GSTIN is required for registered corporate entities",
        });
      } else if (!GSTIN_REGEX.test(gstinValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstin"],
          message: "Enter a valid 15-character GSTIN (e.g., 27AAACA7823K1Z5)",
        });
      }
    } else if (gstinValue) {
      if (!GSTIN_REGEX.test(gstinValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstin"],
          message: "Enter a valid 15-character GSTIN (e.g., 27AAACA7823K1Z5)",
        });
      }
    }

    // 3. Embedded PAN in GSTIN check (characters 3-12 of GSTIN is PAN)
    if (
      gstinValue &&
      GSTIN_REGEX.test(gstinValue) &&
      data.panNumber &&
      PAN_REGEX.test(data.panNumber)
    ) {
      const embeddedPan = gstinValue.substring(2, 12);
      if (embeddedPan !== data.panNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstin"],
          message: `GSTIN characters 3–12 (${embeddedPan}) must match entered PAN (${data.panNumber})`,
        });
      }
    }
  });

// Step 4: Business Address Schema
const addressObjectSchema = z.object({
  line1: z
    .string()
    .trim()
    .min(1, "Address Line 1 is required")
    .min(5, "Address Line 1 must be at least 5 characters"),
  line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters"),
  state: z
    .string()
    .trim()
    .min(1, "Please select a state"),
  postalCode: z
    .string()
    .trim()
    .min(1, "PIN Code is required")
    .regex(PINCODE_REGEX, "Enter a valid 6-digit Indian PIN code"),
  country: z.string().default("India"),
});

export const step4BusinessAddressSchema = z
  .object({
    registeredAddress: addressObjectSchema,
    isOperatingAddressSame: z.boolean(),
    operatingAddress: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isOperatingAddressSame) {
      if (!data.operatingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operatingAddress", "line1"],
          message: "Address Line 1 is required for operating location",
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
export const step5KYCSchema = z
  .object({
    signatoryName: z
      .string()
      .trim()
      .min(1, "Full legal name is required")
      .min(3, "Full legal name must be at least 3 characters")
      .max(100, "Full legal name cannot exceed 100 characters"),
    designation: z
      .string()
      .trim()
      .min(1, "Designation / Position in entity is required")
      .min(2, "Designation must be at least 2 characters")
      .max(100, "Designation cannot exceed 100 characters"),
    dateOfBirth: z.string().optional(),
    personalPan: z
      .string()
      .trim()
      .toUpperCase()
      .regex(PAN_REGEX, "Enter a valid 10-character personal PAN (e.g., BKNPR4821E)"),
    isPanVerified: z.boolean().optional(),
    panVerifiedName: z.string().optional(),
    panVerificationStatus: z.enum(["NOT_STARTED", "PENDING", "VERIFIED", "FAILED"]).optional(),
    idDocumentType: z.enum(["AADHAAR", "PAN", "PASSPORT", "VOTER_ID"]),
    idDocumentNumber: z
      .string()
      .trim()
      .min(1, "Document identity number is required"),
    isIdVerified: z.boolean().optional(),
    idVerificationStatus: z.enum(["NOT_STARTED", "PENDING", "VERIFIED", "FAILED"]).optional(),
    signatoryEmail: z
      .string()
      .trim()
      .min(1, "Signatory official email is required")
      .email("Enter a valid official email address"),
    signatoryPhone: z
      .string()
      .trim()
      .regex(PHONE_REGEX, "Enter a valid 10-digit Indian mobile number"),
    identityProofFiles: z
      .object({
        front: uploadedDocumentSchema.optional(),
        back: uploadedDocumentSchema.optional(),
      })
      .optional(),
    addressDocumentType: z.enum(["PASSPORT", "DRIVING_LICENSE", "UTILITY_BILL"]).optional(),
    addressProofFiles: z
      .object({
        front: uploadedDocumentSchema.optional(),
        back: uploadedDocumentSchema.optional(),
      })
      .optional(),
    identityProofDocument: uploadedDocumentSchema.optional(),
    addressProofDocument: uploadedDocumentSchema.optional(),
    isKycVerified: z.boolean().refine((val) => val === true, {
      message: "Please complete both PAN and Identity verification to proceed",
    }),
  })
  .superRefine((data, ctx) => {
    // 0. Independent PAN and ID Verification Check
    if (!data.isPanVerified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["personalPan"],
        message: "Please verify Personal PAN",
      });
    }
    if (!data.isIdVerified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idDocumentNumber"],
        message: "Please verify Aadhaar Number",
      });
    }

    // 1. Aadhaar Number Format Validation
    const docNum = (data.idDocumentNumber || "").trim();
    if (data.idDocumentType === "AADHAAR") {
      const cleanAadhaar = docNum.replace(/[\s-]/g, "");
      if (!/^(?:[xX]{8}\d{4}|\d{12})$/.test(cleanAadhaar)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idDocumentNumber"],
          message: "Enter a valid 12-digit Aadhaar number or masked format (e.g. XXXX XXXX 9034)",
        });
      }
    } else if (data.idDocumentType === "PAN") {
      if (!PAN_REGEX.test(docNum.toUpperCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idDocumentNumber"],
          message: "Enter a valid 10-character PAN (e.g., BKNPR4821E)",
        });
      }
    } else if (data.idDocumentType === "PASSPORT") {
      const cleanPassport = docNum.toUpperCase();
      if (!/^[A-Z][0-9]{7}$/.test(cleanPassport)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idDocumentNumber"],
          message: "Enter a valid Indian Passport number (1 letter followed by 7 digits, e.g. L8923412)",
        });
      }
    } else if (data.idDocumentType === "VOTER_ID") {
      const cleanVoterId = docNum.toUpperCase();
      if (!/^[A-Z]{3}[0-9]{7}$/.test(cleanVoterId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idDocumentNumber"],
          message: "Enter a valid Voter ID (EPIC) number (3 letters followed by 7 digits, e.g. ABC1293841)",
        });
      }
    }

    // 2. Identity Document Uploads validation based on selected document type
    const idFiles = data.identityProofFiles;
    const hasSingleIdDoc = Boolean(data.identityProofDocument?.id);

    if (data.idDocumentType === "AADHAAR") {
      if (!idFiles?.front?.id && !hasSingleIdDoc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identityProof_front"],
          message: "Aadhaar Card Front side upload is required",
        });
      }
      if (!idFiles?.back?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identityProof_back"],
          message: "Aadhaar Card Back side upload is required",
        });
      }
    } else if (data.idDocumentType === "VOTER_ID") {
      if (!idFiles?.front?.id && !hasSingleIdDoc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identityProof_front"],
          message: "Voter ID Front side upload is required",
        });
      }
      if (!idFiles?.back?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identityProof_back"],
          message: "Voter ID Back side upload is required",
        });
      }
    } else if (data.idDocumentType === "PAN") {
      if (!idFiles?.front?.id && !hasSingleIdDoc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identityProof_front"],
          message: "PAN Card image upload is required",
        });
      }
    } else if (data.idDocumentType === "PASSPORT") {
      if (!idFiles?.front?.id && !hasSingleIdDoc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["identityProof_front"],
          message: "Passport identification page upload is required",
        });
      }
    }

    // 3. Address Proof Document Uploads validation (Utility / Electricity Bill)
    const addressFiles = data.addressProofFiles;
    const hasSingleAddressDoc = Boolean(data.addressProofDocument?.id);

    if (!addressFiles?.front?.id && !hasSingleAddressDoc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["addressProof_front"],
        message: "Electricity or utility bill document upload is required",
      });
    }
  });

// Step 6: KYB Schema
export const beneficialOwnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Beneficial owner full name is required"),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, "Enter valid 10-character PAN (e.g., BKNPR4821E)"),
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
    hasGstRegistration: z.boolean().optional(),
    businessRegistrationDoc: uploadedDocumentSchema.optional(),
    constitutionalDoc: uploadedDocumentSchema.optional(),
    boardResolutionDoc: uploadedDocumentSchema.optional(),
    companyPanDoc: uploadedDocumentSchema.optional(),
    gstCertificateDoc: uploadedDocumentSchema.optional(),
    isGstExempt: z.boolean().optional(),
    beneficialOwners: z.array(beneficialOwnerSchema),
    hasNoUboDeclaration: z.boolean(),
    isKybVerified: z.boolean().refine((val) => val === true, {
      message: "Please complete simulated KYB document check before proceeding",
    }),
    kybVerificationStatus: z
      .enum(["NOT_STARTED", "PENDING", "VERIFIED", "FAILED"])
      .optional(),
    kybVerificationNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Validate required documents using centralized kybDocuments configuration
    const docCheck = areRequiredKybDocsUploaded(
      data,
      Boolean(data.hasGstRegistration),
      Boolean(data.isGstExempt)
    );

    for (let i = 0; i < docCheck.missingFields.length; i++) {
      const missingField = docCheck.missingFields[i];
      const missingLabel = docCheck.missingLabels[i] || "Statutory document";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [missingField],
        message: `${missingLabel} is required`,
      });
    }

    // 2. Beneficial ownership check (not applicable for Sole Proprietorship)
    if (data.entityType !== "SOLE_PROPRIETORSHIP") {
      if (!data.hasNoUboDeclaration && data.beneficialOwners.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasNoUboDeclaration"],
          message: "Add at least one beneficial owner or check the widely held declaration",
        });
      }

      if (data.hasNoUboDeclaration && data.beneficialOwners.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasNoUboDeclaration"],
          message: "Beneficial owners list must be empty when widely held declaration is selected",
        });
      }

      if (!data.hasNoUboDeclaration && data.beneficialOwners.length > 0) {
        const totalHolding = data.beneficialOwners.reduce(
          (sum, o) => sum + (o.percentageHolding || 0),
          0
        );
        if (totalHolding > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["beneficialOwners"],
            message: `Total beneficial ownership cannot exceed 100% (currently ${totalHolding}%)`,
          });
        }
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
    bankName: z.string().trim().min(1, "Bank name is required"),
    branchName: z.string().trim().min(1, "Branch name is required"),
    isBankVerified: z.boolean().refine((val) => val === true, {
      message: "Please complete simulated bank account verification before proceeding",
    }),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Bank account numbers do not match",
    path: ["confirmAccountNumber"],
  });

// Step 8: Compliance & Declarations Schema
export const step8ComplianceSchema = z
  .object({
    refundPolicyUrl: z
      .string()
      .trim()
      .min(1, "Refund and cancellation policy URL is required")
      .refine((val) => validateAndNormalizeWebUrl(val).isValid, {
        message: "Enter a valid HTTP or HTTPS web address",
      }),
    termsOfServiceUrl: z
      .string()
      .trim()
      .min(1, "Customer Terms of Service URL is required")
      .refine((val) => validateAndNormalizeWebUrl(val).isValid, {
        message: "Enter a valid HTTP or HTTPS web address",
      }),
    privacyPolicyUrl: z
      .string()
      .trim()
      .min(1, "Privacy policy URL is required")
      .refine((val) => validateAndNormalizeWebUrl(val).isValid, {
        message: "Enter a valid HTTP or HTTPS web address",
      }),
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
    pepStatus: z.enum(["NO", "YES", "UNKNOWN"], {
      message: "Please select your Politically Exposed Persons (PEP) status",
    }),
    pepDetails: z.string().trim().optional(),
    taxResidency: z.enum(["INDIA_ONLY", "OTHER"], {
      message: "Please specify your entity's tax residency status",
    }),
    taxResidencyCountry: z.string().trim().optional(),
    foreignTaxIdNumber: z.string().trim().optional(),
    fatcaCrsClassification: z.enum(["NON_REPORTABLE", "REPORTABLE_US", "REPORTABLE_OTHER", "EXEMPT"], {
      message: "Please select a FATCA / CRS classification",
    }),
    fatcaCrsGiinOrTin: z.string().trim().optional(),
    fatcaSelfCertificationConfirmed: z.boolean().refine((val) => val === true, {
      message: "Please confirm the FATCA / CRS self-certification statement",
    }),
    transactionMonitoringConsent: z.boolean().refine((val) => val === true, {
      message: "Consent for RTTMT automated transaction monitoring & risk evaluation is required",
    }),
    creditCheckConsent: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. PEP conditional disclosure
    if (data.pepStatus === "YES") {
      if (!data.pepDetails || data.pepDetails.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pepDetails"],
          message: "Please disclose the PEP name, public/political role, and relationship to the entity (min 5 characters)",
        });
      }
    } else if (data.pepStatus === "UNKNOWN") {
      if (!data.pepDetails || data.pepDetails.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pepDetails"],
          message: "Please explain why PEP status is pending verification or undetermined (min 5 characters)",
        });
      }
    }

    // 2. Tax Residency conditional fields
    if (data.taxResidency === "OTHER") {
      if (!data.taxResidencyCountry || data.taxResidencyCountry.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxResidencyCountry"],
          message: "Please specify the foreign country / jurisdiction of tax residence",
        });
      }
      if (!data.foreignTaxIdNumber || data.foreignTaxIdNumber.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foreignTaxIdNumber"],
          message: "Please provide the foreign Tax Identification Number (TIN)",
        });
      }
    }

    // 3. FATCA/CRS reportable conditional fields
    if (data.fatcaCrsClassification === "REPORTABLE_US" || data.fatcaCrsClassification === "REPORTABLE_OTHER") {
      if (!data.fatcaCrsGiinOrTin || data.fatcaCrsGiinOrTin.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fatcaCrsGiinOrTin"],
          message: "Please provide the GIIN or Foreign TIN for FATCA / CRS reporting",
        });
      }
    }
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
