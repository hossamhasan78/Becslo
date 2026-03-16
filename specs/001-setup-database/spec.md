# Feature Specification: Setup & Database

**Feature Branch**: `001-setup-database`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Setup & Database - Initialize NextJS project, Set up Supabase project, Create all database tables, Set up RLS policies"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize Development Environment (Priority: P1)

As a developer, I need a properly initialized NextJS project with all dependencies configured so that I can start building features immediately.

**Why this priority**: This is the foundational step - without a working development environment, no further work can proceed. It must be completed first.

**Independent Test**: Can be tested by running `npm run dev` and verifying the development server starts without errors.

**Acceptance Scenarios**:

1. **Given** a clean machine, **When** the initialization commands are executed, **Then** the NextJS project runs on the expected localhost port
2. **Given** the project is initialized, **When** `npm run build` is executed, **Then** the build completes without errors

---

### User Story 2 - Configure Database Infrastructure (Priority: P1)

As a developer, I need Supabase configured with all required tables and security policies so that the application can store and retrieve data securely.

**Why this priority**: All application data must be persisted. Without database tables and Row Level Security (RLS) policies, the application cannot function and data would be unprotected.

**Independent Test**: Can be tested by verifying all tables exist in Supabase and RLS policies prevent unauthorized access.

**Acceptance Scenarios**:

1. **Given** Supabase project is created, **When** the database schema is applied, **Then** all required tables exist with correct columns
2. **Given** tables exist, **When** RLS policies are applied, **Then** unauthorized users cannot read or modify other users' data
3. **Given** tables exist, **When** admin policies are applied, **Then** admin users can access all data for management purposes

---

### User Story 3 - Define Data Models (Priority: P1)

As a developer, I need all data entities properly defined with their relationships so that the application can store pricing calculations, services, and configurations correctly.

**Why this priority**: The entire application is built around storing and analyzing freelance pricing calculations. Each entity is essential for business functionality.

**Independent Test**: Can be tested by inserting sample data into each table and verifying relationships are maintained correctly.

**Acceptance Scenarios**:

1. **Given** users table is created, **When** a user authenticates via Google OAuth, **Then** their profile is created with email and name
2. **Given** services table is populated, **When** the application queries services, **Then** services are returned grouped by category
3. **Given** calculations are stored, **When** an admin views calculations, **Then** all calculation details including services and costs are visible

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize a NextJS 14.x project with TypeScript and Tailwind CSS
- **FR-002**: System MUST connect to Supabase using environment variables for credentials
- **FR-003**: System MUST create the `users` table with columns: id, email, name, created_at
- **FR-004**: System MUST create the `admin_users` table with columns: id, email, role, created_at
- **FR-005**: System MUST create the `services` table with columns: id, name, category, default_hours, min_hours, max_hours, is_active
- **FR-006**: System MUST create the `calculations` table with columns: id, user_id, experience_years, freelance_years, designer_country, client_country, pricing_model, risk_level, profit_margin, total_hours, final_price, created_at
- **FR-007**: System MUST create the `calculation_services` junction table with columns: id, calculation_id, service_id, hours
- **FR-008**: System MUST create the `costs` table with columns: id, calculation_id, name, amount, type
- **FR-009**: System MUST create the `config` table with columns: key, value (JSON)
- **FR-010**: System MUST enable Row Level Security on all tables
- **FR-011**: System MUST create RLS policies allowing authenticated users to insert their own calculations
- **FR-012**: System MUST create RLS policies allowing admin users to read all calculations
- **FR-013**: System MUST create RLS policies allowing admin users to manage services and configuration
- **FR-014**: System MUST seed the services table with default service offerings across categories
- **FR-015**: System MUST seed the config table with default pricing multipliers and base rate

### Key Entities

- **User**: Represents a user authenticated via Google OAuth. Stores email, name, and authentication timestamp. Related to calculations through user_id.
- **AdminUser**: Represents administrators who can access all data and manage system configuration. Stores role for access control.
- **Service**: Represents a service offering that freelancers can include in their calculations. Has categories, hour ranges, and active status.
- **Calculation**: Represents a single pricing calculation performed by a user. Contains all input parameters including experience_years (as categorical range: 0-2, 3-5, 6-9, 10+) and freelance_years (as categorical range: 0-1, 2-3, 4-6, 7+), along with the final calculated price.
- **CalculationService**: Junction entity linking calculations to services with custom hour inputs. Enables many-to-many relationship.
- **Cost**: Represents overhead costs added to a calculation. Supports monthly and project-based cost types.
- **Configuration**: Key-value store for pricing multipliers and system settings. Allows admins to adjust pricing formulas without code changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can initialize the project and start the development server within 10 minutes of cloning the repository
- **SC-002**: All seven database tables are created with correct schemas and relationships
- **SC-003**: RLS policies successfully prevent unauthorized access - verified by attempting unauthorized queries that should fail
- **SC-004**: Default service offerings are queryable and return organized by category
- **SC-005**: Configuration values can be read and are at their documented default values

---

## Clarifications

### Session 2026-03-16

- Q: Should the calculations table store experience_years as exact integers or as categorical year ranges (0-2, 3-5, etc.)? → A: Year ranges

---

## Assumptions

- Supabase project will be created separately by the user before running database migrations
- Google OAuth credentials will be provided by the user
- NextJS project initialization assumes Node.js 18+ is installed
- Database migrations will be run using Supabase CLI or SQL editor
