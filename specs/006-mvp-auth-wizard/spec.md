# Feature Specification: MVP Authentication & Wizard Skeleton

**Feature Branch**: `006-mvp-auth-wizard`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Read Phase 0 from docs\IMPLEMENTATION_PLAN.md and according to the best practices of Githyb's spec-kit, create the spec/s"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Google OAuth Login (Priority: P1)

A user visits the application, clicks the Google login button, authenticates with their Google account, and is redirected to the wizard placeholder page.

**Why this priority**: This is the foundation of the application. Without functional authentication, no other features can be accessed or tested. This validates the core user entry point and ensures the Google OAuth integration works end-to-end.

**Independent Test**: Can be fully tested by visiting the login page, clicking Google login, completing Google authentication, and verifying redirection to the wizard page. Delivers the core value of user access and establishes the authentication flow.

**Acceptance Scenarios**:

1. **Given** user is on the login page, **When** user clicks the Google login button, **Then** user is redirected to Google OAuth consent screen
2. **Given** user completes Google authentication, **When** user grants necessary permissions, **Then** user is redirected back to the application wizard page
3. **Given** user successfully authenticates, **When** the redirect completes, **Then** user's account information is stored and authentication state is established
4. **Given** user cancels Google authentication, **When** user returns to the application, **Then** user sees an appropriate error message on the login page

---

### User Story 2 - Wizard Layout Skeleton (Priority: P2)

An authenticated user sees a two-panel wizard layout with a 3/4 width left panel for step-by-step input and a 1/4 width right panel displaying a live preview placeholder.

**Why this priority**: This establishes the fundamental UI structure that all wizard interactions will use. It ensures the layout meets the constitutional requirement and provides the foundation for building out individual wizard steps.

**Independent Test**: Can be fully tested by logging in and verifying the two-panel layout displays correctly with proper proportions and placeholders. Delivers the core UI framework for the wizard experience.

**Acceptance Scenarios**:

1. **Given** user is authenticated, **When** user accesses the wizard page, **Then** user sees a two-panel layout with left panel exactly 75% width and right panel exactly 25% width on desktop
2. **Given** user is on the wizard page, **When** user views the left panel, **Then** user sees a step navigation placeholder with 7 steps indicated
3. **Given** user is on the wizard page, **When** user views the right panel, **Then** user sees a live preview placeholder area
4. **Given** user is on the wizard page, **When** the page loads, **Then** the layout is responsive and adapts appropriately to screen size

---

### User Story 3 - Admin User Initialization (Priority: P3)

An initial admin user is automatically created during deployment and can access protected routes and functionality.

**Why this priority**: This establishes the administrative foundation for the application. The admin user is required for configuration, testing, and future management of the system. This ensures the system can be configured and maintained from deployment.

**Independent Test**: Can be fully tested by deploying the application, verifying the admin user exists in the database, and confirming the admin can access protected routes. Delivers the foundation for administrative control and system configuration.

**Acceptance Scenarios**:

1. **Given** the application is deployed, **When** the database is initialized, **Then** an admin user record is created with the specified email address
2. **Given** an admin user exists, **When** the admin authenticates, **Then** the admin has access to protected administrative routes
3. **Given** the admin is authenticated, **When** accessing protected routes, **Then** the system verifies admin role and grants appropriate permissions

---

### Edge Cases

- **FR-018**: System MUST display user-friendly error message with retry button when Google authentication fails due to network issues
- **FR-019**: System MUST display specific error message explaining required permissions when user denies Google OAuth permissions
- **FR-020**: System MUST ignore duplicate admin user creation if admin user with same email already exists in the database
- **FR-021**: System MUST automatically redirect to login page when session expires and require re-authentication
- **FR-022**: System MUST redirect unauthenticated users attempting to access wizard page to login page
- **FR-023**: System MUST use idempotent SQL migration to prevent duplicate admin user creation during concurrent deployment
- **FR-024**: System MUST display configuration error message if Google OAuth client secrets are not configured
- **FR-025**: System MUST display error message with manual link when browser blocks Google OAuth redirects

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a login page with a Google OAuth login button as the only authentication method
- **FR-002**: System MUST redirect users to Google OAuth consent screen when login button is clicked
- **FR-003**: System MUST handle Google OAuth callback and process authentication response
- **FR-004**: System MUST create or update user account record upon successful Google OAuth authentication
- **FR-005**: System MUST store user's name, email, and authentication token securely
- **FR-006**: System MUST redirect authenticated users to the wizard page automatically
- **FR-007**: System MUST display error messages when Google authentication fails or is cancelled that include: (1) user-friendly non-technical language, (2) clear explanation of what went wrong, (3) specific action steps to resolve the issue
- **FR-008**: System MUST prevent access to protected routes (wizard, admin) for unauthenticated users
- **FR-009**: System MUST maintain user authentication state across page navigation within 100ms of navigation change
- **FR-010**: System MUST create an initial admin user record during database initialization
- **FR-011**: System MUST allow the initial admin user to authenticate via Google OAuth and gain admin role
- **FR-012**: System MUST verify user authentication status on every protected route access
- **FR-013**: System MUST display a wizard page with a two-panel layout (3/4 left panel, 1/4 right panel)
- **FR-014**: System MUST display step navigation placeholder in the left panel with 7 steps indicated
- **FR-015**: System MUST display a live preview placeholder area in the right panel
- **FR-016**: System MUST maintain wizard state structure in application state management
- **FR-017**: System MUST support deployment to a live hosting environment for access testing

### Key Entities

- **User**: Represents an authenticated user with Google OAuth, includes name, email, authentication tokens, and creation timestamp
- **Admin User**: Represents a user with administrative privileges, includes user reference, role designation, and creation timestamp
- **Authentication State**: Represents the current session state, includes user information, authentication status, and session tokens
- **Wizard State**: Represents the current state of the wizard, includes selected step, input data, and navigation status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete Google OAuth authentication and access the wizard within 30 seconds from login page load
- **SC-002**: 100% of unauthenticated users attempting to access protected routes are redirected to the login page
- **SC-003**: The two-panel wizard layout displays correctly within 2 seconds of page load on internet connection with latency < 100ms and bandwidth > 5 Mbps
- **SC-004**: Admin user is successfully created and authenticated on first deployment without manual intervention
- **SC-005**: Application is deployed and accessible from a live URL for testing within 1 day of completion
- **SC-001**: Google OAuth authentication has a 95%+ success rate for valid Google accounts
- **SC-008**: All authentication failures display clear, actionable error messages to users (meets FR-007 error message criteria)

## Assumptions

- Google OAuth client credentials are properly configured in the hosting environment
- The hosting environment supports environment variable configuration
- Users have a valid Google account for authentication
- The initial admin email address is known and accessible for testing
- The database supports row-level security (RLS) for user data isolation
- The hosting platform provides HTTPS for secure OAuth redirects
- Users' browsers allow third-party cookies for Google OAuth to function

## Constraints

- Google OAuth is the ONLY authentication method permitted (per Constitution)
- No personal data persistence beyond what's required for analytics (per Constitution)
- All authentication must be completed before any wizard features are accessible (per Constitution)
- The wizard layout must be 3/4 left panel and 1/4 right panel (per Constitution)
- The application must be deployable as a monolithic application (per Constitution)

## Out of Scope

- Personal user account management (password reset, profile editing)
- Alternative authentication methods (email/password, social logins other than Google)
- Personal calculation save functionality (deferred to post-MVP)
- Wizard step implementation (only layout and navigation placeholders in this phase)
- Live preview functionality (placeholder only in this phase)
- Analytics data collection (admin user setup only in this phase)
- Email notifications or communications
- Multi-user collaboration features
