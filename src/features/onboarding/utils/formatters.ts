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
  return value.replace(/[^0-9]/g, "").slice(0, 10);
}

export function formatPostalCode(value: string): string {
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
