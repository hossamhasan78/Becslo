# Feature Specification: Persistent Application Header

**Feature Branch**: `022-persistent-app-header`
**Created**: 2026-03-28
**Status**: Draft
**Input**: User description: "Add a persistent top header bar to all authenticated pages (wizard and admin routes). Left side: logo/brand mark with 'Becslo' fallback text, ready to swap to a real asset. Right side: logged-in user's display name or email and a Logout button. Header is fixed/sticky and does not appear on login or signup pages."

## Clarifications

### Session 2026-03-28

- Q: Should the existing page-level logout button in the wizard be removed once the header logout is in place? → A: Yes — remove it. The header logout replaces the wizard's existing page-level logout button entirely; only one logout control should exist.
- Q: Should logout failure handling be a formal requirement or just an edge case note? → A: Formal requirement — if logout fails, display an inline error near the Logout button and keep the user on the current page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identity and Navigation Anchor on Every Authenticated Page (Priority: P1)

A logged-in user navigates through the wizard or the admin dashboard. At all times they can see the application brand mark and their own identity (name or email) in a fixed bar at the top of the screen. They never lose their place or have to scroll up to know who they are logged in as.

**Why this priority**: The header is structural — it must be in place before any other authenticated feature can be considered visually complete. It also addresses a basic trust and orientation need: users should always know which application they are in and which account they are using.

**Independent Test**: Can be fully tested by logging in, navigating to the wizard page, and confirming the header is visible at the top, remains fixed during scroll, shows the brand area on the left, and shows the logged-in user's identifier on the right. Confirm no other logout button appears on the wizard page.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on any wizard step, **When** they view the top of the page, **Then** a fixed header is visible containing a brand mark area on the left and the user's display name or email on the right — and no other logout button exists elsewhere on the wizard page.
2. **Given** a logged-in user is on any admin page, **When** they view the top of the page, **Then** the same fixed header is visible with the same structure.
3. **Given** a logged-in user scrolls down a long page (e.g., a step with many services), **When** the page content scrolls, **Then** the header remains fixed at the top and does not scroll out of view.
4. **Given** a user is on the login page, **When** they view the page, **Then** no header bar is present.
5. **Given** a user is on the signup page, **When** they view the page, **Then** no header bar is present.

---

### User Story 2 - Log Out from Any Authenticated Page (Priority: P2)

A logged-in user decides to end their session from any point in the application. They click the Logout button in the header and are returned to the login page with their session ended.

**Why this priority**: Logout must be universally accessible from all authenticated pages. Without it, users are forced to find a separate logout mechanism or close the browser — a poor and potentially insecure experience.

**Independent Test**: Can be fully tested by logging in, clicking the Logout button in the header from any page, and confirming the user is redirected to the login page and their session is terminated.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on any wizard step, **When** they click the Logout button in the header, **Then** their session ends and they are redirected to the login page.
2. **Given** a logged-in user is on any admin page, **When** they click the Logout button in the header, **Then** their session ends and they are redirected to the login page.
3. **Given** a logged-in user has been redirected to the login page after logout, **When** they attempt to navigate back to a protected route, **Then** they are not granted access and are redirected to login.

---

### User Story 3 - Logo Area Ready for Real Asset (Priority: P3)

A product owner or designer provides a real logo image to replace the current placeholder. The swap is made by updating a single image source — no layout changes, no component redesign, and no visible shift in the header's structure.

**Why this priority**: This is a forward-compatibility requirement. The placeholder ships for launch; the real logo arrives later. The header must be built to accommodate this without rework.

**Independent Test**: Can be tested by confirming the brand area renders at a consistent size and position regardless of whether the image source is a real asset or a placeholder, and that the fallback text 'Becslo' is present when no image loads.

**Acceptance Scenarios**:

1. **Given** the logo image source is a placeholder (broken or blank), **When** the header renders, **Then** the fallback text 'Becslo' is visible in the brand area and the header layout is not broken.
2. **Given** a real logo image is provided as the source, **When** the header renders, **Then** the logo image displays in the brand area at the same size and position as the placeholder, with no layout shift elsewhere in the header.

---

### Edge Cases

- What is shown in the user identity area if the logged-in user has no display name and no email on record? The identity area should display a generic fallback (e.g., 'Account') rather than being blank.
- If the logout action fails (e.g., network error), an inline error message MUST appear near the Logout button and the user remains on the current page — covered by FR-014.
- On very narrow mobile viewports, do the brand area and user area overlap? The header must remain usable at the smallest supported viewport without elements overlapping.
- If the user's display name or email is very long, does it overflow into the logo area? The user identifier should truncate gracefully rather than pushing the layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST display a persistent header bar at the top of all authenticated pages (wizard routes and admin routes).
- **FR-002**: The header MUST remain fixed at the top of the viewport — it MUST NOT scroll out of view when page content scrolls.
- **FR-003**: The header MUST NOT appear on the login page or the signup page.
- **FR-004**: The left side of the header MUST display a brand mark area containing a swappable image element with 'Becslo' as its fallback text — visible when the image fails to load or no source is set.
- **FR-005**: The brand mark image element MUST be swappable to a real logo asset by changing only the image source — no structural or layout changes to the header must be required.
- **FR-006**: The right side of the header MUST display the logged-in user's display name or email address.
- **FR-007**: If the logged-in user has neither a display name nor an email available, the identity area MUST show a non-blank fallback (e.g., 'Account').
- **FR-008**: The right side of the header MUST include a Logout button.
- **FR-009**: Clicking the Logout button MUST end the user's session and redirect them to the login page.
- **FR-010**: After logout, the user MUST NOT be able to access authenticated routes without logging in again.
- **FR-011**: The header MUST be consistent in appearance and behaviour across all authenticated routes — wizard and admin pages share the same header component.
- **FR-012**: On mobile viewports, the header elements (brand area and user/logout area) MUST remain visible and non-overlapping at the smallest supported screen width.
- **FR-013**: Any existing page-level logout controls within authenticated pages (e.g., a logout button inside the wizard content area) MUST be removed — the header logout is the sole logout mechanism in the application.
- **FR-014**: If the logout action fails, the application MUST display an inline error message near the Logout button and keep the user on their current page — the user MUST NOT be silently left believing they are logged out when they are not.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The header is visible and fixed on 100% of authenticated pages — zero authenticated pages render without it.
- **SC-002**: The header is absent on 100% of unauthenticated pages (login, signup) — zero unauthenticated pages render with it.
- **SC-003**: A user can complete a full logout flow — from any authenticated page to the login page — in a single click, using only the header logout button.
- **SC-004**: Swapping the logo asset requires no changes to layout, component structure, or surrounding CSS — only the image source changes.
- **SC-005**: The header renders without overlap or truncation errors on all tested viewport sizes from 375px wide upward.
- **SC-006**: Zero duplicate logout controls exist anywhere in the authenticated application after this feature is complete.

## Assumptions

- The application has existing authenticated routes for both the wizard and the admin dashboard. This feature wraps them with a shared layout — it does not create new routes.
- The login page and signup page are the only unauthenticated routes. Any future unauthenticated routes would need to be explicitly excluded from the header layout if added.
- The user's identity (display name or email) is available from the active authentication session at the time the header renders — no additional data fetch is needed.
- 'Becslo' is the canonical brand name and is used as both the image alt text and the visible fallback.
- The logo placeholder ships with an empty or transparent image source; the real logo asset will be provided at a later date and slotted in without code changes.
- The header height is assumed to be fixed and consistent — page content below the header adjusts its top offset to account for the header height so content is not obscured.
- The existing `WizardLogoutButton` component is the page-level logout that will be removed as part of this feature.
