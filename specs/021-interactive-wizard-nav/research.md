# Research: Interactive In-Wizard Step Navigation

**Branch**: `021-interactive-wizard-nav`
**Date**: 2026-03-28

---

## Finding 1 — StepNavigation already has interactive buttons

**Decision**: No new click-handler infrastructure is needed.

**Rationale**: `src/components/wizard/StepNavigation.tsx` already renders `<button>` elements with `onClick={() => setCurrentStep(step.id)}` and `disabled={!isClickable}`. The component is already structurally interactive.

**Evidence**:
```tsx
// StepNavigation.tsx — current implementation
const isClickable = step.id <= state.highestCompletedStep || step.id <= currentStep

<button
  onClick={() => setCurrentStep(step.id)}
  disabled={!isClickable}
  ...
>
```

**Alternatives considered**: Replacing with `<a>` or adding a new component — rejected, unnecessary.

---

## Finding 2 — highestCompletedStep already tracked in WizardState

**Decision**: No new state fields required.

**Rationale**: `WizardState` already carries `highestCompletedStep: number` (default `0`). `goToNextStep()` in `WizardContext.tsx` updates it via `Math.max(prev.highestCompletedStep, prev.currentStep)` — meaning it monotonically increases and is never reset by back-navigation or editing, satisfying FR-010.

```tsx
// WizardContext.tsx — goToNextStep
setState(prev => ({
  ...prev,
  highestCompletedStep: Math.max(prev.highestCompletedStep, prev.currentStep),
  currentStep: Math.min(prev.currentStep + 1, 6)
}))
```

**Alternatives considered**: Adding a separate `completedSteps: Set<number>` — rejected, existing field is sufficient.

---

## Finding 3 — isCompleted logic bug (the one actual code change)

**Decision**: Fix `isCompleted` in `StepNavigation.tsx` to use `highestCompletedStep`.

**Rationale**: The current definition `isCompleted = step.id < currentStep` only marks steps _before_ the current step as completed. When a user back-navigates (e.g., back to Step 2 after reaching Step 5), steps 3–4 are still within `highestCompletedStep` and should show as green/completed — but they don't with the current logic.

**Current (broken):**
```tsx
const isCompleted = step.id < currentStep
```

**Fixed:**
```tsx
const isCompleted = step.id !== currentStep && step.id <= state.highestCompletedStep
```

This correctly marks any step the user has advanced through as completed, regardless of whether `currentStep` has since been moved back.

**Alternatives considered**: Keeping `step.id < currentStep` and adding a separate "re-completed" state — rejected, overcomplicated for no benefit.

---

## Finding 4 — Keyboard navigation already works via native button semantics

**Decision**: No explicit keyboard event handlers needed for FR-011.

**Rationale**: Native HTML `<button>` elements are:
- Tab-focusable by default
- Activated by Space (native browser behaviour)
- Activated by Enter (standard browser behaviour for buttons)
- Non-interactive when `disabled` (Tab skip + no key activation)

The `disabled` attribute on future-step buttons already satisfies FR-011's requirement that future steps "remain inert to keyboard activation."

**Alternatives considered**: Adding `onKeyDown` handlers — rejected, redundant over native semantics.

---

## Finding 5 — Forward navigation already advances one step (FR-012)

**Decision**: No change to `goToNextStep` needed.

**Rationale**: `goToNextStep` increments `currentStep` by exactly 1 (`Math.min(prev.currentStep + 1, 6)`). When a user back-navigates to Step 2 and presses Next, they advance to Step 3 — not to `highestCompletedStep`. FR-012 is already satisfied.

---

## Finding 6 — setCurrentStep does not guard against skipping

**Decision**: No change needed — the guard lives in `StepNavigation.tsx`.

**Rationale**: `setCurrentStep(step)` in context accepts any number without validation. The guard against forward-skip lives at the call site (`disabled={!isClickable}`). This is correct — `setCurrentStep` is a generic setter; callers are responsible for access control. No change needed.

---

## Summary

| Requirement | Status | Action |
|-------------|--------|--------|
| FR-001 — step list is interactive | Already implemented | None |
| FR-002 — clicking completed step navigates | Already implemented | None |
| FR-003 — clicking future step has no effect | Already implemented (disabled) | None |
| FR-004 — current step highlighted | Already implemented (blue) | None |
| FR-005 — completed steps show completion indicator | Bug in `isCompleted` logic | Fix `StepNavigation.tsx` |
| FR-006 — future steps show locked state | Already implemented (grey + disabled) | None |
| FR-007 — state preserved on back-nav | Already implemented | None |
| FR-008 — consistent with other nav elements | N/A post Change-9 (ProgressBar removed) | None |
| FR-009 — step marked completed on forward nav | Already implemented | None |
| FR-010 — editing earlier step doesn't reset later | Already implemented (Math.max) | None |
| FR-011 — keyboard navigation | Already implemented (native buttons) | None |
| FR-012 — Next always advances one step | Already implemented | None |

**Total code change**: 1 line in `StepNavigation.tsx`.
