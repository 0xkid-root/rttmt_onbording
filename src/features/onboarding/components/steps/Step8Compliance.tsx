"use client";

import React, { useState } from "react";
import {
  Scale,
  ShieldAlert,
  CheckSquare,
  Link as LinkIcon,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  UserCheck,
  AlertCircle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboarding } from "../../hooks/OnboardingContext";
import {
  formatPhoneNumber,
  validateAndNormalizeWebUrl,
  getSafeBaseDomain,
} from "../../utils/formatters";
import {
  PepStatus,
  TaxResidencyStatus,
  FatcaCrsClassification,
} from "../../types";

export function Step8Compliance() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step8;

  const websiteUrl = formData.step2.websiteUrl;
  const accountEmail = formData.step1.email;
  const accountPhone = formData.step1.phone;

  // Local inline URL validation errors from blur handling
  const [urlFieldErrors, setUrlFieldErrors] = useState<{
    refundPolicyUrl?: string;
    termsOfServiceUrl?: string;
    privacyPolicyUrl?: string;
  }>({});

  // URL input normalization on blur with protocol & malformed checks
  const handleUrlBlur = (
    field: "refundPolicyUrl" | "termsOfServiceUrl" | "privacyPolicyUrl",
    value: string
  ) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setUrlFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    const validation = validateAndNormalizeWebUrl(trimmed);
    if (!validation.isValid) {
      setUrlFieldErrors((prev) => ({
        ...prev,
        [field]: validation.error || "Please enter a valid HTTP or HTTPS web address.",
      }));
    } else {
      setUrlFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      if (validation.normalizedUrl !== trimmed) {
        updateStepData("step8", { [field]: validation.normalizedUrl });
      }
    }
  };

  // Safe auto-fill policy URLs using website from Step 2
  const handleAutoFillDomain = () => {
    if (!websiteUrl || !websiteUrl.trim()) {
      toast.error("No website URL provided", {
        description: "Please enter your business website in Step 2 to generate URL suggestions.",
      });
      return;
    }

    const baseDomain = getSafeBaseDomain(websiteUrl);
    if (!baseDomain) {
      toast.error("Invalid website URL in Step 2", {
        description: "Website URL must use a valid http:// or https:// protocol.",
      });
      return;
    }

    // Only suggest into empty fields — never overwrite existing user entries
    const updates: Partial<typeof data> = {};
    let filledCount = 0;

    if (!data.refundPolicyUrl.trim()) {
      updates.refundPolicyUrl = `${baseDomain}/refunds`;
      filledCount++;
    }
    if (!data.termsOfServiceUrl.trim()) {
      updates.termsOfServiceUrl = `${baseDomain}/terms`;
      filledCount++;
    }
    if (!data.privacyPolicyUrl.trim()) {
      updates.privacyPolicyUrl = `${baseDomain}/privacy`;
      filledCount++;
    }

    if (filledCount === 0) {
      toast.info("Existing policy URLs preserved", {
        description: "All policy URL fields already contain values; none were overwritten.",
      });
      return;
    }

    updateStepData("step8", updates);
    toast.success("Policy URL suggestions populated", {
      description: `Generated ${filledCount} suggested path(s) from ${baseDomain}. Please review and verify each link.`,
    });
  };

  // Auto-fill grievance contact from Step 1 account details (without overwriting existing)
  const handleUseAccountContact = () => {
    const updates: Partial<typeof data> = {};
    let filledCount = 0;

    if (!data.grievanceEmail.trim() && accountEmail) {
      updates.grievanceEmail = accountEmail;
      filledCount++;
    }
    if (!data.grievancePhone.trim() && accountPhone) {
      updates.grievancePhone = accountPhone;
      filledCount++;
    }

    if (filledCount === 0) {
      toast.info("Existing contact details preserved", {
        description: "Customer support fields already have values entered.",
      });
      return;
    }

    updateStepData("step8", updates);
    toast.success("Account contact details populated", {
      description: "Support contact pre-filled from your registered account details.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Compliance, Public Policies & Declarations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide customer-facing legal URLs and complete statutory AML, PEP, and tax regulatory disclosures.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Customer-Facing Policy URLs & Contact */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <LinkIcon className="size-4 text-primary" />
                Customer-Facing Policy URLs
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Public policy links hosted on your domain for consumer transparency and dispute handling.
              </p>
            </div>

            {websiteUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoFillDomain}
                className="h-7 text-xs text-primary hover:text-primary/90 px-2 font-normal gap-1 self-start sm:self-auto shrink-0"
                title={`Suggest URL paths based on ${websiteUrl}`}
              >
                <Sparkles className="size-3" />
                Suggest paths from website
              </Button>
            )}
          </div>

          {/* 3 URL Inputs */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Refund & Cancellation Policy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="refundPolicyUrl" className="text-xs sm:text-sm">
                  Refund Policy URL <span className="text-destructive">*</span>
                </Label>
                {data.refundPolicyUrl && validateAndNormalizeWebUrl(data.refundPolicyUrl).isValid && (
                  <a
                    href={validateAndNormalizeWebUrl(data.refundPolicyUrl).normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Open policy link in new tab"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <Input
                id="refundPolicyUrl"
                type="url"
                value={data.refundPolicyUrl}
                onChange={(e) => {
                  setUrlFieldErrors((prev) => ({ ...prev, refundPolicyUrl: undefined }));
                  updateStepData("step8", { refundPolicyUrl: e.target.value });
                }}
                onBlur={(e) => handleUrlBlur("refundPolicyUrl", e.target.value)}
                placeholder="https://brand.com/refunds"
                aria-invalid={Boolean(stepErrors["refundPolicyUrl"] || urlFieldErrors.refundPolicyUrl)}
                aria-describedby={
                  stepErrors["refundPolicyUrl"] || urlFieldErrors.refundPolicyUrl
                    ? "refundPolicyUrl-error"
                    : undefined
                }
              />
              {(urlFieldErrors.refundPolicyUrl || stepErrors["refundPolicyUrl"]) && (
                <p id="refundPolicyUrl-error" role="alert" className="text-xs font-medium text-destructive">
                  {urlFieldErrors.refundPolicyUrl || stepErrors["refundPolicyUrl"]}
                </p>
              )}
            </div>

            {/* Terms of Service */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="termsOfServiceUrl" className="text-xs sm:text-sm">
                  Terms of Service URL <span className="text-destructive">*</span>
                </Label>
                {data.termsOfServiceUrl && validateAndNormalizeWebUrl(data.termsOfServiceUrl).isValid && (
                  <a
                    href={validateAndNormalizeWebUrl(data.termsOfServiceUrl).normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Open terms link in new tab"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <Input
                id="termsOfServiceUrl"
                type="url"
                value={data.termsOfServiceUrl}
                onChange={(e) => {
                  setUrlFieldErrors((prev) => ({ ...prev, termsOfServiceUrl: undefined }));
                  updateStepData("step8", { termsOfServiceUrl: e.target.value });
                }}
                onBlur={(e) => handleUrlBlur("termsOfServiceUrl", e.target.value)}
                placeholder="https://brand.com/terms"
                aria-invalid={Boolean(stepErrors["termsOfServiceUrl"] || urlFieldErrors.termsOfServiceUrl)}
                aria-describedby={
                  stepErrors["termsOfServiceUrl"] || urlFieldErrors.termsOfServiceUrl
                    ? "termsOfServiceUrl-error"
                    : undefined
                }
              />
              {(urlFieldErrors.termsOfServiceUrl || stepErrors["termsOfServiceUrl"]) && (
                <p id="termsOfServiceUrl-error" role="alert" className="text-xs font-medium text-destructive">
                  {urlFieldErrors.termsOfServiceUrl || stepErrors["termsOfServiceUrl"]}
                </p>
              )}
            </div>

            {/* Privacy Policy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="privacyPolicyUrl" className="text-xs sm:text-sm">
                  Privacy Policy URL <span className="text-destructive">*</span>
                </Label>
                {data.privacyPolicyUrl && validateAndNormalizeWebUrl(data.privacyPolicyUrl).isValid && (
                  <a
                    href={validateAndNormalizeWebUrl(data.privacyPolicyUrl).normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Open privacy link in new tab"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <Input
                id="privacyPolicyUrl"
                type="url"
                value={data.privacyPolicyUrl}
                onChange={(e) => {
                  setUrlFieldErrors((prev) => ({ ...prev, privacyPolicyUrl: undefined }));
                  updateStepData("step8", { privacyPolicyUrl: e.target.value });
                }}
                onBlur={(e) => handleUrlBlur("privacyPolicyUrl", e.target.value)}
                placeholder="https://brand.com/privacy"
                aria-invalid={Boolean(stepErrors["privacyPolicyUrl"] || urlFieldErrors.privacyPolicyUrl)}
                aria-describedby={
                  stepErrors["privacyPolicyUrl"] || urlFieldErrors.privacyPolicyUrl
                    ? "privacyPolicyUrl-error"
                    : undefined
                }
              />
              {(urlFieldErrors.privacyPolicyUrl || stepErrors["privacyPolicyUrl"]) && (
                <p id="privacyPolicyUrl-error" role="alert" className="text-xs font-medium text-destructive">
                  {urlFieldErrors.privacyPolicyUrl || stepErrors["privacyPolicyUrl"]}
                </p>
              )}
            </div>
          </div>

          {/* Grievance Contact Section */}
          <div className="pt-3 border-t border-border/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Customer Support & Grievance Contact
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Official contact information published for consumer redressal.
                </span>
              </div>
              {(accountEmail || accountPhone) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseAccountContact}
                  className="h-6 text-[11px] text-primary hover:text-primary/90 px-2 font-normal gap-1 self-start sm:self-auto shrink-0"
                >
                  <UserCheck className="size-3" />
                  Use account contact
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="grievanceEmail" className="text-xs sm:text-sm">
                  Support / Grievance Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="grievanceEmail"
                    type="email"
                    value={data.grievanceEmail}
                    onChange={(e) => updateStepData("step8", { grievanceEmail: e.target.value })}
                    placeholder="grievance@brand.com"
                    className="pl-9"
                    aria-invalid={Boolean(stepErrors["grievanceEmail"])}
                    aria-describedby={stepErrors["grievanceEmail"] ? "grievanceEmail-error" : undefined}
                  />
                </div>
                {stepErrors["grievanceEmail"] && (
                  <p id="grievanceEmail-error" role="alert" className="text-xs font-medium text-destructive">
                    {stepErrors["grievanceEmail"]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="grievancePhone" className="text-xs sm:text-sm">
                  Customer Helpline / Support Phone <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="grievancePhone"
                    value={data.grievancePhone}
                    onChange={(e) =>
                      updateStepData("step8", { grievancePhone: formatPhoneNumber(e.target.value) })
                    }
                    placeholder="022-48921000 or 9876543210"
                    className="pl-9"
                    aria-invalid={Boolean(stepErrors["grievancePhone"])}
                    aria-describedby={stepErrors["grievancePhone"] ? "grievancePhone-error" : undefined}
                  />
                </div>
                {stepErrors["grievancePhone"] && (
                  <p id="grievancePhone-error" role="alert" className="text-xs font-medium text-destructive">
                    {stepErrors["grievancePhone"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Compliance Declarations & Consents */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Scale className="size-4 text-primary" />
                Statutory Declarations & Consents
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each declaration must be reviewed and answered individually by the authorized representative.
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/70 self-start sm:self-auto">
              Compliance Review Pending
            </span>
          </div>

          <div className="space-y-4">
            {/* 1. Prohibited & Restricted Merchant Activity Declaration */}
            <div
              className={`rounded-lg border p-3.5 transition-colors space-y-1.5 ${
                data.restrictedBusinessDeclaration
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="restrictedBusinessDeclaration"
                  checked={data.restrictedBusinessDeclaration}
                  onCheckedChange={(checked) =>
                    updateStepData("step8", { restrictedBusinessDeclaration: checked === true })
                  }
                  className="mt-0.5"
                  aria-invalid={Boolean(stepErrors["restrictedBusinessDeclaration"])}
                  aria-describedby={
                    stepErrors["restrictedBusinessDeclaration"]
                      ? "restrictedBusinessDeclaration-error"
                      : undefined
                  }
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="restrictedBusinessDeclaration"
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldAlert className="size-3.5 text-warning shrink-0" />
                    Prohibited & Restricted Merchant Activity Declaration <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    We affirm that our business does not engage in, facilitate, or settle transactions for prohibited goods or services.
                  </p>
                </div>
              </div>
              {stepErrors["restrictedBusinessDeclaration"] && (
                <p
                  id="restrictedBusinessDeclaration-error"
                  role="alert"
                  className="text-xs font-medium text-destructive pl-7"
                >
                  {stepErrors["restrictedBusinessDeclaration"]}
                </p>
              )}
            </div>

            {/* 2. Structured PEP (Politically Exposed Persons) Disclosure */}
            <div
              className={`rounded-lg border p-3.5 transition-colors space-y-3 ${
                data.pepStatus ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <CheckSquare className="size-3.5 text-primary shrink-0" />
                    Politically Exposed Persons (PEP) Compliance <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">FATF / PMLA standard</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Are any directors, partners, key managerial personnel, or beneficial owners Politically Exposed Persons (PEP) or immediate family members of a PEP?
                </p>
              </div>

              {/* Structured Options (YES / NO / UNKNOWN) */}
              <RadioGroup
                value={data.pepStatus}
                onValueChange={(val) =>
                  updateStepData("step8", { pepStatus: val as PepStatus })
                }
                className="grid gap-2 sm:grid-cols-3 pt-1"
                aria-invalid={Boolean(stepErrors["pepStatus"])}
                aria-describedby={stepErrors["pepStatus"] ? "pepStatus-error" : undefined}
              >
                <Label
                  htmlFor="pep-no"
                  className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
                    data.pepStatus === "NO"
                      ? "border-primary bg-background shadow-xs font-medium"
                      : "border-border/70 hover:bg-background/60"
                  }`}
                >
                  <RadioGroupItem value="NO" id="pep-no" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">No PEP</span>
                    <span className="text-[11px] text-muted-foreground block">
                      No individuals associated are PEPs.
                    </span>
                  </div>
                </Label>

                <Label
                  htmlFor="pep-yes"
                  className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
                    data.pepStatus === "YES"
                      ? "border-primary bg-background shadow-xs font-medium"
                      : "border-border/70 hover:bg-background/60"
                  }`}
                >
                  <RadioGroupItem value="YES" id="pep-yes" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">Yes — Disclose</span>
                    <span className="text-[11px] text-muted-foreground block">
                      PEP association is disclosed below.
                    </span>
                  </div>
                </Label>

                <Label
                  htmlFor="pep-unknown"
                  className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
                    data.pepStatus === "UNKNOWN"
                      ? "border-primary bg-background shadow-xs font-medium"
                      : "border-border/70 hover:bg-background/60"
                  }`}
                >
                  <RadioGroupItem value="UNKNOWN" id="pep-unknown" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">Pending Inquiry</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Status is actively under verification.
                    </span>
                  </div>
                </Label>
              </RadioGroup>

              {stepErrors["pepStatus"] && (
                <p id="pepStatus-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["pepStatus"]}
                </p>
              )}

              {/* Conditional Disclosure Field for YES */}
              {data.pepStatus === "YES" && (
                <div className="pt-2 border-t border-border/50 space-y-1.5">
                  <Label htmlFor="pepDetails" className="text-xs font-medium text-foreground">
                    PEP Disclosure Particulars <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="pepDetails"
                    rows={2}
                    value={data.pepDetails || ""}
                    onChange={(e) => updateStepData("step8", { pepDetails: e.target.value })}
                    placeholder="Enter full name of individual, public/political office held, jurisdiction, and relationship to the merchant entity..."
                    className="text-xs"
                    aria-invalid={Boolean(stepErrors["pepDetails"])}
                    aria-describedby={stepErrors["pepDetails"] ? "pepDetails-error" : undefined}
                  />
                  {stepErrors["pepDetails"] && (
                    <p id="pepDetails-error" role="alert" className="text-xs font-medium text-destructive">
                      {stepErrors["pepDetails"]}
                    </p>
                  )}
                </div>
              )}

              {/* Conditional Disclosure & Notice for UNKNOWN */}
              {data.pepStatus === "UNKNOWN" && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Compliance Notice: Applications with undetermined PEP status require secondary enhanced compliance review by the onboarding team prior to final approval.
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pepDetails" className="text-xs font-medium text-foreground">
                      Pending Determination Particulars <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="pepDetails"
                      value={data.pepDetails || ""}
                      onChange={(e) => updateStepData("step8", { pepDetails: e.target.value })}
                      placeholder="Explain why PEP determination is pending or under active inquiry..."
                      className="text-xs"
                      aria-invalid={Boolean(stepErrors["pepDetails"])}
                      aria-describedby={stepErrors["pepDetails"] ? "pepDetails-error" : undefined}
                    />
                    {stepErrors["pepDetails"] && (
                      <p id="pepDetails-error" role="alert" className="text-xs font-medium text-destructive">
                        {stepErrors["pepDetails"]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Independent Tax Residency Classification */}
            <div
              className={`rounded-lg border p-3.5 transition-colors space-y-3 ${
                data.taxResidency ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Globe className="size-3.5 text-primary shrink-0" />
                    Entity Tax Residency <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Income Tax Act</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Declare the entity&apos;s tax residence jurisdiction for statutory withholding and tax reporting.
                </p>
              </div>

              <RadioGroup
                value={data.taxResidency}
                onValueChange={(val) =>
                  updateStepData("step8", { taxResidency: val as TaxResidencyStatus })
                }
                className="grid gap-2 sm:grid-cols-2 pt-1"
                aria-invalid={Boolean(stepErrors["taxResidency"])}
                aria-describedby={stepErrors["taxResidency"] ? "taxResidency-error" : undefined}
              >
                <Label
                  htmlFor="tax-india"
                  className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
                    data.taxResidency === "INDIA_ONLY"
                      ? "border-primary bg-background shadow-xs font-medium"
                      : "border-border/70 hover:bg-background/60"
                  }`}
                >
                  <RadioGroupItem value="INDIA_ONLY" id="tax-india" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">India Only</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Tax resident exclusively of India.
                    </span>
                  </div>
                </Label>

                <Label
                  htmlFor="tax-other"
                  className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer text-xs transition-colors ${
                    data.taxResidency === "OTHER"
                      ? "border-primary bg-background shadow-xs font-medium"
                      : "border-border/70 hover:bg-background/60"
                  }`}
                >
                  <RadioGroupItem value="OTHER" id="tax-other" className="mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-foreground">Foreign / Multiple</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Tax resident outside or in addition to India.
                    </span>
                  </div>
                </Label>
              </RadioGroup>

              {stepErrors["taxResidency"] && (
                <p id="taxResidency-error" role="alert" className="text-xs font-medium text-destructive">
                  {stepErrors["taxResidency"]}
                </p>
              )}

              {/* Conditional Foreign Tax Fields */}
              {data.taxResidency === "OTHER" && (
                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <Label htmlFor="taxResidencyCountry" className="text-xs font-medium text-foreground">
                      Primary Foreign Country / Jurisdiction <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="taxResidencyCountry"
                      value={data.taxResidencyCountry || ""}
                      onChange={(e) => updateStepData("step8", { taxResidencyCountry: e.target.value })}
                      placeholder="e.g. United States, Singapore, UK"
                      className="text-xs"
                      aria-invalid={Boolean(stepErrors["taxResidencyCountry"])}
                      aria-describedby={
                        stepErrors["taxResidencyCountry"] ? "taxResidencyCountry-error" : undefined
                      }
                    />
                    {stepErrors["taxResidencyCountry"] && (
                      <p
                        id="taxResidencyCountry-error"
                        role="alert"
                        className="text-xs font-medium text-destructive"
                      >
                        {stepErrors["taxResidencyCountry"]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="foreignTaxIdNumber" className="text-xs font-medium text-foreground">
                      Foreign Tax ID / TIN <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="foreignTaxIdNumber"
                      value={data.foreignTaxIdNumber || ""}
                      onChange={(e) => updateStepData("step8", { foreignTaxIdNumber: e.target.value })}
                      placeholder="e.g. US SSN/EIN, UTR, or local TIN"
                      className="text-xs"
                      aria-invalid={Boolean(stepErrors["foreignTaxIdNumber"])}
                      aria-describedby={
                        stepErrors["foreignTaxIdNumber"] ? "foreignTaxIdNumber-error" : undefined
                      }
                    />
                    {stepErrors["foreignTaxIdNumber"] && (
                      <p
                        id="foreignTaxIdNumber-error"
                        role="alert"
                        className="text-xs font-medium text-destructive"
                      >
                        {stepErrors["foreignTaxIdNumber"]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Independent FATCA / CRS Classification & Certification */}
            <div
              className={`rounded-lg border p-3.5 transition-colors space-y-3 ${
                data.fatcaSelfCertificationConfirmed
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fatcaCrsClassification" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <CheckSquare className="size-3.5 text-primary shrink-0" />
                    FATCA / CRS Classification & Self-Certification <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Inter-Governmental Agreement</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Select the entity&apos;s classification under Foreign Account Tax Compliance Act (FATCA) and Common Reporting Standard (CRS).
                </p>
              </div>

              <div className="space-y-2">
                <Select
                  value={data.fatcaCrsClassification}
                  onValueChange={(val) =>
                    updateStepData("step8", {
                      fatcaCrsClassification: val as FatcaCrsClassification,
                    })
                  }
                >
                  <SelectTrigger
                    id="fatcaCrsClassification"
                    className="w-full text-xs"
                    aria-invalid={Boolean(stepErrors["fatcaCrsClassification"])}
                    aria-describedby={
                      stepErrors["fatcaCrsClassification"] ? "fatcaCrsClassification-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select FATCA / CRS Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NON_REPORTABLE" className="text-xs">
                      Non-Reportable Entity (Active Non-Financial Entity with no US controlling persons)
                    </SelectItem>
                    <SelectItem value="REPORTABLE_US" className="text-xs">
                      US Specified Person or US Reportable Entity (FATCA)
                    </SelectItem>
                    <SelectItem value="REPORTABLE_OTHER" className="text-xs">
                      Reportable under Common Reporting Standard (CRS) in other jurisdictions
                    </SelectItem>
                    <SelectItem value="EXEMPT" className="text-xs">
                      Exempt Beneficial Owner / Active Financial Institution
                    </SelectItem>
                  </SelectContent>
                </Select>

                {stepErrors["fatcaCrsClassification"] && (
                  <p
                    id="fatcaCrsClassification-error"
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {stepErrors["fatcaCrsClassification"]}
                  </p>
                )}
              </div>

              {/* Conditional GIIN / Foreign TIN for reportable classification */}
              {(data.fatcaCrsClassification === "REPORTABLE_US" ||
                data.fatcaCrsClassification === "REPORTABLE_OTHER") && (
                <div className="pt-2 border-t border-border/50 space-y-1.5">
                  <Label htmlFor="fatcaCrsGiinOrTin" className="text-xs font-medium text-foreground">
                    GIIN or Reporting TIN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fatcaCrsGiinOrTin"
                    value={data.fatcaCrsGiinOrTin || ""}
                    onChange={(e) => updateStepData("step8", { fatcaCrsGiinOrTin: e.target.value })}
                    placeholder="Enter GIIN (Global Intermediary Identification Number) or foreign TIN"
                    className="text-xs font-mono"
                    aria-invalid={Boolean(stepErrors["fatcaCrsGiinOrTin"])}
                    aria-describedby={
                      stepErrors["fatcaCrsGiinOrTin"] ? "fatcaCrsGiinOrTin-error" : undefined
                    }
                  />
                  {stepErrors["fatcaCrsGiinOrTin"] && (
                    <p
                      id="fatcaCrsGiinOrTin-error"
                      role="alert"
                      className="text-xs font-medium text-destructive"
                    >
                      {stepErrors["fatcaCrsGiinOrTin"]}
                    </p>
                  )}
                </div>
              )}

              {/* Mandatory Self-Certification Checkbox */}
              <div className="pt-2 border-t border-border/50 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="fatcaSelfCertificationConfirmed"
                    checked={data.fatcaSelfCertificationConfirmed}
                    onCheckedChange={(checked) =>
                      updateStepData("step8", { fatcaSelfCertificationConfirmed: checked === true })
                    }
                    className="mt-0.5"
                    aria-invalid={Boolean(stepErrors["fatcaSelfCertificationConfirmed"])}
                    aria-describedby={
                      stepErrors["fatcaSelfCertificationConfirmed"]
                        ? "fatcaSelfCertificationConfirmed-error"
                        : undefined
                    }
                  />
                  <Label
                    htmlFor="fatcaSelfCertificationConfirmed"
                    className="text-xs font-medium text-foreground cursor-pointer leading-normal"
                  >
                    I hereby certify the FATCA / CRS classification and residency particulars provided above on behalf of the merchant entity. <span className="text-destructive">*</span>
                  </Label>
                </div>
                {stepErrors["fatcaSelfCertificationConfirmed"] && (
                  <p
                    id="fatcaSelfCertificationConfirmed-error"
                    role="alert"
                    className="text-xs font-medium text-destructive pl-6"
                  >
                    {stepErrors["fatcaSelfCertificationConfirmed"]}
                  </p>
                )}
              </div>
            </div>

            {/* 5. Real-Time Transaction Monitoring & Threat Intelligence Consent */}
            <div
              className={`rounded-lg border p-3.5 transition-colors space-y-1.5 ${
                data.transactionMonitoringConsent
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="transactionMonitoringConsent"
                  checked={data.transactionMonitoringConsent}
                  onCheckedChange={(checked) =>
                    updateStepData("step8", { transactionMonitoringConsent: checked === true })
                  }
                  className="mt-0.5"
                  aria-invalid={Boolean(stepErrors["transactionMonitoringConsent"])}
                  aria-describedby={
                    stepErrors["transactionMonitoringConsent"]
                      ? "transactionMonitoringConsent-error"
                      : undefined
                  }
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="transactionMonitoringConsent"
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="size-3.5 text-primary shrink-0" />
                    Consent for Real-Time Transaction Monitoring & Threat Intelligence <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Consent to automated transaction monitoring, suspicious velocity scanning, and commercial registry checks for risk evaluation. (Authorizes automated platform monitoring; does not perform external credit rating queries).
                  </p>
                </div>
              </div>
              {stepErrors["transactionMonitoringConsent"] && (
                <p
                  id="transactionMonitoringConsent-error"
                  role="alert"
                  className="text-xs font-medium text-destructive pl-7"
                >
                  {stepErrors["transactionMonitoringConsent"]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
