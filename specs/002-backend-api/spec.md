# Feature Specification: Backend API

**Feature Branch**: `002-backend-api`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Backend API - Implement all endpoints, Add calculation storage logic, Add PDF generation endpoint"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fetch Pricing Configuration (Priority: P1)

As a user, I need to fetch pricing configuration (services, multipliers, countries) so that the calculator can display options and perform calculations.

**Why this priority**: Without pricing configuration data, the calculator cannot function. This is the foundational data needed for all calculations.

**Independent Test**: Can be tested by calling the services and config endpoints and verifying correct data is returned.

**Acceptance Scenarios**:

1. **Given** the system has active services, **When** user requests services, **Then** services are returned grouped by category
2. **Given** the system has configuration values, **When** user requests config, **Then** all pricing multipliers and base rates are returned
3. **Given** country data exists, **When** user requests countries, **Then** ISO 3166 country list is returned

---

### User Story 2 - Store Calculations (Priority: P1)

As a user, I need to store my pricing calculation so that admins can view analytics on freelance pricing trends.

**Why this priority**: The core business value is providing analytics on freelance pricing. Without storing calculations, there is no data for admins to analyze.

**Independent Test**: Can be tested by submitting a calculation and verifying it persists in the database.

**Acceptance Scenarios**:

1. **Given** user has completed a pricing calculation, **When** user submits the calculation, **Then** it is stored with all input parameters and final price
2. **Given** user is not authenticated, **When** user attempts to submit calculation, **Then** the request is rejected
3. **Given** calculation includes services and costs, **When** calculation is stored, **Then** all related services and costs are linked correctly

---

### User Story 3 - Generate PDF Export (Priority: P1)

As a user, I need to export my pricing calculation as a PDF so that I can share it with clients.

**Why this priority**: PDF export is a primary deliverable for users to present their pricing to clients.

**Independent Test**: Can be tested by requesting PDF export and verifying a downloadable PDF is returned.

**Acceptance Scenarios**:

1. **Given** user has completed a calculation, **When** user requests PDF export, **Then** a PDF document is generated with calculation breakdown
2. **Given** user requests PDF, **When** generation succeeds, **Then** a download URL is returned to the client

---

### User Story 4 - Admin Analytics Access (Priority: P2)

As an admin, I need to view analytics on all calculations so that I can understand pricing trends.

**Why this priority**: Admin analytics is the business driver for storing calculations. Without this, there is no value in storing user calculations.

**Independent Test**: Can be tested by calling the analytics endpoint as an admin and verifying stats are returned.

**Acceptance Scenarios**:

1. **Given** calculations exist in the system, **When** admin requests analytics, **Then** aggregate statistics are returned (total calculations, average price, average hours)
2. **Given** admin requests analytics, **When** data exists, **Then** top services and top client countries are included

---

### User Story 5 - Admin Service Management (Priority: P2)

As an admin, I need to manage service offerings so that I can update pricing catalog.

**Why this priority**: Admins need to add, update, or remove services as the business offerings change.

**Independent Test**: Can be tested by performing CRUD operations on services and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** admin accesses service management, **When** admin creates a new service, **Then** the service appears in the catalog
2. **Given** service exists, **When** admin updates the service, **Then** changes are reflected immediately
3. **Given** service exists, **When** admin toggles active status, **Then** inactive services are hidden from users

---

### User Story 6 - Admin Configuration Control (Priority: P2)

As an admin, I need to modify pricing multipliers and base rates so that I can adjust pricing formulas without code changes.

**Why this priority**: The constitution mandates full pricing engine configurability. This allows dynamic pricing adjustments.

**Independent Test**: Can be tested by updating config values and verifying the calculator uses new values.

**Acceptance Scenarios**:

1. **Given** admin accesses configuration, **When** admin updates base hourly rate, **Then** new rate is used for all subsequent calculations
2. **Given** admin updates multipliers, **When** calculation is performed, **Then** updated multipliers are applied correctly
3. **Given** non-admin user accesses config endpoint, **When** user attempts to modify settings, **Then** the request is rejected

---

### Edge Cases

- What happens when calculation submission fails due to database error?
- How does the system handle PDF generation failure?
- What happens when required configuration values are missing?
- How does the system handle invalid or malformed calculation data?
- What happens when country codes are invalid?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide GET /api/services endpoint returning all active services grouped by category
- **FR-002**: System MUST provide GET /api/config endpoint returning all pricing configuration values
- **FR-003**: System MUST provide GET /api/countries endpoint returning ISO 3166 country list
- **FR-004**: System MUST provide POST /api/calculation endpoint storing calculation with related services and costs
- **FR-005**: System MUST provide POST /api/export-pdf endpoint generating PDF with calculation breakdown
- **FR-006**: System MUST provide GET /api/admin/calculations endpoint returning all stored calculations with details
- **FR-007**: System MUST provide GET /api/admin/analytics endpoint returning aggregate statistics
- **FR-008**: System MUST provide GET /api/admin/services endpoint returning all services (including inactive)
- **FR-009**: System MUST provide POST /api/admin/services endpoint for creating new services
- **FR-010**: System MUST provide PATCH /api/admin/services/:id endpoint for updating services or toggling active status
- **FR-011**: System MUST provide PATCH /api/admin/config endpoint for updating configuration values
- **FR-012**: System MUST NOT provide DELETE endpoint for services - soft-delete via is_active toggle is the standard approach
- **FR-013**: System MUST enforce authentication on all calculation-related endpoints
- **FR-014**: System MUST enforce admin role on all admin management endpoints
- **FR-015**: System MUST apply the pricing formula correctly in all calculations
- **FR-016**: System MUST return appropriate error responses for invalid requests

### Key Entities *(include if feature involves data)*

- **Service**: Service offering with name, category, default hours, hour ranges, active status
- **Calculation**: Stored pricing calculation with all input parameters and final result
- **CalculationService**: Link between calculation and selected services with custom hours
- **Cost**: Overhead costs associated with a calculation
- **Configuration**: Pricing multipliers and base rate settings

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All user-facing API endpoints respond within 2 seconds under normal load
- **SC-002**: All admin endpoints are accessible only to authenticated admin users
- **SC-003**: Calculations are stored with 100% accuracy - all input parameters and final price match
- **SC-004**: PDF export generates and returns a valid PDF file
- **SC-005**: Analytics return accurate aggregate statistics from stored calculations
- **SC-006**: Configuration changes take effect immediately for new calculations
- **SC-007**: All API endpoints return proper HTTP status codes for success and error cases

---

## Clarifications

### Session 2026-03-16

- Q: Should the admin services API include a DELETE endpoint, or is soft-delete via the is_active toggle sufficient? → A: No, soft-delete only (use PATCH to toggle is_active)

---

## Assumptions

- Database schema and RLS policies are already configured from Phase 1
- Authentication is handled by Supabase Auth with Google OAuth
- Admin users are managed via the admin_users table
- Country data will be a static list based on ISO 3166 standard
- PDF generation uses server-side rendering approach
