"use client";

import React, { useState } from "react";
import { UserCheck, ShieldCheck, RefreshCw, Calendar, Mail, Phone, IdCard, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../../hooks/OnboardingContext";
import { DocumentUploadBox } from "../common/DocumentUploadBox";
import { VerificationBadge } from "../common/VerificationBadge";
import { formatPan, formatPhoneNumber } from "../../utils/formatters";
import { simulateKycVerification } from "../../services/verificationService";

export function Step5KYC() {
  const { formData, updateStepData, stepErrors } = useOnboarding();
  const data = formData.step5;
  const entityType = formData.step3.entityType;

  const [isVerifying, setIsVerifying] = useState(false);
  const [kycFeedback, setKycFeedback] = useState<string | null>(null);

  const getSignatoryRoleLabel = () => {
    if (entityType === "SOLE_PROPRIETORSHIP") return "Sole Proprietor";
    if (entityType === "LLP") return "Designated Partner";
    if (["PRIVATE_LIMITED", "PUBLIC_LIMITED"].includes(entityType))
      return "Director / Authorized Signatory";
    if (entityType === "PARTNERSHIP") return "Managing Partner";
    return "Authorized Trustee / Signatory";
  };

  const handleSimulateKyc = async () => {
    if (!data.personalPan || !data.idDocumentNumber) return;

    setIsVerifying(true);
    setKycFeedback(null);
    try {
      const result = await simulateKycVerification(data.personalPan, data.idDocumentNumber);
      if (result.verified) {
        updateStepData("step5", { isKycVerified: true });
        setKycFeedback(result.notes);
      }
    } catch {
      setKycFeedback("KYC simulated check timed out. Please retry.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Authorized Signatory KYC Verification
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Identify and verify the primary representative or {getSignatoryRoleLabel().toLowerCase()} who exercises operational authority.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Details */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <UserCheck className="size-4 text-primary" />
              Signatory Identity & Contact Information
            </h3>
            <VerificationBadge
              status={data.isKycVerified}
              label={data.isKycVerified ? "Signatory Verified" : "Verification Required"}
              size="sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="signatoryName">
                Full Legal Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="signatoryName"
                value={data.signatoryName}
                onChange={(e) => updateStepData("step5", { signatoryName: e.target.value })}
                placeholder="e.g. Aditya Vikram Rao"
              />
              <p className="text-[11px] text-muted-foreground">
                As printed on Aadhaar / PAN card.
              </p>
              {stepErrors["signatoryName"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["signatoryName"]}
                </p>
              )}
            </div>

            {/* Designation / Role */}
            <div className="space-y-1.5">
              <Label htmlFor="designation">
                Designation / Position in Entity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="designation"
                value={data.designation}
                onChange={(e) => updateStepData("step5", { designation: e.target.value })}
                placeholder={`e.g. ${getSignatoryRoleLabel()}`}
              />
              {stepErrors["designation"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["designation"]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">
                Date of Birth (18+ only) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  max="2008-01-01"
                  value={data.dateOfBirth}
                  onChange={(e) => updateStepData("step5", { dateOfBirth: e.target.value })}
                  className="pl-9"
                />
              </div>
              {stepErrors["dateOfBirth"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["dateOfBirth"]}</p>
              )}
            </div>

            {/* Personal PAN */}
            <div className="space-y-1.5">
              <Label htmlFor="personalPan">
                Personal PAN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="personalPan"
                maxLength={10}
                value={data.personalPan}
                onChange={(e) =>
                  updateStepData("step5", {
                    personalPan: formatPan(e.target.value),
                    isKycVerified: false,
                  })
                }
                placeholder="BKNPR4821E"
                className="font-mono text-sm uppercase tracking-wider"
              />
              {stepErrors["personalPan"] && (
                <p className="text-xs font-medium text-destructive">{stepErrors["personalPan"]}</p>
              )}
            </div>

            {/* ID Document Type */}
            <div className="space-y-1.5">
              <Label htmlFor="idDocumentType">
                Identity Document Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.idDocumentType}
                onValueChange={(val) => {
                  if (val) {
                    updateStepData("step5", {
                      idDocumentType: val as "AADHAAR" | "PASSPORT" | "VOTER_ID",
                      isKycVerified: false,
                    });
                  }
                }}
              >
                <SelectTrigger id="idDocumentType" className="w-full">
                  <SelectValue placeholder="Select Document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AADHAAR">Aadhaar Card (UIDAI)</SelectItem>
                  <SelectItem value="PASSPORT">Indian Passport</SelectItem>
                  <SelectItem value="VOTER_ID">Voter ID Card (EPIC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* ID Document Number */}
            <div className="space-y-1.5">
              <Label htmlFor="idDocumentNumber">
                {data.idDocumentType === "AADHAAR"
                  ? "Aadhaar Number (12 digits / masked)"
                  : data.idDocumentType === "PASSPORT"
                  ? "Passport Number"
                  : "Voter ID Number"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="idDocumentNumber"
                  value={data.idDocumentNumber}
                  onChange={(e) =>
                    updateStepData("step5", {
                      idDocumentNumber: e.target.value,
                      isKycVerified: false,
                    })
                  }
                  placeholder={
                    data.idDocumentType === "AADHAAR"
                      ? "XXXX XXXX 9034"
                      : data.idDocumentType === "PASSPORT"
                      ? "L8923412"
                      : "ABC1293841"
                  }
                  className="pl-9 font-mono text-sm"
                />
              </div>
              {stepErrors["idDocumentNumber"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["idDocumentNumber"]}
                </p>
              )}
            </div>

            {/* Signatory Email */}
            <div className="space-y-1.5">
              <Label htmlFor="signatoryEmail">
                Signatory Official Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="signatoryEmail"
                  type="email"
                  value={data.signatoryEmail}
                  onChange={(e) => updateStepData("step5", { signatoryEmail: e.target.value })}
                  placeholder="signatory@company.com"
                  className="pl-9"
                />
              </div>
              {stepErrors["signatoryEmail"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["signatoryEmail"]}
                </p>
              )}
            </div>

            {/* Signatory Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="signatoryPhone">
                Signatory Direct Mobile <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="signatoryPhone"
                  maxLength={10}
                  value={data.signatoryPhone}
                  onChange={(e) =>
                    updateStepData("step5", {
                      signatoryPhone: formatPhoneNumber(e.target.value),
                    })
                  }
                  placeholder="98765 43210"
                  className="pl-9"
                />
              </div>
              {stepErrors["signatoryPhone"] && (
                <p className="text-xs font-medium text-destructive">
                  {stepErrors["signatoryPhone"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Identity Document Uploads */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <IdCard className="size-4 text-primary" />
            Signatory KYC Document Uploads
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload clear, non-blurred copies of your identity and address proof documents for simulated forensic verification.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <DocumentUploadBox
              label="Identity Proof (PAN / Passport / Aadhaar)"
              description="Front page showing photo, name, and document number"
              documentType="SIGNATORY_ID"
              document={data.identityProofDocument}
              onDocumentChange={(doc) => updateStepData("step5", { identityProofDocument: doc })}
            />

            <DocumentUploadBox
              label="Address Proof (Passport / Driving License / Utility)"
              description="Showing signatory current residential address"
              documentType="SIGNATORY_ADDRESS"
              document={data.addressProofDocument}
              onDocumentChange={(doc) => updateStepData("step5", { addressProofDocument: doc })}
            />
          </div>

          {/* Simulated KYC Action */}
          <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {kycFeedback ? (
                <span className="text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  {kycFeedback}
                </span>
              ) : (
                <span>Click to execute real-time automated OCR and NSDL identity check simulation.</span>
              )}
            </div>

            <Button
              type="button"
              variant={data.isKycVerified ? "outline" : "default"}
              size="sm"
              onClick={handleSimulateKyc}
              disabled={isVerifying || !data.personalPan || !data.idDocumentNumber}
              className="shrink-0"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 size-3.5 animate-spin" />
                  Verifying Identity...
                </>
              ) : data.isKycVerified ? (
                <>
                  <ShieldCheck className="mr-2 size-3.5 text-success" />
                  Re-Verify Signatory
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-3.5" />
                  Simulate KYC Verification
                </>
              )}
            </Button>
          </div>

          {stepErrors["isKycVerified"] && !data.isKycVerified && (
            <p className="text-xs font-medium text-destructive">{stepErrors["isKycVerified"]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
