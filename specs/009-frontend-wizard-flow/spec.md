# Feature Specification: Wizard Flow & Frontend Integration

**Feature Branch**: `009-frontend-wizard-flow`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "Phase 3: Complete the 7-step wizard with live preview panel, integrating with the pricing engine."

## Clarifications

### Session 2026-03-19

- Q: What happens when a user enters 0 hours for a selected service? → A: The hours input field enforces a hard minimum of 1 at the input level; values less than 1 (zero, negatives) are never accepted.
- Q: Can users freely jump between wizard steps or must they navigate linearly? → A: Users can click any previously completed step to revisit it, but cannot skip ahead past the current step.
- Q: Is the wizard state persisted as a draft or ephemeral? → A: No server-side drafts. Wizard state is stored locally in the browser so it survives page refreshes, but is not saved to the database until final submission.
- Q: Does the pricing model selection (Hourly vs Project-based) change calculation logic or is it just a label? → A: It changes the calculation logic. Hourly model displays per-hour rates; project-based model displays a lump-sum fee with different formula adjustments.
- Q: What triggers saving the calculation to the database? → A: A "Calculate & Save" button on the final step both displays the final calculation result and saves it to the database. PDF download is a separate, optional action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive Wizard Navigation with Live Preview (Priority: P1)

Users must be able to navigate a 7-step wizard where they progressively provide inputs for pricing criteria, and see a live preview of the calculation updating instantly on the right side of the screen.

**Why this priority**: It is the core interactive paradigm of the application, representing the foundational structure and value for the user.

**Independent Test**: Can be fully tested by interacting with each of the 7 steps and seeing the right-side summary reflect changes in under 100ms.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and on the dashboard, **When** they launch a new calculation, **Then** a 7-step layout opens showing a 3/4 width step panel and a persistent 1/4 width live preview panel.
2. **Given** the user is on any step, **When** they make a valid selection/change, **Then** the live preview updates the total price and breakdowns in under 100ms.
3. **Given** the user tries to proceed to the next step, **When** required fields are missing or invalid, **Then** real-time error messages appear and progression is blocked.
4. **Given** the user has completed steps 1 through 4, **When** they click the step indicator for step 2, **Then** they are taken back to step 2 with their previous inputs preserved. Clicking the indicator for step 5 (not yet completed) does nothing.
5. **Given** the user has completed steps 1 through 4 with "Hourly" selected, **When** they go back to Step 1 and switch to "Project-based", **Then** the live preview and all intermediate values recalculate immediately to reflect the new pricing model.

---

### User Story 2 - Accurate Data Input for Pricing Modifiers (Priority: P2)

Users must be able to input variable pricing components including service selections, numerical experience ratings, geographical multipliers, selected costs, and percentage-based risk & profit buffers.

**Why this priority**: These inputs directly dictate the calculated fee.

**Independent Test**: Provide different inputs across all steps and ensure that step-level constraints (like slider ranges) are properly enforced.

**Acceptance Scenarios**:

1. **Given** the user is assigning experience levels, **When** they use the experience sliders, **Then** the values are constrained strictly between 1 and 10.
2. **Given** the user is configuring risk and profit margins, **When** they adjust the respective sliders, **Then** Risk is capped from 0-50% and Profit is capped from 10-50%.
3. **Given** the user inputs an invalid value directly (if applicable), **When** they attempt to save or navigate, **Then** an explicit error is shown and the input is reverted.
4. **Given** the user selects "Hourly" as the pricing model in Step 1, **When** they reach the results review, **Then** the breakdown shows per-hour rates for each service. If they had selected "Project-based", the breakdown shows a single lump-sum project fee with adjusted formula.

---

### User Story 3 - Results Review and PDF Generation (Priority: P3)

Users must be able to review the final calculated breakdown and easily export the result to a client-ready PDF directly from their browser without using cloud storage.

**Why this priority**: It fulfills the primary deliverable for freelancers—a professional quote to send to clients.

**Independent Test**: Generate a completed quote and trigger the PDF down. Check the downloaded PDF for structure and correct formatting (USD, nearest dollar).

**Acceptance Scenarios**:

1. **Given** the user completes all 6 data entry steps, **When** they click the "Calculate & Save" button on the final step, **Then** the system performs the final server-side calculation, displays the detailed breakdown (services, costs, multipliers, recommended range, final USD price), and saves the calculation to the database.
2. **Given** the calculation has been saved and the results are displayed, **When** the user clicks "Download PDF", **Then** a loading indicator appears and a file download is initiated containing the detailed fee breakdown. This action is optional.

### Edge Cases

- The hours input field enforces a minimum value of 1; users cannot enter 0 or negative numbers. If a user no longer wants a service, they must explicitly deselect it.
- How does the system handle network errors during API fetches for categories, configuration, or PDF export? (Shows polite retry option and maintains current state).
- What happens if the live calculation fails on the backend API? (Falls back gracefully, shows warning).
- How does the UI behave on very small screens? (Panels stack: Wizard top, Preview securely pinned below or accessible via toggle).
- If the user refreshes the page mid-wizard, all previously entered inputs and the current step position are restored from browser-local storage.
- If the user goes back to Step 1 and switches the pricing model after completing later steps, the live preview and stored intermediate prices must recalculate immediately to reflect the new model.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a 7-step setup flow combining Pricing Model, Services, Experience, Geography, Costs, and Risk/Profit buffers.
- **FR-002**: System MUST render a persistent live-preview panel comprising 1/4th of the layout at larger screen sizes.
- **FR-003**: System MUST update calculation estimates on the local client in less than 100ms upon every input change.
- **FR-004**: System MUST enforce user validation explicitly: Experience ranges (1-10), Risk (0-50%), and Profit (10-50%).
- **FR-005**: System MUST allow generation and direct streaming download of a PDF document summarizing the final calculation.
- **FR-006**: System MUST ensure all financial values are expressed solely in USD, rounded to the nearest dollar.
- **FR-007**: System MUST provide keyboard accessibility, mobile-friendly stacking, and smooth transitions along the setup steps.
- **FR-008**: System MUST handle external API/state errors defensively, providing retry actions where possible.
- **FR-009**: System MUST enforce a minimum value of 1 on all service-hours input fields at the input control level, preventing entry of 0 or negative numbers.
- **FR-010**: System MUST allow users to navigate back to any previously completed step via clickable step indicators, while preventing navigation to steps beyond the current one.
- **FR-011**: System MUST persist wizard state in browser-local storage so that all inputs and the current step survive page refreshes. No server-side draft saving is required.
- **FR-012**: System MUST apply different calculation logic based on the selected pricing model: "Hourly" produces a detailed per-service breakdown showing hourly rates, hours, and per-service costs; "Project-based" uses the same underlying calculation but aggregates the output into a single lump-sum project fee without per-hour granularity. Switching models must trigger an immediate recalculation.
- **FR-013**: System MUST provide a "Calculate & Save" button on the final wizard step that simultaneously displays the complete calculation result and persists it to the database. PDF download MUST be a separate, optional action available after saving.

### Key Entities

- **WizardState**: Contextual memory tracking current step, inputs, applied rules, and intermediate prices across the 7 stages without needing full page reloads. Persisted in browser-local storage to survive page refreshes; not saved to the server until final submission.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Feature completes real-time rate updates for any input on any step in consistently under 100ms.
- **SC-002**: Validations strictly prevent progression if required values are omitted or out-of-bounds metrics (e.g. Risk > 50%) are somehow forced into the system.
- **SC-003**: PDF generation starts streaming a complete document within acceptable perceptual times (under 3 seconds typical) cleanly containing all required breakdowns and user details.
- **SC-004**: Completion of the 7-step wizard journey occurs entirely client-side without full page reloads between steps.
