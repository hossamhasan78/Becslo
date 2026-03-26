# Quickstart: Remove Pricing Model Step

**Branch**: `015-remove-pricing-model`
**Date**: 2026-03-25

---

## What This Change Does

Removes the Pricing Model selection screen (old Step 1) from the wizard. The wizard now starts directly at Service Selection. All subsequent steps shift down by one (old Step 2 → new Step 1, etc.). The pricing model is hardcoded to `'project'` internally.

**Files to modify:** 5
**Files to delete:** 1
**Database migrations:** None

---

## Prerequisites

- Node.js and dependencies installed (`npm install` from repo root)
- Local Supabase running or connected to staging
- Checked out on branch `015-remove-pricing-model`

---

## Implementation Order

Follow this exact order to avoid TypeScript errors mid-change:

### Step 1 — Update the Step Registry and State Type

**File**: `src/types/wizard.ts`

1. Delete the `PricingModel` type export.
2. Remove `pricingModel: PricingModel | null` from `WizardState`.
3. Remove `pricingModel: null` from `DEFAULT_WIZARD_STATE`.
4. Replace the `WIZARD_STEPS` array with the 6-step version (see `data-model.md`).

---

### Step 2 — Update the Wizard Context

**File**: `src/lib/context/WizardContext.tsx`

1. Remove `PricingModel` from the import from `@/types/wizard`.
2. In both `pricingInput` objects (in `useMemo` and in `calculateAndSave`), change:
   ```ts
   pricingModel: state.pricingModel || 'hourly'
   ```
   to:
   ```ts
   pricingModel: 'project'
   ```
3. Remove `setPricingModel` from the context interface, implementation, and the `contextValue` object.
4. In `goToNextStep`, change `Math.min(prev.currentStep + 1, 7)` to `Math.min(prev.currentStep + 1, 6)`.

---

### Step 3 — Renumber Step Validators

**File**: `src/lib/validation/step-validators.ts`

1. Delete `case 1` (the pricingModel validation block).
2. Renumber all remaining cases: `2 → 1`, `3 → 2`, `4 → 3`, `5 → 4`, `6 → 5`, `7 → 6`.

---

### Step 4 — Update the Wizard Page

**File**: `src/app/(wizard)/wizard/page.tsx`

1. Remove `import { PricingModelStep } from '@/components/wizard/steps/PricingModelStep'`.
2. In `renderStep()`:
   - Delete `case 1: return <PricingModelStep />`.
   - Renumber remaining cases: `2 → 1`, `3 → 2`, `4 → 3`, `5 → 4`, `6 → 5`, `7 → 6`.
   - Change `default: return <PricingModelStep />` to `default: return <ServiceSelectionStep />`.
3. Change all hardcoded `7` step-count references:
   - `state.currentStep < 7` → `state.currentStep < 6` (Next button + keyboard shortcut — 2 occurrences)
   - `state.currentStep === 7` → `state.currentStep === 6` (PDF button)

---

### Step 5 — Update ProgressBar Default

**File**: `src/components/wizard/ProgressBar.tsx`

1. Change the default prop: `totalSteps = 7` → `totalSteps = 6`.

---

### Step 6 — Delete PricingModelStep Component

**File**: `src/components/wizard/steps/PricingModelStep.tsx`

Delete the file. Confirm no other imports reference it after Step 4 above.

---

## Verify

```bash
# TypeScript — should produce zero errors
npx tsc --noEmit

# Unit tests
npm run test

# Dev server — open /wizard and confirm:
# 1. First step is Service Selection
# 2. Step list shows 6 steps
# 3. No Back button on Step 1
# 4. All 6 steps navigate correctly
npm run dev
```

---

## Manual Test Checklist

- [ ] Wizard opens at Service Selection (not Pricing Model)
- [ ] Step list shows: Services, Experience, Geography, Costs, Risk & Profit, Results
- [ ] Step counter reads "Step 1 of 6" on first step
- [ ] No Back button visible on Step 1
- [ ] Back button works on Steps 2–6
- [ ] Step 6 (Results) shows the PDF download button
- [ ] Completing the wizard saves a calculation with `pricing_model = 'project'` in the database
- [ ] TypeScript build passes with zero errors

---

## Rollback

If anything goes wrong, revert the 5 modified files and restore `PricingModelStep.tsx` from git:

```bash
git checkout main -- src/types/wizard.ts src/lib/context/WizardContext.tsx src/lib/validation/step-validators.ts src/app/(wizard)/wizard/page.tsx src/components/wizard/ProgressBar.tsx src/components/wizard/steps/PricingModelStep.tsx
```
