# Quickstart Verification: Disable Wizard Session Persistence

**Feature**: 020-disable-session-persistence
**Date**: 2026-03-28

---

## Pre-Implementation Checklist

- [ ] On branch `020-disable-session-persistence`
- [ ] `WizardContext.tsx` is the only file that imports `useSessionStorage` (verified — grep confirms 2 files: WizardContext.tsx and useSessionStorage.ts itself)

---

## Post-Implementation Verification Steps

### Step 1 — Code Change Verification

- [ ] `WizardContext.tsx` line importing `useSessionStorage` is removed
- [ ] `WizardContext.tsx` state declaration uses `useState<WizardState>(DEFAULT_WIZARD_STATE)` (not `useSessionStorage`)
- [ ] `resetWizard` contains no empty `if (typeof window !== 'undefined') {}` block
- [ ] `src/lib/hooks/useSessionStorage.ts` file is deleted

### Step 2 — TypeScript / Lint

- [ ] `npm run lint` passes with no new errors introduced by this change
- [ ] The pre-existing `react-hooks/set-state-in-effect` error on `useSessionStorage.ts` is **gone** (file deleted)

### Step 3 — Reload Behaviour (SC-001)

- [ ] Open the wizard and advance to Step 3 with at least one service selected
- [ ] Refresh the browser (F5 or Ctrl+R)
- [ ] Wizard shows **Step 1** with all fields blank — no previously entered values visible

### Step 4 — Browser Storage Empty (SC-002)

- [ ] Open browser DevTools → Application → Session Storage
- [ ] After a reload, confirm the key `becslo_wizard_state` is **absent** from session storage

### Step 5 — Database Records Intact (SC-003)

- [ ] Complete a full wizard run and confirm it saves (Step 6)
- [ ] Reload the page
- [ ] Check the admin dashboard — the saved calculation record is still present and unchanged

### Step 6 — Navigation-Away Reset (US2)

- [ ] Complete the wizard to Step 6
- [ ] Navigate to `/login` or another route
- [ ] Navigate back to `/wizard`
- [ ] Confirm Step 1 is shown with blank fields

---

## Definition of Done

All 6 steps above pass. `npm run lint` reports no new errors. Lint error count is equal to or less than the pre-change count (pre-existing errors in other files are excluded).
