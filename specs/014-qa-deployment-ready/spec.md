# Feature Specification: Testing & Deployment Readiness (Phase 7)

**Feature Branch**: `014-qa-deployment-ready`  
**Created**: 2026-03-24  
**Status**: Draft  
**Input**: User description: "Phase 7 - Testing and Deployment Readiness: Comprehensive testing and production deployment"

## Clarifications

### Session 2026-03-24
- Q: Which intensive testing types are out of scope? → A: Formal Penetration Testing and high-volume Load Testing (>100 concurrent) are excluded from this MVP phase.
- Q: Post-production deployment verification? → A: Mandatory automated smoke tests must be executed after every production deployment to verify system health.
- Q: PDF Generation error recovery? → A: Display a clear error message with a manual "Retry" button.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - End-to-End Core Flow Validation (Priority: P1)

As a QA/Tester, I want to verify the complete user journey from authentication through the 7-step wizard to the final PDF quote download to ensure the system delivers its primary value.

**Why this priority**: This is the core functionality of the product. If this fails, the tool is unusable.

**Independent Test**: Can be fully tested by creating a new account, completing a mock calculation, and verifying the contents of the generated PDF.

**Acceptance Scenarios**:

1. **Given** a new email/password user, **When** they complete the signup/login flow and the 7-step wizard with realistic inputs (range 0.5 to 100 service hours), **Then** they should receive a downloadable PDF matching the on-screen calculation.
2. **Given** an existing admin user, **When** they modify a service's base rate in the admin dashboard, **Then** a user currently in the wizard should see the updated calculation in the live preview (after refresh or component update).

---

### User Story 2 - Production Deployment and Environment Setup (Priority: P2)

As a Developer, I want to securely deploy the application to production environments with all database migrations and environment configurations correctly set.

**Why this priority**: Necessary to move the product from development to a stable environment for actual users.

**Independent Test**: Can be tested by triggering a deployment and verifying that the production URL functions independently of the development environments.

**Acceptance Scenarios**:

1. **Given** a set of database migrations, **When** they are run against the production instances, **Then** all tables and access policies must be applied without data loss.
2. **Given** a production deployment, **When** a user signs up, **Then** their data must be stored in the production database instance, not the development one.

---

### User Story 3 - System Maintenance Documentation (Priority: P3)

As a System Admin, I want to have clear documentation for setting up new admins and understanding the API structure so I can manage the system long-term.

**Why this priority**: Important for the long-term sustainability and hand-off of the project.

**Independent Test**: Can be tested by a non-technical stakeholder following the "Admin Setup Guide" to create a new admin.

**Acceptance Scenarios**:

1. **Given** the documentation is provided, **When** a user follows the steps to add an admin via a Supabase migration, **Then** they should gain access to the `/admin` dashboard.

---

### Edge Cases

- **Large Inputs**: What happens when a user inputs 99,999 hours for a service? System should cap or provide a warning.
- **Database Connection Failure**: How does the wizard handle a temporary loss of connection to Supabase during a step change?
- **Invalid Auth Credentials**: Does the system provide clear, non-leaking error messages for failed logins?
- **PDF Generation Timeout**: If the generator times out, a "Retry" button must be shown to the user.

### Out of Scope

- **Formal Security Audit**: Penetration testing or third-party audits.
- **High-Volume Load Testing**: Validating performance for >100 concurrent users.
- **Legacy Browser Support**: Ensuring compatibility with IE11 or outdated mobile browsers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a verification suite for the full authentication flow (Sign-up, Login, Logout).
- **FR-002**: System MUST validate all wizard transitions to ensure no state is lost or corrupted during navigation.
- **FR-003**: System MUST calculate fee edge cases (zero hours, max limits) and display appropriate validation messages.
- **FR-004**: System MUST synchronise price multipliers (experience, geography) with the live pricing engine.
- **FR-005**: System MUST support deployment with separate configurations for preview and production environments.
- **FR-006**: System MUST include a "Deployment Checklist" document for production releases.
- **FR-007**: System MUST implement post-deployment automated smoke tests for production environment health verification.
- **FR-008**: System MUST provide a "Retry" mechanism for failed PDF generation attempts at the final wizard step.

### Key Entities *(include if feature involves data)*

- **Test Report**: Represents the outcome of the QA phase, linking to specific versions and test cases.
- **Environment Configuration**: Represents the variables and connection strings used for different environments.

### Assumptions & Dependencies

- **Assumption**: The hosting platform supports atomic deployments and environment variable management.
- **Dependency**: All previous phases (0-6) must be functionally complete before final QA can begin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of P1 User Stories pass in the final pre-production test run.
- **SC-002**: Production deployment process (from trigger to live) takes under 10 minutes.
- **SC-003**: System documentation covers 100% of the integration points used by the wizard and management dashboard.
- **SC-004**: Zero critical security vulnerabilities found in the primary user access flows during final review.
