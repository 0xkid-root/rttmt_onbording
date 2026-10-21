"use client";

import React, { useState } from "react";
import { FileCheck, ShieldCheck, RefreshCw, Plus, Trash2, Users, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { DocumentUploadBox } from "../common/DocumentUploadBox";
import { VerificationBadge } from "../common/VerificationBadge";
import { ENTITY_TYPE_OPTIONS } from "../../mocks/options";
import { formatPan } from "../../utils/formatters";
import { simulateKybVerification } from "../../services/verificationService";

export function Step6KYB() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step6;
  const entityType = formData.step3.entityType;

  const [isVerifying, setIsVerifying] = useState(false);
  const [kybFeedback, setKybFeedback] = useState<string | null>(null);

  const currentEntityConfig = ENTITY_TYPE_OPTIONS.find((e) => e.value === entityType);
  const isCorporate = ["PRIVATE_LIMITED", "PUBLIC_LIMITED", "LLP"].includes(entityType);
  const isProprietor = entityType === "SOLE_PROPRIETORSHIP";

  const handleAddOwner = () => {
    updateStepData("step6", {
      beneficialOwners: [
        ...data.beneficialOwners,
        { name: "", pan: "", percentageHolding: 25, isPep: false },
      ],
      hasNoUboDeclaration: false,
    });
  };

  const handleRemoveOwner = (index: number) => {
    const updated = data.beneficialOwners.filter((_, i) => i !== index);
    updateStepData("step6", { beneficialOwners: updated });
  };

  const handleOwnerChange = (index: number, field: string, value: unknown) => {
    const updated = [...data.beneficialOwners];
    updated[index] = { ...updated[index], [field]: value };
    updateStepData("step6", { beneficialOwners: updated });
  };

  const handleSimulateKyb = async () => {
    let docsCount = 0;
    if (data.businessRegistrationDoc) docsCount++;
    if (data.constitutionalDoc) docsCount++;
    if (data.boardResolutionDoc) docsCount++;
    if (data.companyPanDoc) docsCount++;
    if (data.gstCertificateDoc) docsCount++;

    setIsVerifying(true);
    setKybFeedback(null);
    try {
      const result = await simulateKybVerification(
        currentEntityConfig?.label || entityType,
        docsCount
      );
      if (result.verified) {
        updateStepData("step6", { isKybVerified: true });
        setKybFeedback(result.notes);
      }
    } catch {
      setKybFeedback("KYB verification check timed out. Please retry.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Know Your Business (KYB) & Entity Verification
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload statutory formation charters, board authorizations, and identify ultimate beneficial owners (UBOs) for{" "}
          <strong className="text-foreground">{currentEntityConfig?.label}</strong>.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Document Requirements tailored by Entity Type */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <FileCheck className="size-4 text-primary" />
              Statutory Incorporation & Registration Documents
            </h3>
            <VerificationBadge
              status={data.isKybVerified}
              label={data.isKybVerified ? "KYB Cleared" : "Verification Pending"}
              size="sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 1. Primary Registration Document */}
            <DocumentUploadBox
              label={
                isProprietor
                  ? "Shop & Establishment / MSME Udyam Registration"
                  : isCorporate
                  ? "Certificate of Incorporation (COI from MCA)"
                  : "Partnership Deed / Trust Deed"
              }
              description="Official registration certificate displaying registration number"
              required
              documentType="BUSINESS_REG_DOC"
              document={data.businessRegistrationDoc}
              onDocumentChange={(doc) =>
                updateStepData("step6", { businessRegistrationDoc: doc, isKybVerified: false })
              }
              error={stepErrors["businessRegistrationDoc"]}
            />

            {/* 2. Constitutional Charters (for Companies / LLPs / Trusts) */}
            {!isProprietor && (
              <DocumentUploadBox
                label={
                  isCorporate
                    ? "Memorandum & Articles of Association (MOA / AOA)"
                    : "Registered Partnership Agreement / Bylaws"
                }
                description="Governing charter outlining business objectives"
                documentType="CONSTITUTIONAL_DOC"
                document={data.constitutionalDoc}
                onDocumentChange={(doc) =>
                  updateStepData("step6", { constitutionalDoc: doc, isKybVerified: false })
                }
              />
            )}

            {/* 3. Board Resolution / Signatory Authorization Letter */}
            {!isProprietor && (
              <DocumentUploadBox
                label="Board Resolution / Signatory Authority Letter"
                description="Authorizing primary signatory to open RTTMT merchant account"
                documentType="BOARD_RESOLUTION"
                document={data.boardResolutionDoc}
                onDocumentChange={(doc) =>
                  updateStepData("step6", { boardResolutionDoc: doc, isKybVerified: false })
                }
              />
            )}

            {/* 4. Company PAN Card Copy */}
            {!isProprietor && (
              <DocumentUploadBox
                label="Entity / Company PAN Card Copy"
                description="Clear scanned copy of company permanent account number"
                documentType="COMPANY_PAN"
                document={data.companyPanDoc}
                onDocumentChange={(doc) =>
                  updateStepData("step6", { companyPanDoc: doc, isKybVerified: false })
                }
              />
            )}

            {/* 5. GST Registration Certificate */}
            <DocumentUploadBox
              label="GST Registration Certificate (REG-06)"
              description="Showing all registered trading business premises"
              documentType="GST_CERTIFICATE"
              document={data.gstCertificateDoc}
              onDocumentChange={(doc) =>
                updateStepData("step6", { gstCertificateDoc: doc, isKybVerified: false })
              }
            />
          </div>
        </div>

        {/* Beneficial Ownership (UBO) Section (For corporate entities) */}
        {!isProprietor && (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="size-4 text-primary" />
                  Ultimate Beneficial Ownership (UBO Declaration)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mandatory AML disclosure of natural persons holding ≥ 10% equity / profit shares.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddOwner}
                disabled={data.hasNoUboDeclaration}
                className="self-start sm:self-auto text-xs"
              >
                <Plus className="mr-1 size-3.5" />
                Add Beneficial Owner
              </Button>
            </div>

            {/* No UBO Checkbox */}
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="hasNoUboDeclaration"
                  checked={data.hasNoUboDeclaration}
                  onCheckedChange={(checked) =>
                    updateStepData("step6", {
                      hasNoUboDeclaration: checked === true,
                      beneficialOwners: checked === true ? [] : data.beneficialOwners,
                    })
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="hasNoUboDeclaration"
                  className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
                >
                  <strong>No Single Individual Holds ≥ 10%:</strong> The entity is widely held (e.g. institutional venture backed / listed / no single natural person holds more than 10% voting equity).
                </Label>
              </div>
            </div>

            {/* Beneficial Owners List */}
            {!data.hasNoUboDeclaration && data.beneficialOwners.length > 0 && (
              <div className="space-y-3 pt-2">
                {data.beneficialOwners.map((owner, idx) => (
                  <div
                    key={idx}
                    className="grid gap-3 sm:grid-cols-12 items-center rounded-lg border border-border p-3 bg-muted/20"
                  >
                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-xs">Full Legal Name</Label>
                      <Input
                        value={owner.name}
                        onChange={(e) => handleOwnerChange(idx, "name", e.target.value)}
                        placeholder="Owner Name"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs">Personal PAN</Label>
                      <Input
                        maxLength={10}
                        value={owner.pan}
                        onChange={(e) =>
                          handleOwnerChange(idx, "pan", formatPan(e.target.value))
                        }
                        placeholder="PAN Number"
                        className="h-8 text-xs font-mono uppercase"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs">Holding % (Voting/Equity)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={owner.percentageHolding}
                        onChange={(e) =>
                          handleOwnerChange(
                            idx,
                            "percentageHolding",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="51"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end justify-end pt-5 sm:pt-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRemoveOwner(idx)}
                        className="text-destructive hover:bg-destructive/10"
                        title="Remove owner"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stepErrors["hasNoUboDeclaration"] && (
              <p className="text-xs font-medium text-destructive">
                {stepErrors["hasNoUboDeclaration"]}
              </p>
            )}
          </div>
        )}

        {/* Simulated KYB Verification Button */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div className="text-xs text-muted-foreground">
            {kybFeedback ? (
              <span className="text-success font-medium flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                {kybFeedback}
              </span>
            ) : (
              <span>Simulate instant Ministry of Corporate Affairs (MCA) and ROC registry check.</span>
            )}
          </div>

          <Button
            type="button"
            variant={data.isKybVerified ? "outline" : "default"}
            size="sm"
            onClick={handleSimulateKyb}
            disabled={isVerifying || !data.businessRegistrationDoc}
            className="shrink-0"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="mr-2 size-3.5 animate-spin" />
                Verifying Registry...
              </>
            ) : data.isKybVerified ? (
              <>
                <ShieldCheck className="mr-2 size-3.5 text-success" />
                Re-Validate Charters
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 size-3.5" />
                Simulate KYB Verification
              </>
            )}
          </Button>
        </div>

        {stepErrors["isKybVerified"] && !data.isKybVerified && (
          <p className="text-xs font-medium text-destructive">{stepErrors["isKybVerified"]}</p>
        )}
      </div>
    </div>
  );
}
