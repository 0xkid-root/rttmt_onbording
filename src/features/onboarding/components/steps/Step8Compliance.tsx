"use client";

import React from "react";
import { Scale, ShieldAlert, CheckSquare, Link as LinkIcon, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { formatPhoneNumber } from "../../utils/formatters";

export function Step8Compliance() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step8;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Compliance, Public Policies & Declarations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Declare published customer consumer-protection policies and confirm statutory AML/sanction declarations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Customer Policies & Grievance Contact */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <LinkIcon className="size-4 text-primary" />
            Mandatory Customer-Facing Legal URLs
          </h3>
          <p className="text-xs text-muted-foreground">
            As mandated by Reserve Bank of India (RBI) Payment Aggregator Master Directions, your website must host clear customer policies.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="refundPolicyUrl">
                Refund & Cancellation Policy <span className="text-destructive">*</span>
              </Label>
              <Input
                id="refundPolicyUrl"
                type="url"
                value={data.refundPolicyUrl}
                onChange={(e) => updateStepData("step8", { refundPolicyUrl: e.target.value })}
                placeholder="https://brand.com/refunds"
              />
              {stepErrors["refundPolicyUrl"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["refundPolicyUrl"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="termsOfServiceUrl">
                Terms of Service URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="termsOfServiceUrl"
                type="url"
                value={data.termsOfServiceUrl}
                onChange={(e) => updateStepData("step8", { termsOfServiceUrl: e.target.value })}
                placeholder="https://brand.com/terms"
              />
              {stepErrors["termsOfServiceUrl"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["termsOfServiceUrl"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="privacyPolicyUrl">
                Privacy Policy URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="privacyPolicyUrl"
                type="url"
                value={data.privacyPolicyUrl}
                onChange={(e) => updateStepData("step8", { privacyPolicyUrl: e.target.value })}
                placeholder="https://brand.com/privacy"
              />
              {stepErrors["privacyPolicyUrl"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["privacyPolicyUrl"]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
            <div className="space-y-1.5">
              <Label htmlFor="grievanceEmail">
                Customer Support / Grievance Officer Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="grievanceEmail"
                  type="email"
                  value={data.grievanceEmail}
                  onChange={(e) => updateStepData("step8", { grievanceEmail: e.target.value })}
                  placeholder="grievance-officer@brand.com"
                  className="pl-9"
                />
              </div>
              {stepErrors["grievanceEmail"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["grievanceEmail"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grievancePhone">
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
                />
              </div>
              {stepErrors["grievancePhone"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["grievancePhone"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Declarations & Consents */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Scale className="size-4 text-primary" />
            Statutory Declarations & Consents
          </h3>

          <div className="space-y-3.5">
            {/* Restricted Business Declaration */}
            <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-1.5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="restrictedBusinessDeclaration"
                  checked={data.restrictedBusinessDeclaration}
                  onCheckedChange={(checked) =>
                    updateStepData("step8", { restrictedBusinessDeclaration: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="restrictedBusinessDeclaration"
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldAlert className="size-3.5 text-warning" />
                    Prohibited & Restricted Merchant Activity Declaration <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    I solemnly affirm that our business does not engage in, facilitate, or settle transactions related to prohibited goods or services (including unauthorized weapons, counterfeit goods, illegal narcotics, adult services, unauthorized multi-level marketing, or unregulated crypto-derivatives).
                  </p>
                </div>
              </div>
              {stepErrors["restrictedBusinessDeclaration"] && (
                <p className="text-xs font-medium text-destructive pl-7">
                  {stepErrors["restrictedBusinessDeclaration"]}
                </p>
              )}
            </div>

            {/* PEP Declaration */}
            <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-1.5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="pepDeclaration"
                  checked={data.pepDeclaration}
                  onCheckedChange={(checked) =>
                    updateStepData("step8", { pepDeclaration: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="pepDeclaration"
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="size-3.5 text-primary" />
                    Politically Exposed Persons (PEP) Compliance <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    None of the directors, partners, key managerial personnel, or ultimate beneficial owners are Politically Exposed Persons (PEP) or immediate relatives of a PEP as defined under PMLA / FATF regulations.
                  </p>
                </div>
              </div>
              {stepErrors["pepDeclaration"] && (
                <p className="text-xs font-medium text-destructive pl-7">
                  {stepErrors["pepDeclaration"]}
                </p>
              )}
            </div>

            {/* FATCA / CRS Consent */}
            <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-1.5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="fatcaConsent"
                  checked={data.fatcaConsent}
                  onCheckedChange={(checked) =>
                    updateStepData("step8", { fatcaConsent: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="fatcaConsent"
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="size-3.5 text-primary" />
                    FATCA / CRS & Indian Tax Residency Confirmation <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The entity is a tax resident of India and is not a reportable entity under the Foreign Account Tax Compliance Act (FATCA) or Common Reporting Standard (CRS).
                  </p>
                </div>
              </div>
              {stepErrors["fatcaConsent"] && (
                <p className="text-xs font-medium text-destructive pl-7">
                  {stepErrors["fatcaConsent"]}
                </p>
              )}
            </div>

            {/* RTTMT Monitoring Consent */}
            <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-1.5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="creditCheckConsent"
                  checked={data.creditCheckConsent}
                  onCheckedChange={(checked) =>
                    updateStepData("step8", { creditCheckConsent: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="creditCheckConsent"
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="size-3.5 text-primary" />
                    Consent for Real-Time Transaction Monitoring & Threat Intelligence <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    I authorize RTTMT to perform continuous automated threat intelligence, suspicious velocity scanning, and commercial registry checks for risk evaluation and AML prevention.
                  </p>
                </div>
              </div>
              {stepErrors["creditCheckConsent"] && (
                <p className="text-xs font-medium text-destructive pl-7">
                  {stepErrors["creditCheckConsent"]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
