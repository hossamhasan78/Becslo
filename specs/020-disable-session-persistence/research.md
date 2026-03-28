# Research: Disable Wizard Session Persistence

**Feature**: 020-disable-session-persistence
**Date**: 2026-03-28
**Status**: Complete — no unknowns remain

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Authentication-First | ✅ N/A | No auth changes |
| II. Data Privacy & Analytics | ✅ Pass | `calculateAndSave` writes to DB at Step 6; persisted calculation records are entirely unaffected by this change |
| III. Monolithic Architecture | ✅ Pass | No new services, libraries, or dependencies introduced; this is a net reduction in code |
| IV. Admin-Configured Pricing | ✅ N/A | No pricing logic touched |
| V. MVP Incremental Development | ✅ Pass | Blocking launch requirement per Addendum v1.1 |
| Amendment v1.2 | ✅ Pass | `useMemo` real-time calculation in `WizardContext` is fully preserved; only the `useSessionStorage` persistence layer is removed |

---

## Touch Points

### Touch Point 1 — `src/lib/context/WizardContext.tsx`

**What**: Three changes in one file.

1. **Line 5** — Remove import:
   ```
   import { useSessionStorage } from '@/lib/hooks/useSessionStorage'
   ```

2. **Line 57** — Swap hook (one line):
   ```
   // Before:
   const [state, setState] = useSessionStorage<WizardState>('becslo_wizard_state', DEFAULT_WIZARD_STATE)
   // After:
   const [state, setState] = useState<WizardState>(DEFAULT_WIZARD_STATE)
   ```
   `useState` is already imported on line 3 — no new import needed.

3. **Lines 166–169** — Remove dead empty block in `resetWizard`:
   ```typescript
   // Before:
   const resetWizard = useCallback(() => {
     setState(DEFAULT_WIZARD_STATE)
     if (typeof window !== 'undefined') {
     }
   }, [setState])

   // After:
   const resetWizard = useCallback(() => {
     setState(DEFAULT_WIZARD_STATE)
   }, [setState])
   ```
   This empty block was leftover from when `resetWizard` previously called `sessionStorage.removeItem(...)`.

**Decision**: `useState` is the correct replacement — it provides the same `[value, setter]` tuple API as `useSessionStorage`, so all downstream call sites (`updateState`, `goToNextStep`, etc.) require zero changes.

---

### Touch Point 2 — `src/lib/hooks/useSessionStorage.ts`

**What**: Delete the file entirely.

**Rationale**: `useSessionStorage` is imported **only** by `WizardContext.tsx` (verified via full-project grep). After Touch Point 1, no file imports it. Deleting the file:
- Satisfies FR-002 (no browser storage read/write survives reload)
- Eliminates the pre-existing `react-hooks/set-state-in-effect` lint error (line 13) which had been present since the hook was written
- Net lint improvement: 3 errors → 2 errors

**Alternative considered**: Keep the file but leave it unused. Rejected — unused files add noise and the lint error would persist.

---

## No Data Model Changes

No schema, table, migration, or API changes needed. The change is entirely confined to client-side React state management.

## No API Contract Changes

No API routes are added, modified, or removed.

---

## Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Replacement for `useSessionStorage` | `useState` | Already imported; identical tuple API; initialises from `DEFAULT_WIZARD_STATE` unconditionally |
| `useSessionStorage.ts` file | Delete | Only consumer removed; pre-existing lint error also resolved |
| `resetWizard` empty block | Remove | Dead code; leftover from previous storage-clearing logic |
| Warning dialog on reload | None | Explicitly out of scope per spec FR-005 and Change 7 intent |
