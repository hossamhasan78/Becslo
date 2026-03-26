# Implementation Plan: Overhead Costs — User-Editable Amounts

**Branch**: `017-user-editable-costs` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-user-editable-costs/spec.md`

---

## Summary

Remove the `default_cost` column from the `costs` table and replace the wizard's checkbox-based cost selection with per-category numeric input fields. Users enter their own overhead amounts; zero/blank fields are excluded. The pricing engine is simplified to sum user-provided amounts directly. A new `calculation_costs` table persists individual cost line items per calculation. No pre-filled defaults exist anywhere in the product after this change.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 (Next.js 14.x App Router)
**Primary Dependencies**: Next.js 14, Supabase JS client, Supabase CLI (migration runner), Zod (validation)
**Storage**: Supabase PostgreSQL — `costs`, `calculations`, new `calculation_costs` tables
**Testing**: `npm test` (Jest/Vitest per project setup); `npm run lint`
**Target Platform**: Vercel (serverless) + Supabase
**Project Type**: Web application (monolith)
**Performance Goals**: Standard — no new performance requirements; cost input is client-side, no latency concern
**Constraints**: USD only; nearest-dollar rounding; monolithic Next.js architecture; no new services
**Scale/Scope**: Single-user wizard session; calculation records are append-only

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Authentication-First | ✅ Pass | No auth changes; existing auth gates all wizard/admin routes |
| II. Data Privacy & Analytics | ✅ Pass | Cost entries stored per-calculation for admin analytics; no personal save |
| III. Monolithic Architecture | ✅ Pass | All changes within the Next.js monolith + Supabase; no new services |
| IV. Admin-Configured Pricing | ✅ Pass | Admin still configures cost *categories*; only the default *amount* is removed |
| V. MVP Incremental Development | ✅ Pass | Change 3 is a defined addendum item; does not skip phases |

**Post-Design Re-check**: All principles still pass. The new `calculation_costs` table follows the same RLS patterns as `calculation_services`. The pricing engine simplification reduces complexity rather than adding it.

---

## Project Structure

### Documentation (this feature)

```text
specs/017-user-editable-costs/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── api-contracts.md ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (touch-points for this feature)

```text
src/
├── app/
│   └── api/
│       ├── v1/
│       │   ├── costs/route.ts                    ← remove default_cost from select
│       │   └── calculate-and-save/route.ts       ← remove costs DB fetch; add calculation_costs insert
│       └── admin/
│           └── calculations/[id]/route.ts        ← add calculation_costs fetch
├── components/
│   ├── admin/
│   │   └── CalculationDetails.tsx               ← display cost line items from new table
│   └── wizard/
│       └── steps/
│           └── CostsStep.tsx                    ← full rewrite: inputs replace checkboxes
├── lib/
│   ├── context/
│   │   └── WizardContext.tsx                    ← setCostAmount replaces toggleCost; engine mapping updated
│   ├── types/
│   │   └── pricing.ts                           ← Cost, PricingInput, PricingOutput, new CostEntry/CostBreakdown
│   ├── validation/
│   │   └── pricing-schema.ts                    ← selectedCosts Zod schema change
│   └── pricing-engine.ts                        ← remove costs param; sum from input directly
└── types/
    └── wizard.ts                                ← WizardState.costs: CostEntry[]

supabase/
└── migrations/
    └── 012_user_editable_costs.sql              ← DROP COLUMN + CREATE TABLE calculation_costs
```

---

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## Phase 0: Research

**Status**: Complete. See [research.md](./research.md).

All unknowns resolved:

| Unknown | Resolution |
|---|---|
| How costs are currently stored in calculation records | No per-cost persistence exists today — only a summed overhead total in `calculations.subtotal` |
| New table needed for per-category storage | `calculation_costs` table, modelled after `calculation_services` |
| Migration safety | `DROP COLUMN IF EXISTS` — idempotent |
| Engine simplification | Remove `costs: CostItem[]` parameter; sum `amount` directly from input |
| Admin UI impact | No dedicated admin costs UI exists; only API and `CalculationDetails` component affected |
| Input validation strategy | `<input type="number" min=0 max=999999>` — browser-native restriction |

---

## Phase 1: Design

**Status**: Complete.

### Artifacts Generated

- **[data-model.md](./data-model.md)**: DB schema changes, TypeScript type changes, engine and context changes.
- **[contracts/api-contracts.md](./contracts/api-contracts.md)**: Before/after for `GET /api/v1/costs`, `POST /api/v1/calculate-and-save`, `GET /api/admin/calculations/[id]`.
- **[quickstart.md](./quickstart.md)**: Touch-point table, local dev setup, manual verification checklist.

### Design Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Cost entry storage | New `calculation_costs` table | Mirrors `calculation_services`; enables line-item display (Change 5) |
| Name persistence | Snapshot `cost_name` at save time | Survives admin renames/deletions |
| Engine interface | Remove `costs` param entirely | Amounts now in input; no DB lookup needed |
| WizardState costs type | `CostEntry[]` (`{costId, costName, amount}`) | Carries all needed fields to save API without secondary lookups |
| WizardContext action | `setCostAmount(id, name, amount)` replaces `toggleCost` | Unified add/update/remove via amount value |
| Admin UI | No new page; only API + `CalculationDetails` update | No admin costs management page currently exists |
