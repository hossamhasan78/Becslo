# Feature Specification: Frontend - Calculator

**Feature Branch**: `003-frontend-calculator`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Frontend - Calculator - Build wizard layout, Implement each step component, Build live preview panel, Integrate API calls"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Pricing Model Selection (Priority: P1)

As a user, I need to select my pricing model so that I can proceed with the calculation.

**Why this priority**: The first step in the calculator wizard. Without selecting a pricing model, users cannot proceed.

**Independent Test**: Can be tested by loading the calculator and verifying the pricing model step is displayed and selectable.

**Acceptance Scenarios**:

1. **Given** the user visits the calculator, **When** the page loads, **Then** the pricing model selection step is displayed as the first step
2. **Given** the user is on the pricing model step, **When** they select "hourly" or "fixed", **Then** the selection is saved and they can proceed to the next step
3. **Given** the user has selected a pricing model, **When** they move to the next step, **Then** their selection persists

---

### User Story 2 - Select Services (Priority: P1)

As a user, I need to select services and specify hours so that I can calculate my pricing.

**Why this priority**: Core functionality - services are the basis for calculating the project cost.

**Independent Test**: Can be tested by selecting services and verifying hours can be adjusted within min/max bounds.

**Acceptance Scenarios**:

1. **Given** the user navigates to the services step, **When** services are loaded, **Then** they are displayed grouped by category in an accordion
2. **Given** the user expands a category, **When** they see available services, **Then** they can select services and adjust hours within allowed ranges
3. **Given** the user adjusts service hours, **When** they enter a value outside the allowed range, **Then** the input shows an error
4. **Given** the user has selected services, **When** they proceed, **Then** the total hours are calculated correctly

---

### User Story 3 - Enter Experience Information (Priority: P1)

As a user, I need to enter my design experience and freelance experience so that the calculator can apply the appropriate multipliers.

**Why this priority**: Experience level directly affects the pricing through multipliers defined in configuration.

**Independent Test**: Can be tested by entering experience years and verifying the correct multiplier is applied.

**Acceptance Scenarios**:

1. **Given** the user reaches the experience step, **When** the page loads, **Then** designer experience and freelance experience selectors are displayed
2. **Given** the user selects a designer experience range, **When** they select "3-5 years", **Then** the corresponding multiplier (1.0) is applied
3. **Given** the user selects a freelance experience range, **When** they select "2-3 years", **Then** the corresponding multiplier (1.0) is applied

---

### User Story 4 - Select Geography (Priority: P1)

As a user, I need to select my country and client's country so that the calculator can apply geography-based multipliers.

**Why this priority**: Geography affects pricing through cost of living adjustments.

**Independent Test**: Can be tested by selecting countries and verifying the geography multiplier is applied.

**Acceptance Scenarios**:

1. **Given** the user reaches the geography step, **When** the page loads, **Then** country dropdowns for designer and client are displayed
2. **Given** the user selects designer country and client country, **When** they proceed, **Then** the geography multiplier is applied correctly

---

### User Story 5 - Add Overhead Costs (Priority: P2)

As a user, I need to add overhead costs so that they are included in the final calculation.

**Why this priority**: Many freelance projects have additional costs that should be factored into pricing.

**Independent Test**: Can be tested by adding costs and verifying they appear in the final calculation.

**Acceptance Scenarios**:

1. **Given** the user reaches the costs step, **When** the page loads, **Then** predefined cost categories are displayed (Software, Subscriptions, Tools, Outsourcing, Travel, Research Incentives, Misc)
2. **Given** the user adds a cost, **When** they specify name, amount, and type (monthly/project), **Then** the cost is added to the calculation
3. **Given** the user has added costs, **When** they proceed, **Then** the overhead is included in the final price

---

### User Story 6 - View Live Calculation Preview (Priority: P1)

As a user, I need to see a live preview of my calculation as I complete each step so that I understand how my inputs affect the final price.

**Why this priority**: This is a core constitutional requirement - the Real-Time Calculator Preview ensures users get immediate feedback.

**Independent Test**: Can be tested by changing inputs and verifying the preview updates immediately.

**Acceptance Scenarios**:

1. **Given** the user is on any step, **When** they modify any input, **Then** the preview panel updates within 100ms
2. **Given** the user views the preview panel, **When** they are on any step, **Then** they see the breakdown: base rate, experience multiplier, geography multiplier, services subtotal, costs, risk buffer, profit margin, final price

---

### User Story 7 - Export PDF (Priority: P1)

As a user, I need to export my calculation as a PDF so that I can share it with clients.

**Why this priority**: PDF export is a primary deliverable for presenting pricing to clients.

**Independent Test**: Can be tested by clicking export and verifying a PDF is downloaded.

**Acceptance Scenarios**:

1. **Given** the user completes all steps, **When** they click "Export PDF", **Then** a PDF is generated with all calculation details
2. **Given** the user requests PDF export, **When** generation succeeds, **Then** the PDF downloads automatically

---

### Edge Cases

- What happens when no services are selected?
- What happens when API calls fail (services, config, countries)?
- How does the wizard handle incomplete data when navigating between steps?
- What happens when experience or country selections are invalid?
- How does the system handle very large hour totals?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a wizard layout with 3/4 width left panel for wizard steps
- **FR-002**: System MUST display a live preview panel in 1/4 width right side
- **FR-003**: System MUST implement Step 1: Pricing Model selection (hourly/fixed)
- **FR-004**: System MUST implement Step 2: Service selection with accordion by category and manual hours input
- **FR-005**: System MUST implement Step 3: Experience selection (designer years + freelance years)
- **FR-006**: System MUST implement Step 4: Geography selection (designer country + client country from ISO list)
- **FR-007**: System MUST implement Step 5: Costs input with predefined categories
- **FR-008**: System MUST implement Step 6: Results preview with calculation breakdown
- **FR-009**: System MUST implement Step 7: Export PDF button
- **FR-010**: System MUST fetch services from API and group by category
- **FR-011**: System MUST fetch pricing configuration from API (multipliers, base rate)
- **FR-012**: System MUST fetch country list from API
- **FR-013**: System MUST calculate pricing in real-time as user modifies inputs
- **FR-014**: System MUST apply experience multipliers correctly based on selected ranges
- **FR-015**: System MUST apply geography multipliers based on selected countries
- **FR-016**: System MUST apply risk buffer and profit margin to final price
- **FR-017**: System MUST validate service hours within min/max bounds
- **FR-018**: System MUST generate PDF export with full calculation breakdown

### Key Entities *(include if feature involves data)*

- **PricingModel**: User's choice between hourly or fixed-price
- **SelectedService**: Service with user-specified hours
- **ExperienceLevel**: Designer and freelance experience ranges
- **GeographicLocation**: Designer and client countries
- **OverheadCost**: Additional costs with name, amount, and type
- **CalculationBreakdown**: Real-time preview showing all price components

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Wizard loads within 2 seconds on standard connection
- **SC-002**: Preview panel updates within 100ms of input change
- **SC-003**: All seven wizard steps are navigable
- **SC-004**: Service hours validation prevents invalid inputs
- **SC-005**: Final price matches manual calculation when same inputs are used
- **SC-006**: PDF export generates and downloads successfully
- **SC-007**: API failures show appropriate error messages without breaking the wizard
- **SC-008**: Users can complete the full wizard flow from start to PDF export

---

## Assumptions

- Backend API endpoints are already implemented from Phase 2
- User authentication is handled by Supabase Auth
- Pricing engine logic is available in the codebase
- PDF generation component is available from Phase 2
- Services are pre-seeded in the database
- Configuration values are at default values
