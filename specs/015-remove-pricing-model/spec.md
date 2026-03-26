# Feature Specification: Remove Pricing Model Step

**Feature Branch**: `015-remove-pricing-model`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Read Change 1 from docs/IMPLEMENTATION_PLAN_ADDENDUM_v1.1.md — Remove Pricing Model Step from wizard, hardcode project pricing, renumber to 6 steps, remove back button on step 1"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Wizard Opens Directly to Service Selection (Priority: P1)

A user logs in and is taken to the fee calculator wizard. The wizard opens immediately at the Service Selection screen — there is no preliminary step asking them to choose a pricing model. The user begins selecting services right away.

**Why this priority**: This is the most visible change and the entry point to the entire wizard flow. Every user encounters this first. Removing the pricing model step eliminates friction and reduces the number of decisions a user has to make before reaching the core of the tool.

**Independent Test**: Can be fully tested by logging in and verifying the first screen presented is Service Selection with no pricing model choice available anywhere in the session.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the wizard page, **When** the wizard loads, **Then** the first visible step is Service Selection — no pricing model question appears before it or anywhere else in the flow.
2. **Given** a user on any step of the wizard, **When** they inspect all visible steps in the step list, **Then** exactly 6 steps are listed and none of them is labelled 'Pricing Model' or similar.
3. **Given** a user on Step 1 (Service Selection), **When** they look for a Back button, **Then** no Back button is present — only a forward navigation control.

---

### User Story 2 — Step Numbering and Labels Are Accurate Throughout (Priority: P2)

A user progresses through the wizard and at every step the step indicator and step list correctly reflect their position within a 6-step flow. Labels, counts, and progress indicators all match the new structure.

**Why this priority**: Inconsistent step counts or labels — such as a progress bar showing "Step 1 of 7" while the list shows 6 entries — would confuse users and undermine confidence in the tool. This must be fully consistent before the wizard is considered correct.

**Independent Test**: Can be fully tested by navigating through all 6 steps and verifying that every step reference — progress indicator, step list, step heading — consistently shows the correct step number and total count.

**Acceptance Scenarios**:

1. **Given** a user on Service Selection, **When** they read the step label, **Then** it reads Step 1 of 6 (or equivalent wording).
2. **Given** a user on Risk & Profit, **When** they read the step label, **Then** it reads Step 5 of 6.
3. **Given** a user on Results, **When** they read the step label, **Then** it reads Step 6 of 6.
4. **Given** a user at any step, **When** they view the in-wizard step list, **Then** the list contains exactly 6 named steps in the correct order: Service Selection → Experience → Geography → Costs → Risk & Profit → Results.

---

### User Story 3 — All Calculations Use Project-Based Pricing (Priority: P3)

A user completes the wizard and receives a final price. The calculated result is always produced using project-based pricing logic — no user selection or toggle influences the pricing model. The result is identical in structure and accuracy to what project-based pricing previously produced.

**Why this priority**: This validates that removal of the UI step did not break the underlying calculation. It is lower priority than the UX changes because the calculation engine is not being modified — only the source of the pricing model input is changing (from user-selected to hardcoded).

**Independent Test**: Can be fully tested by completing the full 6-step wizard and verifying the final price is produced and matches the expected output of project-based calculation logic.

**Acceptance Scenarios**:

1. **Given** a user who has completed all 6 steps, **When** they reach the Results step, **Then** a final price is displayed with a full breakdown, calculated using project-based logic.
2. **Given** any completed calculation stored in the system, **When** an admin inspects the record, **Then** the pricing model is recorded as 'project' — not blank, not null, and not user-supplied.

---

### Edge Cases

- What happens if a user navigates directly to the URL of the old Pricing Model step via browser history or a bookmarked link? The wizard silently redirects to Step 1 (Service Selection) — no error message, no "step removed" notice, no 404 page.
- What happens if existing calculation records in the database contain a pricing model value other than 'project'? Historic records must be unaffected — this change applies only to new wizard sessions.
- What happens if a user refreshes the browser while on Step 1? They should be returned to Step 1 with a clean state (per session reset behaviour defined separately in Change 7 of the addendum).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The wizard MUST open at Service Selection as the first and only entry step — no pricing model selection screen shall appear before it or anywhere else in the flow. Any in-progress wizard navigation state pointing to the removed step MUST silently redirect to Step 1 with no error or notice shown to the user.
- **FR-002**: The pricing model MUST be fixed internally to 'project' for all new calculations — it is not a user-configurable value and must not appear in wizard state.
- **FR-003**: The wizard MUST consist of exactly 6 steps in this order: Service Selection, Experience, Geography, Costs, Risk & Profit, Results.
- **FR-004**: Step 1 (Service Selection) MUST NOT display a Back button or any backward navigation control.
- **FR-005**: All step count references throughout the wizard — progress indicators, step labels, step lists, headings — MUST reflect 6 steps with no reference to a 7-step flow or a pricing model step.
- **FR-006**: The fee calculation engine MUST continue to produce correct, complete results using project-based pricing logic without any dependency on a user-supplied pricing model input.
- **FR-007**: All new calculations written to persistent storage MUST record the pricing model as 'project'.

### Key Entities

- **Wizard Step**: A discrete screen in the wizard flow. After this change, exactly 6 steps exist, numbered 1–6, each with a label and navigation controls appropriate to its position (no Back on Step 1).
- **Pricing Model**: A fixed constant value ('project') applied by the fee calculation engine. Not stored as wizard state; not displayed to the user.
- **Calculation Record**: A stored output of a completed wizard session. All new records must include pricing model = 'project'.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of wizard sessions begin at Service Selection — zero users encounter a pricing model selection screen.
- **SC-002**: All step indicators, progress labels, and step lists consistently display 6 steps with correct labels at every point in the wizard flow.
- **SC-003**: Step 1 (Service Selection) has no Back button at any viewport size.
- **SC-004**: All new calculation records stored in the system carry pricing model = 'project' — zero records are created with a null, blank, or non-'project' value.
- **SC-005**: The full 6-step wizard flow can be completed without errors, producing a valid final price equal to what the project-based calculation previously produced.

---

## Scope

**In scope:**
- Removing the Pricing Model selection step from the wizard UI entirely
- Hardcoding 'project' as the pricing model in wizard state and calculation logic
- Renumbering all steps and updating all step-count references from 7 to 6
- Removing the Back button from Step 1 (Service Selection)
- Updating all progress indicators, step labels, and the in-wizard step list to reflect the 6-step structure

**Out of scope:**
- Changes to the calculation formula or pricing engine logic (only the model input source changes, not the formula itself)
- Modifications to historic calculation records in the database
- Session persistence behaviour (addressed separately in Change 7 of the addendum)
- Any other wizard step content or layout changes not listed above

---

## Assumptions

- The existing project-based calculation logic is correct and complete — this change removes only the UI selection, not the engine.
- The admin dashboard (Calculations Viewer, analytics, config editor) does **not** display or depend on the pricing_model field — confirmed. No admin UI changes are required as part of this feature.
- Step numbering in the UI is 1-based (Step 1, Step 2, …) and this convention is preserved.
- The string 'project' matches the value already used internally by the calculation engine for project-based pricing.

---

## Clarifications

### Session 2026-03-25

- Q: Does the admin Calculations Viewer currently display the pricing_model field to admins? → A: No — pricing_model does not appear anywhere in the admin dashboard. No admin UI changes required.
- Q: How should the app handle navigation to the now-removed pricing model step URL? → A: Silent redirect — wizard routes straight to Step 1 with no message or indication.

---

## Dependencies

- **Change 5 (Results Step Redesign)** and **Change 6 (Remove Right Column)** both reference Step 6 as Results — this feature must be implemented before or alongside those changes to ensure consistent step numbering.
- **Change 8 (Interactive Step Navigation)** and **Change 9 (Remove Top Progress Indicator)** depend on the step list being accurate — this feature is a prerequisite for both.
- No external service or third-party dependencies.
