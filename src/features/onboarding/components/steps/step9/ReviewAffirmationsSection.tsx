"use client";

import React from "react";
import { Scale, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Step9ReviewData } from "../../../types";

interface ReviewAffirmationsSectionProps {
  data: Step9ReviewData;
  entityName: string;
  updateStepData: (stepKey: "step9", data: Partial<Step9ReviewData>) => void;
  stepErrors: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ReviewAffirmationsSection({
  data,
  entityName,
  updateStepData,
  stepErrors,
  isSubmitting,
  onSubmit,
}: ReviewAffirmationsSectionProps) {
  return (
    <>
      {/* Final Affirmations & Submission Checkboxes */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Scale className="size-4 text-primary" />
          Statutory Final Declarations
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="declarationAccepted"
              checked={data.declarationAccepted}
              onCheckedChange={(checked) =>
                updateStepData("step9", { declarationAccepted: checked === true })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="declarationAccepted"
              className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
            >
              I hereby declare that the particulars given above are true, correct, and
              complete to the best of my knowledge and belief. I agree to promptly notify
              RTTMT of any material change in business activity, ownership structure, or
              banking details.
            </Label>
          </div>
          {stepErrors["declarationAccepted"] && (
            <p className="text-xs font-medium text-destructive pl-7">
              {stepErrors["declarationAccepted"]}
            </p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="authorizedSignatoryConfirmation"
              checked={data.authorizedSignatoryConfirmation}
              onCheckedChange={(checked) =>
                updateStepData("step9", {
                  authorizedSignatoryConfirmation: checked === true,
                })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="authorizedSignatoryConfirmation"
              className="text-xs font-normal text-muted-foreground leading-relaxed cursor-pointer"
            >
              I confirm that I am the duly authorized signatory/director empowered to
              execute this merchant onboarding application on behalf of{" "}
              <strong className="text-foreground">{entityName}</strong>.
            </Label>
          </div>
          {stepErrors["authorizedSignatoryConfirmation"] && (
            <p className="text-xs font-medium text-destructive pl-7">
              {stepErrors["authorizedSignatoryConfirmation"]}
            </p>
          )}
        </div>
      </div>

      {/* Final Submit Application Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <p className="text-xs text-muted-foreground">
          Upon submission, your application will enter automated underwriting and status tracking.
        </p>

        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={
            isSubmitting ||
            !data.declarationAccepted ||
            !data.authorizedSignatoryConfirmation
          }
          className="w-full sm:w-auto font-semibold px-8"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 size-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit Application for Review
            </>
          )}
        </Button>
      </div>
    </>
  );
}
