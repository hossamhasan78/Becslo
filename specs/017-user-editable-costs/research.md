# Research: Overhead Costs — User-Editable Amounts

**Feature Branch**: `017-user-editable-costs`
**Date**: 2026-03-26
**Status**: Complete — all unknowns resolved

---

## Finding 1: Current Costs Data Flow (End-to-End)

**Decision**: Fully mapped before planning to identify every touch-point.

**Current flow**:
1. `costs` table stores `default_cost numeric(10,2)` per category.
2. `GET /api/v1/costs` returns all active costs including `default_cost`.
3. `WizardContext` loads costs → maps them to `engineCosts = [{id, isFixedAmount, defaultCost}]`.
4. `CostsStep.tsx` renders a checkbox list; user toggles cost IDs. State: `state.costs: number[]`.
5. `PricingInput.selectedCosts: string[]` carries only cost IDs to the engine.
6. `calculatePrice()` loops IDs → looks up `defaultCost` per ID → sums into `overheadCosts`.
7. `calculate-and-save` API re-fetches `default_cost` from DB server-side → re-runs calculation → stores `subtotal` (which includes overhead) as a single number on the `calculations` record. **No per-cost line items are persisted to the DB currently.**
8. Admin: no dedicated `/admin/costs` page exists. The `default_cost` field is not exposed in any current admin UI — it exists only at DB and API level.

**Implication**: There is no current `calculation_costs` table. To satisfy the clarification answer (per-category storage), a new table is required.

**Rationale**: Mapping the complete data flow prevents missed touch-points during implementation.

---

## Finding 2: Database Migration Strategy

**Decision**: `ALTER TABLE public.costs DROP COLUMN IF EXISTS default_cost;`

**Rationale**: The `IF EXISTS` guard makes the migration idempotent (FR-008). No archival is needed — the column carries default amounts that will no longer have any meaning after this change. Dropping is safer than nulling (nulling leaves a dead column that could mislead future developers).

**Alternatives considered**:
- Null the column and add a deprecation notice: Rejected — a null column with no readers is dead code that adds confusion.
- Leave the column and just stop reading it: Rejected — violates FR-001 (column must not exist) and SC-001.

---

## Finding 3: New `calculation_costs` Table

**Decision**: Create a new `calculation_costs` table to persist per-calculation cost line items.

**Schema**:
```sql
CREATE TABLE public.calculation_costs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id  uuid NOT NULL REFERENCES public.calculations(id) ON DELETE CASCADE,
  cost_id         integer REFERENCES public.costs(id) ON DELETE SET NULL,
  cost_name       text NOT NULL,  -- snapshot of name at time of calculation
  amount          numeric(10,2) NOT NULL CHECK (amount > 0)
);
```

**Why snapshot the name**: Cost category names can be renamed by admin after a calculation is saved. Snapshotting `cost_name` at save time ensures the calculation record remains accurate historically.

**Why `cost_id` is nullable FK**: If an admin deletes a cost category, the `calculation_costs` record retains the historical name snapshot. `ON DELETE SET NULL` prevents orphan deletion errors.

**Rationale**: Mirrors the existing `calculation_services` pattern exactly. Consistent with the clarification answer (per-category storage).

**Alternatives considered**:
- Store overhead as a single JSON column on `calculations`: Rejected — no query-ability, inconsistent with `calculation_services` pattern.
- Store a single `overhead_total` number: Rejected — violates clarification answer (A); prevents line-item display in Results step (Change 5).

---

## Finding 4: WizardState and Engine Input Reshape

**Decision**: Change `state.costs` from `number[]` (array of selected IDs) to `CostEntry[]` where `CostEntry = { costId: number; costName: string; amount: number }`.

**Rationale**: The pricing engine and save API now need name + amount per cost, not just an ID to look up. Carrying the full entry in state avoids a secondary lookup at save time.

**Engine input change**: `PricingInput.selectedCosts: string[]` → `selectedCosts: Array<{ costId: string; costName: string; amount: number }>`. The engine no longer needs a `costs` reference array — it reads `amount` directly from the input.

**WizardContext action change**: `toggleCost(costId: number)` → `setCostAmount(costId: number, costName: string, amount: number)`. Calling with `amount = 0` removes the entry; calling with `amount > 0` adds or updates it.

---

## Finding 5: Pricing Engine Simplification

**Decision**: Remove the `costs: CostItem[]` reference array parameter from `calculatePrice()`.

**Rationale**: The engine no longer needs to look up default values. Cost amounts are already in `PricingInput.selectedCosts`. The `CostItem` interface (`{ id, isFixedAmount, defaultCost }`) is removed entirely. The `isFixedAmount` distinction becomes irrelevant — all costs are now user-entered amounts and treated identically.

**Output addition**: `PricingOutput` gains a `costBreakdown: CostBreakdown[]` field (mirrors `breakdown: ServiceBreakdown[]`). Each entry: `{ costId: string; costName: string; amount: number }`. The `overheadCosts` total remains as the sum.

---

## Finding 6: Input Validation — Numeric Field Restriction

**Decision**: Use HTML `<input type="number" min={0} max={999999} step={1}>` for cost input fields.

**Rationale**: Browser-native number inputs silently ignore non-numeric keystrokes on most platforms (FR-002 clarification: block at field level). The `max={999999}` attribute enforces the cap at the browser level. Step=1 reinforces whole-dollar input (decimal values are accepted but rounded per FR-007 at calculation time).

**Note**: `type="number"` inputs on mobile show a numeric keyboard, improving usability. The existing pattern in `ServiceSelectionStep` uses similar hour inputs — this is consistent.

---

## Finding 7: Admin Layer — No UI Changes Required

**Decision**: No admin UI component changes needed for costs management.

**Rationale**: There is no `/admin/costs` page or any admin component that currently renders `default_cost` in the UI. The only admin-layer changes are:
1. `GET /api/v1/costs` route: remove `default_cost` from the select query and response shape.
2. `GET /api/admin/calculations/[id]` and `CalculationDetails.tsx`: ensure cost display reads from `calculation_costs` table (new) rather than any cached default.

**Alternatives considered**:
- Build a new admin costs management page: Out of scope per spec Scope section.

---

## Finding 8: `calculate-and-save` API Changes

**Decision**: API no longer fetches or uses `default_cost`. Costs input now carries amounts. After saving the calculation record, insert rows into `calculation_costs`.

**Validation schema change**: `pricingInputSchema` (Zod) — `selectedCosts` field changes from `z.array(z.string())` to `z.array(z.object({ costId: z.string(), costName: z.string(), amount: z.number().min(0).max(999999) }))`.

**Cleanup**: The `costs` fetch from DB (`supabase.from('costs').select('id, is_fixed_amount, default_cost')`) is removed from the API entirely.
