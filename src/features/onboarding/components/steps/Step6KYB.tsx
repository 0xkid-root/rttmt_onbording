"use client";

import React, { useMemo, useEffect, useId } from "react";
import {
  Building2,
  FileText,
  CreditCard,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { DocumentUploadBox } from "../common/DocumentUploadBox";
import { VerificationBadge } from "../common/VerificationBadge";
import { formatPan } from "../../utils/formatters";
import {
  getEntityKybConfig,
  areRequiredKybDocsUploaded,
  KybDocumentField,
} from "../../config/kybDocuments";
import {
  BeneficialOwner,
  BusinessEntityType,
  UploadedDocument,
} from "../../types";

export function Step6KYB() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step6;
  const entityType: BusinessEntityType =
    formData.step3.entityType || data.entityType || "PRIVATE_LIMITED";

  // Derive GST registration status from Step 3
  const hasGstInStep3 = Boolean(
    formData.step3.gstin && !formData.step3.hasNoGstDeclaration
  );
  // Default to false for exemption; unregistered is separate from exempt
  const isGstExempt = Boolean(data.isGstExempt);

  // Sync hasGstRegistration to Step 6 state if out of sync
  useEffect(() => {
    if (data.hasGstRegistration !== hasGstInStep3) {
      updateStepData("step6", { hasGstRegistration: hasGstInStep3 });
    }
  }, [data.hasGstRegistration, hasGstInStep3, updateStepData]);

  // Normalize beneficial owners so every owner has a stable unique ID
  useEffect(() => {
    const owners = data.beneficialOwners;
    if (owners && owners.length > 0) {
      let needsNormalization = false;
      const normalized = owners.map((owner, idx) => {
        if (!owner.id) {
          needsNormalization = true;
          return {
            ...owner,
            id: `ubo_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
          };
        }
        return owner;
      });
      if (needsNormalization) {
        updateStepData("step6", { beneficialOwners: normalized });
      }
    }
  }, [data.beneficialOwners, updateStepData]);

  // Entity-specific document configuration
  const entityConfig = useMemo(
    () => getEntityKybConfig(entityType, hasGstInStep3, isGstExempt),
    [entityType, hasGstInStep3, isGstExempt]
  );

  // Group documents by category
  const registrationDocs = useMemo(
    () => entityConfig.documents.filter((d) => d.category === "registration"),
    [entityConfig]
  );
  const constitutionalDocs = useMemo(
    () => entityConfig.documents.filter((d) => d.category === "constitutional"),
    [entityConfig]
  );
  const taxDocs = useMemo(
    () => entityConfig.documents.filter((d) => d.category === "tax"),
    [entityConfig]
  );

  // Document upload checklist & section stats
  const docStatus = useMemo(() => {
    return areRequiredKybDocsUploaded(data, hasGstInStep3, isGstExempt);
  }, [data, hasGstInStep3, isGstExempt]);

  // UBO holding total calculation
  const totalUboHolding = useMemo(() => {
    if (!data.beneficialOwners || data.beneficialOwners.length === 0) return 0;
    return data.beneficialOwners.reduce(
      (sum, o) => sum + (Number(o.percentageHolding) || 0),
      0
    );
  }, [data.beneficialOwners]);

  // Check if UBO requirements are met
  const isUboComplete = useMemo(() => {
    if (!entityConfig.isUboApplicable) return true; // Sole proprietorship
    if (data.hasNoUboDeclaration) return true; // Widely held / SMO declared
    if (!data.beneficialOwners || data.beneficialOwners.length === 0) return false;
    const hasValidOwners = data.beneficialOwners.every(
      (o) =>
        o.name.trim().length >= 2 &&
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(o.pan.trim().toUpperCase())
    );
    return hasValidOwners && totalUboHolding <= 100;
  }, [
    entityConfig.isUboApplicable,
    data.hasNoUboDeclaration,
    data.beneficialOwners,
    totalUboHolding,
  ]);

  // Auto-verify KYB status when all required documents and UBO declarations are completed
  const isKybComplete = docStatus.isComplete && isUboComplete;

  useEffect(() => {
    if (isKybComplete && (!data.isKybVerified || data.kybVerificationStatus !== "VERIFIED")) {
      updateStepData("step6", {
        isKybVerified: true,
        kybVerificationStatus: "VERIFIED",
        kybVerificationNotes: "All required charters and UBO declarations verified.",
      });
    } else if (!isKybComplete && (data.isKybVerified || data.kybVerificationStatus === "VERIFIED")) {
      updateStepData("step6", {
        isKybVerified: false,
        kybVerificationStatus: "NOT_STARTED",
        kybVerificationNotes: undefined,
      });
    }
  }, [isKybComplete, data.isKybVerified, data.kybVerificationStatus, updateStepData]);

  // Document upload handler
  const handleDocChange = (field: KybDocumentField, doc?: UploadedDocument) => {
    updateStepData("step6", {
      [field]: doc,
    });
  };

  // UBO Management with stable unique IDs
  const handleAddOwner = () => {
    const newOwner: BeneficialOwner = {
      id: `ubo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: "",
      pan: "",
      percentageHolding: entityConfig.uboThresholdPercent,
      isPep: false,
    };

    updateStepData("step6", {
      beneficialOwners: [...(data.beneficialOwners || []), newOwner],
      hasNoUboDeclaration: false,
    });
  };

  const handleRemoveOwner = (ownerId: string) => {
    const updated = (data.beneficialOwners || []).filter((o) => o.id !== ownerId);
    updateStepData("step6", {
      beneficialOwners: updated,
    });
  };

  const handleOwnerFieldChange = (
    ownerId: string,
    field: keyof Omit<BeneficialOwner, "id">,
    value: string | number | boolean
  ) => {
    const updated = (data.beneficialOwners || []).map((owner) => {
      if (owner.id === ownerId) {
        return { ...owner, [field]: value };
      }
      return owner;
    });

    updateStepData("step6", {
      beneficialOwners: updated,
    });
  };

  const handleToggleNoUbo = (checked: boolean) => {
    updateStepData("step6", {
      hasNoUboDeclaration: checked,
      beneficialOwners: checked ? [] : data.beneficialOwners,
    });
  };

  const noUboCheckboxId = useId();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Know Your Business (KYB) & Entity Verification
          </h2>
          <VerificationBadge
            status={data.isKybVerified ? "VERIFIED" : "NOT_STARTED"}
            label={data.isKybVerified ? "KYB Verified" : "Verification Pending"}
            size="sm"
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload statutory formation charters, board authorizations, and tax documents for{" "}
          <strong className="text-foreground">{entityConfig.entityLabel}</strong>.
        </p>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: Business Registration Documents */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-4 text-primary" />
              1. Business Registration Documents
            </h3>
            {docStatus.sections.registration.isComplete ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="size-3" />
                Uploaded
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border shrink-0">
                {docStatus.sections.registration.totalRequired > 1
                  ? `${docStatus.sections.registration.uploadedRequired} of ${docStatus.sections.registration.totalRequired} uploaded`
                  : "Required"}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 items-stretch">
            {registrationDocs.map((spec) => (
              <DocumentUploadBox
                key={spec.field}
                label={spec.label}
                sideBadge={spec.sideBadge}
                required={spec.required}
                documentType={spec.documentType}
                document={data[spec.field]}
                onDocumentChange={(doc) => handleDocChange(spec.field, doc)}
                error={stepErrors[spec.field]}
              />
            ))}
          </div>
        </div>

        {/* SECTION 2: Constitutional and Authorization Documents */}
        {constitutionalDocs.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                2. Constitutional and Authorization Documents
              </h3>
              {docStatus.sections.constitutional.isComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="size-3" />
                  Uploaded
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border shrink-0">
                  {docStatus.sections.constitutional.uploadedRequired} of {docStatus.sections.constitutional.totalRequired} uploaded
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 items-stretch">
              {constitutionalDocs.map((spec) => (
                <DocumentUploadBox
                  key={spec.field}
                  label={spec.label}
                  sideBadge={spec.sideBadge}
                  required={spec.required}
                  documentType={spec.documentType}
                  document={data[spec.field]}
                  onDocumentChange={(doc) => handleDocChange(spec.field, doc)}
                  error={stepErrors[spec.field]}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: Company Tax Documents */}
        {taxDocs.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="size-4 text-primary" />
                3. Company Tax Documents
              </h3>

              {/* GST Status indicator & Section status */}
              <div className="flex items-center gap-2 shrink-0">
                {hasGstInStep3 ? (
                  <span className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                    GSTIN: {formData.step3.gstin}
                  </span>
                ) : isGstExempt ? (
                  <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full">
                    Statutory GST Exemption
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full">
                    Unregistered (Below Threshold)
                  </span>
                )}

                {docStatus.sections.tax.isComplete ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                    <CheckCircle2 className="size-3" />
                    Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border shrink-0">
                    {docStatus.sections.tax.uploadedRequired} of {docStatus.sections.tax.totalRequired} uploaded
                  </span>
                )}
              </div>
            </div>

            {/* Optional GST Exemption declaration for merchants without Step 3 GSTIN */}
            {!hasGstInStep3 && (
              <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="gst-exemption-toggle"
                    checked={isGstExempt}
                    onCheckedChange={(checked) => {
                      updateStepData("step6", {
                        isGstExempt: checked === true,
                      });
                    }}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="gst-exemption-toggle"
                      className="font-semibold text-foreground cursor-pointer block text-xs"
                    >
                      Declare Statutory GST Exemption (Supplies Exclusively Exempt Goods/Services)
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Check this if the business operates exclusively in exempt categories under Section 23 of CGST Act. Otherwise, business is treated as unregistered below turnover threshold (₹40L goods / ₹20L services). In both cases, GST Certificate is optional and will not block verification.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 items-stretch">
              {taxDocs.map((spec) => (
                <DocumentUploadBox
                  key={spec.field}
                  label={spec.label}
                  sideBadge={spec.sideBadge}
                  required={spec.required}
                  documentType={spec.documentType}
                  document={data[spec.field]}
                  onDocumentChange={(doc) => handleDocChange(spec.field, doc)}
                  error={stepErrors[spec.field]}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: Ultimate Beneficial Ownership (UBO) Declaration */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              4. Ultimate Beneficial Ownership (UBO) Declaration
            </h3>

            {entityConfig.isUboApplicable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOwner}
                disabled={data.hasNoUboDeclaration}
                className="shrink-0 h-8 text-xs self-start sm:self-auto"
              >
                <Plus className="mr-1.5 size-3.5" />
                Add Beneficial Owner
              </Button>
            )}
          </div>

          {/* Sole Proprietorship Notice */}
          {!entityConfig.isUboApplicable ? (
            <div className="rounded-md border border-border/80 bg-muted/30 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Sole Proprietor Ownership (100% Beneficial Owner)
                </p>
                <p>
                  In accordance with regulatory KYC guidelines, 100% individual beneficial ownership resides with the sole proprietor, verified in Step 5 KYC. No separate corporate shareholder declaration is required.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* UBO Threshold & Explanation Banner */}
              <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">{entityConfig.uboExplanation}</p>
              </div>

              {/* No Qualifying Individual / Widely Held Checkbox */}
              <div className="rounded-md border border-border/70 bg-background/60 p-3">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id={noUboCheckboxId}
                    checked={data.hasNoUboDeclaration}
                    onCheckedChange={(checked) => handleToggleNoUbo(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <Label
                      htmlFor={noUboCheckboxId}
                      className="text-xs font-semibold text-foreground cursor-pointer block"
                    >
                      No Single Individual Holds ≥ {entityConfig.uboThresholdPercent}%
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      The entity is widely held (e.g. institutional venture backed, listed entity, or no single natural person holds more than {entityConfig.uboThresholdPercent}% voting interest).
                    </p>
                    {data.hasNoUboDeclaration && (
                      <div className="mt-2 rounded bg-muted/40 p-2 text-[11px] text-muted-foreground border border-border/50">
                        <strong className="text-foreground">Senior Managing Official (SMO) Designation:</strong> Under compliance policy (PMLA Rule 9(3)), where no natural person holds ≥ {entityConfig.uboThresholdPercent}% controlling interest, the primary authorized signatory ({formData.step5.signatoryName || "Authorized Managing Director / Officer"}) serves as the designated Senior Managing Official responsible for governance.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Beneficial Owners List */}
              {!data.hasNoUboDeclaration && (
                <div className="space-y-3 pt-1">
                  {(!data.beneficialOwners || data.beneficialOwners.length === 0) ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-2">
                      <Users className="size-8 text-muted-foreground/50 mx-auto" />
                      <p className="text-xs text-muted-foreground">
                        No beneficial owners declared yet. Click{" "}
                        <strong className="text-foreground">&ldquo;Add Beneficial Owner&rdquo;</strong> above or check the widely held declaration.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-muted-foreground font-medium">
                          Declared Owners ({data.beneficialOwners.length})
                        </span>
                        <span
                          className={`font-mono font-medium ${
                            totalUboHolding > 100
                              ? "text-destructive font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          Total Holding: {totalUboHolding}% {totalUboHolding > 100 && "(Exceeds 100% limit)"}
                        </span>
                      </div>

                      {data.beneficialOwners.map((owner, idx) => {
                        const ownerKey = owner.id || `ubo_${idx}`;
                        const nameError = stepErrors[`beneficialOwners.${idx}.name`];
                        const panError = stepErrors[`beneficialOwners.${idx}.pan`];
                        const percentError = stepErrors[`beneficialOwners.${idx}.percentageHolding`];

                        return (
                          <div
                            key={ownerKey}
                            className="grid gap-3 sm:grid-cols-12 items-start rounded-lg border border-border/80 bg-background/80 p-3 hover:border-primary/30 transition-colors"
                          >
                            <div className="sm:col-span-4 space-y-1">
                              <Label htmlFor={`owner-name-${ownerKey}`} className="text-xs">
                                Full Legal Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`owner-name-${ownerKey}`}
                                value={owner.name}
                                onChange={(e) =>
                                  handleOwnerFieldChange(ownerKey, "name", e.target.value)
                                }
                                placeholder="e.g. Aditya Vikram Rao"
                                className="h-8 text-xs"
                                aria-invalid={Boolean(nameError)}
                              />
                              {nameError && (
                                <p role="alert" className="text-[11px] text-destructive font-medium">
                                  {nameError}
                                </p>
                              )}
                            </div>

                            <div className="sm:col-span-3 space-y-1">
                              <Label htmlFor={`owner-pan-${ownerKey}`} className="text-xs">
                                Personal PAN <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`owner-pan-${ownerKey}`}
                                maxLength={10}
                                value={owner.pan}
                                onChange={(e) =>
                                  handleOwnerFieldChange(
                                    ownerKey,
                                    "pan",
                                    formatPan(e.target.value)
                                  )
                                }
                                placeholder="BKNPR4821E"
                                className="h-8 text-xs font-mono uppercase"
                                aria-invalid={Boolean(panError)}
                              />
                              {panError && (
                                <p role="alert" className="text-[11px] text-destructive font-medium">
                                  {panError}
                                </p>
                              )}
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <Label htmlFor={`owner-percent-${ownerKey}`} className="text-xs">
                                Holding % <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`owner-percent-${ownerKey}`}
                                type="number"
                                min={1}
                                max={100}
                                value={owner.percentageHolding}
                                onChange={(e) =>
                                  handleOwnerFieldChange(
                                    ownerKey,
                                    "percentageHolding",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="25"
                                className="h-8 text-xs font-mono"
                                aria-invalid={Boolean(percentError)}
                              />
                              {percentError && (
                                <p role="alert" className="text-[11px] text-destructive font-medium">
                                  {percentError}
                                </p>
                              )}
                            </div>

                            <div className="sm:col-span-2 flex items-center gap-1.5 pt-6 sm:pt-6">
                              <Checkbox
                                id={`owner-pep-${ownerKey}`}
                                checked={owner.isPep}
                                onCheckedChange={(checked) =>
                                  handleOwnerFieldChange(ownerKey, "isPep", checked === true)
                                }
                              />
                              <Label
                                htmlFor={`owner-pep-${ownerKey}`}
                                className="text-xs text-muted-foreground cursor-pointer"
                              >
                                PEP Status
                              </Label>
                            </div>

                            <div className="sm:col-span-1 flex items-center justify-end pt-5 sm:pt-5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveOwner(ownerKey)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label={`Remove beneficial owner ${owner.name || "entry"}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {stepErrors["hasNoUboDeclaration"] && (
                <p role="alert" className="text-xs font-medium text-destructive pt-1">
                  {stepErrors["hasNoUboDeclaration"]}
                </p>
              )}
              {stepErrors["beneficialOwners"] && (
                <p role="alert" className="text-xs font-medium text-destructive pt-1">
                  {stepErrors["beneficialOwners"]}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
