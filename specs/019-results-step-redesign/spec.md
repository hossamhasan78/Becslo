# Feature Specification: Results Step Redesign (Step 6)

**Feature Branch**: `019-results-step-redesign`
**Created**: 2026-03-28
**Status**: Draft
**Input**: Change 5 from `docs/IMPLEMENTATION_PLAN_ADDENDUM_v1.1.md`

---

## Overview

Step 6 (Results) currently shows a summary-only "Project Preview" with aggregated totals and a count of selected services. This change replaces it with the full calculation breakdown — every service listed individually, all cost line items, subtotal, risk buffer, profit margin, final price, and recommended price range. The Download PDF button moves to this step. The right-column live preview panel is removed entirely, as Step 6 now contains all the information it previously displayed.

---

## Clarifications

### Session 2026-03-28

- Q: Should the experience and geography multiplier values be retained on the redesigned Step 6, or removed? → A: Retain both multiplier values on Step 6, displayed below the service breakdown.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Freelancer Sees Full Calculation Breakdown on Step 6 (Priority: P1) 🎯 Launch Blocker

A freelancer reaches Step 6 after completing all five earlier steps. Instead of a brief summary, they see their complete quote: every selected service with its name, hours, and individual cost; every overhead cost category they entered with its amount; then the subtotal, risk buffer, profit margin, final price, and the recommended ±20% price range. Everything they need to understand and verify their quote is visible on this single step.

**Why this priority**: Step 6 is the core output of the entire product. The current summary view is insufficient for a freelancer to understand or act on their quote. Full detail is required before PDF export can be meaningful.

**Independent Test**: Complete the wizard with at least 2 services and 1 overhead cost. Reach Step 6. Confirm: each service appears as its own row with name, hours, and cost. The overhead cost appears by name and amount. Subtotal, risk buffer, profit margin, final price, and recommended range are all visible. No "Project Preview" label or count-based service summary remains.

**Acceptance Scenarios**:

1. **Given** the user reaches Step 6, **When** the step renders, **Then** each selected service is listed as an individual row showing its name, the number of hours, and its calculated cost.
2. **Given** the user entered overhead costs in Step 4, **When** Step 6 renders, **Then** each cost category appears as its own row with the category name and the amount entered.
3. **Given** the user entered no overhead costs, **When** Step 6 renders, **Then** the costs section shows a "no costs" message — no blank or zero-value rows.
4. **Given** the full breakdown is displayed, **When** the user reviews it, **Then** all of the following are present: subtotal, risk buffer amount, profit margin amount, final price (USD), and recommended price range (±20%).
5. **Given** the user is on Step 6, **When** they review the page, **Then** no "Project Preview" label, service count, or summary-only presentation remains.

---

### User Story 2 — Download PDF Button is on Step 6 (Priority: P1) 🎯 Launch Blocker

The Download PDF / export action button is located on Step 6. The user can initiate a PDF export directly from the full breakdown view without navigating elsewhere.

**Why this priority**: PDF export is the primary user action after reviewing the quote. Placing it on Step 6 completes the natural flow: complete wizard → review full quote → export.

**Independent Test**: Reach Step 6. Confirm a "Download PDF" button is visible. Confirm it is associated with the current calculation result. Confirm no PDF export button or link exists on any other wizard step.

**Acceptance Scenarios**:

1. **Given** the user is on Step 6, **When** the step renders, **Then** a "Download PDF" action button is visible.
2. **Given** the user clicks "Download PDF", **When** the click is processed, **Then** the PDF export flow is initiated for the current calculation.
3. **Given** the user is on Steps 1–5, **When** they review the navigation area, **Then** no PDF export button or link is present.

---

### User Story 3 — Right-Column Live Preview Removed (Priority: P1) 🎯 Launch Blocker

The wizard no longer shows a live preview panel in a right-hand column. The wizard occupies the full available width. The full calculation output is displayed on Step 6 only — not as a persistent panel visible during earlier steps.

**Why this priority**: The right column duplicates content now shown on Step 6, creates visual clutter during data-entry steps, and is referenced as a launch blocker in Change 5's "Done When" criteria.

**Independent Test**: Navigate through all 6 wizard steps. Confirm no right-column preview panel is visible at any step. Confirm the wizard content fills the full available width at every step. Confirm no layout gap or empty space exists where the right column used to be.

**Acceptance Scenarios**:

1. **Given** the user is on any wizard step (1–6), **When** the page renders, **Then** no live preview panel is visible in a side column or any position.
2. **Given** the right column is removed, **When** the user views the wizard on desktop and mobile, **Then** the wizard content occupies the full available width with no visual gap or artifact from the removed column.
3. **Given** the wizard is on Steps 1–5, **When** the user reviews the screen, **Then** no pricing figures or calculation output are shown — they appear only on Step 6.

---

### Edge Cases

- **No services selected**: If the user somehow reaches Step 6 with no services, the breakdown shows an empty state with a prompt to go back — no empty service table rows.
- **Very long service list**: If many services are selected, the service list scrolls within the page — no truncation or "show more" pattern needed for MVP.
- **Overhead costs not entered**: The costs section shows a "no costs entered" message rather than an empty table.
- **Recommended range calculation**: Recommended min = final price × 0.8, recommended max = final price × 1.2 — both rounded to the nearest dollar, consistent with existing engine behaviour.

---

## Functional Requirements *(mandatory)*

| ID | Requirement |
|----|-------------|
| FR-001 | Step 6 displays each selected service as an individual line item showing: service name, hours allocated, and calculated cost for that service. |
| FR-002 | Step 6 displays each user-entered overhead cost as an individual line item showing: cost category name and amount in USD. |
| FR-003 | Step 6 displays the full pricing summary: subtotal, risk buffer amount, profit margin amount, and final price in USD. |
| FR-003a | Step 6 displays the experience multiplier (×N) and geography multiplier (×N) below the service breakdown. |
| FR-004 | Step 6 displays the recommended price range: a minimum (−20% of final price) and a maximum (+20% of final price), both in USD. |
| FR-005 | The "Download PDF" action button is present on Step 6. |
| FR-006 | No "Project Preview" label, service count, or summary-only display remains on Step 6. |
| FR-007 | The right-column live preview panel is removed from the wizard layout entirely — it does not render on any step. |
| FR-008 | The wizard occupies the full available width on all steps after removal of the right column. |
| FR-009 | No pricing figures or calculation output are shown on Steps 1–5 — they appear exclusively on Step 6. |
| FR-010 | If no overhead costs were entered, Step 6 shows a "no costs" indicator rather than an empty table. |

---

## Success Criteria *(mandatory)*

| ID | Criterion |
|----|-----------|
| SC-001 | All selected services are individually listed on Step 6 — a 3-service selection produces 3 distinct rows, each with name, hours, and cost. |
| SC-002 | The final price shown on Step 6 is identical to the value previously shown in the live preview panel for the same inputs. |
| SC-003 | No right-column panel is visible on any wizard step across desktop and mobile viewpoints. |
| SC-004 | The wizard layout has no empty space, visual gap, or broken layout artifact where the right column previously existed. |
| SC-005 | The "Download PDF" button is present and functional on Step 6. |
| SC-006 | The recommended price range displayed (min and max) equals final price ×0.8 and ×1.2 respectively, rounded to nearest dollar. |

---

## Scope

### In Scope

- Full calculation breakdown display on Step 6 (services, costs, summary, recommended range)
- Removal of summary-only / count-based service presentation on Step 6
- "Download PDF" button placement on Step 6
- Removal of the right-column live preview panel from all wizard steps
- Full-width wizard layout after right column removal

### Out of Scope

- PDF generation logic or content (pre-existing feature, unchanged)
- Any changes to Steps 1–5 content or logic
- Wizard scroll containment or fixed-zone layout (covered in Change 11)
- Persistent application header (covered in Change 10)
- The `useMemo` real-time calculation in wizard context — it may remain for internal state; only the visible output changes

---

## Assumptions

| ID | Assumption |
|----|------------|
| A | The calculation data already available in wizard state (from the existing live preview) is sufficient to populate the full Step 6 breakdown — no new data fetching is required. |
| B | "Download PDF" button behaviour (what happens when clicked) is unchanged from the current implementation. Only its location moves to Step 6. |
| C | The right column is removed visually and from the layout — the underlying `useMemo` real-time calculation may remain in code as it is also used to populate the Step 6 breakdown. |
| D | All monetary values on Step 6 are displayed in USD, rounded to the nearest dollar, consistent with existing pricing engine behaviour. |
