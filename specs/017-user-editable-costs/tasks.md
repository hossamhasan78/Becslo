# Tasks: Overhead Costs — User-Editable Amounts

**Input**: Design documents from `/specs/017-user-editable-costs/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. The foundational phase (DB + types) is a hard prerequisite for all user story phases. US1 and US2 are both P1 and sequentially dependent; US3 is P2 and can follow independently.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Database migration and TypeScript type changes that every user story depends on. All three tasks in this phase touch different files and can be written in parallel, but the migration (T001) must be applied before any local verification.

**⚠️ CRITICAL**: No user story work can begin until T001–T003 are complete.

- [X] T001 Write migration `supabase/migrations/012_user_editable_costs.sql`: (1) `ALTER TABLE public.costs DROP COLUMN IF EXISTS default_cost;` (2) `CREATE TABLE public.calculation_costs` with columns `id uuid PK`, `calculation_id uuid FK → calculations ON DELETE CASCADE`, `cost_id integer FK → costs ON DELETE SET NULL`, `cost_name text NOT NULL`, `amount numeric(10,2) NOT NULL CHECK (amount > 0)`, plus index on `calculation_id`; (3) Enable RLS on the new table: `ALTER TABLE public.calculation_costs ENABLE ROW LEVEL SECURITY;`; (4) Add RLS policies matching `calculation_services` pattern: users can SELECT their own rows via `auth.uid() = (SELECT user_id FROM calculations WHERE id = calculation_id)`; admins (service role) bypass RLS; no direct user INSERT/UPDATE/DELETE (writes go through the server API only)

- [X] T002 [P] Update `src/lib/types/pricing.ts`: (1) Remove `default_cost: number` from `Cost` interface; (2) Add `CostEntry` interface `{ costId: number; costName: string; amount: number }`; (3) Add `CostBreakdown` interface `{ costId: string; costName: string; amount: number }`; (4) Change `PricingInput.selectedCosts` from `string[]` to `Array<{ costId: string; costName: string; amount: number }>`; (5) Add `costBreakdown: CostBreakdown[]` field to `PricingOutput`

- [X] T003 [P] Update `src/types/wizard.ts`: Change `WizardState.costs` type from `number[]` to `CostEntry[]` (import `CostEntry` from `@/lib/types/pricing`); update `DEFAULT_WIZARD_STATE.costs` to `[]` (type now matches, no value change needed)

**Checkpoint**: Migration file exists and is syntactically correct. Type file compiles with no errors. WizardState type reflects `CostEntry[]`.

---

## Phase 2: User Story 1 — Freelancer Enters Own Overhead Costs (Priority: P1) 🎯 MVP

**Goal**: Replace the checkbox cost selection UI with per-category numeric input fields. User sees empty inputs, types their own amounts; zero/blank = excluded.

**Independent Test**: Navigate to wizard Step 4 as a logged-in user. Confirm every cost category shows an empty numeric input field with no pre-populated value. Enter `200` in one field, leave others blank, advance to Step 5. Confirm the overhead state contains exactly one entry with amount 200.

### Implementation for User Story 1

- [X] T004 [US1] Update `src/lib/context/WizardContext.tsx`: (1) Remove `engineCosts` useMemo entirely (engine no longer takes a costs reference array); (2) Replace `toggleCost(costId: number)` with `setCostAmount(costId: number, costName: string, amount: number)` — amount 0 removes the entry from `state.costs`, amount > 0 adds/updates it; (3) Update `pricingInput.selectedCosts` mapping from `state.costs.map(String)` to `state.costs.map(c => ({ costId: String(c.costId), costName: c.costName, amount: c.amount }))`; (4) Update `calculatePrice()` call to remove the `engineCosts` argument; (5) Update context interface: replace `toggleCost` with `setCostAmount`

- [X] T005 [US1] Rewrite `src/components/wizard/steps/CostsStep.tsx`: Replace the checkbox list with a per-category input list — for each cost in `allCosts`, render a row with the category name as a label and `<input type="number" min={0} max={999999} step={1}>` with empty default value; on `onChange`, call `setCostAmount(cost.id, cost.name, value)`; zero or cleared input calls `setCostAmount(cost.id, cost.name, 0)` to remove the entry; remove all references to `default_cost`, `isSelected`, and `toggleCost`; retain the "Costs are optional" note at the bottom

- [X] T005a [P] [US1] Delete dead component `src/app/(wizard)/wizard/components/step-inputs/cost-selection.tsx` — this file is not imported or used anywhere (wizard page uses `CostsStep`); it references `default_cost` and `toggleCost` and will never compile again; simply delete the file

**Checkpoint**: Wizard Step 4 renders cost categories with empty numeric inputs. Typing a value and advancing stores it in wizard state as a `CostEntry`. Leaving blank stores nothing.

---

## Phase 3: User Story 2 — Calculation Reflects Only User-Entered Costs (Priority: P1) 🎯 MVP

**Goal**: Update the pricing engine, validation schema, and save API so that only user-entered amounts are used in calculation. No `default_cost` is read from the database at any point.

**Independent Test**: POST to `/api/v1/calculate-and-save` with `selectedCosts: [{ costId: "1", costName: "Software", amount: 300 }]`. Confirm `data.overheadCosts === 300`, `data.costBreakdown` has one entry with `amount: 300`, and a `calculation_costs` row is inserted with `amount = 300`. POST with `selectedCosts: []` and confirm `overheadCosts === 0`.

### Implementation for User Story 2

- [X] T006 [P] [US2] Update `src/lib/pricing-engine.ts`: (1) Remove `CostItem` interface; (2) Remove `costs: CostItem[]` parameter from `calculatePrice()` signature; (3) Replace the cost summation loop (lines 73–84) with: iterate `input.selectedCosts`, sum `entry.amount` into `overheadCosts`, build `costBreakdown` array `[{ costId, costName, amount }]`; (4) Retain the existing `overheadCosts = roundToNearestDollar(overheadCosts)` call after the summation — do NOT remove it (required by FR-007 nearest-dollar rounding); (5) Add `costBreakdown` to the returned `PricingOutput` object

- [X] T007 [P] [US2] Update `src/lib/validation/pricing-schema.ts`: Change `selectedCosts` Zod field from `z.array(z.string().or(z.number()).transform(...))` to `z.array(z.object({ costId: z.string(), costName: z.string().min(1), amount: z.number().min(0).max(999999) }))`; entries with `amount: 0` are valid in the schema (filtering is done client-side before sending, but 0 is a safe fallback)

- [X] T007a [P] [US2] Update `src/lib/types/validation.ts`: (1) Update `PricingInputSchema.selectedCosts` from `z.array(z.string().uuid())` to `z.array(z.object({ costId: z.string(), costName: z.string(), amount: z.number().min(0).max(999999) }))` to satisfy the updated `PricingInput` type; (2) Add `costBreakdown: z.array(z.object({ costId: z.string(), costName: z.string(), amount: z.number() }))` to `PricingOutputSchema` to satisfy the updated `PricingOutput` type — this file uses `satisfies z.ZodType<T>` constraints that will fail to compile until both schemas match their corresponding types

- [X] T008 [P] [US2] Update `src/app/api/v1/costs/route.ts`: Remove `default_cost` from the Supabase select query and from the response shape; response now returns only `id`, `name`, `is_fixed_amount`, `is_active`

- [X] T009 [US2] Update `src/app/api/v1/calculate-and-save/route.ts`: (1) Remove the `costs` DB fetch (`supabase.from('costs').select('id, is_fixed_amount, default_cost')`); (2) Remove the `costs` mapping and variable; (3) Update `calculatePrice()` call to remove the `costs` argument (matches new 3-param signature from T006); (4) After inserting `calculation_services`, insert `calculation_costs` rows: map `input.selectedCosts` (filter `amount > 0`) to `{ calculation_id, cost_id: Number(costId), cost_name: costName, amount }` and insert into `calculation_costs` table; if insert fails, clean up and return 500

**Checkpoint**: `calculatePrice()` takes 3 arguments (no costs array). The save API no longer queries `default_cost`. A saved calculation has corresponding `calculation_costs` rows. The `costBreakdown` field appears in the API response.

---

## Phase 4: User Story 3 — Admin Manages Cost Categories Without Amounts (Priority: P2)

**Goal**: Admin calculation detail view shows cost line items by name and amount from `calculation_costs`. No `default_cost` field appears anywhere in admin UI.

**Independent Test**: In the admin dashboard, open any calculation saved after this change. The costs section lists individual line items (name + amount). Confirm no "default cost" label or field appears.

### Implementation for User Story 3

- [X] T010 [P] [US3] Update `src/app/api/admin/calculations/[id]/route.ts`: Add a fetch for `calculation_costs` rows joined to the calculation (`supabase.from('calculation_costs').select('id, cost_id, cost_name, amount').eq('calculation_id', id)`); include the result as a `costs` array in the response payload alongside the existing `services` array

- [X] T011 [P] [US3] Update `src/components/admin/CalculationDetails.tsx`: Update the costs rendering section (currently around line 132–155) to display cost line items from the `costs` array in the API response — render each item as `cost_name` and `amount` (formatted as USD); remove any rendering of `default_cost`; if `costs` array is empty, show "No overhead costs recorded"

**Checkpoint**: Admin calculation detail page shows individual cost line items with name and amount. No `default_cost` value renders anywhere in the admin UI.

---

## Phase 5: Polish & Verification

**Purpose**: Apply migration locally and verify the complete flow end-to-end per quickstart.md.

- [X] T012 Apply migration locally: run `supabase db reset` from repo root; confirm `costs` table has no `default_cost` column (`\d public.costs`); confirm `calculation_costs` table exists with correct schema

- [ ] T013 [P] End-to-end wizard verification (quickstart.md checklist): (1) Navigate to wizard Step 4 — all cost fields are empty; (2) Enter known amounts in 2 fields, leave others blank; (3) Complete wizard through to Results — overhead total equals exactly the sum of the 2 entered values; (4) Confirm empty session (all zeros) produces $0 overhead; (5) Try entering `1000000` — confirm it is capped/blocked at `999999`

- [ ] T014 [P] Admin verification: open a calculation saved after the migration in the admin dashboard; confirm cost line items show individual name + amount entries; confirm no `default_cost` label or field appears anywhere on the page

**Checkpoint**: All functional requirements (FR-001 through FR-008) and success criteria (SC-001 through SC-005) confirmed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately; T002 and T003 can run in parallel with T001
- **US1 (Phase 2)**: Depends on T001–T003 complete — T004 then T005 sequentially
- **US2 (Phase 3)**: Depends on T001–T003 complete — T006, T007, T008 can run in parallel; T009 depends on T006 + T007
- **US3 (Phase 4)**: Depends on T001 (migration) and T009 (calculation_costs inserted) — T010 and T011 can run in parallel
- **Polish (Phase 5)**: Depends on T001 applied locally; T013 depends on all Phase 2+3 complete; T014 depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T001–T003)
- **US2 (P1)**: Depends on Foundational (T001–T003); T009 also depends on T006 + T007
- **US3 (P2)**: Depends on T001 (migration for `calculation_costs` table) and T009 (data to display)

### Parallel Opportunities

- T002 ‖ T003 (different type files, no dependency between them)
- T006 ‖ T007 ‖ T008 (different files, all US2 pre-work for T009)
- T010 ‖ T011 (different files, both US3)
- T013 ‖ T014 (different verification flows, both polish)

---

## Parallel Example: Foundational Phase

```
Launch in parallel:
  Task T002: Update src/lib/types/pricing.ts
  Task T003: Update src/types/wizard.ts
(Both touch different files; T001 migration can be written at the same time)
```

## Parallel Example: User Story 2

```
After T001–T003 complete, launch in parallel:
  Task T006: Update src/lib/pricing-engine.ts
  Task T007: Update src/lib/validation/pricing-schema.ts
  Task T008: Update src/app/api/v1/costs/route.ts
Then:
  Task T009: Update src/app/api/v1/calculate-and-save/route.ts (depends on T006 + T007)
```

---

## Implementation Strategy

### MVP First (US1 + US2 only — both P1)

1. Complete Phase 1: Foundational (T001–T003)
2. Complete Phase 2: US1 — Costs step UI (T004–T005)
3. Complete Phase 3: US2 — Engine + API (T006–T009)
4. **STOP and VALIDATE**: Run T012 + T013 verification
5. US1 + US2 together satisfy SC-001 through SC-005 and all FR-001 through FR-008

### Full Delivery (add US3)

1. Complete MVP scope above
2. Complete Phase 4: US3 — Admin layer (T010–T011)
3. Run T014 verification
4. All user stories and success criteria satisfied

### Total: 14 tasks across 5 phases
