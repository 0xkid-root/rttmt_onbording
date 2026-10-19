"use client";

import React from "react";
import { MapPin, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { INDIAN_STATES } from "../../mocks/options";
import { formatPostalCode } from "../../utils/formatters";

export function Step4BusinessAddress() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step4;

  const handleRegisteredAddressChange = (field: string, value: string) => {
    updateStepData("step4", {
      registeredAddress: {
        ...data.registeredAddress,
        [field]: value,
      },
    });
  };

  const handleOperatingAddressChange = (field: string, value: string) => {
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
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Principal / Registered Office Address
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            As listed on your GST registration, Certificate of Incorporation, or tax record.
          </p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="regLine1">
                Address Line 1 (Premises / Building / Flat) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="regLine1"
                value={data.registeredAddress.line1}
                onChange={(e) => handleRegisteredAddressChange("line1", e.target.value)}
                placeholder="e.g. Unit 804, Tower B, Peninsula Business Park"
              />
              {stepErrors["registeredAddress.line1"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["registeredAddress.line1"]}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="regLine2">Address Line 2 (Street / Area)</Label>
                <Input
                  id="regLine2"
                  value={data.registeredAddress.line2 || ""}
                  onChange={(e) => handleRegisteredAddressChange("line2", e.target.value)}
                  placeholder="e.g. Senapati Bapat Marg, Lower Parel"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regLandmark">Landmark (Optional)</Label>
                <Input
                  id="regLandmark"
                  value={data.registeredAddress.landmark || ""}
                  onChange={(e) => handleRegisteredAddressChange("landmark", e.target.value)}
                  placeholder="e.g. Near World Trade Centre"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="regCity">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="regCity"
                  value={data.registeredAddress.city}
                  onChange={(e) => handleRegisteredAddressChange("city", e.target.value)}
                  placeholder="e.g. Mumbai"
                />
                {stepErrors["registeredAddress.city"] && (
                  <p className="text-xs font-medium text-destructive">
                    {stepErrors["registeredAddress.city"]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regState">
                  State / Union Territory <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.registeredAddress.state}
                  onValueChange={(val) => handleRegisteredAddressChange("state", val || "")}
                >
                  <SelectTrigger id="regState" className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {INDIAN_STATES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {stepErrors["registeredAddress.state"] && (
                  <p className="text-xs font-medium text-destructive">
                    {stepErrors["registeredAddress.state"]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regPostalCode">
                  PIN Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="regPostalCode"
                  maxLength={6}
                  value={data.registeredAddress.postalCode}
                  onChange={(e) =>
                    handleRegisteredAddressChange("postalCode", formatPostalCode(e.target.value))
                  }
                  placeholder="e.g. 400013"
                />
                {stepErrors["registeredAddress.postalCode"] && (
                  <p className="text-xs font-medium text-destructive">
                    {stepErrors["registeredAddress.postalCode"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Address Checkbox */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isOperatingAddressSame"
              checked={data.isOperatingAddressSame}
              onCheckedChange={(checked) =>
                updateStepData("step4", {
                  isOperatingAddressSame: checked === true,
                  operatingAddress:
                    checked === true ? undefined : data.operatingAddress || data.registeredAddress,
                })
              }
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
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Operating / Physical Office Location
                </h4>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="opLine1">
                  Operating Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="opLine1"
                  value={data.operatingAddress?.line1 || ""}
                  onChange={(e) => handleOperatingAddressChange("line1", e.target.value)}
                  placeholder="Warehouse, fulfillment floor, or commercial shop address"
                />
                {stepErrors["operatingAddress.line1"] && (
                  <p className="text-xs font-medium text-destructive">
                    {stepErrors["operatingAddress.line1"]}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="opLine2">Operating Line 2</Label>
                  <Input
                    id="opLine2"
                    value={data.operatingAddress?.line2 || ""}
                    onChange={(e) => handleOperatingAddressChange("line2", e.target.value)}
                    placeholder="Floor, complex, or district"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opLandmark">Operating Landmark</Label>
                  <Input
                    id="opLandmark"
                    value={data.operatingAddress?.landmark || ""}
                    onChange={(e) => handleOperatingAddressChange("landmark", e.target.value)}
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="opCity">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="opCity"
                    value={data.operatingAddress?.city || ""}
                    onChange={(e) => handleOperatingAddressChange("city", e.target.value)}
                    placeholder="City"
                  />
                  {stepErrors["operatingAddress.city"] && (
                    <p className="text-xs font-medium text-destructive">
                      {stepErrors["operatingAddress.city"]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opState">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.operatingAddress?.state || ""}
                    onValueChange={(val) => handleOperatingAddressChange("state", val || "")}
                  >
                    <SelectTrigger id="opState" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {INDIAN_STATES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {stepErrors["operatingAddress.state"] && (
                    <p className="text-xs font-medium text-destructive">
                      {stepErrors["operatingAddress.state"]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opPostalCode">
                    PIN Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="opPostalCode"
                    maxLength={6}
                    value={data.operatingAddress?.postalCode || ""}
                    onChange={(e) =>
                      handleOperatingAddressChange(
                        "postalCode",
                        formatPostalCode(e.target.value)
                      )
                    }
                    placeholder="6-digit PIN code"
                  />
                  {stepErrors["operatingAddress.postalCode"] && (
                    <p className="text-xs font-medium text-destructive">
                      {stepErrors["operatingAddress.postalCode"]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
