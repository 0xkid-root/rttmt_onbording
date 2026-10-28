# RTTMT Merchant Onboarding — Project Source of Truth

## 1. Project Overview

**Product:** RTTMT Merchant Onboarding
**Full form:** Real-Time Transaction Monitoring & Threat Intelligence Platform
**Current phase:** Frontend-first development using mock data
**Primary stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide React.

### Objective

Build a complete, modern, responsive fintech merchant onboarding application. Merchants should be able to create an onboarding application, enter their business details, provide relevant KYC/KYB information, add settlement bank details, complete compliance declarations, review the information, submit the application, and view its status.

This is a standalone onboarding application. It must remain separate from the existing RTTMT dashboard and its features.

### Current scope

- Build the complete frontend with functional interactions.
- Use typed mock data and simulated service responses.
- Implement all onboarding steps, validation, navigation, review, submission, and status.
- Organise code for future backend API integration.
- Do not integrate real banking, OTP, KYC, KYB, payment, or verification services.
- Never present simulated results as real verification or approval.
- Do not change unrelated applications or existing RTTMT dashboard code.

## 2. Technology and Existing Setup

Use the dependencies already installed in the repository:

- Next.js App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod
- `@hookform/resolvers`
- Sonner
- `date-fns` when needed
- TanStack Table only if a genuine tabular interface is needed

**Important:** Inspect the repository and `package.json` before coding. Packages and project configuration have already been set up. Do not initialise another Next.js project, reinstall everything, or create duplicate `app`, `src`, or component directories.

## 3. Required Folder Structure

Use feature-based architecture. Keep route files thin and place onboarding functionality inside `src/features/onboarding/`.

```text
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── (onboarding)/
│       └── onboarding/
│           ├── page.tsx
│           └── status/
│               └── page.tsx
├── components/
│   ├── ui/
│   └── common/
├── features/
│   └── onboarding/
│       ├── components/
│       │   ├── screens/
│       │   │   ├── onboarding-screen.tsx
│       │   │   ├── onboarding-status-screen.tsx
│       │   │   └── login-screen.tsx
│       │   ├── shell/
│       │   │   ├── onboarding-shell.tsx
│       │   │   ├── onboarding-sidebar.tsx
│       │   │   ├── onboarding-header.tsx
│       │   │   ├── onboarding-progress.tsx
│       │   │   └── step-navigation.tsx
│       │   ├── steps/
│       │   │   ├── account-step.tsx
│       │   │   ├── business-profile-step.tsx
│       │   │   ├── company-details-step.tsx
│       │   │   ├── address-step.tsx
│       │   │   ├── kyc-step.tsx
│       │   │   ├── kyb-step.tsx
│       │   │   ├── bank-account-step.tsx
│       │   │   ├── compliance-step.tsx
│       │   │   └── review-step.tsx
│       │   ├── shared/
│       │   │   ├── form-field.tsx
│       │   │   ├── document-upload.tsx
│       │   │   ├── verification-status.tsx
│       │   │   └── section-summary.tsx
│       ├── hooks/
│       │   └── use-onboarding.ts
│       ├── schemas/
│       │   └── onboarding.schema.ts
│       ├── services/
│       │   └── onboarding.service.ts
│       ├── mocks/
│       │   └── onboarding.mock.ts
│       ├── types/
│       │   └── onboarding.types.ts
│       └── utils/
│           └── onboarding.utils.ts
├── lib/
│   └── utils.ts
└── types/
    └── index.ts
```

This is the intended architecture, not a requirement to create empty files. Inspect the current repository and adapt to its existing conventions.

### Folder responsibilities

- `app/`: route entry points, layouts, global CSS and route-level loading/error boundaries.
- `features/onboarding/components/`: onboarding UI and screens.
- `hooks/`: wizard state, navigation, completion and draft coordination.
- `schemas/`: Zod schemas and validation.
- `services/`: typed operations called by hooks and UI.
- `mocks/`: mock records and simulated service responses.
- `types/`: onboarding domain types and service contracts.
- `utils/`: onboarding-specific pure utility functions.
- `components/ui/`: existing shadcn/ui components.
- `components/common/`: genuinely reusable components.
- `lib/`: existing application-wide utilities.

Do not put all application logic in one giant component or scatter mock business logic across UI files.

## 4. Routes

Implement these routes:

| Route                | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `/`                  | Welcome hero landing page                         |
| `/onboarding`        | Complete merchant onboarding wizard               |
| `/onboarding/status` | Simulated application status                      |

The onboarding feature owns the wizard logic. Route files should import the appropriate feature screen instead of containing the entire implementation.

## 5. Complete Onboarding Flow

Implement nine steps in this order.

### Step 1: Account Setup and Contact Verification

Fields:

- Contact person's full name
- Work email
- Email OTP request and entry
- Country calling code
- Mobile number
- Phone OTP request and entry
- Password and confirmation only if credentials are part of the intended account flow
- Terms and privacy consent

Behaviour:

- Validate email and phone formats.
- Provide mock OTP request and verification.
- Display an explicit demo instruction or demo OTP.
- Handle invalid OTP, retry and success states.
- Never send a real email or SMS.

### Step 2: Business Profile

Fields:

- Business or brand name
- Business type
- Industry and subcategory
- Website or app URL
- Business activity description
- Expected monthly transaction volume
- Expected average transaction value
- Customer support email and phone where applicable
- Refund/cancellation policy URL where applicable
- Terms URL where applicable

Behaviour:

- Use appropriate select options.
- Include an Other option when useful.
- Display conditional fields based on business type.
- Validate URLs and required fields.
- Explain unfamiliar fields with concise helper text.

### Step 3: Company and Registration Details

Fields depend on the selected legal entity:

- Legal entity name
- Legal entity type
- Incorporation/registration date where applicable
- PAN or applicable tax identifier
- GSTIN where applicable
- CIN, LLPIN or another applicable registration identifier
- Additional registration information only where relevant

Support entity types such as sole proprietorship, partnership, LLP, private limited company, public limited company and other applicable categories.

Behaviour:

- Apply conditional validation.
- Do not require company registration identifiers from entity types for which they do not apply.
- Explain required, optional and not-applicable fields.
- Do not imply that format validation means government verification.

### Step 4: Registered and Operating Addresses

Registered address:

- Address line 1
- Address line 2, optional
- City
- State/region
- Postal code
- Country

Operating address:

- The same address fields
- Checkbox indicating whether it matches the registered address
- Optional address-proof upload where relevant

Behaviour:

- Synchronise addresses safely when the checkbox is enabled.
- Preserve values when the checkbox is toggled.
- Validate required address fields.
- Show document upload status as simulated.

### Step 5: Individual KYC

Capture information for the relevant proprietor, director, partner, beneficial owner or authorised signatory.

Potential fields, only when required:

- Full legal name
- Role in the business
- Date of birth
- Residential address
- Identity document type
- Identity document reference
- Identity document upload
- Consent or authorisation

Behaviour:

- Collect only information needed for the demonstration.
- Mask identity references in summaries.
- Clearly label uploaded documents as demo uploads.
- Show states such as Not uploaded, Uploaded (demo), Pending (simulated), and Verification simulated.
- Do not claim genuine identity verification.

### Step 6: Business KYB

Represent business verification through conditional document requirements:

- Business registration/incorporation certificate
- PAN or applicable tax document
- Partnership deed or company/LLP documentation
- Authorised signatory authorisation or board resolution
- Beneficial ownership declaration where applicable
- Other relevant supporting documents

Behaviour:

- Show the appropriate document checklist for the selected entity type.
- Distinguish required from optional documents.
- Support demo upload, removal and replacement.
- Display file name, file size, accepted file type and simulated progress.
- Validate file size and file type.
- Keep verification status explicitly simulated.

### Step 7: Settlement Bank Account

Fields:

- Account holder name
- Account number
- Confirm account number
- IFSC
- Account type where needed
- Bank name
- Bank proof upload if applicable

Behaviour:

- Check that account numbers match.
- Validate a plausible IFSC format.
- Mask account numbers in the UI and summaries.
- Provide a clearly labelled Verify bank details (demo) action.
- Simulate success and failure through the service layer.
- Never connect to a real bank or claim genuine bank-account verification.
- Never persist full bank details in browser storage.

### Step 8: Compliance and Declarations

Fields, according to the demo's requirements:

- Business activity declaration
- Restricted/prohibited activity declaration
- Ownership or beneficial-owner declaration where relevant
- Source-of-funds/business-model declaration if needed
- Accuracy of submitted information declaration
- Applicable terms and privacy consent
- Refund/cancellation and support information where relevant

Behaviour:

- Use plain language.
- Do not pre-select consent checkboxes.
- Make required declarations clear.
- Do not present the demo as legal or regulatory approval.

### Step 9: Review and Submit

Display a summary of:

- Account and contact details
- Business profile
- Company details
- Registered and operating addresses
- KYC information
- KYB documents
- Settlement bank
- Compliance declarations

Behaviour:

- Provide an Edit action for every section.
- Navigate back to the relevant step when Edit is selected.
- Highlight incomplete or invalid information.
- Mask identity references and bank account numbers.
- Require the final declaration before submission.
- Prevent duplicate submissions.
- Show a loading state and a recoverable error state.
- Submit through a typed mock service.
- Generate a demo reference such as `RTTMT-DEMO-123456`.
- Clearly label the reference as a demo reference.
- Navigate to the status page after successful submission.

## 6. Application Status

The status screen must explain that this is a simulated application.

Supported demo statuses:

- `DRAFT`
- `ACTION_REQUIRED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`

The normal mock submission should initially result in `UNDER_REVIEW`.

Display:

- Demo application reference
- Current simulated status
- Submission timestamp if available
- Completion checklist
- Mock outstanding actions
- Next steps
- A return-to-onboarding/edit action where appropriate

If someone opens the status page without a submitted application, show a helpful empty state and a link to start onboarding.

Never imply that a real compliance team reviewed or approved the application.

## 7. UI and UX Requirements

Create a professional fintech onboarding experience.

### Layout

Desktop:

- Left navigation/stepper
- Main form area
- Optional contextual guidance where useful

Tablet:

- Compact stepper
- Responsive form widths

Mobile:

- Single-column layout
- Compact progress indicator
- Full-width primary actions where appropriate
- No horizontal overflow

### Design principles

- Reuse the existing design tokens and Tailwind setup.
- Use shadcn/ui and Lucide React consistently.
- Maintain consistent spacing, typography, borders and radii.
- Use calm, trustworthy fintech styling.
- Avoid excessive gradients, unnecessary animations and decorative clutter.
- Do not redesign existing global styling without a clear reason.
- Keep the current step, completed steps and incomplete steps visually distinguishable.
- Use clear button labels such as Previous, Save and continue, Verify (demo), Review application and Submit demo application.
- Show loading, error, success, disabled, empty and retry states where relevant.

### Accessibility

- Use semantic HTML and associated labels.
- Keep visible keyboard focus.
- Ensure readable contrast.
- Make validation messages accessible.
- Do not communicate status using colour alone.
- Support keyboard navigation.
- Respect reduced-motion preferences.

## 8. Forms, Validation and State

Use React Hook Form and Zod.

Requirements:

- Validate each step before allowing the user to continue.
- Preserve form values while navigating between steps.
- Revalidate fields when conditional requirements change.
- Use typed nested domain models.
- Derive the review screen from the current draft state.
- Derive progress and completion from actual form state.
- Keep wizard orchestration in a dedicated hook or controller.
- Avoid unnecessary global state libraries.

### Sensitive-data handling

Never store these in localStorage, sessionStorage, URL parameters, analytics or console logs:

- Passwords
- OTPs
- Full identity-document numbers
- Identity documents
- Full bank account numbers
- Authentication secrets or tokens

Keep sensitive values in memory for the demo. If persistence is introduced, persist only explicitly approved non-sensitive fields. Document the exact fields persisted. Do not save the entire form indiscriminately.

## 9. Mock Services and Future APIs

All business operations must pass through typed service functions. Components must not invent service responses inside JSX or presentation handlers.

Suggested service operations:

```ts
requestDemoEmailOtp(input)
verifyDemoEmailOtp(input)
requestDemoPhoneOtp(input)
verifyDemoPhoneOtp(input)
saveOnboardingDraft(input)
uploadDemoDocument(input)
simulateDocumentVerification(input)
simulateBankVerification(input)
submitDemoApplication(input)
getDemoApplicationStatus(input)
resetDemoApplication()
```

Adapt function names and signatures to the existing codebase.

Mock behaviour must support:

- OTP request, success, invalid OTP and retry
- Draft state
- File upload, removal and replacement
- Simulated document verification
- Simulated bank verification
- Submission loading, success and recoverable failure
- Status retrieval
- Missing application and reset states

Use deterministic demo behaviour wherever possible. Clearly identify all mock responses.

### Future backend integration

When the backend becomes available:

- Replace mock implementations behind the existing service interface.
- Use approved backend DTOs and API contracts.
- Add real server-side validation, authentication, secure document handling and error processing.
- Do not invent endpoint paths, request payloads or backend status codes.
- Do not claim production-grade KYC, KYB or banking functionality before real integrations and security controls have been tested.

## 10. Type Model Guidance

Create appropriate types in `types/onboarding.types.ts`.

Example lifecycle types:

```ts
type OnboardingStatus =
  | "DRAFT"
  | "ACTION_REQUIRED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

type VerificationStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "VERIFIED_DEMO"
  | "FAILED_DEMO"
  | "NOT_APPLICABLE";

type OnboardingStepId =
  | "account"
  | "business-profile"
  | "company-details"
  | "address"
  | "kyc"
  | "kyb"
  | "bank-account"
  | "compliance"
  | "review";
```

Use types for:

- Onboarding draft
- Step completion
- Document metadata
- Verification result
- Application submission request
- Application submission response
- Application status
- Mock service errors

Use discriminated unions when entity-specific requirements benefit from them. Avoid `any`; prefer explicit types and safe narrowing.

## 11. Error and Edge Cases

Handle these cases:

- Continue clicked with invalid fields
- Back/forward navigation without losing entered data
- Entity type changed after entering conditional information
- Operating-address checkbox toggled
- Required document missing
- Unsupported or oversized file
- File removed or replaced
- Invalid OTP and retry
- Incomplete bank details
- Mock verification failure
- Duplicate submission
- Recoverable submission failure
- Status page opened without an application
- Demo reset
- Refresh during onboarding
- Small screens and long validation messages

Every error must have a clear explanation and next action.

## 12. Coding Standards

1. Inspect the repository before editing.
2. Review the current file structure, dependencies, scripts, routes and styles.
3. Reuse existing components and utilities where appropriate.
4. Keep route entry files thin.
5. Keep onboarding code under `src/features/onboarding/`.
6. Use strict TypeScript and avoid `any`.
7. Use Server Components by default and add `"use client"` only where needed.
8. Do not access browser APIs during server rendering.
9. Keep mock logic in services/mocks, not presentation components.
10. Do not add unnecessary dependencies.
11. Do not replace the existing framework or styling configuration.
12. Do not create duplicate application directories.
13. Do not make unrelated changes to the RTTMT dashboard.
14. Never log or persist sensitive information.
15. Keep components focused and reusable without overengineering.

## 13. Definition of Done

- [ ] All nine steps are implemented.
- [ ] Navigation works and preserves the current draft.
- [ ] Required fields are validated.
- [ ] Conditional entity fields work correctly.
- [ ] Address synchronisation works.
- [ ] Demo OTP works with success and failure states.
- [ ] Document uploads validate type and size.
- [ ] Mock document verification is clearly labelled.
- [ ] Mock bank verification is clearly labelled.
- [ ] Consent checkboxes are not preselected.
- [ ] Review data is derived from the actual draft.
- [ ] Sensitive values are masked in summaries.
- [ ] Edit actions return to the correct steps.
- [ ] Submission shows loading, error and success states.
- [ ] A demo reference is generated.
- [ ] The status screen works with and without a submitted application.
- [ ] The UI is responsive and accessible.
- [ ] Mock services are typed and separated from presentation.
- [ ] Sensitive information is not persisted or logged.
- [ ] No unrelated application has been modified.
- [ ] Available lint, typecheck and production build commands have been run.
- [ ] Actual verification results and remaining limitations are reported.

## 14. Instructions for Every AI Coding Agent

Whenever this README is supplied:

1. Inspect the current repository before writing code.
2. Briefly report the existing implementation and missing pieces.
3. Do not reinstall dependencies or initialise a new project.
4. Build the complete functional onboarding flow, not just a static visual.
5. Follow the feature-based folder structure.
6. Reuse the current design system.
7. Keep all verification and submission actions simulated.
8. Protect sensitive information.
9. Do not invent real API contracts.
10. Run available checks and report their actual results.
11. Summarise files changed, features implemented, checks run and known issues.
12. Stay within the standalone merchant-onboarding scope.

## 15. Product Principle

**Make merchant onboarding clear, trustworthy, secure by design, and easy to complete.**

Every step must have a clear purpose. Every required field must be explained. Every error must suggest a next action. Every simulated outcome must be labelled honestly. The architecture must allow real, approved backend services to be integrated later without rebuilding the user experience.
