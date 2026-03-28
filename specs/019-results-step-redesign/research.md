# Research: Results Step Redesign (Step 6)

**Feature Branch**: `019-results-step-redesign`
**Date**: 2026-03-28

---

## Finding 1 — Touch Points

Four files need to change. No new dependencies. No schema changes.

| File | Change |
|------|--------|
| `src/components/wizard/WizardLayout.tsx` | Remove `rightPanel` prop, `<aside>` sidebar, and mobile toggle button; make wizard full-width |
| `src/app/(wizard)/wizard/page.tsx` | Remove `rightPanel={<LivePreview />}` prop and `LivePreview` import |
| `src/components/wizard/steps/ReviewStep.tsx` | Complete rewrite — full breakdown replacing summary-only display |
| `src/components/wizard/LivePreview.tsx` | Delete — no longer rendered anywhere after this change |

---

## Finding 2 — All Required Data Already Exists in `PricingOutput`

The new Step 6 breakdown requires no new data fetching or state changes. Every field is already present in the `result` object from `useWizard()`:

| Step 6 Section | Source Field |
|----------------|-------------|
| Service name | `result.breakdown[i].serviceName` |
| Service hours | `result.breakdown[i].hours` |
| Service cost | `result.breakdown[i].cost` |
| Cost category name | `result.costBreakdown[i].costName` |
| Cost amount | `result.costBreakdown[i].amount` |
| Services subtotal | `result.baseCost` |
| Overhead total | `result.overheadCosts` |
| Combined subtotal | `result.subtotal` |
| Risk buffer | `result.riskBufferAmount` |
| Profit margin | `result.profitMarginAmount` |
| Final price | `result.finalPrice` |
| Recommended min | `result.recommendedMin` |
| Recommended max | `result.recommendedMax` |
| Experience multiplier | `result.experienceMultiplier` |
| Geography multiplier | `result.geographyMultiplier` |

The `WizardContext` `result` useMemo already computes all of these. No changes needed to WizardContext, PricingOutput type, or any API.

---

## Finding 3 — WizardLayout Simplification

`WizardLayout.tsx` currently accepts `leftPanel` and `rightPanel` props and renders a responsive two-column layout with:
- A fixed `<aside>` sidebar (1/4 width, sticky, `md:w-1/4 lg:w-1/5`)
- A mobile floating toggle button (fixed bottom-right)
- A mobile close button inside the sidebar

After this change:
- `rightPanel` prop is removed entirely
- `<aside>` element and all its children are removed
- Mobile toggle button is removed
- `showMobilePreview` state is removed
- `leftPanel` fills full width via `flex-1`

**Decision**: Update `WizardLayout` in place rather than creating a new component. The `rightPanel` prop is only used in one caller (`page.tsx`), so the interface change is safe.

**Alternative considered**: Keep `rightPanel` as optional and conditionally render it. Rejected — the addendum requires the right column to be permanently removed. Making it optional would leave dead code.

---

## Finding 4 — Pre-existing Bug in ReviewStep

The current `ReviewStep.tsx` accesses `item.subtotal` to display service costs, but `ServiceBreakdown` has no `subtotal` field — the correct field is `item.cost`. This is a pre-existing type error (suppressed by `any` cast). The rewrite corrects this naturally.

---

## Finding 5 — LivePreview Sections That Map to New ReviewStep

`LivePreview.tsx` currently renders three sub-components in project mode:
1. `PriceDisplay` → finalPrice (blue card) + recommendedMin/Max
2. `CostBreakdown` → baseCost, overheadCosts, riskBufferAmount, profitMarginAmount
3. `ProjectBreakdown` → count of services + total hours (summary-only — this is what the spec replaces with per-service rows)

The new ReviewStep replaces `ProjectBreakdown`'s count-based display with individual `breakdown[]` rows (name, hours, cost each). `PriceDisplay` and `CostBreakdown` content migrates to the new ReviewStep layout.

Experience/geography multiplier cards (currently in ReviewStep, not LivePreview) are retained per clarification answer.

---

## Finding 6 — Constitution Deviation Justification

The project constitution (Development Workflow section) specifies: "Wizard UI: 3/4 left panel for step-by-step input, 1/4 right panel for live preview" and "Real-time accumulation: fee updates MUST be reflected immediately in the live preview panel."

This change removes the right panel. **Justification**: Implementation Plan Addendum v1.1, approved by CEO/Business Director on 2026-03-25, explicitly authorises Changes 5 and 6 which together require full removal of the right column. The real-time calculation (useMemo in WizardContext) is preserved — its output is now displayed on Step 6 rather than a persistent sidebar. The spirit of the principle (user sees calculation results) is maintained.

---

## Summary

| Item | Status |
|------|--------|
| Touch points | 4 files |
| Data model changes | None |
| API contract changes | None |
| New dependencies | None |
| Constitution gates | All pass (1 justified deviation — authorised by addendum v1.1) |
