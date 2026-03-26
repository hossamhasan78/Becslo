# Data Model: Overhead Costs — User-Editable Amounts

**Feature Branch**: `017-user-editable-costs`
**Date**: 2026-03-26

---

## Database Changes

### 1. `costs` Table — Column Removal

**Migration**: Drop `default_cost` column.

```
costs
├── id              serial PK
├── name            text NOT NULL
├── is_active       boolean DEFAULT true
├── is_fixed_amount boolean              ← added by migration 006; retained
└── created_at      timestamptz
```

**Removed**: `default_cost numeric(10,2)` — permanently dropped, no archival.

---

### 2. New Table: `calculation_costs`

Stores per-calculation cost line items. Mirrors the `calculation_services` pattern.

```
calculation_costs
├── id              uuid PK DEFAULT gen_random_uuid()
├── calculation_id  uuid NOT NULL FK → calculations(id) ON DELETE CASCADE
├── cost_id         integer FK → costs(id) ON DELETE SET NULL  ← nullable
├── cost_name       text NOT NULL          ← snapshot at calculation time
└── amount          numeric(10,2) NOT NULL CHECK (amount > 0)
```

**Rules**:
- `cost_id` is nullable — if a cost category is later deleted by admin, the historical record is preserved via `cost_name` snapshot.
- `amount` must be > 0 — only positive user-entered values are persisted (zero/blank entries are excluded before save).
- `ON DELETE CASCADE` from `calculations` — deleting a calculation removes its cost line items.

**Index**: `CREATE INDEX idx_calculation_costs_calculation_id ON public.calculation_costs(calculation_id);`

---

## TypeScript Type Changes

### `src/lib/types/pricing.ts`

**Removed from `Cost` interface**: `default_cost: number`

```typescript
// Before
interface Cost {
  id: number;
  name: string;
  is_fixed_amount: boolean;
  default_cost: number;   ← REMOVED
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// After
interface Cost {
  id: number;
  name: string;
  is_fixed_amount: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**New type: `CostEntry`** (wizard state cost entry):
```typescript
interface CostEntry {
  costId: number;
  costName: string;   // captured at input time for display & save
  amount: number;     // user-entered value, 1–999999
}
```

**New type: `CostBreakdown`** (pricing engine output):
```typescript
interface CostBreakdown {
  costId: string;
  costName: string;
  amount: number;
}
```

**Changed: `PricingInput.selectedCosts`**:
```typescript
// Before
selectedCosts: string[];

// After
selectedCosts: Array<{ costId: string; costName: string; amount: number }>;
```

**Changed: `PricingOutput`** — add `costBreakdown`:
```typescript
interface PricingOutput {
  baseCost: number;
  overheadCosts: number;        // sum of all cost amounts (unchanged field name)
  costBreakdown: CostBreakdown[]; ← NEW
  subtotal: number;
  riskBufferAmount: number;
  profitMarginAmount: number;
  finalPrice: number;
  recommendedMin: number;
  recommendedMax: number;
  experienceMultiplier: number;
  geographyMultiplier: number;
  breakdown: ServiceBreakdown[];
}
```

---

## Wizard State Changes

### `src/types/wizard.ts` (or wherever `WizardState` is defined)

```typescript
// Before
interface WizardState {
  costs: number[];   // array of selected cost IDs
  ...
}

// After
interface WizardState {
  costs: CostEntry[];   // array of { costId, costName, amount }
  ...
}
```

**Default state**: `costs: []` — unchanged semantics (empty array = no costs).

---

## Pricing Engine Changes

### `src/lib/pricing-engine.ts`

**Removed**: `CostItem` interface (`{ id: string; isFixedAmount: boolean; defaultCost: number }`).

**Removed**: `costs: CostItem[]` parameter from `calculatePrice()`.

**New signature**:
```typescript
export function calculatePrice(
  input: PricingInput,
  countries: CountryMultiplier[],
  services: ServiceItem[]
): PricingOutput
```

**Cost summation — new logic** (replaces lines 73–84):
```
// No DB lookup needed — amounts come directly from input
const costBreakdown: CostBreakdown[] = []
let overheadCosts = 0
for (const costEntry of input.selectedCosts) {
  overheadCosts += costEntry.amount
  costBreakdown.push({ costId: costEntry.costId, costName: costEntry.costName, amount: costEntry.amount })
}
overheadCosts = roundToNearestDollar(overheadCosts)
```

---

## API Layer Changes

### `GET /api/v1/costs`

- Query: remove `default_cost` from select.
- Response shape: no `default_cost` field.

### `POST /api/v1/calculate-and-save`

- Remove: `costs` DB fetch (`supabase.from('costs').select('id, is_fixed_amount, default_cost')`).
- Remove: `costs` parameter from `calculatePrice()` call.
- Add: after inserting `calculation_services`, insert `calculation_costs` rows:
  ```
  calculation_costs rows = input.selectedCosts
    .filter(c => c.amount > 0)
    .map(c => ({
      calculation_id: calculation.id,
      cost_id: Number(c.costId),
      cost_name: c.costName,
      amount: c.amount
    }))
  ```
- Validation schema (`pricingInputSchema`): update `selectedCosts` Zod schema.

### `GET /api/admin/calculations/[id]`

- Add: fetch `calculation_costs` rows joined to the calculation.
- Return: cost line items alongside service line items.

---

## WizardContext Changes

### `src/lib/context/WizardContext.tsx`

- **`engineCosts` memo**: removed entirely (engine no longer takes a costs reference array).
- **`pricingInput.selectedCosts`**: maps from `state.costs` (now `CostEntry[]`) to `Array<{costId, costName, amount}>`.
- **`toggleCost`**: replaced with `setCostAmount(costId: number, costName: string, amount: number)`:
  - `amount === 0` → remove entry from `state.costs` if it exists.
  - `amount > 0` → add or update entry in `state.costs`.
- **Exported action**: `setCostAmount` replaces `toggleCost` in context interface.
