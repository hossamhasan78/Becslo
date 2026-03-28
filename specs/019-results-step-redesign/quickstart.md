# Quickstart: Results Step Redesign (Step 6)

**Feature Branch**: `019-results-step-redesign`
**Date**: 2026-03-28

---

## Touch Points

| File | Change |
|------|--------|
| `src/components/wizard/WizardLayout.tsx` | Remove `rightPanel` prop, `<aside>` sidebar, and mobile toggle button; make wizard full-width |
| `src/app/(wizard)/wizard/page.tsx` | Remove `rightPanel={<LivePreview />}` prop and `LivePreview` import |
| `src/components/wizard/steps/ReviewStep.tsx` | Complete rewrite — full breakdown (per-service rows, overhead costs, pricing summary, recommended range) |
| `src/components/wizard/LivePreview.tsx` | Delete — no longer rendered anywhere |

---

## Local Dev Setup

No migration or environment changes needed.

```bash
npm run dev
```

Navigate to `http://localhost:3000/wizard` — log in as a test user.

---

## Manual Verification Checklist

### Right Column Removal (all steps)

1. Navigate the wizard through Steps 1–6 in sequence.
2. At **every step**, confirm no right-column preview panel is visible.
3. Confirm the wizard content fills the full available width — no visual gap or empty space on the right.

### Step 6 — Full Breakdown Display

4. Complete the wizard with **at least 2 services** selected and **at least 1 overhead cost** entered.
5. On Step 6, confirm each selected service appears as its own row showing: **service name**, **hours**, and **cost**.
6. Confirm the overhead cost appears as its own row showing: **cost category name** and **amount in USD**.
7. Confirm the following are all visible: **subtotal**, **risk buffer amount**, **profit margin amount**, **final price (USD)**.
8. Confirm the **experience multiplier** (×N) and **geography multiplier** (×N) are displayed below the service breakdown.
9. Confirm the **recommended price range** is shown: min (−20% of final price) and max (+20% of final price), both in USD.
10. Confirm **no "Project Preview" label**, service count, or summary-only presentation remains.

### Step 6 — Download PDF Button

11. Confirm a **"Download PDF"** button is visible on Step 6 (in the navigation footer).
12. Confirm **no PDF export button** is present on Steps 1–5.

### Edge Cases

13. Complete the wizard with **no overhead costs** entered. On Step 6, confirm the costs section shows a **"no costs"** indicator (not an empty table or blank space).
14. Complete the wizard with **1 service**. Confirm exactly **1 row** appears in the services section.
15. Verify the recommended min equals `finalPrice × 0.8` rounded to the nearest dollar, and max equals `finalPrice × 1.2` rounded to the nearest dollar.
