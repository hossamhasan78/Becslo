# Research: Remove Pricing Model Step

**Branch**: `015-remove-pricing-model`
**Date**: 2026-03-25
**Status**: Complete — no unknowns remain

---

## Summary

No external research was required. All decisions are grounded in the existing codebase. The sections below document findings from reading the source files and the design choices that follow.

---

## Finding 1 — The Pricing Model Field Exists in Four Places

After reading the codebase, `pricingModel` touches exactly these locations:

| File | Current Role | Change Required |
|------|-------------|-----------------|
| `src/types/wizard.ts` | `pricingModel: PricingModel \| null` field in `WizardState`; `PricingModel = 'hourly' \| 'project'` type; Step 1 in `WIZARD_STEPS` | Remove field from state; delete Step 1 entry; shrink array to 6 |
| `src/lib/context/WizardContext.tsx` | Reads `state.pricingModel \|\| 'hourly'` when building `PricingInput`; exposes `setPricingModel` setter | Replace with hardcoded `'project'`; remove setter |
| `src/lib/validation/step-validators.ts` | `case 1` validates `pricingModel` is not null | Delete `case 1`; renumber `case 2` through `case 7` to `case 1` through `case 6` |
| `src/app/(wizard)/wizard/page.tsx` | `case 1` renders `<PricingModelStep />`; hardcoded `7` in step-count comparisons | Remove case + import; change `7` to `6` in three places |

**Decision**: All four files must be updated atomically in the same PR. The `PricingModelStep.tsx` component file is deleted.

**Rationale**: Partial updates leave the wizard in a broken state — e.g., updating `WIZARD_STEPS` without updating `step-validators.ts` causes step 1 validation to pass immediately (no case match → no errors) but step numbering is misaligned.

---

## Finding 2 — `PricingInput.pricingModel` in the Engine Type Must Be Kept

- **File**: `src/lib/types/pricing.ts`
- `PricingInput` declares `pricingModel: 'hourly' | 'project'`
- The engine (`src/lib/pricing-engine.ts`) and the `/api/v1/calculate-and-save` endpoint both consume this type

**Decision**: Do **not** remove `pricingModel` from `PricingInput`. Keep the field in the engine type, but always pass `'project'` from `WizardContext`. This is a one-line change in two call sites in `WizardContext.tsx`.

**Rationale**: Removing `pricingModel` from `PricingInput` would require updating the API route, the pricing engine, and any tests that reference `PricingInput`. The engine already works correctly with `'project'` — there is no benefit to touching it. Keeping the field also preserves forward-compatibility if the engine ever supports model-specific logic again.

**Alternatives considered**:
- Remove `pricingModel` from `PricingInput` entirely — rejected: unnecessary scope expansion, touches API routes and engine
- Add a type alias `type PricingModelConstant = 'project'` — rejected: over-engineering for a one-line fix

---

## Finding 3 — `ProgressBar` Has a Hardcoded Default of 7

- **File**: `src/components/wizard/ProgressBar.tsx`
- `totalSteps = 7` is the default prop value
- `WIZARD_STEPS` from `@/types/wizard` is iterated to render step buttons

**Decision**: Change the default prop to `totalSteps = 6`. The `WIZARD_STEPS` array update (Finding 1) automatically fixes the rendered buttons since `ProgressBar` maps over the array. The only manual change needed is the default prop value and the two places it computes `progress` and aria labels.

**Rationale**: The component is data-driven from `WIZARD_STEPS` for the step dots, so the array update handles most of it. Only the `totalSteps` default and the `aria-valuemax` / "Step X of Y" label are hardcoded.

---

## Finding 4 — `StepNavigation` Is Fully Data-Driven

- **File**: `src/components/wizard/StepNavigation.tsx`
- Maps directly over `WIZARD_STEPS` — no hardcoded step counts
- Title/description displayed as `WIZARD_STEPS[currentStep - 1]`

**Decision**: No change needed to `StepNavigation.tsx` beyond the `WIZARD_STEPS` update in `wizard.ts`.

**Rationale**: The component has no hardcoded step numbers. Once `WIZARD_STEPS` is updated, `StepNavigation` renders correctly with 6 steps automatically.

---

## Finding 5 — URL Routing Is State-Based, Not Path-Based

The wizard lives entirely at `/wizard`. There are no deep-link URLs like `/wizard/step/1`. Step navigation is driven by `currentStep` in `WizardState`.

**Decision**: No URL redirect route is needed. The "silent redirect" requirement (FR-001, clarified in spec) is fulfilled by the `renderStep()` default case in `page.tsx`. After the change, any `currentStep` value that doesn't match a valid case (or the removed case 1) falls through to the default, which should render `<ServiceSelectionStep />` and reset `currentStep` to 1 if needed.

**Rationale**: Client-side SPA routing handles this automatically. The only sessionStorage concern (users with old state in browser) is handled by Change 7 (session persistence removal), which is a dependency.

---

## Finding 6 — `setPricingModel` Has No Known External Callers

- **File**: `src/lib/context/WizardContext.tsx` — `setPricingModel` is exposed via context
- **`src/components/wizard/steps/PricingModelStep.tsx`** — the only consumer (being deleted)

**Decision**: Remove `setPricingModel` from the context interface and implementation entirely.

**Rationale**: The only component that called it is being deleted. Removing it from the interface enforces the constraint that pricing model is no longer user-settable.

---

## Dependency Note

**Change 7 (Session Persistence Removal)** should be implemented alongside or immediately after this change. Without Change 7, users with `currentStep: 2` saved in sessionStorage (pointing to what was formerly Services, now Step 1) will load the wizard at step 2 (Experience) — one step ahead of the correct starting position. This produces a confusing UX until sessionStorage is cleared or Change 7 ships.

**Recommendation**: Implement Change 1 and Change 7 in the same PR or back-to-back.
