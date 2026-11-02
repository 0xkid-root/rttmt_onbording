"use client";

import React from "react";
import { MapPin, Building } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { AddressDetails } from "../../types";
import { AddressFormFields } from "./step4/AddressFormFields";

export function Step4BusinessAddress() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step4;

  const handleRegisteredAddressChange = (field: keyof AddressDetails, value: string) => {
    updateStepData("step4", {
      registeredAddress: {
        ...data.registeredAddress,
        [field]: value,
      },
    });
  };

  const handleOperatingAddressChange = (field: keyof AddressDetails, value: string) => {
    const current = data.operatingAddress || {
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    };

    updateStepData("step4", {
      operatingAddress: {
        ...current,
        [field]: value,
      },
    });
  };

  const handleSameAddressToggle = (checked: boolean) => {
    if (checked) {
      updateStepData("step4", {
        isOperatingAddressSame: true,
      });
    } else {
      // Check if user has already entered custom information in operating address
      const hasCustomData = Boolean(
        data.operatingAddress &&
          (data.operatingAddress.line1?.trim() ||
            data.operatingAddress.city?.trim() ||
            data.operatingAddress.state?.trim() ||
            data.operatingAddress.postalCode?.trim())
      );

      const nextOperating: AddressDetails =
        hasCustomData && data.operatingAddress
          ? data.operatingAddress
          : {
              line1: data.registeredAddress?.line1 || "",
              line2: data.registeredAddress?.line2 || "",
              landmark: data.registeredAddress?.landmark || "",
              city: data.registeredAddress?.city || "",
              state: data.registeredAddress?.state || "",
              postalCode: data.registeredAddress?.postalCode || "",
              country: data.registeredAddress?.country || "India",
            };

      updateStepData("step4", {
        isOperatingAddressSame: false,
        operatingAddress: nextOperating,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Business Operating & Registered Address
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide your official registered legal office address and operational fulfillment centers.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Registered Address */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <AddressFormFields
            prefix="registeredAddress"
            fieldIdPrefix="reg"
            title="Principal / Registered Office Address"
            icon={Building}
            address={data.registeredAddress}
            onChange={handleRegisteredAddressChange}
            stepErrors={stepErrors}
            line1Placeholder="e.g. Unit 804, Tower B, Peninsula Business Park"
            line2Placeholder="e.g. Senapati Bapat Marg, Lower Parel"
            landmarkPlaceholder="e.g. Near World Trade Centre"
          />
        </div>

        {/* Operating Address Section */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isOperatingAddressSame"
              checked={data.isOperatingAddressSame}
              onCheckedChange={(checked) => handleSameAddressToggle(checked === true)}
            />
            <Label
              htmlFor="isOperatingAddressSame"
              className="text-sm font-semibold text-foreground cursor-pointer"
            >
              Operating / Communication address is the same as the registered office address
            </Label>
          </div>

          {/* Operating Address (Only when different) */}
          {!data.isOperatingAddressSame && (
            <div className="pt-3 border-t border-border">
              <AddressFormFields
                prefix="operatingAddress"
                fieldIdPrefix="op"
                title="Operating / Physical Office Location"
                icon={MapPin}
                address={data.operatingAddress || {
                  line1: "",
                  line2: "",
                  landmark: "",
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "India",
                }}
                onChange={handleOperatingAddressChange}
                stepErrors={stepErrors}
                line1Placeholder="Warehouse, fulfillment floor, or commercial shop address"
                line2Placeholder="Floor, complex, or district"
                landmarkPlaceholder="Nearby landmark"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
