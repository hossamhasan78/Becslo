# Feature Specification: Frontend - Admin

**Feature Branch**: `004-frontend-admin`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Frontend - Admin - Build admin dashboard pages, Implement service CRUD, Implement config editor, Build calculations viewer"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Admin Dashboard (Priority: P1)

As an admin, I need to access the admin dashboard so that I can manage the pricing system.

**Why this priority**: Admins need a dedicated area to manage services, configuration, and view analytics.

**Independent Test**: Can be tested by navigating to /admin and verifying dashboard loads for admin users.

**Acceptance Scenarios**:

1. **Given** the user is an admin, **When** they navigate to /admin, **Then** the admin dashboard is displayed
2. **Given** the user is not an admin, **When** they navigate to /admin, **Then** access is denied with appropriate error message

---

### User Story 2 - View Analytics (Priority: P1)

As an admin, I need to view analytics on all calculations so that I can understand pricing trends.

**Why this priority**: The constitution mandates numeric analytics only - this is the primary value for admins.

**Independent Test**: Can be tested by viewing analytics page and verifying stats are displayed.

**Acceptance Scenarios**:

1. **Given** the admin accesses analytics, **When** the page loads, **Then** total calculations count is displayed
2. **Given** the admin accesses analytics, **When** data exists, **Then** average project price is shown
3. **Given** the admin accesses analytics, **When** data exists, **Then** average total hours is shown
4. **Given** the admin accesses analytics, **When** data exists, **Then** top used services are displayed
5. **Given** the admin accesses analytics, **When** data exists, **Then** top client countries are displayed

---

### User Story 3 - Manage Services (Priority: P1)

As an admin, I need to manage service offerings so that I can update the pricing catalog.

**Why this priority**: Admins need to add, update, or remove services as business offerings change.

**Independent Test**: Can be tested by performing CRUD operations on services.

**Acceptance Scenarios**:

1. **Given** the admin navigates to services, **When** the page loads, **Then** all services are displayed in a list
2. **Given** the admin creates a new service, **When** they fill in name, category, hours, **Then** the service is created successfully
3. **Given** the admin updates a service, **When** they modify fields, **Then** changes are saved
4. **Given** the admin toggles a service, **When** they set is_active to false, **Then** the service is hidden from users

---

### User Story 4 - Edit Configuration (Priority: P1)

As an admin, I need to modify pricing multipliers and base rates so that I can adjust pricing formulas without code changes.

**Why this priority**: The constitution mandates full pricing engine configurability.

**Independent Test**: Can be tested by updating config values and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** the admin navigates to config, **When** the page loads, **Then** current configuration values are displayed
2. **Given** the admin updates base hourly rate, **When** they save, **Then** the new rate is stored
3. **Given** the admin updates experience multipliers, **When** they save, **Then** the multipliers are stored
4. **Given** the admin updates risk buffer or profit margin, **When** they save, **Then** the values are stored

---

### User Story 5 - View Stored Calculations (Priority: P2)

As an admin, I need to view all stored calculations so that I can analyze pricing data.

**Why this priority**: Provides visibility into how users are using the calculator.

**Independent Test**: Can be tested by viewing calculations page.

**Acceptance Scenarios**:

1. **Given** the admin navigates to calculations, **When** the page loads, **Then** all stored calculations are displayed in a table
2. **Given** the admin expands a calculation, **When** they click to view details, **Then** full calculation details including services and costs are shown

---

### Edge Cases

- What happens when admin tries to delete a service that is used in existing calculations?
- What happens when configuration values are invalid (negative numbers, etc.)?
- How does the system handle when there are no calculations to display?
- What happens when API calls to admin endpoints fail?
- How does the system handle concurrent edits to configuration?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide /admin dashboard landing page
- **FR-002**: System MUST provide /admin/analytics page with numeric statistics
- **FR-003**: System MUST display total calculations count on analytics page
- **FR-004**: System MUST display average project price on analytics page
- **FR-005**: System MUST display average total hours on analytics page
- **FR-006**: System MUST display top used services on analytics page
- **FR-007**: System MUST display top client countries on analytics page
- **FR-008**: System MUST provide /admin/services page listing all services
- **FR-009**: System MUST allow creating new services via form
- **FR-010**: System MUST allow editing existing services
- **FR-011**: System MUST allow toggling service active status (soft-delete)
- **FR-012**: System MUST NOT allow hard delete of services
- **FR-013**: System MUST provide /admin/config page with editable fields
- **FR-014**: System MUST allow editing base hourly rate
- **FR-015**: System MUST allow editing experience multipliers
- **FR-016**: System MUST allow editing risk buffer percentage
- **FR-017**: System MUST allow editing profit margin percentage
- **FR-018**: System MUST provide /admin/calculations page with table view
- **FR-019**: System MUST allow expanding calculation to see full details
- **FR-020**: System MUST enforce admin-only access to all /admin routes
- **FR-021**: System MUST show appropriate error messages for failed operations

### Key Entities *(include if feature involves data)*

- **Analytics**: Aggregate statistics (totals, averages, top items)
- **Service**: Service offering with CRUD operations
- **Configuration**: Pricing multipliers and base rate settings
- **Calculation**: Stored calculation with details

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All admin pages load within 2 seconds
- **SC-002**: Analytics display accurate calculations from database
- **SC-003**: Service CRUD operations complete successfully
- **SC-004**: Configuration changes persist and are retrievable
- **SC-005**: Calculations table displays all stored data correctly
- **SC-006**: Non-admin users cannot access any admin pages
- **SC-007**: All form validations work correctly

---

## Assumptions

- Backend API endpoints are already implemented from Phase 2
- Authentication is handled by Supabase Auth with Google OAuth
- Admin users are managed via the admin_users table
- Services and configuration data exist in the database
- No PDF export from admin (per constitution - numeric analytics only)
