# Tasks: Wizard Flow & Frontend Integration

**Input**: Design documents from `/specs/009-frontend-wizard-flow/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing types, hooks, and state management to support the full wizard flow.

- [x] T001 Extend `WizardState` interface with `highestCompletedStep`, `isSaved`, and `savedCalculationId` fields in `src/types/wizard.ts`
- [x] T002 Add `pricingModel` field to `PricingInput` interface in `src/lib/types/pricing.ts`
- [x] T003 [P] Create `useSessionStorage` custom hook for wizard state persistence in `src/lib/hooks/useSessionStorage.ts`
- [x] T004 [P] Create per-step validation functions (steps 1-7) in `src/lib/validation/step-validators.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core context provider and pricing engine updates that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Refactor `WizardContext` in `src/lib/context/WizardContext.tsx` to unify wizard state and pricing context — add `highestCompletedStep` tracking, `sessionStorage` sync via `useSessionStorage` hook, `goToNextStep()` / `goToPreviousStep()` actions, `validateStep()` using step-validators, and `resetWizard()` method
- [x] T006 Extend `calculatePrice()` in `src/lib/pricing-engine.ts` to accept a `pricingModel` parameter and produce different output formatting for "hourly" (per-hour rate breakdown) vs "project" (lump-sum fee)
- [x] T007 Update `StepNavigation` component in `src/components/wizard/StepNavigation.tsx` to support free navigation to completed steps (clickable indicators for steps ≤ `highestCompletedStep`), disable future steps, and show step titles/descriptions inline
- [x] T008 Update `WizardLayout` in `src/components/wizard/WizardLayout.tsx` to implement responsive 3/4 + 1/4 layout at ≥768px and stacked layout with mobile preview toggle at <768px
- [x] T009 Update `LivePreview` component in `src/components/wizard/LivePreview.tsx` — build the layout slots for both "hourly" (breakdown table) and "project" (lump-sum fee summary) views, showing recommended range and loading/error skeletons. (Wiring is in T023)

**Checkpoint**: Foundation ready — wizard shell, live preview, and navigation are functional. User story step components can now be built.

---

## Phase 3: User Story 1 — Interactive Wizard Navigation with Live Preview (Priority: P1) 🎯 MVP

**Goal**: Users navigate a 7-step wizard with real-time price updates in the live preview panel, using clickable step indicators for free navigation to completed steps.

**Independent Test**: Log in, open the wizard, walk through steps 1-6 entering valid data, confirm the live preview updates in <100ms on every change, use step indicators to jump back to completed steps, and confirm future steps are disabled.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `PricingModelStep` component in `src/components/wizard/steps/PricingModelStep.tsx` — radio/card selection for "Hourly" vs "Project-based" with clear visual distinction and description for each option
- [x] T011 [P] [US1] Create `ServiceSelectionStep` component in `src/components/wizard/steps/ServiceSelectionStep.tsx` — accordion UI grouped by category (from `GET /api/v1/categories` + `GET /api/v1/services`), each service has a checkbox and a basic number input for hours (enforcement deferred to T019)
- [x] T012 [P] [US1] Create `ExperienceStep` component in `src/components/wizard/steps/ExperienceStep.tsx` — two sliders: Designer Experience (1-10) and Freelance Experience (1-10) with numeric labels and current value display
- [x] T013 [P] [US1] Create `GeographyStep` component in `src/components/wizard/steps/GeographyStep.tsx` — two searchable dropdowns for Designer Country and Client Country (from `GET /api/v1/countries`), showing country name and multiplier
- [x] T014 [P] [US1] Create `CostsStep` component in `src/components/wizard/steps/CostsStep.tsx` — checkbox list of available overhead costs (from `GET /api/v1/costs`) with cost name and default amount displayed; costs are optional (step can be skipped with no selections)
- [x] T015 [P] [US1] Create `RiskProfitStep` component in `src/components/wizard/steps/RiskProfitStep.tsx` — two sliders: Risk Buffer (0-50%) and Profit Margin (10-50%) with percentage labels and current value display; ranges sourced from `GET /api/v1/config`
- [x] T016 [US1] Create `ReviewStep` placeholder component in `src/components/wizard/steps/ReviewStep.tsx` — displays the complete calculation breakdown from the live preview data (services, costs, multipliers, final price, recommended range); includes a "Calculate & Save" button (wired in US3) and PDF download placeholder
- [x] T017 [US1] Integrate all 7 step components into the wizard page at `src/app/(wizard)/page.tsx` — render the active step based on `currentStep` from WizardContext, wire Next/Previous buttons to `goToNextStep()` / `goToPreviousStep()`, and ensure step transitions trigger validation
- [x] T018 [US1] Wire each step component to WizardContext's `updateState()` so every input change triggers `calculatePrice()` recalculation and live preview update; verify updates complete in <100ms by testing with browser DevTools Performance tab

**Checkpoint**: At this point, User Story 1 should be fully functional — all 7 steps render, inputs work, live preview updates in real-time, step navigation allows jumping to completed steps, and state persists through page refreshes via sessionStorage.

---

## Phase 4: User Story 2 — Accurate Data Input for Pricing Modifiers (Priority: P2)

**Goal**: All input components enforce strict validation constraints (experience 1-10, risk 0-50%, profit 10-50%, hours ≥ 1), and the pricing model selection actively changes the calculation logic and output breakdown.

**Independent Test**: Enter out-of-range values in sliders and hours fields — confirm they are all rejected at the input level. Switch pricing model between hourly and project — confirm the live preview and final breakdown display differently.

### Implementation for User Story 2

- [x] T019 [P] [US2] Add real-time inline validation to `ServiceSelectionStep` — enforce hours min=1 at the HTML `<input type="number" min={1}>` level plus client-side guard; show error if a service is selected but hours not yet set
- [x] T020 [P] [US2] Add real-time inline validation to `ExperienceStep` — clamp slider values to 1-10 via HTML `<input type="range" min={1} max={10}>` attributes; show numeric readout and descriptive labels (e.g., "Junior" to "Expert")
- [x] T021 [P] [US2] Add real-time inline validation to `GeographyStep` — mark country dropdowns as required; show validation error if user clicks Next without selecting both countries
- [x] T022 [P] [US2] Add real-time inline validation to `RiskProfitStep` — clamp slider values to Risk 0-50% and Profit 10-50% via HTML range attributes; dynamically pull min/max from config API response
- [x] T023 [US2] Integrate pricing model wiring into `LivePreview` and `ReviewStep` — add conditional logic so that selecting "Hourly" renders the per-service breakdown and "Project-based" renders the single lump-sum fee (using the structure created in T009). Ensure any pricing model change triggers immediate recalculation across all wizard steps.
- [x] T024 [US2] Add "Next" button gating via `validateStep()` — each step's Next button calls the step-specific validator from `step-validators.ts`; if validation fails, display inline errors on the offending fields and prevent step advancement

**Checkpoint**: At this point, all validation constraints are enforced, pricing model correctly changes the calculation, and no invalid data can pass through the wizard.

---

## Phase 5: User Story 3 — Results Review and PDF Generation (Priority: P3)

**Goal**: Users click "Calculate & Save" on the final step to persist their calculation to the database and see the full result. PDF download is a separate optional action.

**Independent Test**: Complete the wizard with valid data, click "Calculate & Save", verify the result is displayed with full breakdown and the calculation appears in the database. Click "Download PDF" and verify file downloads.

### Implementation for User Story 3

- [x] T025 [US3] Create `POST /api/v1/calculate-and-save` API route in `src/app/api/v1/calculate-and-save/route.ts` — validate inputs with Zod schema (including `pricingModel` and hours ≥ 1), run `calculatePrice()` server-side, insert into `calculations` and `calculation_services` tables via Supabase, return `calculationId` + full breakdown; require Supabase Auth JWT
- [x] T026 [US3] Add `calculateAndSave()` async method to WizardContext in `src/lib/context/WizardContext.tsx` — calls `POST /api/v1/calculate-and-save`, handles loading/error states, sets `isSaved=true` and `savedCalculationId` on success, clears sessionStorage after successful save
- [x] T027 [US3] Complete `ReviewStep` component in `src/components/wizard/steps/ReviewStep.tsx` — wire "Calculate & Save" button to `calculateAndSave()`, show loading spinner during save, on success show final result breakdown with `calculationId`, and reveal the "Download PDF" button
- [x] T028 [US3] Add error handling to `ReviewStep` for save failures — display error toast/banner with retry option; maintain wizard state on failure (do not clear sessionStorage)
- [x] T029 [US3] Wire "Download PDF" button in `ReviewStep` to call `POST /api/v1/export-pdf` (Phase 4 endpoint); if not yet implemented, show a disabled button with "Coming Soon" tooltip.

**Checkpoint**: Full wizard flow is complete end-to-end — users can enter data, review, save to database, and optionally download PDF.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UX improvements, accessibility, and refinements that affect multiple user stories.

- [ ] T030 [P] Add keyboard navigation support to all step components — Tab/Shift+Tab between fields, Enter to advance, Escape to go back; add proper `aria-label`, `aria-describedby`, and `role` attributes in all wizard step components
- [ ] T031 [P] Add smooth CSS transitions between wizard steps — fade-in/slide-in animations for step content swap in `src/components/wizard/WizardLayout.tsx`; ensure transitions are < 200ms
- [ ] T032 [P] Add loading skeletons for async data fetches (services, categories, countries, costs, config) — show shimmer placeholders in each step while data loads from Supabase APIs
- [ ] T033 [P] Add network error retry UI — if any API fetch fails (services, countries, costs, config), show an inline "Failed to load. Retry?" message with a retry button instead of crashing; implement in `WizardContext.tsx`
- [ ] T034 Review and verify pricing model switch edge case — when user goes back to Step 1 and changes the pricing model after completing later steps, confirm all intermediate values recalculate immediately and the live preview reflects the new model
- [ ] T035 Run full wizard flow end-to-end manually — test all 7 steps with various inputs, page refresh mid-wizard, step jumping, pricing model switch, Calculate & Save, and PDF download; document any issues found
- [ ] T036 Perform sub-100ms real-time calculation audit — confirm all input changes consistently update result in browser console under <100ms on a standard throttled environment; verify no DOM reload metrics between steps. (SC-001, SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) + User Story 1 (Phase 3) — extends US1 components with validation
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) + User Story 1 (Phase 3) — extends ReviewStep with save/download
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — builds all 7 step components
- **User Story 2 (P2)**: Depends on US1 — adds validation and pricing model logic to existing step components
- **User Story 3 (P3)**: Depends on US1 — adds Calculate & Save API + wiring to ReviewStep

### Within Each User Story

- Step components (T010-T015) can be built in parallel [P]
- ReviewStep (T016) needs other steps to exist (for flow testing)
- Integration (T017-T018) comes last within US1
- Validation tasks (T019-T022) in US2 can run in parallel [P]
- API route (T025) in US3 must come before context wiring (T026)

### Parallel Opportunities

- T003 + T004 can run in parallel (different files)
- T010 through T015 can all run in parallel (separate step components)
- T019 through T022 can all run in parallel (validation additions to separate files)
- T030 through T033 can all run in parallel (separate concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all step components in parallel:
Task: "Create PricingModelStep in src/components/wizard/steps/PricingModelStep.tsx"
Task: "Create ServiceSelectionStep in src/components/wizard/steps/ServiceSelectionStep.tsx"
Task: "Create ExperienceStep in src/components/wizard/steps/ExperienceStep.tsx"
Task: "Create GeographyStep in src/components/wizard/steps/GeographyStep.tsx"
Task: "Create CostsStep in src/components/wizard/steps/CostsStep.tsx"
Task: "Create RiskProfitStep in src/components/wizard/steps/RiskProfitStep.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all validation tasks in parallel:
Task: "Add validation to ServiceSelectionStep"
Task: "Add validation to ExperienceStep"
Task: "Add validation to GeographyStep"
Task: "Add validation to RiskProfitStep"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009)
3. Complete Phase 3: User Story 1 (T010-T018)
4. **STOP and VALIDATE**: Walk through all 7 steps, verify live preview updates
5. Deploy/demo if ready — a functional wizard with real-time pricing

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Full wizard flow works → Deploy/Demo (MVP!)
3. Add User Story 2 → All validation enforced → Deploy/Demo
4. Add User Story 3 → Calculate & Save + PDF → Deploy/Demo (Feature Complete!)
5. Add Polish → Production-ready quality

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Hours input min=1 enforced at HTML input level (not just JS validation)
- sessionStorage key: `becslo_wizard_state`
- All monetary values: USD, rounded to nearest dollar
- Live preview target: <100ms update time
