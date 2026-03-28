# Tasks: Interactive In-Wizard Step Navigation

**Input**: Design documents from `/specs/021-interactive-wizard-nav/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Implementation note**: Research confirmed this feature is 90% already implemented. The entire code change is one line in one file. Tasks below reflect this reality — Phase 1 and Phase 2 are minimal, and the core implementation sits in Phase 2 as a foundational fix that unblocks correct visual behaviour for all three user stories.

**Tests**: Not explicitly requested in spec. Acceptance test instructions included in Polish phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm working environment before making changes.

**⚠️ SKIP IF**: You are already on branch `021-interactive-wizard-nav` and the dev server runs.

- [x] T001 Confirm active branch is `021-interactive-wizard-nav` (`git branch --show-current`)
- [x] T002 Confirm dev server starts without errors (`npm run dev`)

**Checkpoint**: Branch confirmed, dev server healthy — proceed to implementation.

---

## Phase 2: Foundational (Blocking Prerequisite — The Fix)

**Purpose**: Apply the one-line `isCompleted` fix that restores correct visual state for completed steps on back-navigation. This single change unlocks full acceptance for all three user stories.

**⚠️ CRITICAL**: All three user stories depend on this fix for correct visual feedback.

- [x] T003 In `src/components/wizard/StepNavigation.tsx` line 16, replace the single line `const isCompleted = step.id < currentStep` with `const isCompleted = step.id !== currentStep && step.id <= state.highestCompletedStep` — no other lines change

**Checkpoint**: Foundation fix applied. Run dev server and verify Step 3–4 render green when user has previously reached them and back-navigated to Step 2.

---

## Phase 3: User Story 1 — Navigate Back to a Completed Step (Priority: P1) 🎯 MVP

**Goal**: A user can click any previously completed step in the step list and land there directly, with data intact and subsequent completed steps still shown as green.

**Independent Test**: Complete Steps 1–3 → Click Step 1 in the step list → Verify wizard shows Step 1 with previously entered data → Verify Steps 2–3 appear green (completed) in the step list.

### Implementation for User Story 1

- [x] T004 [US1] Verify acceptance scenario 1 in `src/components/wizard/StepNavigation.tsx`: complete Steps 1–3, click Step 1 — wizard navigates to Step 1, previously entered data displays correctly
- [x] T005 [US1] Verify acceptance scenario 2 in `src/components/wizard/StepNavigation.tsx`: complete Steps 1–4, click Step 2 — wizard navigates to Step 2, all wizard state preserved (services, experience, geography visible)
- [x] T006 [US1] Verify acceptance scenario 3: navigate back to Step 2, change a value, advance forward — updated value flows through to Step 6 Results and Steps 3–6 remain in completed/green state throughout

**Checkpoint**: User Story 1 fully functional — single-click back-navigation to any completed step works with correct visual state.

---

## Phase 4: User Story 2 — Locked Future Steps Cannot Be Skipped (Priority: P2)

**Goal**: Clicking a future (not-yet-reached) step in the step list has no effect — wizard stays on the current step, locked steps remain visually greyed.

**Independent Test**: Fresh wizard load → click Step 3 in the step list → wizard remains on Step 1, Step 3 remains grey and non-interactive.

### Implementation for User Story 2

> **Note**: This user story is already correctly implemented by the existing `disabled={!isClickable}` guard in `StepNavigation.tsx`. Tasks here are verification only. No data-loss warning or confirmation dialog should appear at any point — clicking a completed step must navigate silently with no interruption.

- [ ] T007 [US2] Verify acceptance scenario 1: on fresh load (Step 1, no steps completed), click Step 3 — wizard stays on Step 1 with no navigation change and no warning dialog appears
- [ ] T008 [US2] Verify acceptance scenario 2: complete Steps 1–2 (now on Step 3), click Step 5 — wizard stays on Step 3, Step 5 renders with `cursor-not-allowed` and grey styling, no dialog appears
- [ ] T009 [US2] Verify acceptance scenario 3: complete all steps (now on Step 6), view step list — Steps 1–5 show as completed and clickable, no warning appears when clicking back to any prior step

**Checkpoint**: User Story 2 confirmed — future steps are non-interactive in all tested scenarios.

---

## Phase 5: User Story 3 — Visual Step States Are Clear (Priority: P3)

**Goal**: All three visual states (completed, current, future) are simultaneously visible and distinguishable in the step list at every wizard stage.

**Independent Test**: Complete Steps 1–4, back-navigate to Step 2 via step list — Step 1 green (completed), Step 2 blue (current), Steps 3–4 green (completed), Steps 5–6 grey (future/locked). All visually distinct without explanation.

### Implementation for User Story 3

> **Note**: This user story is satisfied by the T003 fix. Tasks here verify all three states render correctly across representative scenarios.

- [ ] T010 [P] [US3] Verify acceptance scenario 1: user on Step 3 (Steps 1–2 done) — Steps 1–2 show green with checkmark SVG, Step 3 shows blue highlight, Steps 4–6 show grey with `cursor-not-allowed`
- [ ] T011 [P] [US3] Verify acceptance scenario 2: fresh start (Step 1 only) — Step 1 shows blue, Steps 2–6 show grey locked
- [ ] T012 [P] [US3] Verify acceptance scenario 3: all 6 steps completed — Steps 1–5 show green with checkmarks, Step 6 shows blue (current)
- [ ] T013 [US3] Verify key back-navigation scenario: complete Steps 1–5, click Step 2 — Steps 1, 3, 4, 5 all show green (not zinc-100), Step 2 shows blue, Step 6 shows grey

**Checkpoint**: User Story 3 confirmed — all three states visually distinguishable in every tested scenario.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mobile verification, keyboard accessibility confirmation, and spec acceptance sign-off.

- [ ] T014 [P] [US3] Verify mobile viewport (SC-005): open wizard on narrow viewport (375px), step list renders without layout breakage, all three visual states (completed/current/future) are visible and distinguishable
- [ ] T015 [P] Verify keyboard navigation (FR-011 — no code change needed; native `<button>` elements already satisfy this): Tab through step list items, confirm completed steps receive focus outline, confirm Enter/Space activates completed step navigation, confirm future (disabled) steps are skipped by Tab
- [ ] T016 Verify `aria-current="step"` attribute is present on the active step button in `src/components/wizard/StepNavigation.tsx` (already in code — confirm not broken by T003 fix)
- [ ] T017 Run `npm run lint` — confirm zero new lint errors introduced by T003
- [ ] T018 Run `npm test` — confirm existing test suite passes

**Checkpoint**: All user stories accepted, keyboard and mobile verified, linting clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2 — T003)**: Depends on Phase 1 — **BLOCKS all user story acceptance**
- **User Stories (Phases 3–5)**: All depend on T003 completion
  - US1, US2, US3 verification tasks can run in parallel once T003 is applied
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after T003 — no dependency on US2 or US3
- **US2 (P2)**: Can start after T003 — independent of US1 and US3
- **US3 (P3)**: Can start after T003 — independent of US1 and US2 (but the fix IS T003)

### Within Each User Story

- All acceptance verification tasks within a story can run in parallel (marked [P] where applicable)
- No models-before-services ordering needed — this is purely a component fix

---

## Parallel Execution Example: After T003

Once the fix (T003) is applied, all verification tasks across all three stories can run simultaneously:

```
T004 [US1] Verify scenario 1 (back-nav data preserved)
T007 [US2] Verify scenario 1 (future step locked)
T010 [US3] Verify scenario 1 (three states visible)   ← all in parallel
T011 [US3] Verify scenario 2 (fresh start)
T012 [US3] Verify scenario 3 (all complete)
T014 [US3] Verify mobile viewport (SC-005)
T015     Verify keyboard navigation (FR-011)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Apply fix (T003) — **the entire implementation**
3. Complete Phase 3: Verify US1 acceptance (T004–T006)
4. **STOP and VALIDATE**: Test US1 manually
5. Ship — back-navigation is now fully functional with correct visuals

### Incremental Delivery

1. T001–T003 (Setup + Fix) → All user stories unblocked
2. T004–T006 (US1 verification) → Back-nav confirmed ✅
3. T007–T009 (US2 verification) → Forward-lock confirmed ✅
4. T010–T013 (US3 verification) → Visual states confirmed ✅
5. T014–T018 (Polish) → Mobile, keyboard, lint ✅

---

## Notes

- [P] tasks = different verification flows, no dependencies between them
- T003 is the **only code change** in this entire feature
- All other tasks are verification/acceptance steps — no additional code required
- Total implementation effort: ~2 minutes (1 line change); verification effort: ~30 minutes
