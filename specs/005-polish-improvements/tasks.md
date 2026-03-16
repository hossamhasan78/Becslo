# Tasks: Phase 5 Polish

**Input**: Design documents from `/specs/005-polish-improvements/`
**Prerequisites**: plan.md, spec.md

**Tests**: Not requested - this is polish/improvement work

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US4)
- Exact file paths included

---

## Phase 1: Setup

**Purpose**: Review existing code structure and identify files to modify

- [ ] T001 Review existing wizard components in src/components/wizard/
- [ ] T002 [P] Review existing admin pages in src/app/admin/
- [ ] T003 [P] Review existing API routes in src/app/api/

---

## Phase 2: Input Validation (US1)

**Goal**: Add form validation to wizard steps with field-level error messages

**Independent Test**: Enter invalid inputs (negative numbers, empty required fields) and verify error messages appear

### Implementation

- [ ] T004 [US1] Add validation utility in src/lib/validation.ts
- [ ] T005 [P] [US1] Add validation to PricingModelStep in src/components/wizard/PricingModelStep.tsx
- [ ] T006 [P] [US1] Add validation to ServiceSelectionStep in src/components/wizard/
- [ ] T007 [US1] Add validation to ExperienceStep (designer/freelance years)
- [ ] T008 [US1] Add validation to GeographyStep (country selection)
- [ ] T009 [US1] Add validation to CostsStep (cost inputs)
- [ ] T010 [US1] Add validation state to WizardContext in src/components/WizardContext.tsx

**Checkpoint**: All wizard steps validate inputs before allowing progression

---

## Phase 3: Error Handling (US2)

**Goal**: Add user-friendly error messages and recovery for API/network failures

**Independent Test**: Simulate network errors and verify user-friendly messages appear

### Implementation

- [ ] T011 [P] [US2] Add error handling wrapper to API calls in src/lib/api-client.ts
- [ ] T012 [P] [US2] Add global error boundary component in src/components/ErrorBoundary.tsx
- [ ] T013 [US2] Add error state to WizardContext for display in LivePreview
- [ ] T014 [US2] Add retry logic (3 attempts) for transient failures
- [ ] T015 [US2] Add session timeout handling with data preservation

**Checkpoint**: All error scenarios show user-friendly messages

---

## Phase 4: Loading States (US3)

**Goal**: Add loading indicators for async operations

**Independent Test**: Trigger async operations and verify loading spinners appear

### Implementation

- [ ] T016 [P] [US3] Create LoadingSpinner component in src/components/ui/LoadingSpinner.tsx
- [ ] T017 [P] [US3] Create SkeletonLoader component in src/components/ui/SkeletonLoader.tsx
- [ ] T018 [US3] Add loading state to WizardContext
- [ ] T019 [US3] Add loading states to wizard step buttons
- [ ] T020 [US3] Add loading states to admin pages

**Checkpoint**: All async operations show loading feedback

---

## Phase 5: Edge Cases (US4)

**Goal**: Handle boundary conditions and unusual scenarios

**Independent Test**: Enter extreme values and verify correct handling

### Implementation

- [ ] T021 [P] [US4] Add input sanitization to prevent XSS in src/lib/sanitize.ts
- [ ] T022 [P] [US4] Add overflow handling for max value calculations
- [ ] T023 [US4] Add decimal rounding for years of experience
- [ ] T024 [US4] Add confirmation dialog for discarding unsaved changes in src/components/ui/ConfirmDialog.tsx

**Checkpoint**: Edge cases handled gracefully without errors

---

## Phase 6: Polish & Integration

**Purpose**: Final integration and testing

- [ ] T025 Run linting: npm run lint
- [ ] T026 Run type checking: npx tsc --noEmit
- [ ] T027 Test validation flow end-to-end
- [ ] T028 Test error handling flow end-to-end
- [ ] T029 Test loading states in all async operations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Input Validation (Phase 2)**: Depends on Setup - Must complete before US2-US4 can integrate
- **Error Handling (Phase 3)**: Can run in parallel with Phase 2
- **Loading States (Phase 4)**: Can run in parallel with Phase 2-3
- **Edge Cases (Phase 5)**: Can run in parallel with Phase 2-4
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Core validation - highest priority
- **US2 (P1)**: Error handling - essential for UX
- **US3 (P2)**: Loading states - enhances UX
- **US4 (P2)**: Edge cases - defensive coding

### Within Each User Story

- Create utilities first (validation, error handling)
- Apply to components
- Integrate with WizardContext
- Test independently

### Parallel Opportunities

- T002-T003 (Setup) can run in parallel
- T005-T006 (US1 validation) can run in parallel
- T011-T012 (US2 error handling) can run in parallel
- T016-T017 (US3 loading components) can run in parallel
- T021-T022 (US4 edge cases) can run in parallel
- All user stories can proceed in parallel after Phase 1

---

## Implementation Strategy

### MVP First (US1 - Input Validation Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Input Validation
3. **STOP and VALIDATE**: Test validation independently

### Incremental Delivery

1. Complete Phase 1: Setup
2. Add Phase 2: Input Validation → Test → Deploy
3. Add Phase 3: Error Handling → Test → Deploy
4. Add Phase 4: Loading States → Test → Deploy
5. Add Phase 5: Edge Cases → Test → Deploy
6. Polish phase for final integration

### Parallel Team Strategy

With multiple developers:

1. Developer A: Setup + Input Validation
2. Developer B: Error Handling
3. Developer C: Loading States + Edge Cases

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story independently testable
- Focus on user experience improvements
- Commit after each logical group
- Stop at any checkpoint to validate
