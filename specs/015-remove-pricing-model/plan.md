# Implementation Plan: Remove Pricing Model Step

**Branch**: `015-remove-pricing-model` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-remove-pricing-model/spec.md`

---

## Summary

Remove the Pricing Model selection screen (old Step 1) from the wizard. Hardcode `pricingModel: 'project'` internally. Renumber all remaining steps from 7 to 6. Remove the Back button from the new Step 1 (Service Selection). The change touches 5 source files and deletes 1 component — no database migration is required.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 (NextJS 14.x App Router)
**Primary Dependencies**: NextJS 14, React 18, Framer Motion (ProgressBar animation), Supabase JS client
**Storage**: Supabase PostgreSQL via API routes; sessionStorage for wizard state (being removed in Change 7)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Vercel (serverless/edge, web browser)
**Performance Goals**: No regression — wizard step render must remain under 100ms
**Constraints**: No new npm dependencies; changes must not break the existing `/api/v1/calculate-and-save` contract; historic calculation records in Supabase are untouched
**Scale/Scope**: 5 files modified, 1 file deleted, 0 migrations

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Authentication-First | ✅ Pass | No auth changes; wizard is already behind auth |
| II. Data Privacy & Analytics | ✅ Pass | Calculations still stored; `pricing_model = 'project'` written to DB for all new records |
| III. Monolithic Architecture | ✅ Pass | All changes within `src/` of the NextJS monolith; no new services |
| IV. Admin-Configured Pricing | ✅ Pass | Pricing rates, multipliers, and service definitions remain admin-configurable; removing user choice of pricing *model* does not affect admin-configured *parameters* |
| V. MVP Incremental Development | ✅ Pass | Post-build refinement; does not alter the priority order of original MVP phases |

**Post-design re-check**: All principles still satisfied. No violations introduced by the design in Phase 1.

---

## Project Structure

### Documentation (this feature)

```text
specs/015-remove-pricing-model/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── wizard-step-contract.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (files affected)

```text
src/
├── types/
│   └── wizard.ts                          ← MODIFY — remove pricingModel field, update WIZARD_STEPS to 6 entries
├── lib/
│   ├── context/
│   │   └── WizardContext.tsx              ← MODIFY — hardcode 'project', remove setPricingModel, update step max to 6
│   └── validation/
│       └── step-validators.ts             ← MODIFY — delete case 1, renumber cases 2–7 → 1–6
├── components/
│   └── wizard/
│       ├── ProgressBar.tsx                ← MODIFY — change totalSteps default from 7 to 6
│       └── steps/
│           └── PricingModelStep.tsx       ← DELETE — component has no callers after page.tsx update
└── app/
    └── (wizard)/
        └── wizard/
            └── page.tsx                   ← MODIFY — remove PricingModelStep import/case, update hardcoded 7→6 (3 places)
```

**Not modified** (data-driven, auto-updated via `WIZARD_STEPS`):
- `src/components/wizard/StepNavigation.tsx` — iterates `WIZARD_STEPS`, no hardcoded counts
- `src/lib/types/pricing.ts` — `PricingInput.pricingModel` field kept; value always `'project'`
- `src/lib/pricing-engine.ts` — no change; already handles `'project'` correctly
- All Supabase migrations — no schema changes required

**Structure Decision**: NextJS monolith (App Router). All changes are within `src/` at the component, context, and type layers. No API route changes needed.

---

## Phase 0: Research

**Status**: Complete. See [research.md](./research.md).

### Key Decisions

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| `PricingInput.pricingModel` field | Keep in engine type; always pass `'project'` | Avoids expanding scope to API routes and pricing engine |
| `setPricingModel` in context | Remove entirely | Only caller (`PricingModelStep`) is deleted |
| URL/step redirect | No new route needed — `default` case in `renderStep()` handles it | Wizard is SPA at `/wizard`; no path-based step routing exists |
| Session state migration | Recommend shipping Change 7 (session reset) alongside this change | Users with old sessionStorage may load at a shifted step number |

---

## Phase 1: Design & Contracts

**Status**: Complete.

### Artifacts Generated

- **[data-model.md](./data-model.md)** — Before/after for `WizardState`, `WIZARD_STEPS`, validation map, and step-to-component routing map
- **[contracts/wizard-step-contract.md](./contracts/wizard-step-contract.md)** — Authoritative step registry, rendering, validation, navigation, and pricing model contracts
- **[quickstart.md](./quickstart.md)** — Ordered implementation steps with manual test checklist and rollback instructions

### Design Summary

The change is entirely additive-by-subtraction: remove one array entry, one interface field, one switch case (with renumbering), and one component file. The pricing engine, API routes, and database are untouched. The `PricingInput` type retains `pricingModel` to avoid engine changes — it is always assigned `'project'` at the two WizardContext call sites.

---

## Implementation Notes for Coder

1. **Follow the order in quickstart.md** — Steps 1→6 in that order prevent intermediate TypeScript errors.
2. **Three `7`s must change to `6`** in `page.tsx` — missing any one produces a broken step boundary.
3. **`setPricingModel` appears in the context interface, the implementation, AND the `contextValue` useMemo** — remove from all three.
4. **The `default` case in `renderStep()`** must point to `<ServiceSelectionStep />`, not `<PricingModelStep />`, to satisfy the silent redirect requirement.
5. **Ship with Change 7** (session persistence removal) to prevent sessionStorage step-number mismatch for existing users.
