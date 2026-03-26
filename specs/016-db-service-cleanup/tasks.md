# Tasks: Database Service Cleanup

**Input**: Design documents from `/specs/016-db-service-cleanup/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. This feature is SQL/seed-only — zero TypeScript or React source files change.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Write the migration file and update the seed script. Both must be complete before any user story verification can begin. The migration file (T001) and the seed update (T002) touch different files and can be written in parallel.

**⚠️ CRITICAL**: All user story verification phases depend on T001 and T002 being complete and correct.

[X] T001

[X] T002 [P]

**Checkpoint**: `011_remove_non_design_services.sql` exists and is syntactically correct. `004_seed_data.sql` retains exactly 2 categories (Strategy & Research, Design & UI/UX) and 34 services.

---

## Phase 2: User Story 1 — Wizard Shows Only Product Design Services (Priority: P1) 🎯 MVP

**Goal**: After running the migration, the wizard Service Selection step and admin dashboard show only the 34 surviving design services. No Development or Marketing & Launch services appear anywhere in the product.

**Independent Test**: Run `supabase db push` to apply the migration. Open the wizard as a logged-in user, navigate to Step 1 (Service Selection), and confirm only the 2 surviving categories and 34 services appear. Check the admin services page confirms the same.

### Implementation for User Story 1

- [X] T003 [US1] Run the migration against the local Supabase instance: execute `supabase db push` from the repo root and confirm it completes without errors — if errors occur, check FK constraint order in T001 and fix before proceeding

- [X] T004 [P] [US1] Verify the post-migration database state: query `SELECT name FROM public.categories ORDER BY display_order` — must return exactly `['Strategy & Research', 'Design & UI/UX']`; query `SELECT COUNT(*) FROM public.services` — must return `34`; query `SELECT COUNT(*) FROM public.services WHERE category_id IN (SELECT id FROM public.categories WHERE name IN ('Development', 'Marketing & Launch'))` — must return `0`

- [X] T005 [P] [US1] Verify wizard and admin UI reflect the post-migration catalogue: open the running dev server at `/wizard`, navigate to Step 1 (Service Selection), confirm no service from Development or Marketing & Launch categories appears; open the admin services page at `/admin/services`, confirm the deleted categories and services are absent from all listings; optionally verify directly via API: `GET /api/v1/services` and `GET /api/v1/categories` must return only the 34 surviving services across 2 categories (covers SC-002)

**Checkpoint**: Wizard opens at Service Selection and shows only the 34 surviving design services. 'Development' and 'Marketing & Launch' categories are absent from all product views.

---

## Phase 3: User Story 2 — Historical Calculations Remain Intact (Priority: P2)

**Goal**: After the migration, all pre-existing `calculations` rows remain in the database with their original `final_price` values. No calculation records have been deleted or modified as a side effect of the service cleanup.

**Independent Test**: Query the `calculations` table before and after migration to confirm row count and `final_price` sums are identical. Query `calculation_services` to confirm no junction rows reference deleted service IDs.

> **Note**: Phase 3 can run immediately after Phase 2 (T003) completes — T001 is the only prerequisite.

### Implementation for User Story 2

[X] T006

[X] T007 [P]

**Checkpoint**: Zero `calculations` rows deleted. Zero orphaned `calculation_services` rows. Historical data integrity confirmed.

---

## Phase 4: User Story 3 — Seed Scripts Cannot Restore Removed Services (Priority: P3)

**Goal**: After T002 updates the seed file, running `supabase db reset` (which replays all migrations from scratch including the seed) produces a database containing exactly 2 categories and 34 services — none of the deleted items are present.

**Independent Test**: Run `supabase db reset` against a local instance. Query categories and services to confirm only the surviving 34 appear.

> **Note**: Phase 4 only depends on T002 being complete.

[ ] T008

- [X] T008 [US3]
**Checkpoint**: Fresh database from seed contains exactly 2 categories and 34 services. No deleted item is re-introduced.

---

## Phase 5: Polish & Verification

**Purpose**: Cross-cutting validation confirming all three stories work together and the migration is production-safe.

- [ ] T009 Verify migration idempotency: run `supabase db push` a second time against the already-migrated local database — the migration must complete without errors and the service count must remain 34 (no data loss from re-run)

- [ ] T010 [P] Run TypeScript type-check from the repo root (`npx tsc --noEmit`) — must produce zero errors; no source code was modified by this feature but this confirms the DB-only change has no downstream type impact

---

## Dependencies & Execution Order

### Phase Dependencies

```
T001 (write migration)
  └── T003 (run migration) → T004 [P] (DB verify) → T006 (calculations check)
                           → T005 [P] (UI verify)   → T007 [P] (orphan check)
                           → T009 (idempotency)

T002 [P] (update seed)
  └── T008 (seed reset verify)

All complete → T010 (tsc check)
```

- **T001**: No dependencies — start here
- **T002**: No dependencies — can run in parallel with T001 (different file)
- **T003**: Depends on T001 only
- **T004, T005**: Depend on T003 — can run in parallel (different checks)
- **T006, T007**: Depend on T003 — can run in parallel (different tables)
- **T008**: Depends on T002 only — independent of T001/T003
- **T009**: Depends on T003 (migration must have run first)
- **T010**: No file dependencies — can run any time after T001/T002 are written

### User Story Dependencies

- **US1 (P1)**: Depends on T001 (migration written and run)
- **US2 (P2)**: Depends on T001 (migration run) — independent of US1 tasks
- **US3 (P3)**: Depends on T002 (seed updated) — fully independent of US1 and US2

### Parallel Opportunities

- **T001 and T002** can be written simultaneously (different files)
- **T004 and T005** can both run after T003 (different verification checks)
- **T006 and T007** can both run after T003 (different table queries)
- **T009 and T010** can run together in the polish phase

---

## Parallel Execution Example

```bash
# Phase 1: Launch both in parallel:

Task A: "Write supabase/migrations/011_remove_non_design_services.sql"
  ── 3-step FK-safe DELETE sequence

Task B: "Update supabase/migrations/004_seed_data.sql"
  ── Remove 2 categories + ~89 service rows from seed

# Phase 2: After T001 (migration written), run it:
Task C: "supabase db push" → verify no errors

# Phase 2 verify: After T003, launch in parallel:
Task D: "Query DB — verify 2 categories, 34 services"
Task E: "Open wizard — verify UI shows correct services"

# Phase 3 verify: After T003, launch in parallel:
Task F: "Query calculations — verify rows intact"
Task G: "Query calculation_services — verify no orphans"

# Phase 4 verify: After T002:
Task H: "supabase db reset — verify seed produces 34 services"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (write migration) + T002 (update seed) — in parallel
2. Complete T003 (run migration)
3. Complete T004 + T005 (verify US1) — in parallel
4. **STOP and VALIDATE**: Wizard shows only design services → **US1 delivered**
5. Continue to US2 and US3 verification immediately after

### Incremental Delivery

1. T001 + T002 → Migration and seed ready
2. T003 → Migration applied → US1 deliverable
3. T004 + T005 → US1 verified
4. T006 + T007 → US2 verified (data integrity confirmed)
5. T008 → US3 verified (seed integrity confirmed)
6. T009 + T010 → Production safety confirmed → ready to merge

### Suggested MVP Scope

US1 (P1) is the minimum shippable increment. The reduced service catalogue is immediately visible in the wizard. US2 (data integrity) and US3 (seed hygiene) are verification steps that complete the feature but do not block the P1 outcome from being shipped.

---

## Notes

- [P] tasks = different files or independent checks, safe to run simultaneously
- T001 is the single most critical task — the SQL execution order must be correct (junction → category → individual)
- T002 can proceed in parallel — it edits a different file (seed script)
- T008 (`supabase db reset`) will replay ALL migrations from scratch — only safe in local dev
- No source code files (TypeScript/React) are modified by this feature
- After T001 completes, no migration file is ever modified again — it is an immutable versioned record
- Commit order suggestion: T001 + T002 together → T003 (migration applied, documented in PR) → T004–T010 (verification noted in PR description)
