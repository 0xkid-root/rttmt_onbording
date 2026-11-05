import {
  BankVerificationResult,
  BusinessEntityType,
  CompanyDirectorRecord,
} from "../types";
import { MOCK_IFSC_DIRECTORY, MockIfscRecord } from "../mocks/options";

export async function lookupIfsc(
  ifscRaw: string,
  options?: { signal?: AbortSignal }
): Promise<MockIfscRecord | null> {
  const ifsc = ifscRaw.trim().toUpperCase();

  if (options?.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 350);
    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });

  if (MOCK_IFSC_DIRECTORY[ifsc]) {
    return MOCK_IFSC_DIRECTORY[ifsc];
  }

  // Fallback for valid-format IFSCs in demo
  if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    const prefix = ifsc.substring(0, 4);
    let bankName = "Commercial Bank of India";
    if (prefix === "HDFC") bankName = "HDFC Bank";
    else if (prefix === "ICIC") bankName = "ICICI Bank";
    else if (prefix === "SBIN") bankName = "State Bank of India";
    else if (prefix === "UTIB") bankName = "Axis Bank";
    else if (prefix === "KKBK") bankName = "Kotak Mahindra Bank";
    else if (prefix === "PUNB") bankName = "Punjab National Bank";
    else if (prefix === "YESB") bankName = "Yes Bank";

    return {
      bankName,
      branchName: "Commercial Branch",
      city: "Metro Region",
      state: "India",
    };
  }

  return null;
}

export async function verifyBankAccount(
  accountNumber: string,
  ifscRaw: string,
  expectedHolderName: string,
  options?: { signal?: AbortSignal; shouldFail?: boolean }
): Promise<BankVerificationResult> {
  if (options?.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 1000);
    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });

  const ifsc = ifscRaw.trim().toUpperCase();
  const ifscInfo = await lookupIfsc(ifsc).catch(() => null);
  const cleanAcc = accountNumber.trim().replace(/[^0-9]/g, "");
  const last4 = cleanAcc.length >= 4 ? cleanAcc.slice(-4) : cleanAcc;
  const masked = `••••••••${last4}`;

  if (options?.shouldFail) {
    return {
      isVerified: false,
      isSimulated: true,
      bankName: ifscInfo?.bankName || "Commercial Bank Ltd",
      branchName: ifscInfo?.branchName || "Main Commercial Branch",
      city: ifscInfo?.city || "Mumbai",
      accountHolderNameMatch: false,
      accountNumberMasked: masked,
      verifiedAt: new Date().toISOString(),
      notes: "Simulated verification: Account status could not be verified in demo mode.",
    };
  }

  const nameMatch = !!(cleanAcc && expectedHolderName.trim());

  return {
    isVerified: true,
    isSimulated: true,
    bankName: ifscInfo?.bankName || "Commercial Bank Ltd",
    branchName: ifscInfo?.branchName || "Main Commercial Branch",
    city: ifscInfo?.city || "Mumbai",
    accountHolderNameMatch: nameMatch,
    accountNumberMasked: masked,
    verifiedAt: new Date().toISOString(),
    pennyDropReference: `SIM-PDR-${Date.now().toString().slice(-7)}`,
    notes: `Simulated bank account verification passed for account ending in ••${last4}. (Demo Mode — No live penny drop executed).`,
  };
}

export interface PanVerificationResult {
  verified: boolean;
  isSimulated: boolean;
  provider: string;
  pan: string;
  registeredName?: string;
  status: "SUCCESS" | "FAILED";
  notes: string;
}

export interface IdVerificationResult {
  verified: boolean;
  isSimulated: boolean;
  score: number;
  provider: string;
  docType: string;
  docTail: string;
  notes: string;
}

/**
 * Simulated PAN Verification Service (Demo Only)
 * NOTE: No live authorized government NSDL/ITD or third-party PAN API is configured in the environment.
 * All responses are explicitly marked as simulated demo verifications.
 */
export async function simulatePanVerification(
  panRaw: string,
  signatoryName?: string
): Promise<PanVerificationResult> {
  const pan = (panRaw || "").trim().toUpperCase();
  await new Promise((resolve) => setTimeout(resolve, 850));

  // Validate standard 10-char PAN format: 5 letters, 4 digits, 1 letter
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    return {
      verified: false,
      isSimulated: true,
      provider: "RTTMT Simulated Verification Service (Demo Only)",
      pan,
      status: "FAILED",
      notes: "Invalid PAN format. Personal PAN must follow 5 letters, 4 digits, 1 letter (e.g. BKNPR4821E).",
    };
  }

  // Simulated provider returned record clearly labelled as demo
  // If the user entered a signatory name, upper-case it to simulate the tax registry returned name
  const returnedName = signatoryName?.trim()
    ? signatoryName.trim().toUpperCase()
    : "ADITYA VIKRAM RAO";

  return {
    verified: true,
    isSimulated: true,
    provider: "RTTMT Simulated Verification Service (Demo Only)",
    pan,
    registeredName: returnedName,
    status: "SUCCESS",
    notes: `Simulated PAN check passed for ${pan.slice(0, 5)}***** (Demo Mode — No live NSDL/ITD API configured).`,
  };
}

/**
 * Simulated Identity Document Verification Service (Aadhaar / PAN / Passport / Voter ID) (Demo Only)
 */
export async function simulateIdVerification(
  docNumber: string,
  docType: "AADHAAR" | "PAN" | "PASSPORT" | "VOTER_ID" = "AADHAAR"
): Promise<IdVerificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 850));
  const docClean = (docNumber || "").trim().replace(/\s/g, "");
  const docTail = docClean ? docClean.slice(-4) : "XXXX";

  const docLabel =
    docType === "AADHAAR"
      ? "Aadhaar"
      : docType === "PAN"
      ? "PAN Card"
      : docType === "PASSPORT"
      ? "Passport"
      : "Voter ID (EPIC)";

  return {
    verified: true,
    isSimulated: true,
    score: 98.4,
    provider: "RTTMT Identity Verification Simulation (Demo Only)",
    docType: docLabel,
    docTail,
    notes: `Simulated ${docLabel} verification passed for document ending in ${docTail}. (Demo check only)`,
  };
}

export async function simulateKycVerification(
  pan: string,
  docNumber: string,
  docType: "AADHAAR" | "PAN" | "PASSPORT" | "VOTER_ID" = "AADHAAR"
): Promise<{
  verified: boolean;
  score: number;
  provider: string;
  notes: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const docClean = (docNumber || "").trim().replace(/\s/g, "");
  const docTail = docClean ? docClean.slice(-4) : "XXXX";
  const panMasked = pan ? `${pan.slice(0, 5)}*****` : "*****";

  const docLabel =
    docType === "AADHAAR"
      ? "Aadhaar"
      : docType === "PAN"
      ? "PAN Card"
      : docType === "PASSPORT"
      ? "Passport"
      : "Voter ID (EPIC)";

  return {
    verified: true,
    score: 98.4,
    provider: "RTTMT Identity Verification Simulation",
    notes: `Simulated ${docLabel} & PAN match passed for PAN ${panMasked} and document ending in ${docTail}. (Demo check only)`,
  };
}

export interface KybVerificationResult {
  verified: boolean;
  isSimulated: boolean;
  provider: string;
  entityType: string;
  verifiedAt: string;
  notes: string;
}

export async function simulateKybVerification(
  entityType: string,
  uploadedCount: number,
  options?: { signal?: AbortSignal; shouldFail?: boolean }
): Promise<KybVerificationResult> {
  // Respect AbortSignal if already aborted
  if (options?.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve();
    }, 1000);

    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });

  if (options?.shouldFail) {
    return {
      verified: false,
      isSimulated: true,
      provider: "RTTMT Simulated KYB Registry Check (Demo Service)",
      entityType,
      verifiedAt: new Date().toISOString(),
      notes: `Simulated statutory & charter verification could not verify registry records for ${entityType}. (Demo Mode)`,
    };
  }

  return {
    verified: true,
    isSimulated: true,
    provider: "RTTMT Simulated KYB Registry Check (Demo Service)",
    entityType,
    verifiedAt: new Date().toISOString(),
    notes: `Simulated statutory & charter verification cleared for ${entityType} (${uploadedCount} document(s) verified). (Demo Mode — No live MCA/ROC API configured).`,
  };
}

export interface CompanyRegistryLookupResult {
  verified: boolean;
  isSimulated: boolean;
  provider: string;
  identifier: string;
  entityType: BusinessEntityType;
  legalEntityName: string;
  incorporationDate: string;
  panNumber: string;
  companyStatus: "ACTIVE" | "INACTIVE" | "STRIKE_OFF";
  directors: CompanyDirectorRecord[];
  notes: string;
}

/**
 * Simulated MCA / ROC Registry Verification for CIN and LLPIN
 * Enterprise Architecture:
 * 1. Merchant enters CIN (Pvt/Public Ltd) or LLPIN (LLP).
 * 2. Provider fetches statutory entity records and the verified Director List from MCA.
 * 3. Merchant reviews returned records without needing to manually re-enter all director DINs.
 * 4. Signatories and beneficial owners are identified from this list without automatically
 *    calling redundant DIN Verification on every director.
 */
export async function lookupCompanyByCinOrLlpin(
  identifierRaw: string,
  entityType: BusinessEntityType,
  options?: { signal?: AbortSignal }
): Promise<CompanyRegistryLookupResult | null> {
  if (options?.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const clean = (identifierRaw || "").trim().toUpperCase();
  if (!clean) return null;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 800);
    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });

  const isCorporate = ["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(entityType);
  const isLlp = entityType === "LLP";

  if (!isCorporate && !isLlp) {
    return null;
  }

  if (isCorporate) {
    // 21-char CIN format check: e.g. U72900MH2021PTC358912 or L...
    const isValidCin = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i.test(clean);
    if (!isValidCin && clean.length < 15) {
      return null;
    }

    // Extract year from CIN if valid: characters 10-13 (index 9 to 13)
    let year = "2021";
    if (clean.length === 21) {
      const yearPart = clean.substring(9, 13);
      if (/^\d{4}$/.test(yearPart)) {
        year = yearPart;
      }
    }

    return {
      verified: true,
      isSimulated: true,
      provider: "Ministry of Corporate Affairs (MCA) Registry [Simulated]",
      identifier: clean,
      entityType,
      legalEntityName:
        clean === "U72900MH2021PTC358912"
          ? "RTTMT Technologies Private Limited"
          : "ACME ENTERPRISE TECHNOLOGIES PRIVATE LIMITED",
      incorporationDate: `${year}-04-14`,
      panNumber: "AAACA7823K",
      companyStatus: "ACTIVE",
      directors: [
        {
          din: "08472910",
          name: "Aditya Vikram Rao",
          designation: "Managing Director",
          appointedDate: `${year}-04-14`,
          isSignatory: true,
        },
        {
          din: "09124855",
          name: "Priya S. Sharma",
          designation: "Director",
          appointedDate: `${year}-06-10`,
          isSignatory: false,
        },
        {
          din: "07849120",
          name: "Rajesh K. Mehta",
          designation: "Independent Director",
          appointedDate: `${year}-09-01`,
          isSignatory: false,
        },
      ],
      notes: "MCA Registry records verified. Director list retrieved directly from statutory registry without manual DIN entry.",
    };
  }

  // LLPIN format: e.g., AAA-1234 or AAJ-8491
  return {
    verified: true,
    isSimulated: true,
    provider: "MCA LLP Registry [Simulated]",
    identifier: clean,
    entityType: "LLP",
    legalEntityName: "ACME LOGISTICS & INFOTECH LLP",
    incorporationDate: "2022-02-18",
    panNumber: "AAAFA9812M",
    companyStatus: "ACTIVE",
    directors: [
      {
        din: "08472910",
        name: "Aditya Vikram Rao",
        designation: "Designated Partner",
        appointedDate: "2022-02-18",
        isSignatory: true,
      },
      {
        din: "09124855",
        name: "Priya S. Sharma",
        designation: "Designated Partner",
        appointedDate: "2022-02-18",
        isSignatory: false,
      },
    ],
    notes: "LLP statutory record confirmed. Designated partners loaded from official registry.",
  };
}
