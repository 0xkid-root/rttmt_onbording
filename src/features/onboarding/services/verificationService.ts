import { BankVerificationResult } from "../types";
import { MOCK_IFSC_DIRECTORY, MockIfscRecord } from "../mocks/options";

export async function lookupIfsc(ifscRaw: string): Promise<MockIfscRecord | null> {
  const ifsc = ifscRaw.trim().toUpperCase();
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (MOCK_IFSC_DIRECTORY[ifsc]) {
    return MOCK_IFSC_DIRECTORY[ifsc];
  }

  // Fallback for valid-format IFSCs in demo
  if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    const prefix = ifsc.substring(0, 4);
    let bankName = "Commercial Bank of India";
    if (prefix === "HDFC") bankName = "HDFC Bank Ltd";
    else if (prefix === "ICIC") bankName = "ICICI Bank Ltd";
    else if (prefix === "SBIN") bankName = "State Bank of India";
    else if (prefix === "UTIB") bankName = "Axis Bank Ltd";
    else if (prefix === "KKBK") bankName = "Kotak Mahindra Bank";
    else if (prefix === "PUNB") bankName = "Punjab National Bank";

    return {
      bankName,
      branchName: "Industrial & Commercial Hub",
      city: "Metro Region",
      state: "Central Region",
    };
  }

  return null;
}

export async function verifyBankAccount(
  accountNumber: string,
  ifscRaw: string,
  expectedHolderName: string
): Promise<BankVerificationResult> {
  const ifsc = ifscRaw.trim().toUpperCase();
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const ifscInfo = await lookupIfsc(ifsc);
  const nameMatch = !!(accountNumber && expectedHolderName);

  return {
    isVerified: true,
    bankName: ifscInfo?.bankName || "Commercial Bank Ltd",
    branchName: ifscInfo?.branchName || "Main Commercial Branch",
    city: ifscInfo?.city || "Mumbai",
    accountHolderNameMatch: nameMatch,
    verifiedAt: new Date().toISOString(),
    pennyDropReference: `PDR-${Date.now().toString().slice(-7)}`,
  };
}

export async function simulateKycVerification(
  pan: string,
  docNumber: string
): Promise<{
  verified: boolean;
  score: number;
  provider: string;
  notes: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const docTail = docNumber ? docNumber.slice(-4) : "XXXX";

  return {
    verified: true,
    score: 98.4,
    provider: "RTTMT Identity Engine (Simulated)",
    notes: `Simulated OCR & NSDL PAN match passed for PAN ${pan.slice(0, 5)}*****. Doc ID (ends in ${docTail}) verified.`,
  };
}

export async function simulateKybVerification(
  entityType: string,
  uploadedCount: number
): Promise<{
  verified: boolean;
  registryFound: boolean;
  mcaMatch: boolean;
  notes: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    verified: true,
    registryFound: true,
    mcaMatch: true,
    notes: `Simulated MCA/ROC corporate registry match verified for ${entityType}. ${uploadedCount} document(s) validated.`,
  };
}
