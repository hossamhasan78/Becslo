# Feature Specification: Step 5 — Relabel Next Button to 'Calculate'

**Feature Branch**: `018-calculate-button-label`
**Created**: 2026-03-28
**Status**: Draft
**Input**: Change 4 from `docs/IMPLEMENTATION_PLAN_ADDENDUM_v1.1.md`

---

## Overview

On the Risk & Profit step (Step 5) of the wizard, the navigation button that advances the user to the Results step is currently labelled "Next". This change relabels it to "Calculate" to better reflect what happens when the user clicks it — their entered data is used to produce a priced quote. The button's behaviour, position, and visual style are unchanged.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — User Sees 'Calculate' on Step 5 (Priority: P1)

A freelancer reaches Step 5 (Risk & Profit) of the wizard after completing Steps 1–4. They review their risk buffer and profit margin settings. Instead of a generic "Next" button, they see a "Calculate" button. Clicking it advances them to Step 6 (Results) exactly as before.

**Why this priority**: This is the only change in this feature. It is low effort but reinforces that clicking the button produces the final calculation — improving the clarity of the user journey.

**Independent Test**: Navigate to Step 5 in the wizard. Confirm the action button reads "Calculate". Click it. Confirm the wizard advances to Step 6 (Results) and the full calculation breakdown is displayed.

**Acceptance Scenarios**:

1. **Given** the user is on Step 5 (Risk & Profit), **When** the step renders, **Then** the primary action button label reads "Calculate" (not "Next" or any other label).
2. **Given** the user clicks the "Calculate" button, **When** the click is processed, **Then** the wizard advances to Step 6 (Results) and the full calculation output is displayed.
3. **Given** the user is on any other wizard step (1–4), **When** the step renders, **Then** the primary action button label reads "Next" — unchanged.

---

### Edge Cases

- **Button disabled state**: If the step's validation is not yet satisfied (e.g., required fields empty), the "Calculate" button remains disabled — label changes but disabled behaviour does not.
- **Back button**: The Back button on Step 5 is unaffected — it continues to navigate to Step 4 with no label or behaviour change.

---

## Functional Requirements *(mandatory)*

| ID | Requirement |
|----|-------------|
| FR-001 | The primary action button on Step 5 (Risk & Profit) displays the label "Calculate". |
| FR-002 | Clicking the "Calculate" button on Step 5 advances the wizard to Step 6 (Results) — identical behaviour to the previous "Next" button. |
| FR-003 | The "Calculate" button respects the same enabled/disabled validation rules as the previous "Next" button — no change to when the button becomes clickable. |
| FR-004 | All other wizard steps (1, 2, 3, 4) continue to display "Next" as the primary action button label. |

---

## Success Criteria *(mandatory)*

| ID | Criterion |
|----|-----------|
| SC-001 | Step 5 shows "Calculate" as the button label in all tested states (enabled and disabled). |
| SC-002 | No other wizard step is affected — steps 1–4 continue to show "Next". |
| SC-003 | Clicking "Calculate" on Step 5 successfully advances to Step 6 in 100% of cases where validation passes. |

---

## Scope

### In Scope

- Label text of the primary action button on Step 5 only.

### Out of Scope

- Button behaviour, styling, position, or animation.
- Any changes to Steps 1–4 or Step 6.
- Changes to the Back button or any secondary buttons.
- Step 6 content or layout (covered in Change 5).

---

## Assumptions

| ID | Assumption |
|----|------------|
| A | "Step 5" refers to the Risk & Profit step in the current 6-step wizard (after the Pricing Model step was removed in Change 1). |
| B | The button is the same component used for "Next" on other steps — only the label text prop changes, not the component itself. |
