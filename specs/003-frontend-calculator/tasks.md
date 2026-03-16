# Tasks: Frontend - Calculator

**Feature**: Frontend - Calculator  
**Branch**: `003-frontend-calculator`  
**Generated**: 2026-03-16

---

## Phase 1: Setup & Foundation

### Project Initialization

- [ ] T001 Create main calculator page layout in src/app/page.tsx with 3/4 + 1/4 split
- [ ] T002 [P] Create API service hooks (useServices, useConfig, useCountries) in src/hooks/
- [ ] T003 [P] Extend WizardContext to include all wizard state (src/components/WizardContext.tsx)

---

## Phase 2: Wizard Step Components

### Step 1: Pricing Model (US1)

- [ ] T004 [US1] Update PricingModelStep component in src/components/wizard/PricingModelStep.tsx
- [ ] T005 [US1] Implement hourly/fixed selection with state persistence

### Step 2: Services (US2)

- [ ] T006 [US2] Create ServiceSelectionStep component in src/components/wizard/ServiceSelectionStep.tsx
- [ ] T007 [US2] Implement accordion by category for services
- [ ] T008 [US2] Implement hours input with min/max validation

### Step 3: Experience (US3)

- [ ] T009 [US3] Create ExperienceStep component in src/components/wizard/ExperienceStep.tsx
- [ ] T010 [US3] Implement designer and freelance experience selectors

### Step 4: Geography (US4)

- [ ] T011 [US4] Create GeographyStep component in src/components/wizard/GeographyStep.tsx
- [ ] T012 [US4] Implement country dropdowns from API

### Step 5: Costs (US5)

- [ ] T013 [US5] Create CostsStep component in src/components/wizard/CostsStep.tsx
- [ ] T014 [US5] Implement cost input with categories (Software, Subscriptions, Tools, Outsourcing, Travel, Research Incentives, Misc)

### Step 6: Results Preview (US6)

- [ ] T015 [US6] Create ResultsPreviewStep component in src/components/wizard/ResultsPreviewStep.tsx
- [ ] T016 [US6] Implement calculation breakdown display

### Step 7: Export PDF (US7)

- [ ] T017 [US7] Create ExportPdfStep component in src/components/wizard/ExportPdfStep.tsx
- [ ] T018 [US7] Integrate PDF export button with /api/export-pdf

---

## Phase 3: Live Preview Panel

- [ ] T019 [P] Create LivePreview component in src/components/wizard/LivePreview.tsx
- [ ] T020 [P] Implement real-time calculation using pricing-engine.ts
- [ ] T021 [P] Ensure preview updates within 100ms of input change

---

## Phase 4: Integration & Navigation

- [ ] T022 Implement wizard navigation (Next/Back buttons)
- [ ] T023 Connect all steps to WizardContext
- [ ] T024 Implement step validation before proceeding

---

## Phase 5: Polish

- [ ] T025 Add loading states for API calls
- [ ] T026 Add error handling for failed API calls
- [ ] T027 Add input validation feedback
- [ ] T028 Style wizard components with Tailwind CSS

---

## Dependencies

```
T001 (Phase 1) → T002-T003 (Phase 1)
T002-T003 → T004-T018 (Phase 2 - can parallel within)
T004-T018 → T019-T021 (Phase 3)
T019-T021 → T022-T024 (Phase 4)
T022-T024 → T025-T028 (Phase 5)
```

---

## Parallel Execution Opportunities

- T002-T003 can run in parallel
- T004-T018 (all wizard step components) can run in parallel
- T019-T021 (live preview) can run in parallel with wizard steps
- T025-T028 (polish tasks) can run in parallel

---

## Independent Test Criteria

### US1 - Pricing Model Selection
- User can select hourly or fixed
- Selection persists when navigating

### US2 - Service Selection
- Services displayed in accordion by category
- Hours validated within min/max

### US3 - Experience
- Designer and freelance years selectable
- Correct ranges displayed

### US4 - Geography
- Countries loaded from API
- Dropdowns functional

### US5 - Costs
- Costs can be added/removed
- Categories available

### US6 - Live Preview
- Updates within 100ms
- Shows full breakdown

### US7 - PDF Export
- PDF generates successfully
- Downloads automatically

---

## Implementation Strategy

MVP Scope: All tasks in Phases 1-4 are required. Phase 5 polish tasks can be deferred if needed.

The wizard step components need to be implemented in order, but can be tested individually once the foundation (WizardContext) is complete.
