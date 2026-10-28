"use client";

import React, { useMemo, useEffect } from "react";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { VerificationBadge } from "../common/VerificationBadge";
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
import { KybDocumentsSection } from "./step6/KybDocumentsSection";
import { BeneficialOwnersSection } from "./step6/BeneficialOwnersSection";

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
  const isGstExempt = Boolean(data.isGstExempt || formData.step3.hasNoGstDeclaration);

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

  const handleToggleGstExempt = (exempt: boolean) => {
    updateStepData("step6", {
      isGstExempt: exempt,
    });
  };

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
        {/* Document Upload Sections (Registration, Constitutional, Tax) */}
        <KybDocumentsSection
          data={data}
          registrationDocs={registrationDocs}
          constitutionalDocs={constitutionalDocs}
          taxDocs={taxDocs}
          docStatus={docStatus}
          hasGstInStep3={hasGstInStep3}
          isGstExempt={isGstExempt}
          step3Gstin={formData.step3.gstin}
          onDocChange={handleDocChange}
          onToggleGstExempt={handleToggleGstExempt}
          stepErrors={stepErrors}
        />

        {/* SECTION 4: Ultimate Beneficial Ownership (UBO) Declaration */}
        <BeneficialOwnersSection
          entityConfig={entityConfig}
          beneficialOwners={data.beneficialOwners}
          hasNoUboDeclaration={data.hasNoUboDeclaration}
          totalUboHolding={totalUboHolding}
          signatoryName={formData.step5.signatoryName}
          onAddOwner={handleAddOwner}
          onRemoveOwner={handleRemoveOwner}
          onOwnerFieldChange={handleOwnerFieldChange}
          onToggleNoUbo={handleToggleNoUbo}
          stepErrors={stepErrors}
        />
      </div>
    </div>
  );
}
