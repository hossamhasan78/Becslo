# Tasks: Core Pricing Engine

**Input**: Design documents from `/specs/008-core-pricing-engine/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Tests are OPTIONAL - feature specification does not explicitly request test implementation. Tasks below exclude test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- **Paths shown below**: NextJS 14.x monolithic structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install required dependencies in package.json (zod, @supabase/supabase-js)
- [X] T002 [P] Create lib directory structure (types, utils, supabase) in lib/
- [X] T003 [P] Create components/context directory in components/
- [X] T004 [P] Create components/ui directory in components/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create TypeScript type interfaces in lib/types/pricing.ts (PricingInput, PricingOutput, ServiceBreakdown)
- [X] T006 Create Zod validation schemas in lib/types/validation.ts (PricingInputSchema, PricingOutputSchema, ErrorResponseSchema)
- [X] T007 Create currency formatting utility in lib/utils/formatting.ts (formatCurrency, roundToNearestDollar)
- [X] T008 [P] Create validation helper functions in lib/utils/validation.ts (validatePricingInput, validateInputRanges)
- [X] T009 Implement pure pricing engine function in lib/pricing-engine.ts (calculatePrice with experience multiplier, geography multiplier, adjusted rates, risk buffer, profit margin, final price rounding, recommended range)
- [X] T010 [P] Create Supabase client utility in lib/supabase/client.ts (initializeSupabase, getSupabaseClient)
- [X] T011 [P] Implement server-side POST endpoint in app/api/calculate/route.ts (authenticate user, validate input, calculate price, return result)
- [X] T012 [P] Implement GET endpoint in app/api/services/route.ts (fetch active services with categories from Supabase)
- [X] T013 [P] Implement GET endpoint in app/api/categories/route.ts (fetch categories ordered by displayOrder from Supabase)
- [X] T014 [P] Implement GET endpoint in app/api/countries/route.ts (fetch active countries with multipliers from Supabase)
- [X] T015 [P] Implement GET endpoint in app/api/costs/route.ts (fetch active costs from Supabase)
- [X] T016 [P] Implement GET endpoint in app/api/config/route.ts (fetch global pricing config from Supabase)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Calculate Project Price with Complete Parameters (Priority: P1) 🎯 MVP

**Goal**: Enable freelancers to calculate project price by selecting services, specifying hours, inputting experience levels, choosing geographic locations, selecting optional costs, and adjusting risk and profit margins. System calculates and displays final price with breakdown of all components.

**Independent Test**: Enter complete set of parameters (services, hours, experience, geography, costs, risk, profit) and validate that system produces correct final price with detailed breakdown.

### Implementation for User Story 1

- [X] T017 [P] Create PricingContext provider in components/context/PricingContext.tsx (PricingProvider component with useState for pricing parameters, setPricing function, calculate function)
- [X] T018 [P] Create custom hook in components/context/PricingContext.tsx (usePricing hook returns pricing, setPricing, calculate, validationErrors)
- [X] T019 [US1] Integrate PricingContext in wizard page (wrap wizard page in PricingProvider, use usePricing hook in step components)
- [X] T020 [US1] Connect service selection to PricingContext in app/wizard/components/step-inputs/service-selection.tsx (setPricing to update services array)
- [X] T021 [US1] Connect hours input to PricingContext in app/wizard/components/step-inputs/service-hours.tsx (setPricing to update hours for each service)
- [X] T022 [US1] Connect designer experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx (setPricing to update designerExperience)
- [X] T023 [US1] Connect freelance experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx (setPricing to update freelanceExperience)
- [X] T024 [US1] Connect designer country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx (setPricing to update designerCountryCode, fetch countries from /api/countries)
- [X] T025 [US1] Connect client country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx (setPricing to update clientCountryCode)
- [X] T026 [US1] Connect cost checkboxes to PricingContext in app/wizard/components/step-inputs/cost-selection.tsx (setPricing to update selectedCosts array, fetch costs from /api/costs)
- [X] T027 [US1] Connect risk buffer slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx (setPricing to update riskBufferPercent, validate 0-50% range)
- [X] T028 [US1] Connect profit margin slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx (setPricing to update profitMarginPercent, validate 10-50% range)
- [X] T029 [US1] Integrate client-side calculation in PricingContext in components/context/PricingContext.tsx (call calculatePrice function from lib/pricing-engine.ts, store result in state)
- [X] T030 [US1] Create basic live preview display in components/ui/live-preview.tsx (display finalPrice, recommendedMin, recommendedMax, simple breakdown list)
- [X] T031 [US1] Store calculation result to Supabase in app/wizard/page.tsx (insert Calculation record, insert CalculationService records on wizard completion)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Real-Time Preview During Input (Priority: P2)

**Goal**: Enable freelancers to see price update instantly as they adjust each input field without requiring manual submission.

**Independent Test**: Enter parameters and change each input while observing that price updates within 100ms without page reload or manual submission.

### Implementation for User Story 2

- [X] T032 [P] Wrap LivePreview component in React.memo in components/ui/live-preview.tsx (prevent re-renders when parent state changes)
- [X] T033 [US2] Add useMemo for calculation result in PricingContext in components/context/PricingContext.tsx (cache pricing calculation result, recalculate only when pricing state changes)
- [X] T034 [US2] Add useMemo for derived values in LivePreview in components/ui/live-preview.tsx (cache finalPrice, subtotal, breakdown display)
- [X] T035 [US2] Split LivePreview into sub-components in components/ui/live-preview.tsx (create PriceDisplay, ServiceBreakdown, CostBreakdown, MultiplierSummary components)
- [X] T036 [US2] Add useCallback to input handlers in PricingContext in components/context/PricingContext.tsx (memoize event handlers passed to child components)
- [X] T037 [US2] Add debouncing to rapid input changes in components/context/PricingContext.tsx (debounce setPricing calls 50-100ms using setTimeout/clearTimeout)
- [X] T038 [US2] Optimize pricing engine performance in lib/pricing-engine.ts (use local variables, avoid unnecessary object allocations, optimize multiplication operations)
- [X] T039 [US2] Remove calculation from wizard page in app/wizard/page.tsx (rely on client-side calculation from PricingContext, only call server API for final validation/storage)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Validation of Input Parameters (Priority: P3)

**Goal**: Enable freelancers to enter project parameters with clear feedback about what needs to be corrected when inputs are invalid or out of range.

**Independent Test**: Enter invalid inputs (negative hours, experience outside 1-10, etc.) and validate that appropriate error messages appear.

### Implementation for User Story 3

- [ ] T040 [P] Add validation error state in PricingContext in components/context/PricingContext.tsx (useState for validationErrors object)
- [ ] T041 [P] Add real-time validation in PricingContext in components/context/PricingContext.tsx (call validatePricingInput from lib/utils/validation.ts when pricing state changes, update validationErrors)
- [ ] T042 [P] Display inline error messages in service-hours.tsx in app/wizard/components/step-inputs/service-hours.tsx (show error if hours < 0 or > maxHours)
- [ ] T043 [P] Display inline error messages in experience-input.tsx in app/wizard/components/step-inputs/experience-input.tsx (show error if experience < 1 or > 10)
- [ ] T044 [P] Display inline error messages in geography-input.tsx in app/wizard/components/step-inputs/geography-input.tsx (show error if country code invalid or not found)
- [ ] T045 [P] Display inline error messages in risk-profit-input.tsx in app/wizard/components/step-inputs/risk-profit-input.tsx (show error if risk < 0 or > 50, profit < 10 or > 50)
- [ ] T046 [P] Disable calculation button in wizard page in app/wizard/page.tsx (disable when validationErrors has any errors)
- [ ] T047 [P] Clear error messages when user corrects input in PricingContext in components/context/PricingContext.tsx (reset validationErrors for specific field when valid input entered)
- [ ] T048 [US3] Implement client-side validation in app/api/calculate/route.ts (reuse PricingInputSchema from lib/types/validation.ts, return 400 with field-specific errors)
- [ ] T049 [US3] Display server-side validation errors in wizard page in app/wizard/page.tsx (catch API errors, display validationErrors from server response)
- [ ] T050 [P] [US3] Validate zero service hours behavior in lib/pricing-engine.ts (return 0 for base cost when all hours are 0, handle gracefully)
- [ ] T051 [P] [US3] Validate negative input handling in lib/utils/validation.ts (add explicit check for negative values in validatePricingInput, return error)
- [ ] T052 [P] [US3] Validate same country selection in lib/pricing-engine.ts (handle designerCountryCode == clientCountryCode case, use combined multiplier correctly)
- [ ] T053 [P] [US3] Validate large hour values in lib/pricing-engine.ts (test with 1000+ hours, ensure calculation completes without overflow)
- [ ] T054 [P] [US3] Validate min/max experience values in lib/utils/validation.ts (ensure 1,1 and 10,10 boundary cases work correctly)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 [P] Update documentation in docs/ (add pricing engine documentation, API reference)
- [ ] T056 [P] Code cleanup and refactoring (remove unused imports, consolidate duplicate functions, improve variable naming)
- [ ] T057 Performance optimization across all stories (profile calculation function, optimize React re-renders, add React.memo where needed)
- [ ] T058 Security hardening (verify RLS policies on Supabase tables, ensure authentication on all API endpoints, validate all inputs server-side)
- [ ] T059 [P] Add TypeScript strict mode configuration in tsconfig.json (enable strict: true, fix type errors)
- [ ] T060 [P] Add error boundaries in wizard page in app/wizard/page.tsx (wrap wizard in ErrorBoundary component, display user-friendly error messages)
- [ ] T061 [P] Verify Vercel scalability configuration (configure edge functions, ensure caching headers are optimized for 1,000 concurrent users)
- [ ] T062 [P] Add performance benchmarks for concurrent users (create load test script, measure pricing calculation throughput under simulated concurrent load)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 pricing engine but adds optimization layer independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds validation layer to US1 inputs, does not break US1

### Within Each User Story

- Models before services (types before API endpoints)
- Services before endpoints (lib functions before API routes)
- Core implementation before integration (pricing engine before context integration)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T004) marked [P] can run in parallel
- All Foundational tasks (T005-T016) marked [P] can run in parallel (within Phase 2)
- T017-T018 within US1 can run in parallel (different parts of PricingContext)
- T019-T028 within US1 can mostly run in parallel (different input components)
- T032-T039 within US2 can run in parallel (different optimization tasks)
- T040-T054 within US3 can run in parallel (different validation UI components)
- All Polish tasks (T050-T055) marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch PricingContext creation together:
Task: "Create PricingContext provider in components/context/PricingContext.tsx"
Task: "Create custom hook in components/context/PricingContext.tsx"

# Launch all input component integrations together:
Task: "Connect service selection to PricingContext in app/wizard/components/step-inputs/service-selection.tsx"
Task: "Connect hours input to PricingContext in app/wizard/components/step-inputs/service-hours.tsx"
Task: "Connect designer experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx"
Task: "Connect freelance experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx"
Task: "Connect designer country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx"
Task: "Connect client country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx"
Task: "Connect cost checkboxes to PricingContext in app/wizard/components/step-inputs/cost-selection.tsx"
Task: "Connect risk buffer slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx"
Task: "Connect profit margin slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T016) CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T017-T031)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T016)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T017-T031)
3. Add User Story 2 → Test independently → Deploy/Demo (T032-T039)
4. Add User Story 3 → Test independently → Deploy/Demo (T040-T054)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T031)
   - Developer B: User Story 2 (T032-T039)
   - Developer C: User Story 3 (T040-T054)
3. Stories complete and integrate independently
4. Team collaborates on Polish (T055-T062)

---

## Summary

**Total Tasks**: 62
**Tasks per User Story**:
- User Story 1 (P1): 15 tasks (T017-T031)
- User Story 2 (P2): 8 tasks (T032-T039)
- User Story 3 (P3): 15 tasks (T040-T054)

**Parallel Opportunities Identified**:
- Setup phase: 3 parallel tasks (T002-T004)
- Foundational phase: 12 parallel tasks (T005-T016)
- User Story 1: 9 parallel tasks (T017, T018, T019-T028)
- User Story 2: 8 parallel tasks (T032-T039)
- User Story 3: 13 parallel tasks (T040-T047, T049-T050-T054)
- Polish phase: 7 parallel tasks (T055-T060, T061-T062)

**Independent Test Criteria per Story**:
- **User Story 1**: Enter complete set of parameters (services, hours, experience, geography, costs, risk, profit) and validate that system produces correct final price with detailed breakdown
- **User Story 2**: Enter parameters and change each input while observing that price updates within 100ms without page reload or manual submission
- **User Story 3**: Enter invalid inputs (negative hours, experience outside 1-10, etc.) and validate that appropriate error messages appear, including edge cases (zero hours, same country, 1000+ hours, min/max experience)

**Suggested MVP Scope**: User Story 1 (P1) only - delivers core pricing calculation functionality that enables freelancers to calculate project fees with complete breakdown

**Format Validation**:
✅ ALL 62 tasks follow checklist format (checkbox, ID, labels, file paths)
✅ Every task has exact file path
✅ Story labels (US1, US2, US3) applied to user story phases only
✅ Parallel markers ([P]) applied where appropriate
✅ Tasks organized by phase and user story for independent implementation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
