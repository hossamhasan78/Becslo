# Feature Specification: Overhead Costs — User-Editable Amounts

**Feature Branch**: `017-user-editable-costs`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Change 3 — Overhead Costs: User-Editable Amounts from IMPLEMENTATION_PLAN_ADDENDUM_v1.1.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Freelancer Enters Own Overhead Costs (Priority: P1) 🎯 MVP

A freelancer reaches the Costs step (Step 4) of the wizard. Instead of seeing a list of checkboxes with pre-populated amounts, they see a list of cost categories (e.g., "Software Subscriptions", "Equipment", "Office Rent") each with an empty numeric input field. The freelancer types in their actual overhead amounts. Any category left blank or set to zero is automatically excluded from the calculation. Only costs with a positive amount are factored into the final price.

**Why this priority**: This is the core change — it replaces the existing UI pattern and directly affects the user's calculation accuracy. All other stories depend on this being in place.

**Independent Test**: Open the wizard as a logged-in user, navigate to Step 4 (Costs), confirm every cost category shows an empty input field with no pre-populated value, enter amounts in some fields and leave others blank, advance to Step 5 and confirm only the filled-in costs are reflected in the calculation.

**Acceptance Scenarios**:

1. **Given** the user is on the Costs step, **When** the step loads, **Then** each cost category displays an editable numeric input field that is empty (no pre-filled default value).
2. **Given** the user enters a positive amount in a cost category field, **When** they advance to the next step, **Then** that cost is included in the calculation total.
3. **Given** the user leaves a cost field blank or enters 0, **When** they advance to the next step, **Then** that cost is excluded from the calculation total.
4. **Given** the user enters only zeros or leaves all fields blank, **When** they attempt to advance, **Then** the wizard proceeds normally — no error is shown, and overhead contributes $0 to the total.

---

### User Story 2 - Calculation Reflects Only User-Entered Costs (Priority: P1) 🎯 MVP

When the user proceeds from the Costs step to the Results step (Step 6), the final quoted price reflects only the overhead costs the user manually entered. No legacy default value from the database is applied. The calculation is transparent — what the user typed is exactly what gets added.

**Why this priority**: This is the trust and accuracy guarantee. If a legacy default were silently applied, the calculation would be wrong. This story ensures the pricing engine honours only user input.

**Independent Test**: Enter known amounts in the Costs step, note the sum, proceed to Results, and verify the overhead total in the breakdown exactly matches the sum entered — with no additional amount from any database default.

**Acceptance Scenarios**:

1. **Given** the user entered amounts summing to $X on the Costs step, **When** the Results step loads, **Then** the overhead costs line in the calculation breakdown shows exactly $X.
2. **Given** the user entered no values on the Costs step (all blank), **When** the Results step loads, **Then** the overhead costs contribute $0 to the total.
3. **Given** the costs data store previously held default amounts, **When** the calculation runs after this change, **Then** no default amount is read or applied at any stage of the calculation.

---

### User Story 3 - Admin Manages Cost Categories Without Amounts (Priority: P2)

An admin visits the admin configuration editor to manage cost categories. They can add new category names and remove existing ones. However, they no longer see a "default cost amount" input field anywhere in the admin UI — that field has been permanently removed. The admin's role is to define what cost categories exist, not to pre-set amounts.

**Why this priority**: The admin experience must be consistent with the new model. Leaving a "default cost" field in the admin panel would be misleading and could imply defaults are being applied when they are not.

**Independent Test**: Log in as admin, open the cost categories configuration page, confirm there is no input field for a default amount on any cost category — only the category name and add/remove controls.

**Acceptance Scenarios**:

1. **Given** the admin is on the cost categories management page, **When** they view an existing cost category, **Then** no "default amount" or "default cost" field is visible.
2. **Given** the admin adds a new cost category, **When** they complete the form, **Then** only the category name is required — no amount field is present in the form.
3. **Given** the admin opens any cost-related configuration panel, **When** they inspect all form fields, **Then** no field labelled "default cost", "default amount", or similar exists.

---

### Edge Cases

- What happens if all cost categories are left blank — does the wizard allow advancing? (Yes — costs are optional; a freelancer may have zero overheads.)
- What happens if the user enters a very large number in a cost field? → Cap is $999,999 per category; values above this are blocked at the field level.
- What happens if the user enters a decimal value (e.g., $12.50) — is fractional input accepted and rounded to the nearest dollar per the product-wide rounding rule?
- What happens if cost categories are removed by the admin between wizard sessions — does the Costs step gracefully handle a returning user whose previous session referenced a now-deleted category?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The costs data store MUST NOT contain a default cost amount field after the migration runs — the field is permanently removed, not nulled or deprecated.
- **FR-002**: The Costs step (Step 4) MUST display each active cost category as a row with an editable numeric input field. No pre-populated value is shown. The field MUST restrict input to numeric characters only — non-numeric keystrokes are blocked at the field level with no error message required.
- **FR-002a**: Each cost field MUST enforce a maximum value of $999,999. Values above this cap MUST be rejected at the field level (input blocked or clamped) before the user can advance.
- **FR-003**: The Costs step MUST treat any field left blank or set to 0 as excluded from the calculation. Only positive values (up to $999,999) are included.
- **FR-004**: The pricing engine MUST sum only the values the user entered on the Costs step. It MUST NOT read or apply any stored default cost amount.
- **FR-005**: The admin cost category editor MUST NOT present any field for entering or editing a default cost amount. Admins manage category names only.
- **FR-006**: Entering a cost amount MUST be optional — the wizard MUST allow the user to advance from the Costs step with all fields empty or zero.
- **FR-007**: Cost amounts entered by the user MUST be rounded to the nearest dollar consistent with the product-wide rounding rule.
- **FR-008**: The data migration MUST be safe to run on a database where the default cost field has already been removed — it must not error on a clean state.

### Key Entities

- **Cost Category**: A named overhead type defined by the admin (e.g., "Software Subscriptions"). After this change, it holds only a name and display order — no default amount.
- **User Cost Entry**: The amount a user types for a specific cost category during a wizard session. On calculation completion, each entry is stored individually as a separate record attached to the calculation — preserving the category name and the user-entered amount. This enables the Results step to display cost line items by name and amount.
- **Calculation**: The wizard output record. Its overhead cost total is the sum of all individual user cost entries stored against it. No single pre-summed total is stored — the total is always derived from the individual entries.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After the migration, the costs data store contains zero records with a default cost value — the field does not exist.
- **SC-002**: 100% of cost category rows on the Costs step render with empty input fields and no pre-populated amount on first load.
- **SC-003**: A calculation produced after this change with known user-entered cost values shows an overhead total that exactly matches the sum of those user-entered values — no discrepancy from any legacy default.
- **SC-004**: The admin cost category management page contains zero UI elements referencing "default cost", "default amount", or pre-set cost values.
- **SC-005**: The wizard can be completed end-to-end with all cost fields left blank, producing a valid calculation with $0 overhead contribution.

---

## Scope

### In Scope

- Data migration to permanently remove the default cost amount field from the costs store.
- Wizard Step 4 (Costs) UI: replace the existing checkbox/pre-filled list with per-category editable numeric input fields.
- Pricing engine update: derive overhead cost total from user input only.
- Admin cost category editor: remove the default cost amount field.

### Out of Scope

- Adding, reordering, or redesigning cost categories themselves — admin content management is unchanged beyond removing the amount field.
- Changes to the Results step layout or PDF export (covered by Change 5 in the addendum).
- Any changes to how risk buffer or profit margin are calculated.
- Saving or persisting individual cost entries between separate wizard sessions.

---

## Clarifications

### Session 2026-03-26

- Q: How should cost entries be stored per calculation — individually per category (name + amount each) or as a single summed total? → A: Individually per category. Each user cost entry is stored as a separate record (category name + amount) attached to the calculation, enabling Results step line-item display.
- Q: What is the expected behaviour when a user enters non-numeric text in a cost field? → A: Restrict input at the field level — non-numeric keystrokes are silently blocked. No error message needed.
- Q: Should there be a maximum allowed value per cost field? → A: Yes — $999,999 per category. Values above this cap are blocked at the field level.

---

## Assumptions

- The costs data store currently has a default cost amount field holding numeric values. The migration removes this field with no data archival needed.
- Cost categories are already seeded. This feature does not add or remove any categories — only removes the amount field.
- User-entered cost amounts are stored as part of the calculation record, not the cost categories table — consistent with the existing calculation data model.
- Fractional dollar input (e.g., $12.50) is accepted but rounded to the nearest dollar on calculation, consistent with the product-wide rounding rule.
- The Costs step currently uses a checkbox-based UI. This feature replaces that entirely with a numeric input list.
- No cost entry is mandatory — the wizard must be completable with all costs at zero.
