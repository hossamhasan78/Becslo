# Implementation Plan: Database Service Cleanup

**Branch**: `016-db-service-cleanup` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-db-service-cleanup/spec.md`

---

## Summary

Permanently remove two entire service categories ('Development', 'Marketing & Launch') and 19 individual non-design services from the 'Strategy & Research' and 'Design & UI/UX' categories via a single idempotent Supabase migration. Update seed scripts so deleted items cannot be re-introduced. No source code changes, no schema changes, no API contract changes — only row-level deletions in the database and a seed script cleanup.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 (NextJS 14.x App Router)
**Primary Dependencies**: NextJS 14, Supabase JS client, Supabase CLI (migration runner)
**Storage**: Supabase PostgreSQL — `categories`, `services`, `calculation_services` tables
**Testing**: Vitest (unit), Playwright (E2E) — no new tests needed; existing tests unaffected by row deletions
**Target Platform**: Vercel (serverless) + Supabase Cloud
**Project Type**: Web application monolith
**Performance Goals**: N/A — one-time migration, no runtime performance targets
**Constraints**: All DB changes via Supabase migrations (Constitution Deployment Process); no new source files outside `supabase/migrations/`
**Scale/Scope**: 2 files modified/created; 98 rows deleted (46 Development + 33 Marketing & Launch + 19 individual); 0 schema changes; 0 TypeScript changes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Authentication-First | ✅ Pass | No auth changes; wizard and admin remain fully auth-gated |
| II. Data Privacy & Analytics | ✅ Pass | Historical `calculations` rows are explicitly preserved (FR-007); only junction rows for deleted services are cleaned up |
| III. Monolithic Architecture | ✅ Pass | Change is a Supabase migration file — no new services, no new dependencies |
| IV. Admin-Configured Pricing | ✅ Pass | Remaining 34 services remain fully manageable via admin dashboard; this migration only removes the non-design subset |
| V. MVP Incremental Development | ✅ Pass | This is a prerequisite data cleanup enabling the correct service list for the wizard |

**All gates pass. No violations.**

---

## Project Structure

### Documentation (this feature)

```text
specs/016-db-service-cleanup/
├── plan.md                        # This file
├── research.md                    # Phase 0 output ✅
├── data-model.md                  # Phase 1 output ✅
├── quickstart.md                  # Phase 1 output ✅
├── contracts/
│   └── api-response-contract.md  # Phase 1 output ✅
├── checklists/
│   └── requirements.md            # Spec quality checklist ✅
└── tasks.md                       # Phase 2 output (not yet created)
```

### Source Code (files affected)

```text
supabase/
└── migrations/
    ├── 004_seed_data.sql            # MODIFY — remove deleted services/categories
    └── 011_remove_non_design_services.sql  # CREATE — new migration

# No changes to:
src/                    # All service/category queries are dynamic DB reads
tests/                  # No test files affected
```

**Structure Decision**: Single project layout (Option 1). Only two files change — a new SQL migration and an update to the existing seed script. No TypeScript or React files require modification.

---

## Phase 0: Research Findings

All technical unknowns resolved. See [`research.md`](./research.md) for full details.

| Finding | Resolution |
|---------|-----------|
| FK constraint chain | `calculation_services` must be cleaned up before services are deleted due to `ON DELETE RESTRICT` |
| Idempotency | Name-based `WHERE ... IN (...)` deletes are safe no-ops when rows are already absent |
| Migration naming | `011_remove_non_design_services.sql` (next in sequence after `010_`) |
| Seed files affected | Only `004_seed_data.sql` — `20260318_seed_data_additional.sql` is countries only |
| Source code changes | Zero — all service/category queries are dynamic DB reads |
| Surviving catalogue | 2 categories, 34 services (16 in Strategy & Research, 18 in Design & UI/UX) |

---

## Phase 1: Design Artifacts

All Phase 1 artifacts generated. See linked files for full detail.

### Data Model Summary

No schema changes. Row deletions only:

| Table | Change |
|-------|--------|
| `categories` | Delete 2 rows ('Development', 'Marketing & Launch') |
| `services` | Delete ~89 rows (category cascade + 19 individual deletions) |
| `calculation_services` | Delete any rows referencing deleted service IDs (defensive; expected 0 in production) |
| `calculations` | No change — rows preserved with original `final_price` |

See [`data-model.md`](./data-model.md) for the full before/after service list.

### Deletion Execution Order (critical)

```
1. DELETE calculation_services WHERE service_id IN (targeted services)
2. DELETE categories WHERE name IN ('Development', 'Marketing & Launch')  ← cascades to services
3. DELETE services WHERE name IN (19 individual services) AND in surviving categories
```

### Contracts

API response shapes are unchanged. Endpoints return fewer rows after migration. See [`contracts/api-response-contract.md`](./contracts/api-response-contract.md).

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deletion method | Hard DELETE (not is_active flag) | Addendum explicitly requires permanent removal |
| FK handling | Auto-delete junction rows, continue | Clarified in session 2026-03-26 — preserve parent calculations |
| Migration idempotency | Name-based WHERE clauses | Environment-safe; no-op when rows already absent |
| Source code changes | None | All queries are dynamic DB reads; UI reflects DB state automatically |
| Seed file rollback risk | Documented in quickstart | One-way destructive change; local `supabase db reset` is the only recovery path |
