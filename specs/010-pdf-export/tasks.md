# Tasks: PDF Export

**Input**: Design documents from `/specs/010-pdf-export/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `@react-pdf/renderer` dependency in `package.json`
- [x] T002 [P] Create directory structure for PDF generation: `src/app/api/v1/export-pdf/` and `src/components/wizard/pdf/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that MUST be complete before ANY user story can be implemented

- [x] T003 Create base PDF document component `src/components/wizard/pdf/QuoteDocument.tsx` with standard `@react-pdf/renderer` structure
- [x] T004 Define TypeScript interfaces for PDF data hydration in `src/types/pdf.ts` (based on data-model.md)

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Generate Professional Quote (Priority: P1) 🎯 MVP

**Goal**: Enable users to download a professional PDF of their calculation results.

**Independent Test**: Complete the wizard, click "Download PDF", and receive a PDF file that opens correctly and displays the final price.

### Tests for User Story 1

- [x] T005 [P] [US1] Write Vitest logic tests for PDF hydration data mapping in `tests/unit/pdf_logic.test.ts`
- [x] T006 [P] [US1] Write Playwright E2E flow test for the PDF download interaction in `tests/e2e/pdf_export.spec.ts`

### Implementation for User Story 1

- [x] T007 [P] [US1] Create the Next.js Route Handler `src/app/api/v1/export-pdf/route.ts` with basic binary streaming response
- [x] T008 [US1] Implement session-based authentication check in the API route handler `src/app/api/v1/export-pdf/route.ts` (FR-009)
- [x] T009 [US1] Implement server-side calculation hydration from Supabase using the provided ID in `src/app/api/v1/export-pdf/route.ts`
- [x] T010 [US1] Integrate `QuoteDocument.tsx` into the API route to generate the PDF buffer for streaming
- [x] T011 [P] [US1] Add "Download PDF" button and loading state management to `src/app/(wizard)/wizard/page.tsx` (Final Step UI)
- [x] T012 [US1] Implement `handleDownloadPDF` client-side logic in `src/app/(wizard)/wizard/page.tsx` to call the export API and trigger browser download
- [x] T013 [US1] Implement error catching, toast message UI, and retry logic for network timeouts during download in `src/app/(wizard)/wizard/page.tsx` (Edge Case 3)

**Checkpoint**: User Story 1 functional - basic PDF download with final price is available without silent failures.

---

## Phase 4: User Story 2 - Transparent Breakdown for Clients (Priority: P2)

**Goal**: Add detailed service breakdown and professional branding to the PDF.

**Independent Test**: Download the PDF and verify it contains a table of services, hours, rates, and Becslo logo/header.

### Tests for User Story 2

- [x] T014 [P] [US2] Update Vitest logic to test service breakdown and overheads alignment in `tests/unit/pdf_logic.test.ts`

### Implementation for User Story 2

- [x] T015 [P] [US2] Implement the Header section in `QuoteDocument.tsx` with Becslo branding, user info, and Calculation ID (FR-002)
- [x] T016 [US2] Implement the "Service Breakdown" table in `QuoteDocument.tsx` displaying name, hours, rate, and cost (FR-003)
- [x] T017 [US2] Implement "Overhead Costs" and "Price Summary" sections in `QuoteDocument.tsx` (FR-004, FR-005)
- [x] T018 [P] [US2] Add Footer with page pagination and generation date to `QuoteDocument.tsx`

**Checkpoint**: User Story 2 functional - PDF now contains full professional breakdown.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 Ensure USD rounding parity in `QuoteDocument.tsx` to match wizard live preview (FR-006)
- [x] T020 [P] Add UTF-8 font support (Inter) to handle special characters in `QuoteDocument.tsx`
- [x] T021 Final performance audit: ensure generation starts in <5s (SC-001)
- [x] T022 Manual QA: verify the PDF displays core calculation parameters and cross-renders correctly in standard PDF viewers (SC-002, SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on US1 and US2 completion.

### Parallel Opportunities

- T005, T006, T007, T011, T014, T015, T018, T020 can potentially run in parallel after foundational phase because they touch different files/logic blocks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (US1).
3. **STOP and VALIDATE**: Verify a basic PDF can be downloaded.

### Incremental Delivery

1. Foundation ready.
2. US1 adds core functionality (Download) and Error handling.
3. US2 adds professional value (Detail & Branding).
4. Polish adds production quality.
