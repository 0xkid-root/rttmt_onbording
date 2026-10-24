import { IdentityDocumentType, AddressDocumentType } from "../types";

export interface DocumentUploadSlot {
  id: "front" | "back";
  sideBadge: string;
  label: string;
  description: string;
}

export interface KycDocOption<T extends string> {
  value: T;
  label: string;
  description: string;
  acceptedInfo: string;
  slots: DocumentUploadSlot[];
}

export const IDENTITY_DOCUMENT_OPTIONS: KycDocOption<IdentityDocumentType>[] = [
  {
    value: "AADHAAR",
    label: "Aadhaar Card (UIDAI)",
    description: "Front & back of 12-digit Aadhaar Card or masked e-Aadhaar.",
    acceptedInfo: "Aadhaar Card, e-Aadhaar, or UIDAI letter. Masked Aadhaar recommended.",
    slots: [
      {
        id: "front",
        sideBadge: "Front Side",
        label: "Aadhaar Card Front",
        description: "Front side showing clear photo, full legal name, date of birth, and gender.",
      },
      {
        id: "back",
        sideBadge: "Back Side",
        label: "Aadhaar Card Back",
        description: "Back side showing residential address, barcode/QR, and father's/husband's name.",
      },
    ],
  },
  {
    value: "PAN",
    label: "PAN Card",
    description: "Permanent Account Number card issued by the Income Tax Department.",
    acceptedInfo: "Laminated physical PAN card or official e-PAN PDF with QR code.",
    slots: [
      {
        id: "front",
        sideBadge: "Front Side",
        label: "PAN Card Front Image",
        description: "Clear photo showing PAN number, signatory full legal name, father's name, and signature.",
      },
    ],
  },
  {
    value: "PASSPORT",
    label: "Indian Passport",
    description: "Official Indian Republic passport identification and biometric page.",
    acceptedInfo: "Valid Indian Republic passport photo/bio page. Must not be expired.",
    slots: [
      {
        id: "front",
        sideBadge: "Bio / Photo Page",
        label: "Passport Identification Page",
        description: "Page showing photo, passport number, full legal name, nationality, and validity.",
      },
    ],
  },
  {
    value: "VOTER_ID",
    label: "Voter ID Card (EPIC)",
    description: "Election Commission of India Electoral Photo Identity Card.",
    acceptedInfo: "Electoral Photo ID Card (EPIC) or official digital e-EPIC download.",
    slots: [
      {
        id: "front",
        sideBadge: "Front Side",
        label: "Voter ID Front",
        description: "Front side showing clear photo, EPIC number, and signatory legal name.",
      },
      {
        id: "back",
        sideBadge: "Back Side",
        label: "Voter ID Back",
        description: "Back side showing permanent residential address and issuing authority stamp.",
      },
    ],
  },
];

export const ADDRESS_DOCUMENT_OPTIONS: KycDocOption<AddressDocumentType>[] = [
  {
    value: "PASSPORT",
    label: "Indian Passport",
    description: "Address page of valid Indian Passport.",
    acceptedInfo: "Page showing current residential address. Must match signatory details.",
    slots: [
      {
        id: "front",
        sideBadge: "Address Page",
        label: "Passport Address Page",
        description: "Clear scan/photo showing complete residential address and spouse/parent name.",
      },
    ],
  },
  {
    value: "DRIVING_LICENSE",
    label: "Driving Licence",
    description: "State transport department issued driving licence card.",
    acceptedInfo: "Valid laminated smart card or booklet. Must not be expired.",
    slots: [
      {
        id: "front",
        sideBadge: "Front Side",
        label: "Driving Licence Front",
        description: "Front side showing photo, licence number, validity, and bearer name.",
      },
      {
        id: "back",
        sideBadge: "Back Side",
        label: "Driving Licence Back",
        description: "Back side showing complete residential address and vehicle category endorsements.",
      },
    ],
  },
  {
    value: "UTILITY_BILL",
    label: "Utility Bill",
    description: "Electricity, Piped Gas, Water, or Telephone landline bill within 3 months.",
    acceptedInfo: "Electricity, piped gas, water, or broadband bill issued within last 90 days in signatory's name.",
    slots: [
      {
        id: "front",
        sideBadge: "Full Bill",
        label: "Utility Bill Document",
        description: "Complete utility invoice clearly displaying signatory name, full address, and billing date.",
      },
    ],
  },
];
