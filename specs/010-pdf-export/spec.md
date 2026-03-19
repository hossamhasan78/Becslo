# Feature Specification: PDF Export

**Feature Branch**: `010-pdf-export`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "Implement professional PDF export for final pricing quotes including user info, service breakdown, and recommended ranges"

## Clarifications

### Session 2026-03-19
- **Q**: Should the PDF be generated on the client or server? → **A**: Server-side (Next.js API route).
- **Q**: How should the export endpoint protect user data? → **A**: Session Cookie (Auth Header check).
- **Q**: Should the PDF include Becslo branding? → **A**: Include Becslo logo / name in the header.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Professional Quote (Priority: P1)

As a freelancer who has just finished calculating a project fee, I want to download a professional PDF document so that I can provide a clear and official price quote to my client.

**Why this priority**: This is the primary output of the application and the core value proposition for professional freelancers.

**Independent Test**: Can be fully tested by completing the wizard and clicking the "Download PDF" button. A PDF file should be received by the browser.

**Acceptance Scenarios**:

1. **Given** I am on the final step of the wizard, **When** I click "Download PDF", **Then** a PDF document downloads automatically naming the calculation.
2. **Given** a generated PDF, **When** I open it, **Then** I see the final price matches the live preview exactly (rounded to the nearest USD).

---

### User Story 2 - Transparent Breakdown for Clients (Priority: P2)

As a freelancer, I want the PDF to include a detailed breakdown of services, hours, and overheads so that my client has full transparency into the project scope and pricing components.

**Why this priority**: Transparency builds trust between the freelancer and client and justifies the quoted price.

**Independent Test**: Can be tested by comparing the PDF table content with the "Service Details" section of the wizard's live preview.

**Acceptance Scenarios**:

1. **Given** a generated PDF, **When** I review the services section, **Then** I see each service name, the hours allocated, the adjusted hourly rate, and the subtotal for that service.
2. **Given** the PDF footer, **When** I look for identification, **Then** I see the Calculation ID and the date the quote was generated.

---

### Edge Cases

- **Large Service Lists**: How does the PDF handle multi-page service breakdowns? (Requirement: Automatic pagination with headers).
- **Special Characters**: How does the system handle non-ASCII characters in user names or service descriptions? (Requirement: Support UTF-8 encoding).
- **Network Timeout**: How does the UI handle a generation failure? (Requirement: Show a user-friendly error message within the wizard and allow retry).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a professional PDF document using a predefined server-side template (API route).
- **FR-002**: PDF MUST include the following Header information:
    - Becslo logo and/or brand name.
    - User's full name and email address (from profile/session).
    - "Project Quote" title.
    - Generation date.
    - Unique Calculation ID.
- **FR-003**: PDF MUST include a "Service Breakdown" section displaying:
    - Service name.
    - Allocated hours.
    - Adjusted hourly rate (after multipliers).
    - Total cost per service.
- **FR-004**: PDF MUST display "Overhead Costs" as a separate line item if selected.
- **FR-005**: PDF MUST display the following Price Summary prominently:
    - Subtotal.
    - Final Price (Subtotal + Risk + Profit).
    - Recommended Range (Min/Max).
- **FR-006**: All currency values in the PDF MUST be formatted in USD and rounded to the nearest dollar.
- **FR-007**: System MUST stream the PDF directly from the server-side API to the user's browser without storage.
- **FR-008**: The "Download PDF" button MUST show a visual loading state while the server generates the document.
- **FR-009**: The export API MUST verify the user's session cookie before generating the document to ensure calculation privacy.

### Key Entities

- **Quote (PDF Document)**: A non-editable document containing the project's financial proposal.
- **Calculation Record**: The source data stored in the database used to hydrate the PDF template.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The PDF document generation and download start should happen in under 5 seconds for a standard calculation (up to 20 services).
- **SC-002**: 100% of generated PDFs must contain the correct Calculation ID matching the database record.
- **SC-003**: All currency amounts in the PDF must match the values displayed in the user interface at the time of export.
- **SC-004**: The PDF must render correctly (legible font and grid alignment) in standard PDF viewers (Chrome, Safari, Adobe Reader).
