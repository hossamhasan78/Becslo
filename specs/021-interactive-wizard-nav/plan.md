# Implementation Plan: Interactive In-Wizard Step Navigation

**Branch**: `021-interactive-wizard-nav` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-interactive-wizard-nav/spec.md`

---

## Summary

Make the wizard's in-body step list fully interactive per Change 8 of Implementation Plan Addendum v1.1. Research revealed the feature is 90% already implemented. The `StepNavigation` component already has clickable buttons, disabled future-step guards, and keyboard-accessible `<button>` elements. The only code change required is a one-line fix to the `isCompleted` derivation, which currently uses `step.id < currentStep` (breaks on back-navigation) instead of the correct `step.id !== currentStep && step.id <= state.highestCompletedStep`.

---

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, Next.js 14.x (App Router)
**Storage**: N/A — pure in-memory client-side state
**Testing**: Jest / React Testing Library (existing test setup)
**Target Platform**: Web (desktop + mobile browsers)
**Project Type**: Web application — Next.js 14.x monolith
**Performance Goals**: Instant (synchronous state update, no async operations)
**Constraints**: No new dependencies; no server-side changes; no session storage
**Scale/Scope**: 6 fixed wizard steps; single-user in-session state

---

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Check | Result |
|-----------|-------|--------|
| I — Authentication-First | Feature is wizard UI, not auth flow. Auth already functional. | ✅ Pass |
| II — Data Privacy & Analytics | No new data stored; no personal save functionality added. | ✅ Pass |
| III — Monolithic Architecture | No new services, no new dependencies, no microservices. Pure component fix. | ✅ Pass |
| IV — Admin-Configured Pricing | No pricing logic touched. | ✅ Pass |
| V — MVP Incremental Development | Wizard UX polish; fits Change 8 in the addendum roadmap. | ✅ Pass |
| Amendment v1.2 — Single-column layout | No layout changes. StepNavigation already renders within single-column wizard. | ✅ Pass |

**No violations. No complexity justification required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/021-interactive-wizard-nav/
├── plan.md              ← this file
├── spec.md
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (affected files only)

```text
src/
└── components/
    └── wizard/
        └── StepNavigation.tsx   ← single file change (1 line)
```

---

## Phase 0: Research — Complete

See [`research.md`](./research.md) for full findings. Summary:

- All 12 functional requirements (FR-001 through FR-012) mapped against existing code.
- 11 of 12 are already implemented correctly.
- **FR-005** (completed steps show completion indicator on back-navigation) has a logic bug.
- No new state, no new API calls, no new dependencies required.

All NEEDS CLARIFICATION items resolved. Gates pass.

---

## Phase 1: Design

### The Fix

**File**: `src/components/wizard/StepNavigation.tsx`
**Line**: 16

```diff
- const isCompleted = step.id < currentStep
+ const isCompleted = step.id !== currentStep && step.id <= state.highestCompletedStep
```

**Why this works**:

- `state.highestCompletedStep` is set to `Math.max(prev.highestCompletedStep, prev.currentStep)` each time the user advances — it represents every step the user has passed through.
- It never decreases (editing an earlier step does not lower it — FR-010 satisfied by existing code).
- When user back-navigates to Step 2 from Step 5 (`highestCompletedStep = 4`), steps 3 and 4 now correctly evaluate as `isCompleted = true` and render green with a checkmark.
- `step.id !== currentStep` ensures the active step always renders as current (blue), not completed (green), regardless of its position relative to `highestCompletedStep`.

### State derivation after fix

| Scenario | `currentStep` | `highestCompletedStep` | Step 3 renders as |
|----------|--------------|----------------------|-------------------|
| Fresh start, user on Step 1 | 1 | 0 | Locked (future) |
| User completed Step 1, now on Step 2 | 2 | 1 | Locked (future) |
| User on Step 5, all prior done | 5 | 4 | Completed (green) |
| User back-navigated to Step 2 from Step 5 | 2 | 4 | **Completed (green)** ← fixed |

### No other changes required

| Requirement | Implementation | File | Action |
|-------------|---------------|------|--------|
| Clickable buttons | `<button onClick>` already present | StepNavigation.tsx | None |
| Forward-skip locked | `disabled={!isClickable}` already correct | StepNavigation.tsx | None |
| Current step highlighted | `isCurrent ? 'bg-blue-600'` already correct | StepNavigation.tsx | None |
| Future steps locked visual | `'bg-zinc-200 text-zinc-400 cursor-not-allowed'` already correct | StepNavigation.tsx | None |
| Keyboard navigation | Native `<button>` — Tab + Enter + Space built in | StepNavigation.tsx | None |
| State preserved | `setCurrentStep` only updates `currentStep`, rest of state untouched | WizardContext.tsx | None |
| Next advances one step | `goToNextStep` increments by 1 | WizardContext.tsx | None |
| `highestCompletedStep` never decreases | `Math.max` in `goToNextStep` | WizardContext.tsx | None |
| `aria-current="step"` on active step | Already present | StepNavigation.tsx | None |

### Data model

No schema changes. No new entities. See [`data-model.md`](./data-model.md).

### Contracts

None. Feature is entirely internal to the wizard client.

---

## Testing Plan

### Unit test — `StepNavigation.tsx`

The existing test suite should cover (add if missing):

1. **Back-navigation completed state**: Render with `currentStep=2, highestCompletedStep=4`. Assert steps 3 and 4 render with green/completed styling (checkmark SVG present). Assert steps 5 and 6 render as disabled.
2. **Fresh state**: Render with `currentStep=1, highestCompletedStep=0`. Assert only step 1 is active (blue). Assert steps 2–6 are disabled.
3. **All complete**: Render with `currentStep=6, highestCompletedStep=5`. Assert steps 1–5 show checkmarks. Assert step 6 is current (blue).
4. **Click completed step**: Simulate click on step 1 when `currentStep=3, highestCompletedStep=2`. Assert `setCurrentStep(1)` called.
5. **Click future step**: Simulate click on step 4 when `highestCompletedStep=2`. Assert button is disabled and `setCurrentStep` not called.

### Acceptance test

Manual walkthrough against spec acceptance scenarios (User Stories 1, 2, 3) in `spec.md`.
