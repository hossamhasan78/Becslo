# Tasks: Disable Wizard Session Persistence

**Input**: Design documents from `/specs/020-disable-session-persistence/`
**Prerequisites**: spec.md ✅, research.md ✅ (serves as plan.md substitute — no schema/type/dependency changes), quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Two user stories (US1: reload resets state; US2: navigation-away resets state) are served by the **exact same code change** — they are inseparable. Both are delivered together in Phase 1. No setup or foundational phase needed: no schema changes, no new dependencies, no type changes. The entire change is 3 edits in one file and deletion of one file.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: User Story 1 + User Story 2 — Wizard Resets on Reload and Navigation (Priority: P1 + P2) 🎯

**Goal**: Replace `useSessionStorage` with in-memory `useState` in `WizardContext`. After this change, every page load/reload starts the wizard at Step 1 with blank state. No browser storage is read or written.

**Independent Test**: Open the wizard, advance to Step 3 with a service selected, refresh the page. Confirm Step 1 loads with all fields blank. Open DevTools → Application → Session Storage and confirm `becslo_wizard_state` key is absent.

### Implementation for User Story 1 + User Story 2

- [X] T001 [US1] [US2] Update `src/lib/context/WizardContext.tsx`: (1) Remove the import line `import { useSessionStorage } from '@/lib/hooks/useSessionStorage'`; (2) On line 57, replace `const [state, setState] = useSessionStorage<WizardState>('becslo_wizard_state', DEFAULT_WIZARD_STATE)` with `const [state, setState] = useState<WizardState>(DEFAULT_WIZARD_STATE)` — `useState` is already imported on line 3, no new import needed

- [X] T002 [US1] [US2] Clean up dead code in `src/lib/context/WizardContext.tsx`: In the `resetWizard` callback (lines 165–169), remove the empty `if (typeof window !== 'undefined') {}` block — it was previously used to clear session storage and is now a no-op. The result should be: `const resetWizard = useCallback(() => { setState(DEFAULT_WIZARD_STATE) }, [setState])`

- [X] T003 [P] [US1] [US2] Delete `src/lib/hooks/useSessionStorage.ts` — after T001 removes the only import, this file has no remaining consumers anywhere in the project (confirmed by grep). T003 targets a different file from T002 and can run in parallel with T002 once T001 is complete. Deleting it also eliminates the pre-existing `react-hooks/set-state-in-effect` lint error (line 13 of that file)

- [X] T004 Run `npm run lint` and confirm: (1) no new errors introduced by T001–T003; (2) the pre-existing `react-hooks/set-state-in-effect` error previously on `useSessionStorage.ts` is gone (file deleted); (3) total error count is equal to or less than the pre-change count — satisfies SC-004

**Checkpoint**: T001–T004 complete. Open wizard in browser and reload at any step — Step 1 must appear with blank fields.

---

## Phase 2: Verification

**Goal**: Confirm all acceptance criteria and success criteria from the spec are met.

- [ ] T005 End-to-end verification per `specs/020-disable-session-persistence/quickstart.md` checklist: (1) Advance to Step 3, refresh, confirm Step 1 blank; (2) Inspect browser DevTools session storage — `becslo_wizard_state` key absent; (3) Complete a full wizard run, reload, confirm saved DB record intact in admin dashboard; (4) Complete wizard, navigate to `/login`, return to `/wizard`, confirm Step 1 blank

---

## Parallel Opportunities

```
# US1 + US2 — T001 must run first (removes import):
T001: WizardContext.tsx (remove import + swap hook)

# After T001, T002 and T003 can run in parallel (different files):
T002: WizardContext.tsx (clean up resetWizard dead block)
T003: Delete useSessionStorage.ts [P]

# After T002 + T003:
T004: Run npm run lint — verify SC-004
T005: End-to-end verification
```

---

## Implementation Strategy

### Total: 5 tasks across 2 phases

| Phase | Stories | Tasks | Parallel |
|-------|---------|-------|----------|
| Phase 1 | US1 + US2 | T001, T002, T003, T004 | T002 + T003 parallel after T001 |
| Phase 2 | — | T005 | No |

### MVP First (all stories are P1/P2 — deliver together)

1. Complete T001 (removes import, swaps hook — must be first)
2. Complete T002 and T003 in parallel (different files, both unblock after T001)
3. Complete T004 (lint check — SC-004 gate)
4. Complete T005 (end-to-end verification)
5. **STOP and VALIDATE**: Walk through quickstart.md checklist manually
