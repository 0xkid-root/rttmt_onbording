"use client";

import React from "react";
import { Scale } from "lucide-react";
import { Step8ComplianceData } from "../../../types";
import { RestrictedBusinessDeclaration } from "./RestrictedBusinessDeclaration";
import { PepDeclarationSection } from "./PepDeclarationSection";
import { TaxResidencySection } from "./TaxResidencySection";
import { FatcaCrsSection } from "./FatcaCrsSection";
import { TransactionMonitoringConsent } from "./TransactionMonitoringConsent";

interface StatutoryDeclarationsSectionProps {
  data: Step8ComplianceData;
  updateStepData: (stepKey: "step8", data: Partial<Step8ComplianceData>) => void;
  stepErrors: Record<string, string>;
}

export function StatutoryDeclarationsSection({
  data,
  updateStepData,
  stepErrors,
}: StatutoryDeclarationsSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Scale className="size-4 text-primary" />
            Statutory Declarations & Consents
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each declaration must be reviewed and answered individually by the
            authorized representative.
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/70 self-start sm:self-auto">
          Compliance Review Pending
        </span>
      </div>

      <div className="space-y-4">
        {/* 1. Prohibited & Restricted Merchant Activity Declaration */}
        <RestrictedBusinessDeclaration
          checked={data.restrictedBusinessDeclaration}
          onCheckedChange={(checked) =>
            updateStepData("step8", { restrictedBusinessDeclaration: checked })
          }
          error={stepErrors["restrictedBusinessDeclaration"]}
        />

        {/* 2. Structured PEP (Politically Exposed Persons) Disclosure */}
        <PepDeclarationSection
          pepStatus={data.pepStatus}
          pepDetails={data.pepDetails}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
        />

        {/* 3. Independent Tax Residency Classification */}
        <TaxResidencySection
          taxResidency={data.taxResidency}
          taxResidencyCountry={data.taxResidencyCountry}
          foreignTaxIdNumber={data.foreignTaxIdNumber}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
        />

        {/* 4. Independent FATCA / CRS Classification & Certification */}
        <FatcaCrsSection
          fatcaCrsClassification={data.fatcaCrsClassification}
          fatcaCrsGiinOrTin={data.fatcaCrsGiinOrTin}
          fatcaSelfCertificationConfirmed={data.fatcaSelfCertificationConfirmed}
          updateStepData={updateStepData}
          stepErrors={stepErrors}
        />

        {/* 5. Real-Time Transaction Monitoring & Threat Intelligence Consent */}
        <TransactionMonitoringConsent
          checked={data.transactionMonitoringConsent}
          onCheckedChange={(checked) =>
            updateStepData("step8", { transactionMonitoringConsent: checked })
          }
          error={stepErrors["transactionMonitoringConsent"]}
        />
      </div>
    </div>
  );
}
