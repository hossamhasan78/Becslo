# Feature Specification: Interactive In-Wizard Step Navigation

**Feature Branch**: `021-interactive-wizard-nav`
**Created**: 2026-03-28
**Status**: Draft
**Input**: User description: "Interactive In-Wizard Step Navigation — clicking a step in the wizard body navigates to that step; completed steps are clickable, current step is highlighted, future steps are locked."

## Clarifications

### Session 2026-03-28

- Q: When a user edits an earlier completed step and then moves forward, what happens to the steps that follow the edited one? → A: Steps after the edited step remain completed and stay clickable — editing an earlier step does not invalidate or reset subsequent steps.
- Q: Should the step list items be keyboard-navigable? → A: Full keyboard navigation — step items are focusable via Tab and activatable via Enter or Space.
- Q: After a user back-navigates to an earlier step via the step list, pressing Next advances to: → A: Always one step at a time (e.g., Step 2 → Step 3), regardless of how far the user has previously reached.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Back to a Completed Step (Priority: P1)

A user is partway through the wizard and realises they need to change something in a step they already completed. They click that step's label in the wizard's step list and are taken directly back to it — without using the Back button repeatedly.

**Why this priority**: This is the core value of the feature. Without it, users are forced to step backwards one at a time, which is slow and frustrating. This alone makes the feature worthwhile.

**Independent Test**: Can be fully tested by completing Steps 1–3, then clicking Step 1 in the step list — the user should land on Step 1 with their previously entered data intact.

**Acceptance Scenarios**:

1. **Given** the user has completed Step 1 and is now on Step 3, **When** they click Step 1 in the step list, **Then** the wizard navigates to Step 1 and displays the content they previously entered.
2. **Given** the user has completed Steps 1–4 and is on Step 5, **When** they click Step 2, **Then** the wizard navigates to Step 2 preserving all wizard state.
3. **Given** the user navigates back to Step 2 and changes a value, **When** they proceed forward through the wizard, **Then** the updated value is carried through to the final calculation and Steps 3–6 remain in completed state.

---

### User Story 2 - Locked Future Steps Cannot Be Skipped (Priority: P2)

A user on Step 2 tries to click Step 5 in the step list. The click has no effect — Step 5 appears visually locked and the wizard remains on Step 2. This enforces data-entry order and prevents incomplete calculations.

**Why this priority**: Preventing forward-skip is required for data integrity. Steps build on each other; skipping ahead would result in missing inputs and broken calculation outputs.

**Independent Test**: Can be fully tested on a fresh wizard load — all steps beyond Step 1 should be non-interactive, and clicking them should not change the active step.

**Acceptance Scenarios**:

1. **Given** the user is on Step 1 (no steps completed), **When** they click Step 3 in the step list, **Then** nothing happens — the wizard stays on Step 1.
2. **Given** the user is on Step 3 (Steps 1–2 completed), **When** they click Step 5, **Then** the wizard remains on Step 3 and Step 5 shows a locked/disabled visual indicator.
3. **Given** the user is on Step 6 (all prior steps completed), **When** they view the step list, **Then** all steps 1–5 are shown as completed and clickable.

---

### User Story 3 - Visual Step States Are Clear (Priority: P3)

A user can tell at a glance which steps they have completed, which step they are currently on, and which steps they have not yet reached. The step list communicates this with distinct visual treatment for each state.

**Why this priority**: Clear visual feedback is necessary for users to confidently navigate. Without distinct states, users cannot easily identify which steps are interactive.

**Independent Test**: Can be tested visually by inspecting the step list at different wizard stages and confirming the three states (completed, active, future) are visually distinguishable.

**Acceptance Scenarios**:

1. **Given** a user on Step 3 with Steps 1–2 completed, **When** they view the step list, **Then** Steps 1–2 appear with a completion indicator (e.g., checkmark or distinct colour), Step 3 appears highlighted as the current step, and Steps 4–6 appear visually muted or with a locked indicator.
2. **Given** a user on Step 1 (fresh start), **When** they view the step list, **Then** Step 1 is highlighted as active and Steps 2–6 are locked/greyed.
3. **Given** a user who completed all 6 steps, **When** they view the step list, **Then** all steps show completed styling with no locked indicators.

---

### Edge Cases

- If the user navigates back to an earlier step and changes an input, subsequent completed steps remain completed and clickable — their completion status is not reset.
- On mobile viewports, the step list renders as a horizontal row of compact buttons (existing layout uses `flex-wrap` and responsive gap sizing) — no separate mobile-specific behaviour is required.
- What if the wizard only has one step completed — the user can click that single completed step to revisit it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The wizard's in-body step list MUST be interactive — each step item MUST be a clickable element, not static text.
- **FR-002**: Clicking a completed step in the step list MUST navigate the wizard to that step.
- **FR-003**: Clicking a future (not-yet-reached) step MUST have no effect — the wizard MUST remain on the current step.
- **FR-004**: The current step MUST be visually highlighted in the step list to distinguish it from all other steps.
- **FR-005**: Completed steps MUST display a visual completion indicator (e.g., checkmark or distinct colour) that differs from the current and future step styles.
- **FR-006**: Future steps MUST display a locked or disabled visual state that communicates they are non-interactive.
- **FR-007**: Navigation via the step list MUST preserve all wizard state — data entered in any step MUST NOT be lost when the user navigates back via the step list and then continues forward.
- **FR-008**: If other step navigation elements are present in the wizard, their interactive behaviour MUST be consistent with the step list — completed steps clickable, future steps locked, current step highlighted.
- **FR-009**: A step MUST be classified as "completed" once the user has advanced past it using a forward-navigation action (Next / Calculate button). This applies to Steps 1–5 only — Step 6 is the terminal step and has no subsequent step to advance to, so the completed/current distinction is only relevant for Steps 1–5.
- **FR-010**: Editing data in a previously completed step MUST NOT change the completed status of any subsequent steps — all steps already marked completed remain completed regardless of edits made to earlier steps.
- **FR-011**: Step list items MUST be focusable via keyboard (Tab key) and activatable via Enter or Space — completed steps MUST respond to keyboard activation identically to mouse click; future steps MUST remain inert to keyboard activation.
- **FR-012**: The Next / Calculate button MUST always advance exactly one step forward from the current step — it MUST NOT skip ahead to the furthest previously reached step when the user has back-navigated.

### Key Entities

- **Wizard Step**: A discrete stage in the wizard flow (Steps 1–6). Has three possible navigation states: completed, current, or future.
- **Step List**: The in-body component that renders the ordered list of wizard steps. Each item displays the step label and its current state.
- **Wizard State**: The in-memory record of the user's progress — tracks the active step index and the highest step reached. Determines which steps are completed, current, or future. Editing an earlier step does not reduce the highest step reached.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate from any completed step back to any earlier completed step in a single click — no multi-click back-stepping is required.
- **SC-002**: 100% of future steps (steps beyond the highest-reached step) are non-interactive — clicking them produces no navigation change in any tested scenario.
- **SC-003**: All three step states (completed, current, future) are visually distinguishable without requiring any tooltip or additional explanation.
- **SC-004**: Navigating back and forward via the step list produces no data loss — all previously entered values are retained across all steps in every tested scenario.
- **SC-005**: The step list navigation rules and visual states are consistent across desktop and mobile viewports.

## Assumptions

- The wizard already renders a step list component in the wizard body (sidebar or inline). This feature makes it interactive — it does not introduce a brand-new navigation component from scratch.
- "Completed" means the user has navigated forward past a step at least once using the Next or Calculate button. A step the user is currently on but has not yet advanced from is the current step, not completed.
- No unsaved-change warning is required when clicking a completed step — wizard field values are held in memory continuously and are not lost on step change.
- The number of wizard steps is fixed at 6, as per the post-Change-1 wizard flow.
- Step progress state is tracked via the wizard's existing in-memory state (session storage was removed per Change 7; this feature does not re-introduce it).
- The highest-reached step index is never decreased — it only increases as the user advances forward. Editing an earlier step does not lower it.
