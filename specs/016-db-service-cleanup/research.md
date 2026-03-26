# Research: Database Service Cleanup

**Branch**: `016-db-service-cleanup`
**Date**: 2026-03-26
**Purpose**: Resolve all technical unknowns before writing the implementation plan.

---

## Finding 1 — FK Constraint Chain Governs Execution Order

**Decision**: The migration must delete `calculation_services` junction rows first, then categories (with cascade to services), then individual services.

**Rationale**: The schema has two relevant FK constraints:
- `services.category_id → categories.id ON DELETE CASCADE` — deleting a category auto-deletes its services.
- `calculation_services.service_id → services.id ON DELETE RESTRICT` — a service row cannot be deleted while any `calculation_services` rows reference it. This blocks the category CASCADE from completing if junction records exist.

**Correct execution order**:
1. DELETE from `calculation_services` WHERE `service_id` is in the set of services to be removed (includes all services in the two target categories plus the 19 individual services).
2. DELETE from `categories` WHERE name IN ('Development', 'Marketing & Launch') — cascades to all their services automatically.
3. DELETE from `services` WHERE name IN (the 19 individual services) — only services in surviving categories remain to clean up here; the cascade in step 2 handles the category-level deletions.

**Alternatives considered**: Using `ON DELETE CASCADE` for `calculation_services.service_id` at migration time was considered but rejected — changing FK behaviour is a schema change with broader implications and is out of scope.

---

## Finding 2 — Idempotency via Name-Based DELETE

**Decision**: Use `DELETE FROM ... WHERE name IN (...)` targeting names, not IDs. The subquery for `calculation_services` cleanup also targets names, not hardcoded IDs.

**Rationale**: Service IDs are auto-incremented integers that may differ between environments (dev, staging, prod). Using names makes the migration portable and correct across all environments. Since `DELETE` on a `WHERE` clause that matches zero rows is a no-op (no error), name-based deletes are inherently idempotent.

**`calculation_services` cleanup subquery**:
```sql
DELETE FROM public.calculation_services
WHERE service_id IN (
  SELECT s.id FROM public.services s
  JOIN public.categories c ON s.category_id = c.id
  WHERE c.name IN ('Development', 'Marketing & Launch')
  UNION
  SELECT s.id FROM public.services s
  JOIN public.categories c ON s.category_id = c.id
  WHERE c.name IN ('Strategy & Research', 'Design & UI/UX')
    AND s.name IN (
      'Industry Trends Analysis', 'Messaging Framework', 'Pricing Strategy', 'Product Positioning',
      'Banner & Ad Design', 'Brand Identity Design', 'Color Palette Creation', 'E-commerce Design',
      'Empty State Design', 'Error State Design', 'Landing Page Design', 'Loading State Design',
      'Logo Design', 'Motion Graphics', 'Packaging Design', 'Print Design',
      'Social Media Graphics', 'Typography Selection', 'Video Editing'
    )
);
```
If all services are already deleted when this runs, the subquery returns no IDs and the DELETE is a safe no-op.

**Alternatives considered**: Pre-capturing service IDs into a temp table was considered but adds unnecessary complexity for a small, bounded set.

---

## Finding 3 — Migration File Naming

**Decision**: Name the new migration `011_remove_non_design_services.sql`.

**Rationale**: Existing migrations follow a `NNN_descriptive_name.sql` pattern (`001_init_schema.sql` through `010_add_config_version_column.sql`). The next available number is `011`. The descriptive name matches the addendum's suggested name `remove_non_design_services`.

**Alternatives considered**: Timestamp-prefix naming (like `20260318_seed_data_additional.sql`) is used inconsistently for the additional seed file. The numeric prefix convention is used for all structural migrations and is clearer for ordering.

---

## Finding 4 — Only One Seed File Contains Service/Category Data

**Decision**: Only `supabase/migrations/004_seed_data.sql` requires updating. `supabase/migrations/20260318_seed_data_additional.sql` only contains country data and is unaffected.

**Rationale**: Grepping the migration files confirms that all category and service `INSERT` statements are in `004_seed_data.sql`. The additional seed file adds extra countries via `ON CONFLICT DO NOTHING` and has no service rows.

**Seed file changes required**:
- Remove the two `insert` entries for categories 'Development' and 'Marketing & Launch'.
- Remove all service rows for categories 3 (Development) and 4 (Marketing & Launch) — approximately 40 + 30 = 70 rows.
- Remove the 4 individual service rows from Strategy & Research.
- Remove the 15 individual service rows from Design & UI/UX.

---

## Finding 5 — No Source Code Changes Required

**Decision**: Zero TypeScript/React files need to be modified for this change.

**Rationale**: All source code that lists services or categories queries the database at runtime:
- Wizard: `ServiceSelectionStep` fetches from `/api/v1/services` and `/api/v1/categories`.
- Admin dashboard: `ServicesTable`, `ServiceForm` fetch from `/api/admin/services`.
- Analytics: pulls from calculations table, not the service catalogue directly.

After the migration deletes the rows, all these queries will automatically return the reduced set. No hardcoded service lists exist in source code.

**Alternatives considered**: N/A — no source code change is architecturally necessary.

---

## Finding 6 — Surviving Service Catalogue (34 services across 2 categories)

**Strategy & Research — 16 surviving services** (20 original − 4 deleted):

| Deleted | Surviving |
|---------|-----------|
| Industry Trends Analysis | Brand Strategy |
| Messaging Framework | Market Research |
| Pricing Strategy | Competitor Analysis |
| Product Positioning | User Research |
| | Value Proposition Development |
| | Customer Persona Creation |
| | User Journey Mapping |
| | Information Architecture |
| | Content Strategy |
| | SEO Strategy |
| | Analytics Setup |
| | Product Roadmap Planning |
| | Feature Prioritization |
| | Usability Testing Plan |
| | Accessibility Audit |
| | Brand Voice & Tone |

**Design & UI/UX — 18 surviving services** (33 original − 15 deleted):

| Deleted | Surviving |
|---------|-----------|
| Banner & Ad Design | Icon Set Design |
| Brand Identity Design | UI Design - Web |
| Color Palette Creation | UI Design - Mobile |
| E-commerce Design | UX Design - Wireframes |
| Empty State Design | UX Design - Prototyping |
| Error State Design | Design System Creation |
| Landing Page Design | Component Library |
| Loading State Design | Dashboard Design |
| Logo Design | App Screen Design |
| Motion Graphics | Illustration Design |
| Packaging Design | Photo Editing |
| Print Design | Presentation Design |
| Social Media Graphics | Animation |
| Typography Selection | 3D Modeling |
| Video Editing | Icon Animation |
| | User Onboarding Design |
| | Accessibility Design Review |
| | Design Handoff |
