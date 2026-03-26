# Quickstart: Overhead Costs — User-Editable Amounts

**Feature Branch**: `017-user-editable-costs`
**Date**: 2026-03-26

---

## What This Feature Changes

Change 3 from the Implementation Plan Addendum v1.1. Transforms the Costs step from a checkbox list with pre-set default amounts into a per-category numeric input list where the user enters their own overhead amounts. The database `default_cost` column is permanently removed.

---

## Touch-Points Summary

| Layer | File(s) | Change Type |
|---|---|---|
| DB Migration | `supabase/migrations/012_user_editable_costs.sql` | New migration |
| Types | `src/lib/types/pricing.ts` | Modified |
| Types | `src/types/wizard.ts` | Modified |
| Pricing Engine | `src/lib/pricing-engine.ts` | Modified |
| Validation | `src/lib/validation/pricing-schema.ts` | Modified |
| Wizard Context | `src/lib/context/WizardContext.tsx` | Modified |
| Wizard UI | `src/components/wizard/steps/CostsStep.tsx` | Rewritten |
| API | `src/app/api/v1/costs/route.ts` | Modified |
| API | `src/app/api/v1/calculate-and-save/route.ts` | Modified |
| API | `src/app/api/admin/calculations/[id]/route.ts` | Modified |
| Admin UI | `src/components/admin/CalculationDetails.tsx` | Modified |

---

## Local Dev Setup

No new environment variables needed.

After checking out the branch, run DB migration to apply the schema changes:

```bash
supabase db reset
```

This drops `default_cost`, adds `calculation_costs` table, and re-seeds.

---

## Key Behaviour to Verify Manually

1. **Costs step loads empty**: Navigate to wizard Step 4. Every cost category shows a blank numeric input — no pre-filled amount.
2. **Zero/blank = excluded**: Leave all fields empty, advance. The Results step shows $0 overhead.
3. **Positive amount = included**: Enter amounts in 2 fields, advance. Results shows a sum equal to exactly those two amounts.
4. **Max cap enforced**: Try entering `1000000` in a cost field — it should be capped/blocked at `999999`.
5. **Non-numeric blocked**: Try typing letters into a cost field — they should not appear.
6. **Admin calculations detail**: Open an existing calculation in the admin panel — cost line items now show name + amount individually.

---

## Architecture Decisions (see research.md for full rationale)

- **`calculatePrice()` no longer takes a `costs` reference array** — amounts come directly from `PricingInput.selectedCosts`.
- **`calculation_costs` table** mirrors `calculation_services` for consistent line-item storage.
- **`cost_name` is snapshotted** at calculation time so historical records survive admin renames/deletions.
- **`toggleCost` → `setCostAmount`** in WizardContext — the action now carries name + amount, not just a toggle ID.
