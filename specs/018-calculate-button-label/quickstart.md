# Quickstart: Step 5 — Relabel Next Button to 'Calculate'

**Feature Branch**: `018-calculate-button-label`
**Date**: 2026-03-28

---

## Touch Points

| File | Change |
|------|--------|
| `src/app/(wizard)/wizard/page.tsx` | Conditionally render "Calculate" on step 5, "Next Step" on steps 1–4 |

---

## Local Dev Setup

No migration or environment changes needed.

```bash
npm run dev
```

Navigate to `http://localhost:3000/wizard` — log in as a test user.

---

## Manual Verification Checklist

1. Navigate through the wizard to Step 5 (Risk & Profit).
2. Confirm the primary action button reads **"Calculate"** (not "Next Step").
3. Confirm the button is **disabled** if validation has not passed (e.g., required fields empty).
4. Click "Calculate" — confirm the wizard advances to **Step 6** (Results) with the full breakdown displayed.
5. Go back to any of Steps 1–4 — confirm the button reads **"Next Step"** on all of them.
6. Confirm the **Back** button on Step 5 still navigates to Step 4 unchanged.
