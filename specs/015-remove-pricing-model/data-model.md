# Data Model: Remove Pricing Model Step

**Branch**: `015-remove-pricing-model`
**Date**: 2026-03-25

---

## Affected Types

### `WizardState` (`src/types/wizard.ts`)

This interface drives all wizard state. The `pricingModel` field is removed.

**Before:**
```ts
export type PricingModel = 'hourly' | 'project'

export interface WizardState {
  currentStep: number
  calculation_id: string | null
  updatedAt: string | null
  pricingModel: PricingModel | null   // ← REMOVE
  services: SelectedService[]
  experienceDesigner: number
  experienceFreelance: number
  designerCountryId: number | null
  clientCountryId: number | null
  designerCountryCode: string
  clientCountryCode: string
  costs: number[]
  riskBuffer: number
  profitMargin: number
  highestCompletedStep: number
  isSaved: boolean
  savedCalculationId: string | null
}
```

**After:**
```ts
// PricingModel type removed — 'project' is a constant, not a user-chosen value

export interface WizardState {
  currentStep: number
  calculation_id: string | null
  updatedAt: string | null
  // pricingModel removed
  services: SelectedService[]
  experienceDesigner: number
  experienceFreelance: number
  designerCountryId: number | null
  clientCountryId: number | null
  designerCountryCode: string
  clientCountryCode: string
  costs: number[]
  riskBuffer: number
  profitMargin: number
  highestCompletedStep: number
  isSaved: boolean
  savedCalculationId: string | null
}
```

**`DEFAULT_WIZARD_STATE` change**: Remove `pricingModel: null` from the default object.

---

### `WIZARD_STEPS` (`src/types/wizard.ts`)

The step registry drives `StepNavigation`, `ProgressBar`, and `StepNavigation` title rendering.

**Before (7 steps):**
```ts
export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Pricing Model', description: 'Choose hourly or project-based' },
  { id: 2, title: 'Services',      description: 'Select services and hours' },
  { id: 3, title: 'Experience',    description: 'Enter experience levels' },
  { id: 4, title: 'Geography',     description: 'Select countries' },
  { id: 5, title: 'Costs',         description: 'Add additional costs' },
  { id: 6, title: 'Risk & Profit', description: 'Set risk and profit margins' },
  { id: 7, title: 'Review',        description: 'Review and export' },
]
```

**After (6 steps):**
```ts
export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Services',      description: 'Select services and hours' },
  { id: 2, title: 'Experience',    description: 'Enter experience levels' },
  { id: 3, title: 'Geography',     description: 'Select countries' },
  { id: 4, title: 'Costs',         description: 'Add additional costs' },
  { id: 5, title: 'Risk & Profit', description: 'Set risk and profit margins' },
  { id: 6, title: 'Results',       description: 'Review and export' },
]
```

---

### `PricingInput` (`src/lib/types/pricing.ts`)

The engine input type. **No structural change.** The `pricingModel` field is kept but is always passed as `'project'` by `WizardContext`.

```ts
export interface PricingInput {
  pricingModel: 'hourly' | 'project'  // ← kept; always 'project' from WizardContext
  services: Array<{ serviceId: string; hours: number }>
  designerExperience: number
  freelanceExperience: number
  designerCountryCode: string
  clientCountryCode: string
  selectedCosts: string[]
  riskBufferPercent: number
  profitMarginPercent: number
}
```

**Rationale**: Removing it from the engine type would expand scope to the API route and pricing engine. The engine already handles `'project'` correctly. The field is effectively frozen at `'project'` from the wizard side.

---

## Step Validation Map (`src/lib/validation/step-validators.ts`)

The `validateStep(stepId, state)` function's `switch` must be renumbered.

| Old case | New case | Validates |
|----------|----------|-----------|
| `case 1` | **deleted** | ~~pricingModel~~ |
| `case 2` | `case 1` | services (at least 1, hours ≥ 1) |
| `case 3` | `case 2` | experienceDesigner & experienceFreelance (1–10) |
| `case 4` | `case 3` | designerCountryCode & clientCountryCode |
| `case 5` | `case 4` | costs (no validation — optional) |
| `case 6` | `case 5` | riskBuffer (0–50), profitMargin (10–50) |
| `case 7` | `case 6` | review (no validation) |

---

## Step-to-Component Routing Map (`src/app/(wizard)/wizard/page.tsx`)

The `renderStep()` switch and step-count guards must be updated.

| Old case | New case | Component |
|----------|----------|-----------|
| `case 1` | **deleted** | ~~`<PricingModelStep />`~~ |
| `case 2` | `case 1` | `<ServiceSelectionStep />` |
| `case 3` | `case 2` | `<ExperienceStep />` |
| `case 4` | `case 3` | `<GeographyStep />` |
| `case 5` | `case 4` | `<CostsStep />` |
| `case 6` | `case 5` | `<RiskProfitStep />` |
| `case 7` | `case 6` | `<ReviewStep />` |
| `default` | `default` | `<ServiceSelectionStep />` (was `<PricingModelStep />`) |

**Hardcoded `7` references in `page.tsx` to update:**
- `state.currentStep < 7` (Next button condition) → `< 6`
- `state.currentStep === 7` (PDF button condition) → `=== 6`
- `e.key === 'Enter' && state.currentStep < 7` (keyboard shortcut) → `< 6`

---

## Deleted Files

| File | Reason |
|------|--------|
| `src/components/wizard/steps/PricingModelStep.tsx` | Component renders the removed step; has no other callers |

---

## No Database Changes

This feature requires no Supabase migrations. The `pricing_model` column in the `calculations` table is unaffected — it will always receive the value `'project'` from new wizard sessions. Historic records with any value are left unchanged.
