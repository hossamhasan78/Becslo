# Quickstart: Wizard Flow & Frontend Integration

**Feature**: 009-frontend-wizard-flow
**Date**: 2026-03-19

## Prerequisites

Before implementing this feature, ensure:

1. **Phase 0 (Auth)** is complete — user can log in via email/password
2. **Phase 1 (Database)** is complete — all tables seeded (services, categories, countries, costs, config)
3. **Phase 2 (Pricing Engine)** is complete — `calculatePrice()` function works, API endpoints functional
4. Node.js 18+ and npm installed
5. Supabase project configured with `.env.local`

## Quick Setup

```bash
# 1. Ensure you're on the feature branch
git checkout 009-frontend-wizard-flow

# 2. Install dependencies (if any new ones were added)
npm install

# 3. Start the dev server
npm run dev

# 4. Open the wizard page
# Navigate to http://localhost:3000 → Login → Wizard page
```

## Key Files to Modify

| File | Purpose |
|------|---------|
| `src/types/wizard.ts` | Extend WizardState with `highestCompletedStep`, `isSaved`, `savedCalculationId` |
| `src/lib/context/WizardContext.tsx` | New unified wizard+pricing context with sessionStorage sync |
| `src/lib/pricing-engine.ts` | Add `pricingModel` parameter support |
| `src/lib/types/pricing.ts` | Add `pricingModel` to `PricingInput` |
| `src/lib/utils/validation.ts` | Add per-step validation functions |
| `src/components/wizard/StepNavigation.tsx` | Update for free navigation to completed steps |
| `src/components/wizard/LivePreview.tsx` | Update for pricing model-aware display |
| `src/components/wizard/WizardLayout.tsx` | Add responsive stacking + mobile preview toggle |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/wizard/steps/PricingModelStep.tsx` | Step 1: Hourly vs Project selection |
| `src/components/wizard/steps/ServiceSelectionStep.tsx` | Step 2: Accordion with categories + hours input |
| `src/components/wizard/steps/ExperienceStep.tsx` | Step 3: Two sliders (1-10) |
| `src/components/wizard/steps/GeographyStep.tsx` | Step 4: Two country dropdowns |
| `src/components/wizard/steps/CostsStep.tsx` | Step 5: Checkbox list of overhead costs |
| `src/components/wizard/steps/RiskProfitStep.tsx` | Step 6: Two sliders (Risk 0-50%, Profit 10-50%) |
| `src/components/wizard/steps/ReviewStep.tsx` | Step 7: Final breakdown + Calculate & Save + PDF download |
| `src/lib/hooks/useSessionStorage.ts` | Custom hook for sessionStorage sync |
| `src/lib/validation/step-validators.ts` | Per-step validation functions |
| `src/app/api/v1/calculate-and-save/route.ts` | New API: calculate + persist to DB |

## Architecture Summary

```
User navigates to /wizard (authenticated)
  │
  ├─ WizardContext initializes:
  │    ├─ Loads state from sessionStorage (if exists)
  │    ├─ Fetches reference data (services, categories, countries, costs, config)
  │    └─ Computes initial LivePreviewData via calculatePrice()
  │
  ├─ User interacts with Steps 1-6:
  │    ├─ Each input change updates WizardState
  │    ├─ WizardState synced to sessionStorage (debounced)
  │    ├─ calculatePrice() runs on every state change → updates LivePreview
  │    ├─ Step validation runs on "Next" click
  │    └─ Step indicators allow jump to completed steps
  │
  └─ User clicks "Calculate & Save" on Step 7:
       ├─ POST /api/v1/calculate-and-save
       ├─ Server validates, calculates, saves to DB
       ├─ Returns calculationId + full breakdown
       ├─ Client displays final results
       ├─ sessionStorage cleared
       └─ "Download PDF" button appears (optional)
```

## Running Tests

```bash
# Unit tests (pricing engine, validation)
npm test

# Lint check
npm run lint
```

## Common Issues

- **Services not loading**: Ensure Phase 1 seed data migration has run (`npx supabase db push`)
- **Auth redirect loop**: Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Live preview shows $0**: Ensure countries and costs data loaded (check Network tab for API responses)
