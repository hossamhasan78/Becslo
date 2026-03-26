# Quickstart: Database Service Cleanup

**Branch**: `016-db-service-cleanup`
**Date**: 2026-03-26

---

## What This Change Does

Permanently removes two full service categories (Development, Marketing & Launch) and 19 individual non-design services from the 'Strategy & Research' and 'Design & UI/UX' categories via a single Supabase migration. Updates seed scripts so the deleted items cannot be re-introduced on a fresh database.

**Files to create:** 1 (migration)
**Files to modify:** 1 (seed script)
**Schema changes:** None (row deletions only)
**Source code changes:** None

---

## Prerequisites

- Supabase CLI installed and authenticated
- Local Supabase running (`supabase start`) or connected to staging
- Branch checked out: `016-db-service-cleanup`

---

## Implementation Order

### Step 1 — Create Migration File

**File to create**: `supabase/migrations/011_remove_non_design_services.sql`

The migration must execute in this exact order:
1. Delete `calculation_services` junction rows for all targeted services (defensive guard — prevents FK violation)
2. Delete the 'Development' and 'Marketing & Launch' categories (CASCADE removes all services in those categories)
3. Delete the 19 individual services from surviving categories

Migration must be **idempotent** — running it twice must not error.

---

### Step 2 — Update Seed Script

**File to modify**: `supabase/migrations/004_seed_data.sql`

Remove from the seed:
- Category inserts for 'Development' and 'Marketing & Launch'
- All service inserts for categories 3 (Development) and 4 (Marketing & Launch)
- The 4 individual service rows from Strategy & Research: Industry Trends Analysis, Messaging Framework, Pricing Strategy, Product Positioning
- The 15 individual service rows from Design & UI/UX: Banner & Ad Design, Brand Identity Design, Color Palette Creation, E-commerce Design, Empty State Design, Error State Design, Landing Page Design, Loading State Design, Logo Design, Motion Graphics, Packaging Design, Print Design, Social Media Graphics, Typography Selection, Video Editing

The surviving seed must produce exactly **2 categories** and **34 services**.

---

## Verify

```bash
# Run migration against local Supabase
supabase db push

# TypeScript check — should produce zero errors (no source changes)
npx tsc --noEmit

# Spot-check: count surviving categories and services
# Expected: 2 categories, 34 services
```

---

## Manual Test Checklist

- [ ] Migration runs without errors against the local database
- [ ] Category count after migration = 2 ('Strategy & Research', 'Design & UI/UX')
- [ ] Service count after migration = 34 total (16 + 18)
- [ ] 'Development' and 'Marketing & Launch' categories absent from admin dashboard
- [ ] None of the 19 individually deleted services appear in any category in the wizard
- [ ] Wizard service selection step loads and displays the correct 34 services
- [ ] Any pre-existing `calculations` rows are intact and unmodified (final_price unchanged)
- [ ] Seed scripts run against an empty database produce 0 deleted items
- [ ] Migration is idempotent — running it a second time completes without error

---

## Rollback

If the migration needs to be reversed (development only — this is a destructive migration with no automatic rollback):

```bash
# Restore seed data and re-run from scratch in local dev:
supabase db reset
```

> ⚠️ In production/staging: there is no automated rollback. A reverse migration re-inserting all deleted rows would be required. This is a destructive, one-way change.
