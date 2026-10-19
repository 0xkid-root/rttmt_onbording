import { BusinessEntityType, StepConfig } from "../types";

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "step1",
    stepNumber: 1,
    title: "Account Verification",
    shortTitle: "Account",
    description: "Verify your email, phone, and secure your credentials",
  },
  {
    id: "step2",
    stepNumber: 2,
    title: "Business Profile",
    shortTitle: "Profile",
    description: "Brand name, industry categorization, and transaction metrics",
  },
  {
    id: "step3",
    stepNumber: 3,
    title: "Company Details",
    shortTitle: "Company",
    description: "Legal entity classification, PAN, GSTIN, and corporate IDs",
  },
  {
    id: "step4",
    stepNumber: 4,
    title: "Business Address",
    shortTitle: "Address",
    description: "Registered office and operating communication locations",
  },
  {
    id: "step5",
    stepNumber: 5,
    title: "KYC Verification",
    shortTitle: "KYC",
    description: "Identity verification for authorized signatory or director",
  },
  {
    id: "step6",
    stepNumber: 6,
    title: "KYB Documents",
    shortTitle: "KYB",
    description: "Entity incorporation records and beneficial ownership",
  },
  {
    id: "step7",
    stepNumber: 7,
    title: "Settlement Account",
    shortTitle: "Bank Account",
    description: "Bank account details for daily automated settlements",
  },
  {
    id: "step8",
    stepNumber: 8,
    title: "Compliance & Policies",
    shortTitle: "Compliance",
    description: "Statutory declarations, policies, and regulatory consent",
  },
  {
    id: "step9",
    stepNumber: 9,
    title: "Review & Submit",
    shortTitle: "Review",
    description: "Review all submitted information and finalize application",
  },
];

export interface EntityTypeOption {
  value: BusinessEntityType;
  label: string;
  description: string;
  cinLabel?: string;
  requiredKybDocs: string[];
}

export const ENTITY_TYPE_OPTIONS: EntityTypeOption[] = [
  {
    value: "PRIVATE_LIMITED",
    label: "Private Limited Company (Pvt Ltd)",
    description: "Registered under Companies Act with MCA; 2 or more directors",
    cinLabel: "CIN (Corporate Identity Number)",
    requiredKybDocs: [
      "Certificate of Incorporation (COI)",
      "Memorandum & Articles of Association (MOA / AOA)",
      "Board Resolution for Authorized Signatory",
      "Company PAN Card",
    ],
  },
  {
    value: "PUBLIC_LIMITED",
    label: "Public Limited Company",
    description: "Publicly listed or unlisted corporation registered with MCA",
    cinLabel: "CIN (Corporate Identity Number)",
    requiredKybDocs: [
      "Certificate of Incorporation (COI)",
      "Commencement of Business Certificate",
      "Board Resolution with list of Directors",
      "Company PAN Card",
    ],
  },
  {
    value: "LLP",
    label: "Limited Liability Partnership (LLP)",
    description: "Partnership registered under LLP Act with limited liability",
    cinLabel: "LLPIN (LLP Identification Number)",
    requiredKybDocs: [
      "LLP Agreement (Registered)",
      "Certificate of Incorporation",
      "Partners Authorization Resolution",
      "LLP PAN Card",
    ],
  },
  {
    value: "SOLE_PROPRIETORSHIP",
    label: "Sole Proprietorship",
    description: "Single individual owned business with registration / trade certificate",
    cinLabel: "Registration / License Number",
    requiredKybDocs: [
      "Shop & Establishment Certificate or Udyam MSME Registration",
      "GST Registration Certificate (if applicable)",
      "Proprietor Business Declaration",
    ],
  },
  {
    value: "PARTNERSHIP",
    label: "Partnership Firm",
    description: "Traditional partnership created via registered Partnership Deed",
    cinLabel: "RoF Registration Number",
    requiredKybDocs: [
      "Registered Partnership Deed",
      "Registration Certificate (Registrar of Firms)",
      "Partnership Authority Letter",
      "Firm PAN Card",
    ],
  },
  {
    value: "TRUST_NGO",
    label: "Trust / Society / Section 8 NGO",
    description: "Non-profit or registered trust established for public benefit",
    cinLabel: "Trust / Society Reg. Number",
    requiredKybDocs: [
      "Trust Deed / Society Registration Certificate",
      "12A / 80G Registration (if applicable)",
      "Trustees Resolution",
      "Entity PAN Card",
    ],
  },
];

export const BUSINESS_CATEGORIES: {
  category: string;
  subcategories: string[];
}[] = [
  {
    category: "Software & Technology (SaaS)",
    subcategories: [
      "Enterprise SaaS Solutions",
      "Cloud Infrastructure & Hosting",
      "Developer Tools & APIs",
      "Consumer Web & Mobile Apps",
      "IT Consulting & Managed Services",
    ],
  },
  {
    category: "E-Commerce & Digital Retail",
    subcategories: [
      "Apparel & Fashion Retail",
      "Electronics & Appliances",
      "Consumer Packaged Goods (FMCG)",
      "Books, Media & Stationery",
      "D2C Specialist Brands",
    ],
  },
  {
    category: "Financial Services & FinTech",
    subcategories: [
      "Payment Intermediaries & Gateways",
      "Lending & Credit Platforms",
      "InsurTech Solutions",
      "WealthTech & Investment Advisors",
      "Financial Analytics & Accounting",
    ],
  },
  {
    category: "Education & EdTech",
    subcategories: [
      "K-12 Online Learning",
      "Higher Education & Professional Upskilling",
      "Test Preparation & Coaching",
      "Vocational Training & Skill Certification",
    ],
  },
  {
    category: "Healthcare & Pharmaceuticals",
    subcategories: [
      "Telemedicine & Digital Consultations",
      "Pharmacy & Medical Supplies",
      "Diagnostics & Lab Test Booking",
      "Health & Wellness Platforms",
    ],
  },
  {
    category: "Logistics, Supply Chain & Transport",
    subcategories: [
      "On-demand Courier & Last-Mile Delivery",
      "Freight Forwarding & Trucking",
      "Fleet Management Platforms",
      "Warehousing & Fulfillment",
    ],
  },
  {
    category: "Hospitality, Travel & Events",
    subcategories: [
      "Hotel & Accommodation Booking",
      "Travel Agency & Tour Operations",
      "Ticketing & Event Management",
      "Food & Dining Reservations",
    ],
  },
];

export const MONTHLY_VOLUME_TIERS = [
  { value: "TIER_1", label: "Under ₹10 Lakhs / month" },
  { value: "TIER_2", label: "₹10 Lakhs – ₹50 Lakhs / month" },
  { value: "TIER_3", label: "₹50 Lakhs – ₹2 Crores / month" },
  { value: "TIER_4", label: "₹2 Crores – ₹10 Crores / month" },
  { value: "TIER_5", label: "Above ₹10 Crores / month (Enterprise)" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export interface MockIfscRecord {
  bankName: string;
  branchName: string;
  city: string;
  state: string;
}

export const MOCK_IFSC_DIRECTORY: Record<string, MockIfscRecord> = {
  HDFC0000001: {
    bankName: "HDFC Bank",
    branchName: "Fort Commercial Branch",
    city: "Mumbai",
    state: "Maharashtra",
  },
  HDFC0001245: {
    bankName: "HDFC Bank",
    branchName: "Koramangala 5th Block",
    city: "Bengaluru",
    state: "Karnataka",
  },
  ICIC0000004: {
    bankName: "ICICI Bank",
    branchName: "Nariman Point Capital",
    city: "Mumbai",
    state: "Maharashtra",
  },
  ICIC0000011: {
    bankName: "ICICI Bank",
    branchName: "Connaught Place",
    city: "New Delhi",
    state: "Delhi",
  },
  SBIN0000691: {
    bankName: "State Bank of India",
    branchName: "Mumbai Main Branch",
    city: "Mumbai",
    state: "Maharashtra",
  },
  UTIB0000005: {
    bankName: "Axis Bank",
    branchName: "MG Road Central",
    city: "Bengaluru",
    state: "Karnataka",
  },
  KKBK0000958: {
    bankName: "Kotak Mahindra Bank",
    branchName: "Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
  },
  YESB0000001: {
    bankName: "Yes Bank",
    branchName: "Worli Corporate",
    city: "Mumbai",
    state: "Maharashtra",
  },
};
