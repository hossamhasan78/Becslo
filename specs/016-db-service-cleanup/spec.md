# Feature Specification: Database Service Cleanup

**Feature Branch**: `016-db-service-cleanup`
**Created**: 2026-03-26
**Status**: Draft
**Input**: Change 2 — Database Service Cleanup from `docs/IMPLEMENTATION_PLAN_ADDENDUM_v1.1.md`

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Wizard Shows Only Product Design Services (Priority: P1) 🎯 MVP

A freelance product designer opens the wizard's Service Selection step. The service list contains only product design and UX-related services — no software development services, no marketing services, and none of the non-design items listed for removal. The designer can build an accurate quote without having to scroll past irrelevant services.

**Why this priority**: This is the primary business outcome of the change. The wizard exists to quote product design work. Services outside that scope produce inaccurate quotes and reduce the credibility of the tool.

**Independent Test**: Open the wizard as a logged-in user. Navigate to Step 1 (Service Selection). Inspect the complete list of available services — none of the removed services appear. The two surviving categories (Strategy & Research, Design & UI/UX) contain only the retained services.

**Acceptance Scenarios**:

1. **Given** a logged-in designer on the Service Selection step, **When** the service list loads, **Then** no service from the 'Development' or 'Marketing & Launch' categories appears.
2. **Given** a logged-in designer on the Service Selection step, **When** the service list loads, **Then** none of the 19 individually removed services (e.g., Logo Design, Motion Graphics, Video Editing, Social Media Graphics) appear in any category.
3. **Given** an admin viewing service data via the admin dashboard, **When** they browse categories and services, **Then** the deleted categories and services are absent.

---

### User Story 2 — Historical Calculations Remain Intact (Priority: P2)

A designer who previously completed a quote that included a now-removed service (e.g., Logo Design or Social Media Graphics) can still view that historical calculation. The removal of services from the catalogue does not erase prior calculations or break the calculation history view.

**Why this priority**: Data integrity is non-negotiable. Destroying historical records to perform a catalogue cleanup would be unacceptable and a potential audit failure.

**Independent Test**: If any calculations exist that reference removed services, verify they remain visible and correctly display all historical line items after the migration runs.

**Acceptance Scenarios**:

1. **Given** a calculation record that was saved before the cleanup and includes a now-removed service, **When** a user or admin views that calculation, **Then** all historical data is present and the record is not deleted or corrupted.
2. **Given** the migration has been run, **When** the database is inspected for calculation records, **Then** no `calculations` rows have been deleted as a side effect of the service removal.

---

### User Story 3 — Seed Scripts Cannot Restore Removed Services (Priority: P3)

A developer running the database seed scripts (for local development or a fresh environment) does not accidentally re-introduce the deleted services or categories. The seed scripts are updated to reflect the post-cleanup state of the catalogue.

**Why this priority**: Without this, any developer bootstrapping a local database would silently restore all deleted services, defeating the purpose of the cleanup and causing confusion about the canonical service list.

**Independent Test**: Run the seed scripts from scratch against an empty database. Query the resulting service list — the deleted services and categories are absent.

**Acceptance Scenarios**:

1. **Given** an empty database and the seed scripts are run, **When** the database is queried for services and categories, **Then** none of the deleted items appear.
2. **Given** a database that already has the cleanup migration applied and seed scripts are re-run, **When** the database is queried, **Then** the deleted items are not restored.

---

### Edge Cases

- What if existing `calculation_services` rows reference a service targeted for deletion? The migration must automatically delete only those junction records before deleting the service row. Parent `calculations` rows and their stored `final_price` values must NOT be deleted or modified. The historical quoted price is preserved as-is even if the underlying service line item is no longer resolvable.
- What if a service name in the removal list does not exactly match the database name? (e.g., addendum lists "Industry Trend Analysis" but the database has "Industry Trends Analysis"). The migration must target the exact stored name; discrepancies must be resolved before migration runs.
- What if a category targeted for deletion has already had all its services removed? The empty category row must still be deleted.
- What if the migration is run against a database where the targeted items are already absent? It must complete without error (idempotent behaviour).

---

## Requirements *(mandatory)*

### Functional Requirements

**Category Deletions — hard delete with cascade to all services within:**

- **FR-001**: The system MUST permanently delete the 'Development' category and ALL services within it from the database. This is a hard delete — using the `is_active` flag as a substitute is not acceptable.
- **FR-002**: The system MUST permanently delete the 'Marketing & Launch' category and ALL services within it from the database. This is a hard delete — using the `is_active` flag as a substitute is not acceptable.

**Individual Service Deletions from 'Strategy & Research':**

- **FR-003**: The system MUST permanently delete the following four services from the 'Strategy & Research' category:
  - Industry Trends Analysis
  - Messaging Framework
  - Pricing Strategy
  - Product Positioning

**Individual Service Deletions from 'Design & UI/UX':**

- **FR-004**: The system MUST permanently delete the following fifteen services from the 'Design & UI/UX' category:
  - Banner & Ad Design
  - Brand Identity Design
  - Color Palette Creation
  - E-commerce Design
  - Empty State Design
  - Error State Design
  - Landing Page Design
  - Loading State Design
  - Logo Design
  - Motion Graphics
  - Packaging Design
  - Print Design
  - Social Media Graphics
  - Typography Selection
  - Video Editing

**Migration:**

- **FR-005**: A versioned migration file MUST be created with a descriptive name (e.g., `011_remove_non_design_services`) in the migrations directory.
- **FR-006**: The migration MUST be idempotent — running it against a database where the targeted items are already absent must complete without error.
- **FR-007**: The migration MUST handle referential integrity automatically — if any `calculation_services` junction records are found that reference a service being deleted, the migration MUST delete those junction records first, then proceed to delete the service row. This cleanup is performed silently without aborting the migration. Parent `calculations` rows and their stored `final_price` values MUST NOT be deleted or modified.
- **FR-008**: After the migration completes, no dangling references from historical calculation line items to deleted service IDs may exist in the database.

**Seed Script Updates:**

- **FR-009**: All seed scripts MUST be updated to exclude every deleted service and category so they cannot be re-introduced on a fresh database setup.
- **FR-010**: Updated seed scripts MUST be idempotent — re-running them on a post-migration database must not restore any deleted item.

### Key Entities

- **Category**: Groups related services in the wizard; identified by name. Two categories ('Development', 'Marketing & Launch') are removed in their entirety.
- **Service**: An individual billable work item belonging to a category. 19 individual services from surviving categories plus all services in the two deleted categories are removed.
- **Calculation service line item**: A junction record linking a saved calculation to a specific service used in it, along with hours and cost. Must not be orphaned after service deletion; must be cleaned up before service rows are removed.
- **Migration file**: A versioned, named database change script that applies the cleanup in a trackable and repeatable way.
- **Seed script**: Initial reference data population script. Must be updated to match the post-cleanup catalogue.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero deleted services or categories appear in the wizard Service Selection step after migration.
- **SC-002**: Zero deleted services or categories appear in any API response from services or categories endpoints.
- **SC-003**: One hundred percent of pre-existing calculation records remain accessible and unmodified after migration.
- **SC-004**: Running seed scripts against an empty database produces a service catalogue containing zero deleted items.
- **SC-005**: The migration completes without errors when run against a fully-seeded database.
- **SC-006**: The migration completes without errors when run a second time against a database where the targeted items are already absent (idempotency check).

---

## Assumptions

- The exact database name for the addendum item "Industry Trend Analysis" is **"Industry Trends Analysis"** (plural), matching the seed file. The migration targets the seed-file name.
- The exact database category name for "Marketing" is **"Marketing & Launch"**, matching the seed file.
- This is a new product with no historical calculations referencing the services to be deleted. FR-007 is included as a defensive guard.
- The `is_active` flag on services exists in the schema but is NOT used as the deletion mechanism — this change requires a hard delete per the addendum.
- The surviving service catalogue after cleanup is: **Strategy & Research** (16 services) and **Design & UI/UX** (18 services) — 34 total.

---

## Clarifications

### Session 2026-03-26

- Q: If `calculation_services` junction records exist that reference a service targeted for deletion, what should the migration do? → A: Auto-delete junction records only — silently remove the linking rows and continue; parent `calculations` rows and their `final_price` are preserved as-is.
