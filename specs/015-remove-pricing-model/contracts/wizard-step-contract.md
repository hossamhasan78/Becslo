# UI Contract: Wizard Step Routing

**Branch**: `015-remove-pricing-model`
**Date**: 2026-03-25

This document defines the authoritative mapping between step IDs, components, validation rules, and navigation behaviour after this change is applied. It is the source of truth for implementing and testing the wizard step structure.

---

## Step Registry Contract

Defined in `src/types/wizard.ts` as `WIZARD_STEPS`.

| Step ID | Title | Description |
|---------|-------|-------------|
| 1 | Services | Select services and hours |
| 2 | Experience | Enter experience levels |
| 3 | Geography | Select countries |
| 4 | Costs | Add additional costs |
| 5 | Risk & Profit | Set risk and profit margins |
| 6 | Results | Review and export |

**Invariants:**
- Total step count = 6
- Step IDs are contiguous integers 1–6
- No step titled 'Pricing Model' exists

---

## Step Rendering Contract

Defined in `renderStep()` in `src/app/(wizard)/wizard/page.tsx`.

| Step ID | Component Rendered |
|---------|-------------------|
| 1 | `<ServiceSelectionStep />` |
| 2 | `<ExperienceStep />` |
| 3 | `<GeographyStep />` |
| 4 | `<CostsStep />` |
| 5 | `<RiskProfitStep />` |
| 6 | `<ReviewStep />` |
| default | `<ServiceSelectionStep />` (silently corrects any invalid step state) |

**Invariants:**
- `<PricingModelStep />` is not imported and not rendered at any step ID
- The `default` case renders Step 1 content, effectively a silent redirect

---

## Navigation Controls Contract

Defined in `src/app/(wizard)/wizard/page.tsx`.

| Condition | Control Shown | Behaviour |
|-----------|--------------|-----------|
| `currentStep === 1` | Back button — not rendered | No backward navigation from Step 1; button is absent from the DOM |
| `1 < currentStep ≤ 5` | Back button (enabled) + Next Step button | Standard forward/backward navigation |
| `currentStep === 5` | Back button (enabled) + **Calculate** button* | Advances to Step 6 |
| `currentStep === 6` | Back button (enabled) + Download PDF button | Triggers PDF generation flow |

> *Note: The 'Calculate' button label is specified in Change 4 (separate spec). For this spec, the button label may remain 'Next Step' — the label change is out of scope here.

**Invariants:**
- Back button is `disabled` when `currentStep <= 1` (existing logic, unchanged)
- "Next Step" / forward button shown when `currentStep < 6`
- PDF/action button shown when `currentStep === 6`

---

## Step Validation Contract

Defined in `validateStep(stepId, state)` in `src/lib/validation/step-validators.ts`.

| Step ID | Required Fields | Validation Rule |
|---------|----------------|-----------------|
| 1 | `services` | At least 1 service selected; each service has `hours ≥ 1` |
| 2 | `experienceDesigner`, `experienceFreelance` | Both must be integers between 1 and 10 (inclusive) |
| 3 | `designerCountryCode`, `clientCountryCode` | Both must be non-empty strings |
| 4 | *(none)* | Costs step is optional — always passes validation |
| 5 | `riskBuffer`, `profitMargin` | `riskBuffer` ∈ [0, 50]; `profitMargin` ∈ [10, 50] |
| 6 | *(none)* | Review step has no client-side validation gate |

**Invariants:**
- No case for step 1 that validates `pricingModel` exists
- All step IDs in the switch are 1–6; no `case 7` exists

---

## Pricing Model Contract

The wizard **always** passes `pricingModel: 'project'` to the pricing engine. This is not a user-settable value.

| Property | Value | Source |
|----------|-------|--------|
| `pricingModel` in `PricingInput` | Always `'project'` | Hardcoded in `WizardContext.tsx` |
| `pricingModel` in `WizardState` | Field removed | Not stored in wizard state |
| `pricing_model` in `calculations` table | Always `'project'` for new records | Written by `/api/v1/calculate-and-save` |

---

## Keyboard Shortcut Contract

| Key | Condition | Action |
|-----|-----------|--------|
| `Enter` | `currentStep < 6` AND current step is valid | Advance to next step |
| `Escape` | `currentStep > 1` | Go to previous step |
| Any key | Input/textarea focused | No wizard navigation |
