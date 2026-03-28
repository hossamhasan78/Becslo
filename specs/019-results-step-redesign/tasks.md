# Tasks: Results Step Redesign (Step 6)

**Input**: Design documents from `/specs/019-results-step-redesign/`
**Prerequisites**: spec.md ✅, research.md ✅ (serves as plan.md substitute — no schema/type/dependency changes), quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Three user stories, all P1. US3 (remove right column) is a pure layout change that runs in parallel with no other story dependencies. US1 (ReviewStep rewrite) is the primary content task; US2 (PDF button on Step 6) is subsumed into US1 — the page.tsx navigation already has the Download PDF button, and the ReviewStep rewrite removes the duplicate embedded buttons. No foundational phase needed: no schema changes, no type changes, no new dependencies.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: User Story 3 — Right-Column Live Preview Removed (Priority: P1) 🎯

**Goal**: Remove the right-column live preview panel from all wizard steps. The wizard occupies full available width. No pricing figures shown on Steps 1–5.

**Independent Test**: Navigate through all 6 wizard steps. Confirm no right-column panel is visible at any step. Confirm wizard content fills full width with no layout gap or artifact.

### Implementation for User Story 3

- [ ] T001 [P] [US3] Rewrite `src/components/wizard/WizardLayout.tsx` to remove all right-column code: (1) Remove `rightPanel` from `WizardLayoutProps` interface and from destructured params; (2) Remove `const [showMobilePreview, setShowMobilePreview] = useState(false)` and the `useState` import if unused; (3) Remove the `${showMobilePreview ? 'hidden md:block' : 'block'}` conditional class from `<main>` — replace with plain `block`; (4) Remove the entire `<aside>` element and all its children (mobile close button, `{rightPanel}`); (5) Remove the entire mobile toggle `<button>` block (the one with the chart icon and `setShowMobilePreview(true)`)

- [ ] T002 [P] [US3] Update `src/app/(wizard)/wizard/page.tsx` to remove LivePreview: (1) Delete the line `import LivePreview from '@/components/wizard/LivePreview'`; (2) In the loading-state `<WizardLayout>` (line ~105), remove the `rightPanel={<div className="animate-pulse bg-zinc-50 rounded-3xl h-full w-full" />}` prop; (3) In the error-state `<WizardLayout>` (line ~119), remove the `rightPanel={<div className="bg-zinc-50 rounded-3xl h-full w-full" />}` prop; (4) In the main `<WizardLayout>` (line ~158), remove the `rightPanel={<LivePreview />}` prop

- [ ] T003 [P] [US3] Delete `src/components/wizard/LivePreview.tsx` — this file will no longer be imported or rendered anywhere after T002 is applied; simply delete the file

**Checkpoint**: Run `npm run lint` (TypeScript compile check). No errors. Open wizard in browser — no right panel visible on any step. Layout is full-width.

---

## Phase 2: User Story 1 — Full Calculation Breakdown on Step 6 (Priority: P1) 🎯

**Goal**: Replace the current summary-only ReviewStep with a full calculation breakdown. Each selected service is listed individually (name, hours, cost). Each user-entered overhead cost is listed individually (name, amount, or "no costs" message). Experience and geography multipliers are displayed. Full pricing summary (subtotal, risk buffer, profit margin, final price) is shown. Recommended ±20% price range is shown.

**Independent Test**: Complete the wizard with 2+ services and 1+ overhead cost. On Step 6 confirm: (a) each service appears as its own row with name, hours, and cost; (b) the overhead cost appears with its category name and amount; (c) subtotal, risk buffer, profit margin, final price, and recommended range are all visible; (d) no "Project Preview" label, service count, or summary-only presentation remains.

### Implementation for User Story 1 + User Story 2

- [X] T004 [US1] [US2] Rewrite `src/components/wizard/steps/ReviewStep.tsx` as a full calculation breakdown display. The rewrite must:
- **T005**: Depends on T001–T004 complete

### Parallel Opportunities

```
# US3 tasks — all in parallel:
T001: WizardLayout.tsx (remove rightPanel)
T002: page.tsx (remove LivePreview import + rightPanel props)
T003: Delete LivePreview.tsx

# US1 task — after T002:
T004: ReviewStep.tsx (complete rewrite)
```

---

## Implementation Strategy

### MVP First (all stories are P1 — deliver together)

1. Complete T001 + T002 + T003 in parallel (US3 — layout change)
2. Complete T004 (US1 + US2 — ReviewStep rewrite)
3. Complete T005 (verification)
4. **STOP and VALIDATE**: Walk through quickstart.md checklist manually

### Total: 5 tasks across 3 phases

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|----------|
| Phase 1 | US3 | T001, T002, T003 | Yes (all 3) |
| Phase 2 | US1 + US2 | T004 | No |
| Phase 3 | — | T005 | No |
- [X] T005 End-to-end verification per `specs/019-results-step-redesign/quickstart.md` checklist: (1) Navigate Steps 1–6 and confirm no right-column panel at any step; (2) Complete wizard with 2+ services and 1+ overhead cost; (3) On Step 6 confirm per-service rows, per-cost rows, multipliers, pricing summary, recommended range are all present; (4) Confirm "Download PDF" button is in navigation footer on Step 6; (5) Confirm Steps 1–5 show no pricing figures; (6) Complete wizard with no overhead costs and confirm "no costs" message on Step 6
