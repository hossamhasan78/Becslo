# Feature Specification: Disable Wizard Session Persistence

**Feature Branch**: `020-disable-session-persistence`
**Created**: 2026-03-28
**Status**: Draft
**Input**: Change 7 — Disable Session Persistence on Reload (`docs/IMPLEMENTATION_PLAN_ADDENDUM_v1.1.md`)

## Overview

Currently, the wizard saves its in-progress state to session storage so that refreshing the page restores the user to wherever they were. This behaviour is undesirable: a page reload should start a fresh session at Step 1 with all fields blank. Completed calculations stored in the database are unaffected — only the transient in-progress wizard state is reset.

This is a blocking launch requirement per the Implementation Plan Addendum v1.1.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Fresh Start on Reload (Priority: P1)

A user who is mid-way through the wizard and reloads the page (accidentally or intentionally) should arrive back at Step 1 with a completely blank form rather than their previous in-progress state.

**Why this priority**: Core behavioural requirement. Prevents stale or partially complete state from being silently carried forward into a new calculation session. Blocking launch requirement.

**Independent Test**: Open the wizard, fill in Steps 1–3, refresh the page. Confirm Step 1 is shown with all fields reset to their defaults.

**Acceptance Scenarios**:

1. **Given** a user has progressed to Step 3 of the wizard, **When** they reload the page, **Then** the wizard opens at Step 1 with all fields blank and no previously entered values visible.
2. **Given** a user has reached Step 6 and their calculation has been saved to the database, **When** they reload the page, **Then** the wizard resets to Step 1 and the saved calculation record in the database is unchanged.
3. **Given** a user opens the wizard in a new browser tab, **When** they view any wizard step, **Then** they see Step 1 with blank fields regardless of what another tab may have stored.

---

### User Story 2 — No Ghost State on Navigation (Priority: P2)

A user who completes a calculation, then navigates away from the wizard and returns (via browser back button or direct URL), should not see previously entered values.

**Why this priority**: Ensures users always start a new calculation with a clean slate, preventing confusion from leftover state from a prior session.

**Independent Test**: Complete a full wizard run to Step 6, navigate away to another page (e.g. login), then return to `/wizard`. Confirm Step 1 is shown with blank state.

**Acceptance Scenarios**:

1. **Given** a user has completed a wizard run and navigated away, **When** they return to the wizard URL, **Then** they see Step 1 with all fields blank.
2. **Given** a user begins the wizard but leaves before completing, **When** they return in the same browser session, **Then** no previously entered values are pre-populated.

---

### Edge Cases

- What happens to a calculation that was successfully saved to the database before the reload? It must remain intact in the database — only the in-progress wizard state resets.
- What if the user refreshes mid-step with unsaved data? All unsaved wizard data is lost. No warning is required (this is the intended behaviour per the spec).
- What if the user has multiple browser tabs open with the wizard? Each tab initialises independently with blank state; no cross-tab synchronisation occurs.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The wizard MUST initialise to Step 1 with all fields at their empty defaults on every page load or reload.
- **FR-002**: The wizard state MUST NOT be read from or written to any form of browser storage (session storage, local storage, cookies) that would survive a page reload.
- **FR-003**: Completed calculation records already persisted to the database MUST NOT be affected by the removal of session persistence.
- **FR-004**: The in-memory wizard state MUST be discarded entirely when the user reloads the page or navigates away.
- **FR-005**: No user-visible indication of the change is required — the wizard simply starts fresh every time.

### Key Entities

- **Wizard State**: Transient, in-memory data representing the user's current progress through the wizard (selected services, experience level, geography, costs, risk/profit settings). Lives only for the duration of the page session after this change.
- **Calculation Record**: A persisted database record created when the user completes the wizard and submits. Unaffected by this change.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reloading the wizard at any step (1–6) always presents Step 1 with blank fields — verifiable in 100% of reload attempts.
- **SC-002**: No wizard state is recoverable from browser storage after a page reload — verifiable by inspecting session storage and local storage in browser developer tools.
- **SC-003**: Saved calculation records remain fully accessible in the admin dashboard after a wizard reload — zero data loss on persisted records.
- **SC-004**: The change introduces no new lint errors or TypeScript type errors in the wizard context or any dependent components.

---

## Scope

### In Scope

- Removing session storage persistence from the wizard context
- Replacing persisted state with in-memory state
- Ensuring the empty default state is correctly defined for all wizard fields

### Out of Scope

- Any changes to how completed calculations are stored or retrieved
- Any warning/confirmation dialog on page reload
- Any change to admin session behaviour
- Any change to authentication session (login persistence is unaffected)

---

## Assumptions

| ID | Assumption |
|----|------------|
| A  | The `useSessionStorage` hook is the only persistence mechanism for wizard state. No other storage (local storage, cookies, IndexedDB) is used for wizard state. |
| B  | The empty/default wizard state is already defined in `WizardContext` — it simply needs to be used as the initial state unconditionally. |
| C  | No other component outside `WizardContext` reads wizard state from session storage directly. |
