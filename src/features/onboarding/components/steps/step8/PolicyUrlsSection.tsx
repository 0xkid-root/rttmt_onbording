"use client";

import React, { useState } from "react";
import {
  Link as LinkIcon,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  formatPhoneNumber,
  validateAndNormalizeWebUrl,
  getSafeBaseDomain,
} from "../../../utils/formatters";
import { Step8ComplianceData } from "../../../types";

interface PolicyUrlsSectionProps {
  data: Step8ComplianceData;
  updateStepData: (stepKey: "step8", data: Partial<Step8ComplianceData>) => void;
  stepErrors: Record<string, string>;
  websiteUrl?: string;
  accountEmail?: string;
  accountPhone?: string;
}

export function PolicyUrlsSection({
  data,
  updateStepData,
  stepErrors,
  websiteUrl,
  accountEmail,
  accountPhone,
}: PolicyUrlsSectionProps) {
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
            {data.refundPolicyUrl &&
              validateAndNormalizeWebUrl(data.refundPolicyUrl).isValid && (
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
            aria-invalid={Boolean(
              stepErrors["refundPolicyUrl"] || urlFieldErrors.refundPolicyUrl
            )}
            aria-describedby={
              stepErrors["refundPolicyUrl"] || urlFieldErrors.refundPolicyUrl
                ? "refundPolicyUrl-error"
                : undefined
            }
          />
          {(urlFieldErrors.refundPolicyUrl || stepErrors["refundPolicyUrl"]) && (
            <p
              id="refundPolicyUrl-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
            {data.termsOfServiceUrl &&
              validateAndNormalizeWebUrl(data.termsOfServiceUrl).isValid && (
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
            aria-invalid={Boolean(
              stepErrors["termsOfServiceUrl"] || urlFieldErrors.termsOfServiceUrl
            )}
            aria-describedby={
              stepErrors["termsOfServiceUrl"] || urlFieldErrors.termsOfServiceUrl
                ? "termsOfServiceUrl-error"
                : undefined
            }
          />
          {(urlFieldErrors.termsOfServiceUrl || stepErrors["termsOfServiceUrl"]) && (
            <p
              id="termsOfServiceUrl-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
            {data.privacyPolicyUrl &&
              validateAndNormalizeWebUrl(data.privacyPolicyUrl).isValid && (
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
            aria-invalid={Boolean(
              stepErrors["privacyPolicyUrl"] || urlFieldErrors.privacyPolicyUrl
            )}
            aria-describedby={
              stepErrors["privacyPolicyUrl"] || urlFieldErrors.privacyPolicyUrl
                ? "privacyPolicyUrl-error"
                : undefined
            }
          />
          {(urlFieldErrors.privacyPolicyUrl || stepErrors["privacyPolicyUrl"]) && (
            <p
              id="privacyPolicyUrl-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
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
                onChange={(e) =>
                  updateStepData("step8", { grievanceEmail: e.target.value })
                }
                placeholder="grievance@brand.com"
                className="pl-9"
                aria-invalid={Boolean(stepErrors["grievanceEmail"])}
                aria-describedby={
                  stepErrors["grievanceEmail"] ? "grievanceEmail-error" : undefined
                }
              />
            </div>
            {stepErrors["grievanceEmail"] && (
              <p
                id="grievanceEmail-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
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
                  updateStepData("step8", {
                    grievancePhone: formatPhoneNumber(e.target.value),
                  })
                }
                placeholder="022-48921000 or 9876543210"
                className="pl-9"
                aria-invalid={Boolean(stepErrors["grievancePhone"])}
                aria-describedby={
                  stepErrors["grievancePhone"] ? "grievancePhone-error" : undefined
                }
              />
            </div>
            {stepErrors["grievancePhone"] && (
              <p
                id="grievancePhone-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {stepErrors["grievancePhone"]}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
