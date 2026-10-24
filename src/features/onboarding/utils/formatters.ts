export function formatPan(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function formatGstin(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
}

export function formatIfsc(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
}

export function formatPhoneNumber(value: string): string {
  if (!value) return "";
  let digits = value.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

export function formatPostalCode(value: string): string {
  if (!value) return "";
  return value.replace(/[^0-9]/g, "").slice(0, 6);
}

export function formatAadhaarNumber(value: string): string {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join(" ");
}

export function formatAadhaarInput(value: string): string {
  if (!value) return "";
  const cleaned = value.replace(/[^0-9xX]/g, "").slice(0, 12);
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.substring(i, i + 4).toUpperCase());
  }
  return parts.join(" ");
}

export function isAtLeast18YearsOld(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const [birthYear, birthMonth, birthDay] = parts;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - birthYear;
  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age >= 18;
}

export function get18YearsAgoDate(): string {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const maxDays = new Date(year, month, 0).getDate();
  const adjustedDay = Math.min(day, maxDays);
  return `${year}-${String(month).padStart(2, "0")}-${String(adjustedDay).padStart(2, "0")}`;
}

export function formatCurrencyINR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Safely parses and normalizes a candidate web URL.
 * Only allows http: and https: protocols.
 * Rejects non-web schemes including javascript:, data:, vbscript:, etc.
 * Prepends https:// if a scheme is omitted.
 */
export function validateAndNormalizeWebUrl(raw: string): {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { isValid: false, normalizedUrl: "", error: "URL is required" };
  }

  // Check for explicit scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : "";
    if (scheme !== "http" && scheme !== "https") {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: `Unsupported protocol (${scheme}:). Only http:// and https:// web addresses are accepted.`,
      };
    }
  }

  // Prepend https:// if no scheme is present
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: "Only http:// and https:// URLs are supported.",
      };
    }
    // Must contain a hostname with at least one dot or localhost
    if (!parsed.hostname || (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")) {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: "Please enter a valid domain address (e.g., example.com/refunds).",
      };
    }
    return {
      isValid: true,
      normalizedUrl: parsed.toString(),
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      error: "Please enter a well-formed web address.",
    };
  }
}

/**
 * Validates and extracts a safe base domain from an origin/website URL.
 * Returns null if the URL is invalid or uses an unsupported protocol.
 */
export function getSafeBaseDomain(websiteUrl?: string): string | null {
  if (!websiteUrl || !websiteUrl.trim()) return null;
  const validation = validateAndNormalizeWebUrl(websiteUrl);
  if (!validation.isValid) return null;
  try {
    const parsed = new URL(validation.normalizedUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

/**
 * Masks an Indian Permanent Account Number (PAN) by default (••••••1234F).
 * Shows the full PAN only when explicitly revealed by the user.
 */
export function maskPan(pan?: string, revealed: boolean = false): string {
  if (!pan || !pan.trim()) return "—";
  const cleaned = pan.trim().toUpperCase();
  if (revealed) return cleaned;
  if (cleaned.length < 5) return "•••••";
  return `••••••${cleaned.slice(-4)}`;
}

/**
 * Masks a bank account number (Indian accounts are 9-18 digits).
 * Shows only the last 4 digits (e.g., ••••••••5678).
 * Never exposes the full account number on public or summary screens.
 */
export function maskBankAccount(accountNumber?: string): string | null {
  if (!accountNumber || !accountNumber.trim()) return null;
  const digits = accountNumber.trim();
  if (digits.length <= 4) return `••••${digits}`;
  return `••••••••${digits.slice(-4)}`;
}

/**
 * Formats GSTIN display accurately:
 * - If GSTIN is present: returns the GSTIN string.
 * - If exemption declaration is present (Step 3 declaration or Step 6 KYB exemption): returns "Exempt (Declaration Provided)".
 * - Otherwise: returns a neutral "Not Registered / Not Provided" fallback (NEVER falsely claims exempt).
 */
export function formatGstinDisplay(
  gstin?: string,
  hasNoGstDeclaration?: boolean,
  isGstExempt?: boolean
): string {
  if (gstin && gstin.trim()) return gstin.trim().toUpperCase();
  if (hasNoGstDeclaration || isGstExempt) {
    return "Exempt (Declaration Provided)";
  }
  return "Not Registered / Not Provided";
}

/**
 * Formats ISO submission timestamp using Indian Standard Time locale and options.
 * Handles missing or invalid timestamps safely.
 */
export function formatSubmissionDateTime(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return "—";
  const timestamp = Date.parse(dateStr);
  if (isNaN(timestamp)) return "—";

  try {
    const formatted = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(timestamp));
    return `${formatted} IST`;
  } catch {
    return new Date(timestamp).toLocaleDateString("en-IN");
  }
}

/**
 * Formats timeline timestamps. If the value is a valid ISO date string, formats it cleanly.
 * If already a human-friendly string (e.g., "Today, 10:30 AM" or "Pending"), preserves it safely.
 */
export function formatTimelineTimestamp(timestamp?: string): string {
  if (!timestamp || typeof timestamp !== "string" || !timestamp.trim()) return "—";
  const trimmed = timestamp.trim();

  // If it resembles an ISO date
  if (trimmed.includes("T") || (trimmed.includes("-") && trimmed.length >= 10)) {
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      try {
        return new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }).format(new Date(parsed));
      } catch {
        return trimmed;
      }
    }
  }

  return trimmed;
}

