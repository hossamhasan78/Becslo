# Feature Specification: Database & Configuration Setup

**Feature Branch**: `007-db-schema-setup`  
**Created**: 2026-03-18  
**Status**: Draft  
**Input**: User description: "Phase 1: Database & Configuration Setup - Finalize database schema, seed initial data, setup RLS policies, implement initial API routes"

---

## Clarifications

### Session 2026-03-18

- Q: Which 5 API endpoints are expected? → A: Services, Categories, Countries, Costs, Config (all wizard inputs)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seed Data Available for Wizard (Priority: P1)

A user can access the wizard and see populated dropdown menus with services, categories, countries, and costs.

**Why this priority**: Without seed data, the wizard cannot function. This delivers the foundation for the entire pricing flow.

**Independent Test**: Can be fully tested by visiting the wizard page and verifying dropdown menus contain data. Delivers functional wizard inputs.

**Acceptance Scenarios**:

1. **Given** user is on wizard page, **When** user opens service selection, **Then** all active services grouped by category are displayed
2. **Given** user is on wizard page, **When** user opens country dropdown, **Then** all countries with multipliers are displayed
3. **Given** user is on wizard page, **When** user opens costs selection, **Then** all active costs are displayed

---

### User Story 2 - Protected User Data (Priority: P1)

Users can only access their own calculations; admin can access all data.

**Why this priority**: Data isolation is required for user privacy. This ensures users cannot see each other's calculations.

**Independent Test**: Can be tested by creating two user accounts, creating calculations with each, and verifying User A cannot see User B's data while admin can see both.

**Acceptance Scenarios**:

1. **Given** User A is logged in, **When** User A queries their calculations, **Then** only User A's calculations are returned
2. **Given** User A is logged in, **When** User A queries other users' calculations, **Then** access is denied
3. **Given** Admin user is logged in, **When** Admin queries all calculations, **Then** all users' calculations are returned

---

### User Story 3 - API Data Access (Priority: P2)

Application can fetch configuration data through API endpoints for wizard operations.

**Why this priority**: The wizard needs to fetch services, categories, countries, costs, and configuration to display to users.

**Independent Test**: Can be tested by calling each API endpoint and verifying correct data is returned.

**Acceptance Scenarios**:

1. **Given** application requests services, **When** called with no filters, **Then** only active services are returned
2. **Given** application requests services, **When** called with category filter, **Then** only services from that category are returned
3. **Given** application requests config, **When** called, **Then** base rates and multiplier ranges are returned

---

### User Story 4 - Initial Admin User Ready (Priority: P2)

An admin user exists in the system for dashboard access.

**Why this priority**: Without an admin user, the admin dashboard cannot be accessed or configured.

**Independent Test**: Can be tested by attempting to log in with admin credentials and access admin routes.

**Acceptance Scenarios**:

1. **Given** admin user credentials exist, **When** admin logs in, **Then** admin role is assigned
2. **Given** admin user is logged in, **When** admin accesses /admin, **Then** access is granted

---

### Edge Cases

- **EC-001**: System MUST handle empty database gracefully when no seed data exists
- **EC-002**: System MUST return appropriate error when API endpoint fails
- **EC-003**: System MUST validate that filtered results return only matching records
- **EC-004**: System MUST ensure RLS policies cannot be bypassed by direct database access

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store user account data with id, email, name, and creation timestamp
- **FR-002**: System MUST store admin user roles linked to user accounts
- **FR-003**: System MUST store service definitions with category, name, default hours, min/max hours, and active status
- **FR-004**: System MUST store service categories with display order
- **FR-005**: System MUST store countries with geography multipliers
- **FR-006**: System MUST store calculation records with all pricing inputs and outputs
- **FR-007**: System MUST store calculation services linked to calculations
- **FR-008**: System MUST store configurable costs with active status and default values
- **FR-009**: System MUST store system configuration including base rate and multiplier ranges
- **FR-010**: System MUST seed at least 120 services across all categories
- **FR-011**: System MUST seed approximately 200 countries with geography multipliers
- **FR-012**: System MUST seed default configuration values for pricing
- **FR-013**: System MUST enforce row-level security to isolate user calculations
- **FR-014**: System MUST allow admin users full read/write access to all tables
- **FR-015**: System MUST provide API endpoint to fetch active services filtered by category
- **FR-016**: System MUST provide API endpoint to fetch all categories
- **FR-016a**: System MUST provide API endpoint to fetch all countries with multipliers
- **FR-016b**: System MUST provide API endpoint to fetch active costs
- **FR-016c**: System MUST provide API endpoint to fetch system configuration

### Key Entities

- **User**: Represents authenticated user, includes email, name, creation timestamp
- **Admin User**: Represents user with admin privileges, includes role designation
- **Service**: Represents design service option, includes category, hours range, active status
- **Category**: Represents service grouping, includes display order
- **Country**: Represents geography, includes name, code, multiplier
- **Calculation**: Represents user pricing calculation, includes all inputs and computed outputs
- **Calculation Service**: Represents service line item within a calculation
- **Cost**: Represents optional additional cost, includes name, default value, active status
- **Config**: Represents system configuration, includes base rate, risk/profit ranges

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access wizard and see all service, country, and cost data within 2 seconds of page load
- **SC-002**: 100% of user calculation queries return only the user's own data (RLS enforcement)
- **SC-003**: All five API endpoints (services, categories, countries, costs, config) return valid JSON responses within 500ms
- **SC-004**: Admin user can access all data without restriction
- **SC-005**: Database migration completes successfully and creates all required tables
- **SC-006**: Seed data populates with 120+ services and 200 countries

---

## Assumptions

- Supabase is the database provider (per Constitution)
- NextJS handles API routes (per Constitution)
- Email/password authentication is already configured (from Phase 0)
- Initial admin user credentials are known

---

## Constraints

- All pricing uses USD currency only (per Constitution)
- No personal data beyond name/email stored (per Constitution)
- Monolithic architecture with NextJS + Supabase (per Constitution)
- Database changes managed via Supabase migrations (per Constitution)
