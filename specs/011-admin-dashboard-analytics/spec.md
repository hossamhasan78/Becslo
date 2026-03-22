# Feature Specification: Admin Dashboard & Analytics

**Feature Branch**: `011-admin-dashboard-analytics`
**Created**: 2026-03-22
**Status**: Draft
**Input**: User description: "Phase 5: Admin Dashboard & Analytics - Enable admin to manage services, configurations, and inspect calculations with user data"

## Clarifications

### Session 2026-03-22

- Q: When an admin tries to delete a service that has been used in existing calculations, what should happen? → A: Block deletion - Services used in calculations cannot be deleted, only deactivated
- Q: When two admin users simultaneously edit the same configuration parameters, how should the system handle the conflict? → A: Last-write-wins with session-based locking for critical fields
- Q: For analytics with extremely large datasets, what is the maximum number of calculations the system must support while maintaining performance targets? → A: 10,000 calculations with standard indexing and query optimization
- Q: When an admin enters invalid values in configuration (e.g., negative rates, min > max), how should the system respond? → A: Inline validation with real-time feedback and blocking save
- Q: Should the admin dashboard include text search functionality beyond date range filtering? → A: No text search - Date range filtering only for MVP


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Services Management (Priority: P1)

Admin users can view all available services in a paginated list, activate or deactivate services, edit service details (name, category, hours), and add new services to the system.

**Why this priority**: Services are the foundation of the pricing calculation. Without the ability to manage services, admin cannot control what services users can select, making this the most critical functionality for maintaining pricing accuracy and relevance.

**Independent Test**: Admin can log in, navigate to Services page, view the complete list of services, deactivate one service (verify it no longer appears for users), edit another service's details, and add a new service. All CRUD operations can be tested independently without needing analytics or configuration features.

**Acceptance Scenarios**:

1. **Given** admin user is logged in, **When** they navigate to Services page, **Then** they see a paginated list of all services with columns for name, category, default hours, min hours, max hours, and active status
2. **Given** admin views services list, **When** they click deactivate button on an active service, **Then** the service status changes to inactive and it no longer appears in user service selection
3. **Given** admin views services list, **When** they click edit on a service, **Then** they can modify name, category, default hours, min hours, max hours, and save changes
4. **Given** admin on Services page, **When** they click add service, **Then** they can enter new service details with required fields (name, category, hours) and save
5. **Given** admin views deactivated services, **When** they click activate, **Then** the service status changes to active and appears for users

---

### User Story 2 - Configuration Editor (Priority: P2)

Admin users can adjust pricing configuration parameters including multipliers (experience, geography), base rates, risk buffer range (min/max), and profit margin range (min/max).

**Why this priority**: Pricing configuration directly impacts calculation results. Admin needs control over these parameters to adapt to market conditions and ensure fair pricing. Without this, pricing calculations would use hardcoded values that cannot be adjusted.

**Independent Test**: Admin can navigate to Config page, modify experience multiplier values, update base rate, adjust risk buffer range from 0-50% to a different range, adjust profit margin range from 10-50% to a different range, and save all changes. These settings can be tested independently by running a calculation before and after to verify changes take effect.

**Acceptance Scenarios**:

1. **Given** admin user is logged in, **When** they navigate to Configuration page, **Then** they see all configurable parameters with current values displayed
2. **Given** admin on Configuration page, **When** they modify experience multiplier values, **Then** changes are saved and reflected in new calculations
3. **Given** admin on Configuration page, **When** they update base rate, **Then** all new calculations use the updated base rate
4. **Given** admin on Configuration page, **When** they change risk buffer range (min/max), **Then** the wizard slider range updates to reflect new limits
5. **Given** admin on Configuration page, **When** they change profit margin range (min/max), **Then** the wizard slider range updates to reflect new limits
6. **Given** admin modifies configuration, **When** they click save, **Then** system validates ranges (min <= max) and persists changes

---

### User Story 3 - Analytics Dashboard (Priority: P3)

Admin users can view key metrics displayed in numeric tables including average price, average hours, most used services, top client countries, and total calculation count, all filterable by date range.

**Why this priority**: Analytics provide valuable insights into usage patterns and pricing trends, helping admin make informed decisions about services and configuration. While valuable, it's less critical than the ability to actually manage services and configuration.

**Independent Test**: Admin can navigate to Analytics page, view all metrics tables, apply date range filters, and see updated metrics. This can be tested independently after services and configuration are set up, without needing calculations viewer.

**Acceptance Scenarios**:

1. **Given** admin user is logged in, **When** they navigate to Analytics page, **Then** they see tables displaying: average price, average hours, most used services (count), top client countries (count), total calculations
2. **Given** admin on Analytics page, **When** they select a date range filter, **Then** all metrics update to show data only within that range
3. **Given** admin views most used services table, **When** there are multiple services, **Then** services are ordered by usage count (highest first)
4. **Given** admin views top client countries table, **When** there are multiple countries, **Then** countries are ordered by calculation count (highest first)
5. **Given** no calculations exist in selected date range, **When** admin views Analytics page, **Then** metrics show zero or appropriate empty state

---

### User Story 4 - Calculations Viewer (Priority: P4)

Admin users can view a list of all calculations with user data (name, email), filter by date range, and view detailed breakdown of individual calculations including services, hours, costs, multipliers, and final price.

**Why this priority**: Admin needs the ability to inspect calculations to understand pricing results and investigate issues. This is valuable for debugging and auditing but is less critical than the core management and analytics features.

**Independent Test**: Admin can navigate to Calculations page, view list of calculations with user names and emails, filter by date range, click on a calculation to see full details. This can be tested independently after other features are implemented.

**Acceptance Scenarios**:

1. **Given** admin user is logged in, **When** they navigate to Calculations page, **Then** they see a list of calculations with columns: user name, user email, total price, final price, date created
2. **Given** admin on Calculations page, **When** they apply date range filter, **Then** list shows only calculations within that date range
3. **Given** admin views calculations list, **When** they click on a calculation, **Then** they see detailed breakdown including: all services with hours, costs used, multipliers applied, subtotal, risk buffer, profit margin, final price, recommended range
4. **Given** admin views calculation details, **Then** user name and email are visible as per Constitution II requirement for analytics
5. **Given** no calculations exist or none match filter, **When** admin views Calculations page, **Then** appropriate empty state message is displayed

---

### Edge Cases

- When admin tries to delete a service used in existing calculations, system blocks deletion and provides error message directing admin to deactivate instead
- Configuration changes only affect new calculations; historical calculations remain unchanged to preserve data integrity
- When two admin users simultaneously edit the same configuration, system uses last-write-wins with session-based locking to prevent race conditions
- System must maintain analytics performance (under 3 seconds) with up to 10,000 calculations using standard database indexing and query optimization
- When admin enters invalid configuration values (negative rates, min > max), system provides inline validation with real-time feedback and blocks save until values are corrected
- How does system handle pagination when there are hundreds of services?
- What happens when date range filter returns no results?
- How does system display calculations when user name or email contains special characters?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide admin-only dashboard with sidebar navigation and header showing admin user information
- **FR-002**: System MUST restrict access to all admin pages (`/admin/*`) to users with admin role
- **FR-003**: System MUST redirect non-admin users attempting to access admin pages to the wizard page
- **FR-004**: System MUST provide Services page with paginated list of all services (name, category, default hours, min hours, max hours, active status)
- **FR-005**: Admin MUST be able to activate and deactivate services, with active services available to users and inactive services hidden
- **FR-006**: Admin MUST be able to edit service details (name, category, default hours, min hours, max hours)
- **FR-007**: Admin MUST be able to add new services with required fields (name, category, hours)
- **FR-007A**: System MUST block deletion of services that have been used in existing calculations; admin can only deactivate such services to preserve historical data integrity
- **FR-008**: System MUST provide Configuration page displaying all pricing parameters: experience multipliers, geography multipliers, base rate, risk buffer range (min/max), profit margin range (min/max)
- **FR-009**: Admin MUST be able to modify experience multiplier values
- **FR-010**: Admin MUST be able to modify base rate
- **FR-011**: Admin MUST be able to modify risk buffer range (minimum and maximum percentages)
- **FR-012**: Admin MUST be able to modify profit margin range (minimum and maximum percentages)
- **FR-013**: System MUST validate configuration changes (e.g., minimum <= maximum, positive values) with inline validation providing real-time feedback and blocking save until all values are valid
- **FR-013A**: System MUST handle concurrent admin edits using last-write-wins approach with session-based locking for critical configuration fields
- **FR-014**: System MUST persist configuration changes and apply them to new calculations immediately
- **FR-015**: System MUST provide Analytics page with numeric tables showing: average price, average hours, most used services (with counts), top client countries (with counts), total calculation count
- **FR-016**: System MUST provide date range filters on Analytics page that update all metrics when changed (text search not required for MVP)
- **FR-017**: System MUST order most used services by usage count (highest first)
- **FR-018**: System MUST order top client countries by calculation count (highest first)
- **FR-019**: System MUST provide Calculations Viewer page with list of calculations including user name, user email, total price, final price, date created
- **FR-020**: System MUST provide date range filters on Calculations Viewer page (text search not required for MVP)
- **FR-021**: Admin MUST be able to click on a calculation to view detailed breakdown (services with hours, costs, multipliers, subtotal, risk buffer, profit margin, final price, recommended range)
- **FR-022**: Admin MUST see user name and email in calculation details (Constitution II compliance)
- **FR-023**: System MUST display appropriate empty state messages when no data is available or matches filters
- **FR-024**: Admin dashboard MUST be responsive and work on desktop and tablet screens
- **FR-025**: System MUST provide server-side API endpoints for all admin operations (analytics, services CRUD, configuration, calculations viewer)
- **FR-026**: System MUST implement role-based access control at middleware level for all admin routes
- **FR-027**: System MUST support analytics performance targets (under 3 seconds) with up to 10,000 calculations using standard database indexing and query optimization

### Key Entities

- **Admin User**: Represents users with administrative privileges, has role attribute and can access all admin pages
- **Service**: Represents a type of service users can select for pricing calculation, includes name, category, hours (default/min/max), and active status
- **Configuration**: Represents pricing parameters including base rate, multipliers (experience, geography), risk buffer range, and profit margin range
- **Calculation**: Represents a completed pricing calculation, includes user data (name, email), selected services, hours, costs, multipliers, pricing breakdown, and final price
- **Analytics Metrics**: Aggregated data calculated from calculations including averages, counts, and rankings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can add, edit, activate, or deactivate a service in under 30 seconds
- **SC-002**: Admin can modify any configuration parameter and verify changes are reflected in new calculations within 5 seconds
- **SC-003**: Admin can view analytics for any date range and see updated metrics within 3 seconds
- **SC-004**: Admin can view a list of 100+ calculations with pagination loading each page in under 2 seconds
- **SC-005**: System correctly restricts non-admin users from accessing admin pages (100% success rate)
- **SC-006**: Admin can navigate to any admin page from sidebar navigation in under 2 clicks
- **SC-007**: System displays user name and email in calculation details (100% compliance with Constitution II)
- **SC-008**: Admin dashboard layout is responsive and functional on screens as small as 768px width
- **SC-009**: Configuration changes persist across admin sessions and apply to all new calculations immediately
- **SC-010**: Date range filters correctly filter data across all relevant tables and metrics

## Assumptions

- Admin users are already seeded via SQL migration from Phase 1
- Database schema with services, calculations, config tables is already implemented from Phase 1
- Pricing engine from Phase 2 is already implemented and functioning
- Wizard with pricing calculations is already implemented from Phase 3
- PDF export from Phase 4 is already implemented
- Admin users have role-based access control mechanism in place from Phase 1
- Analytics will use numeric tables only (no charts) as per Phase 5 requirements
- Calculations viewer will display user name and email as per Constitution II and explicit requirement
- Services can be activated/deactivated without impacting historical calculations
- Configuration changes only affect new calculations, not historical data
- Date range filters use calculation created_at timestamp
- Pagination defaults to 25 items per page for services and calculations lists
- All admin operations require active admin session authentication
