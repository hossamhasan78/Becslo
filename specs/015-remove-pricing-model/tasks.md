# Tasks: Remove Pricing Model Step

**Input**: Design documents from `/specs/015-remove-pricing-model/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Update the shared type definitions that all other tasks depend on. TypeScript will surface compile errors in downstream files until this is done — complete this first.

**⚠️ CRITICAL**: All Phase 2 and Phase 3 tasks depend on this phase being complete.

- [X] T001 In `src/types/wizard.ts`: (1) Delete the `PricingModel` type export; (2) Remove the `pricingModel: PricingModel | null` field from the `WizardState` interface; (3) Remove `pricingModel: null` from `DEFAULT_WIZARD_STATE`; (4) Replace the 7-entry `WIZARD_STEPS` array with the 6-entry version — remove the `{ id: 1, title: 'Pricing Model', ... }` entry, renumber the remaining entries `id: 1` through `id: 6`, and rename Step 6 title from `'Review'` to `'Results'` (canonical name used throughout spec and plan)

**Checkpoint**: `src/types/wizard.ts` compiles cleanly. `WIZARD_STEPS.length === 6`. No `pricingModel` field in `WizardState`.

---

## Phase 2: User Story 1 — Wizard Opens Directly at Service Selection (Priority: P1) 🎯 MVP

**Goal**: The wizard opens at Service Selection (new Step 1). The Pricing Model screen is gone. No Back button exists on Step 1.

**Independent Test**: Log in, open the wizard. The first screen is Service Selection. Inspect the step list — 6 steps, none labelled 'Pricing Model'. Step 1 has no Back button.

### Implementation for User Story 1

- [X] T002 [P] [US1] In `src/lib/context/WizardContext.tsx`: (1) Remove `PricingModel` from the import from `@/types/wizard`; (2) Remove `setPricingModel` from the `WizardContextValue` interface, from the implementation body (`const setPricingModel = ...`), and from the `contextValue` useMemo object; (3) In the `useMemo` `pricingInput` object, change `pricingModel: state.pricingModel || 'hourly'` → `pricingModel: 'project'`; (4) In `calculateAndSave`, make the same change at its `pricingInput` object; (5) In `goToNextStep`, change `Math.min(prev.currentStep + 1, 7)` → `Math.min(prev.currentStep + 1, 6)`

- [X] T003 [P] [US1] In `src/app/(wizard)/wizard/page.tsx`: (1) Remove `import { PricingModelStep } from '@/components/wizard/steps/PricingModelStep'`; (2) In `renderStep()`, delete `case 1: return <PricingModelStep />` and renumber remaining cases: `2→1, 3→2, 4→3, 5→4, 6→5, 7→6`; (3) Change `default: return <PricingModelStep />` → `default: return <ServiceSelectionStep />`; (4) Change `state.currentStep < 7` → `state.currentStep < 6` in the Next button JSX; (5) Change `state.currentStep === 7` → `state.currentStep === 6` in the PDF button JSX; (6) Change `state.currentStep < 7` → `state.currentStep < 6` in the `handleKeyDown` keyboard shortcut; (7) Update the Back button to not render (not merely disable) on Step 1 — change `<button disabled={state.currentStep <= 1} onClick={goToPreviousStep}>Back</button>` (or equivalent) to `{state.currentStep > 1 && <button onClick={goToPreviousStep}>Back</button>}` so the button is absent from the DOM on Step 1

- [X] T004 [US1] Delete the file `src/components/wizard/steps/PricingModelStep.tsx` — confirm T003 is complete first (import removed) before deleting to avoid broken import errors

**Checkpoint**: Wizard loads at Service Selection. No Pricing Model screen exists. Clicking Next from Step 1 goes to Step 2 (Experience). Step 6 shows the PDF download button. Back button is disabled on Step 1.

---

## Phase 3: User Story 2 — Step Numbering Accurate Throughout (Priority: P2)

**Goal**: All step indicators, progress labels, and validation logic consistently reflect 6 steps with correct step numbers.

**Independent Test**: Navigate through all 6 steps. At each step, the progress bar, step count label ("Step X of 6"), and step list all show the correct position. Step validation fires at the correct step numbers.

> **Note**: Phase 3 tasks touch different files from Phase 2. T005 and T006 can begin as soon as T001 is complete — they do not need to wait for T002, T003, or T004.

### Implementation for User Story 2

- [X] T005 [P] [US2] In `src/lib/validation/step-validators.ts`: Delete `case 1` (the `pricingModel` validation block including its `break`); renumber all remaining cases: `case 2` → `case 1`, `case 3` → `case 2`, `case 4` → `case 3`, `case 5` → `case 4`, `case 6` → `case 5`, `case 7` → `case 6` (see `data-model.md` Step Validation Map for the full before/after)

- [X] T006 [P] [US2] In `src/components/wizard/ProgressBar.tsx`: Change the default prop value `totalSteps = 7` → `totalSteps = 6`; update `aria-valuemax={totalSteps}` reference if hardcoded anywhere (it is already using the prop, so only the default needs to change)

**Checkpoint**: Progress bar shows "Step 1 of 6" on first step and "Step 6 of 6" on the Review step. The step dot row renders 6 dots. Validation error "Please select a pricing model" no longer appears.

---

## Phase 4: User Story 3 — All Calculations Use Project-Based Pricing (Priority: P3)

**Goal**: Every calculation produced by the wizard uses `pricingModel: 'project'`. No user input influences the pricing model.

**Independent Test**: Complete the full 6-step wizard. In Supabase, inspect the resulting `calculations` row — `pricing_model` column must equal `'project'`. The final price matches what project-based pricing previously produced.

> **Note**: US3 implementation is fully covered by T002 (WizardContext). Both `pricingInput` call sites in WizardContext already hardcode `'project'` after T002. No additional tasks are required for this story.

**US3 is delivered by**: T002 (items 3 and 4 in that task description)

**Checkpoint**: Run the wizard end-to-end. Open the Supabase table viewer for `calculations`. The most recent row has `pricing_model = 'project'`.

---

## Phase 5: Polish & Verification

**Purpose**: Cross-cutting validation confirming all three stories work together without regressions.

- [X] T007 Run TypeScript type-check from the repo root (`npx tsc --noEmit`) and resolve any type errors — common sources: remaining `pricingModel` reference in a component, forgotten `setPricingModel` call, or unmatched step number in a switch; also verify step transition render performance in browser DevTools (Performance tab) — each step change should complete within the plan's 100ms render budget

- [X] T008 Execute the manual test checklist from `specs/015-remove-pricing-model/quickstart.md` — confirm all 8 items pass: wizard opens at Service Selection; step list shows 6 steps; "Step 1 of 6" label on first step; no Back button on Step 1; Back works on Steps 2–6; Step 6 shows PDF button; calculation saves with `pricing_model = 'project'`; TypeScript build is clean; also verify the final quoted price shown on Step 6 matches the expected project-based calculation output (run one known input through the wizard and confirm the numerical result is correct)

---

## Dependencies & Execution Order

### Phase Dependencies

```
T001 (wizard.ts types)
  ├── T002 [P] (WizardContext)  ─── T004 (delete PricingModelStep)
  ├── T003 [P] (page.tsx)       ───┘
  ├── T005 [P] (step-validators)
  └── T006 [P] (ProgressBar)
        └── all complete → T007 (tsc) → T008 (manual test)
```

- **T001**: No dependencies — start here
- **T002, T003, T005, T006**: All depend on T001 only — can all run in parallel
- **T004**: Depends on T003 (import must be removed before file is deleted)
- **T007**: Depends on T002, T003, T004, T005, T006
- **T008**: Depends on T007

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 1 (T001) — no dependency on US2 or US3
- **US2 (P2)**: Depends on Phase 1 (T001) — no dependency on US1 or US3; can run in parallel with US1
- **US3 (P3)**: Fully covered by T002 — no independent tasks; delivered with US1

### Parallel Opportunities

After T001 completes, all four of T002, T003, T005, T006 can run simultaneously — each touches a different file.

---

## Parallel Execution Example

```bash
# After T001 is complete, launch all four in parallel:

Task A: "Update WizardContext — hardcode 'project', remove setPricingModel, update step ceiling"
  File: src/lib/context/WizardContext.tsx

Task B: "Update wizard page — remove PricingModelStep, renumber renderStep, fix step-count guards"
  File: src/app/(wizard)/wizard/page.tsx

Task C: "Update step-validators — delete case 1, renumber cases 2-7 to 1-6"
  File: src/lib/validation/step-validators.ts

Task D: "Update ProgressBar — change totalSteps default from 7 to 6"
  File: src/components/wizard/ProgressBar.tsx

# Then, once Task B is confirmed complete:
Task E: "Delete PricingModelStep.tsx"
  File: src/components/wizard/steps/PricingModelStep.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001
2. Complete T002 + T003 (in parallel)
3. Complete T004
4. **STOP and VALIDATE**: Wizard opens at Service Selection. No Pricing Model screen. No Back on Step 1.
5. Ship US1 if validated — US2 and US3 polish can follow immediately after

### Incremental Delivery

1. T001 → Foundation ready
2. T002 + T003 + T004 → US1 complete (wizard entry point fixed) → validate
3. T005 + T006 → US2 complete (step numbers consistent) → validate
4. T007 + T008 → full verification → ready to merge

### Suggested MVP Scope

US1 (P1) is the minimum shippable increment. The wizard entry point and Back button fix are the highest-visibility changes. US2 (numbering consistency) and US3 (pricing model in DB) complete the feature but do not block the P1 outcome from being validated.

---

## Notes

- [P] tasks = different files, can be assigned to separate developers or run in parallel agents
- T004 is the only task with an intra-phase dependency (must follow T003)
- US3 has no standalone tasks — it is fully delivered within T002
- After T001, no task modifies `src/types/wizard.ts` again — it is the single source of truth for step structure
- Commit order suggestion: T001 → (T002 + T003 + T005 + T006 together) → T004 → T007 → T008
