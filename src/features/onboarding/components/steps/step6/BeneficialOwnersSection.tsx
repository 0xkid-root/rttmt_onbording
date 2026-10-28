"use client";

import React, { useId } from "react";
import { Users, Plus, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPan } from "../../../utils/formatters";
import { BeneficialOwner } from "../../../types";
import { EntityKybConfig } from "../../../config/kybDocuments";

interface BeneficialOwnersSectionProps {
  entityConfig: EntityKybConfig;
  beneficialOwners?: BeneficialOwner[];
  hasNoUboDeclaration?: boolean;
  totalUboHolding: number;
  signatoryName?: string;
  onAddOwner: () => void;
  onRemoveOwner: (ownerId: string) => void;
  onOwnerFieldChange: (
    ownerId: string,
    field: keyof Omit<BeneficialOwner, "id">,
    value: string | number | boolean
  ) => void;
  onToggleNoUbo: (checked: boolean) => void;
  stepErrors: Record<string, string>;
}

export function BeneficialOwnersSection({
  entityConfig,
  beneficialOwners = [],
  hasNoUboDeclaration = false,
  totalUboHolding,
  signatoryName,
  onAddOwner,
  onRemoveOwner,
  onOwnerFieldChange,
  onToggleNoUbo,
  stepErrors,
}: BeneficialOwnersSectionProps) {
  const noUboCheckboxId = useId();

  return (
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
            onClick={onAddOwner}
            disabled={hasNoUboDeclaration}
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
              In accordance with regulatory KYC guidelines, 100% individual beneficial
              ownership resides with the sole proprietor, verified in Step 5 KYC. No separate
              corporate shareholder declaration is required.
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
                checked={hasNoUboDeclaration}
                onCheckedChange={(checked) => onToggleNoUbo(checked === true)}
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
                  The entity is widely held (e.g. institutional venture backed, listed entity,
                  or no single natural person holds more than {entityConfig.uboThresholdPercent}%
                  voting interest).
                </p>
                {hasNoUboDeclaration && (
                  <div className="mt-2 rounded bg-muted/40 p-2 text-[11px] text-muted-foreground border border-border/50">
                    <strong className="text-foreground">
                      Senior Managing Official (SMO) Designation:
                    </strong>{" "}
                    Under compliance policy (PMLA Rule 9(3)), where no natural person holds ≥{" "}
                    {entityConfig.uboThresholdPercent}% controlling interest, the primary authorized
                    signatory ({signatoryName || "Authorized Managing Director / Officer"}) serves as
                    the designated Senior Managing Official responsible for governance.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Beneficial Owners List */}
          {!hasNoUboDeclaration && (
            <div className="space-y-3 pt-1">
              {beneficialOwners.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-2">
                  <Users className="size-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    No beneficial owners declared yet. Click{" "}
                    <strong className="text-foreground">&ldquo;Add Beneficial Owner&rdquo;</strong>{" "}
                    above or check the widely held declaration.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-muted-foreground font-medium">
                      Declared Owners ({beneficialOwners.length})
                    </span>
                    <span
                      className={`font-mono font-medium ${
                        totalUboHolding > 100
                          ? "text-destructive font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      Total Holding: {totalUboHolding}%{" "}
                      {totalUboHolding > 100 && "(Exceeds 100% limit)"}
                    </span>
                  </div>

                  {beneficialOwners.map((owner, idx) => {
                    const ownerKey = owner.id || `ubo_${idx}`;
                    const nameError = stepErrors[`beneficialOwners.${idx}.name`];
                    const panError = stepErrors[`beneficialOwners.${idx}.pan`];
                    const percentError =
                      stepErrors[`beneficialOwners.${idx}.percentageHolding`];

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
                              onOwnerFieldChange(ownerKey, "name", e.target.value)
                            }
                            placeholder="e.g. Aditya Vikram Rao"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(nameError)}
                          />
                          {nameError && (
                            <p
                              role="alert"
                              className="text-[11px] text-destructive font-medium"
                            >
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
                              onOwnerFieldChange(
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
                            <p
                              role="alert"
                              className="text-[11px] text-destructive font-medium"
                            >
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
                              onOwnerFieldChange(
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
                            <p
                              role="alert"
                              className="text-[11px] text-destructive font-medium"
                            >
                              {percentError}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1.5 pt-6 sm:pt-6">
                          <Checkbox
                            id={`owner-pep-${ownerKey}`}
                            checked={owner.isPep}
                            onCheckedChange={(checked) =>
                              onOwnerFieldChange(ownerKey, "isPep", checked === true)
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
                            onClick={() => onRemoveOwner(ownerKey)}
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
  );
}
