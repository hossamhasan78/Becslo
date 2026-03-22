# Tasks: Polish & Enhancements

**Input**: Design documents from `/specs/012-polish-and-enhancements/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No explicit test suites requested in specification; focus is on visual and performance polish.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize feature structure in `frontend/src/`
- [X] T002 [P] Install `framer-motion` dependency via npm
- [X] T003 [P] Create UUID utility in `frontend/src/utils/uuid.ts` using native `crypto.randomUUID()`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define `WizardState` type in `frontend/src/types/wizard.ts` including `calculation_id` and `updatedAt`
- [ ] T005 Implement `useWizardPersistence` hook in `frontend/src/hooks/useWizardPersistence.ts` with hydration-safe Local Storage access
- [ ] T006 [P] Create validation utility in `frontend/src/utils/validation.ts` with `validatePositiveNumber` helper
- [ ] T007 [P] Create `WizardStepWrapper` component in `frontend/src/components/Wizard/WizardStepWrapper.tsx` using `framer-motion`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Wizard UX Polish (Priority: P1) 🎯 MVP

**Goal**: Professional wizard journey with clear progress and smooth transitions

**Independent Test**: Navigate through all 7 steps; verify progress bar updates and transitions are animated.

### Implementation for User Story 1

- [ ] T008 [US1] Wrap wizard steps in `WizardStepWrapper` in `frontend/src/components/Wizard/WizardMain.tsx`
- [ ] T009 [US1] Implement `ProgressBar` component in `frontend/src/components/Wizard/ProgressBar.tsx`
- [ ] T010 [US1] Integrate `ProgressBar` into the main wizard layout in `frontend/src/components/Wizard/WizardMain.tsx`
- [ ] T024 [US1] Implement keyboard shortcuts (Enter/Esc) for wizard navigation in `frontend/src/components/Wizard/WizardMain.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Robust Validation & Error Handling (Priority: P1)

**Goal**: Prevent data errors and handle async failures gracefully

**Independent Test**: Enter negative hours and verify error toast; simulate 404/500 API error and verify retry button.

### Implementation for User Story 2

- [ ] T011 [US2] Apply real-time logic to numeric inputs using `validatePositiveNumber` in `frontend/src/components/Wizard/StepInputs.tsx`
- [ ] T012 [US2] Implement `Retry` UI and global loading states for Supabase API requests in `frontend/src/components/Common/AsyncStatus.tsx`
- [ ] T013 [US2] Integrate `AsyncStatus` (loading/retry) into calculation flow in `frontend/src/components/Wizard/WizardMain.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Responsive & Accessible Experience (Priority: P2)

**Goal**: Seamless usage across devices and screen readers

**Independent Test**: Switch to mobile view and verify vertical panel stacking; navigate entire wizard using Tab key only.

### Implementation for User Story 3

- [ ] T014 [US3] Update wizard layout CSS to stack panels vertically on mobile in `frontend/src/styles/wizard.css`
- [ ] T015 [US3] [P] Add ARIA labels to all interactive elements in `frontend/src/components/Wizard/` components
- [ ] T016 [US3] [P] Ensure focus indicators (outline) are visible for keyboard navigation in `frontend/src/styles/globals.css`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: User Story 4 - High Performance Real-time Results (Priority: P2)

**Goal**: Instant feedback <100ms even with large data sets

**Independent Test**: Rapidly change service hours and verify preview updates appear almost instantly without UI lag.

### Implementation for User Story 4

- [ ] T017 [US4] Implement `React.memo` for service category accordions in `frontend/src/components/Wizard/ServiceSelection.tsx`
- [ ] T018 [US4] Optimize state update logic to ensure <100ms calculation re-renders in `frontend/src/context/WizardContext.tsx`

---

## Phase 7: User Story 5 - Professional PDF Refinement (Priority: P3)

**Goal**: High-quality branded quote exports with unique tracking

**Independent Test**: Generate a PDF; verify it contains the `calculation_id` in the footer and matches the brand typography.

### Implementation for User Story 5

- [ ] T019 [US5] Update `React-PDF` component to include footer with UUID and date in `frontend/src/components/PDF/QuoteDocument.tsx`
- [ ] T020 [US5] [P] Pass `calculation_id` from wizard state to the PDF export payload in `frontend/src/api/export-pdf.ts`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [ ] T021 [P] Update feature documentation in `docs/PO-ENHANCEMENT_NOTES.md`
- [ ] T022 Code cleanup and removal of any console logs or dev stubs
- [ ] T023 Run `quickstart.md` validation on the completed feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### Parallel Opportunities

- All tasks marked [P] can run in parallel within their respective phases.
- Once Phase 2 (Foundational) is complete, US1-US5 implementation can theoretically proceed in parallel if team capacity allows.

---

## Parallel Example: Foundational Phase

```bash
# Initialize state and helpers together:
Task: "Define WizardState type in frontend/src/types/wizard.ts"
Task: "Create validation utility in frontend/src/utils/validation.ts"
Task: "Create WizardStepWrapper component in frontend/src/components/Wizard/WizardStepWrapper.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1 & 2 (Setup & Foundational).
2. Complete Phase 3 (US1 - Wizard UX).
3. Complete Phase 4 (US2 - Validation/Error Handling).
4. **STOP and VALIDATE**: Verify the "Happy Path" with progress tracking and persistence.

### Incremental Delivery

1. Foundation ready.
2. US1 added → Smooth path.
3. US2 added → Robust path.
4. US3-US5 added → Fully production-ready polish.
