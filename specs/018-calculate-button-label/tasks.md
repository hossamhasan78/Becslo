# Tasks: Step 5 — Relabel Next Button to 'Calculate'

**Input**: Design documents from `/specs/018-calculate-button-label/`
**Prerequisites**: spec.md ✅, research.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Single user story. No foundational phase needed — no schema changes, no type changes, no new dependencies. One touch point.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1)

---

## Phase 1: User Story 1 — User Sees 'Calculate' on Step 5 (Priority: P1) 🎯

**Goal**: Change the navigation button label from "Next Step" to "Calculate" on Step 5 only. All other steps are unchanged.

**Independent Test**: Navigate the wizard to Step 5 (Risk & Profit). Confirm the button reads "Calculate". Click it and confirm the wizard advances to Step 6 (Results). Navigate to Steps 1–4 and confirm they still show "Next Step".

### Implementation

- [X] T001 [US1] Update `src/app/(wizard)/wizard/page.tsx`: In the navigation button block (lines 189–203, where `state.currentStep < 6`), replace the static "Next Step" label text with a conditional: when `state.currentStep === 5` render "Calculate", otherwise render "Next Step". The button's className, onClick, disabled logic, and the → arrow span are unchanged.

---

## Phase 2: Polish & Verification

- [X] T002 End-to-end verification (quickstart.md checklist): (1) Navigate to Step 5 — confirm button reads "Calculate"; (2) Click it — confirm Step 6 loads with full results; (3) Visit Steps 1–4 — confirm each shows "Next Step"; (4) Confirm Back button on Step 5 is unaffected.

---

## Dependencies & Execution Order

- **T001**: No dependencies — start immediately
- **T002**: Depends on T001 complete

### Total: 2 tasks across 2 phases

---

## Implementation Strategy

### MVP First (US1 only — P1)

1. Complete T001: Single conditional in page.tsx
2. Complete T002: Manual verification per quickstart.md

### Parallel Opportunities

None — T001 and T002 are sequential (verification depends on implementation).
