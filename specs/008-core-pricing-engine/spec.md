# Feature Specification: Core Pricing Engine

**Feature Branch**: `008-core-pricing-engine`
**Created**: 2026-03-18
**Status**: Draft
**Input**: User description: "Implement full calculation engine to produce final price based on services, experience, geography, costs, risk, and profit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate Project Price with Complete Parameters (Priority: P1)

Freelancer wants to calculate a project price by selecting services, specifying hours, inputting experience levels, choosing geographic locations, selecting optional costs, and adjusting risk and profit margins. The system calculates and displays the final price with a breakdown of all components.

**Why this priority**: This is the core functionality that enables the entire application. Without accurate pricing calculations, users cannot determine appropriate project fees, making this the highest priority feature.

**Independent Test**: Can be fully tested by entering a complete set of parameters (services, hours, experience, geography, costs, risk, profit) and validating that the system produces the correct final price with detailed breakdown. Delivers complete pricing functionality to users.

**Acceptance Scenarios**:

1. **Given** a user has selected 3 services with specified hours (5, 8, 3), **When** they enter designer experience 5, freelance experience 7, designer country USA, client country Germany, select 2 overhead costs, set risk buffer 15%, and profit margin 25%, **Then** the system calculates and displays the final price with complete breakdown of services, adjusted rates, multipliers, costs, risk amount, and profit amount.
2. **Given** a user has completed all parameter inputs, **When** they view the results, **Then** the system shows final price rounded to nearest dollar and recommended price range (±20%).

---

### User Story 2 - Real-Time Preview During Input (Priority: P2)

Freelancer is entering project parameters and wants to see the price update instantly as they adjust each input field without requiring manual submission.

**Why this priority**: Real-time feedback improves user experience and enables rapid exploration of different pricing scenarios. Users can immediately see how changing experience, geography, or other factors impacts the final price.

**Independent Test**: Can be fully tested by entering parameters and changing each input while observing that the price updates within 100ms without page reload or manual submission.

**Acceptance Scenarios**:

1. **Given** a user is entering project parameters, **When** they adjust any input (hours, experience, country, costs, risk, profit), **Then** the displayed price updates within 100ms.
2. **Given** a user is exploring different scenarios, **When** they rapidly change multiple inputs, **Then** the price preview remains responsive and accurate.

---

### User Story 3 - Validation of Input Parameters (Priority: P3)

Freelancer enters project parameters that may be invalid or out of range, and the system must provide clear feedback about what needs to be corrected.

**Why this priority**: Ensures data integrity and prevents calculation errors. Without proper validation, users may receive incorrect prices or confusing results.

**Independent Test**: Can be fully tested by entering invalid inputs (negative hours, experience outside 1-10, etc.) and validating that appropriate error messages appear.

**Acceptance Scenarios**:

1. **Given** a user enters invalid parameters (e.g., designer experience 12), **When** the system validates the input, **Then** the system displays a clear error message indicating the valid range and disables price calculation.
2. **Given** a user enters valid parameters, **When** the system validates the input, **Then** the system enables calculation and removes any error messages.

---

### Edge Cases

- What happens when all service hours are zero?
- What happens when risk buffer is set to 0%?
- What happens when profit margin is set to minimum (10%) or maximum (50%)?
- How does the system handle negative or non-numeric inputs?
- What happens when the same country is selected for both designer and client?
- What happens when no overhead costs are selected?
- How does the system handle extremely large hour values (e.g., 1000+ hours)?
- What happens when experience values are at minimum (1, 1) or maximum (10, 10)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept service selections with user-specified hours for each service
- **FR-002**: System MUST accept designer experience rating on 1-10 scale
- **FR-003**: System MUST accept freelance experience rating on 1-10 scale
- **FR-004**: System MUST accept designer country selection to apply geography multiplier
- **FR-005**: System MUST accept client country selection to apply geography multiplier
- **FR-006**: System MUST accept selection of zero or more overhead costs
- **FR-007**: System MUST accept risk buffer percentage between 0% and 50%
- **FR-008**: System MUST accept profit margin percentage between 10% and 50%
- **FR-009**: System MUST calculate experience multiplier by multiplying designer experience × freelance experience (range 1-100)
- **FR-010**: System MUST apply country-specific geography multipliers based on designer and client countries
- **FR-011**: System MUST calculate adjusted rate per service using formula: base_rate × experience_multiplier × geography_multiplier
- **FR-012**: System MUST calculate base cost as sum of (service_hours × adjusted_rate) for all selected services
- **FR-013**: System MUST calculate subtotal as base_cost + sum of selected overhead costs
- **FR-014**: System MUST calculate risk buffer amount as subtotal × risk_buffer_percentage
- **FR-015**: System MUST calculate profit margin amount as (subtotal + risk_buffer) × profit_margin_percentage
- **FR-016**: System MUST calculate final price as subtotal + risk_buffer + profit_margin
- **FR-017**: System MUST round final price to nearest dollar
- **FR-018**: System MUST calculate recommended minimum price as final_price × 0.8 (20% below final)
- **FR-019**: System MUST calculate recommended maximum price as final_price × 1.2 (20% above final)
- **FR-020**: System MUST display complete calculation breakdown including services, adjusted rates, multipliers, costs, risk amount, and profit amount
- **FR-021**: System MUST validate all inputs are within specified ranges before calculation
- **FR-022**: System MUST display clear error messages for invalid inputs
- **FR-023**: System MUST update price preview within 100ms when any input changes
- **FR-024**: System MUST store calculation results for later reference

### Key Entities *(include if feature involves data)*

- **Service Pricing Configuration**: Represents base rates for services, default hours, and geographic multipliers
- **Experience Multiplier**: Calculated value (1-100) derived from designer and freelance experience ratings
- **Geography Multiplier**: Country-specific factor (0.5x to 2.0x) applied based on designer and client locations
- **Overhead Cost**: Fixed expense items that can be optionally included in project pricing
- **Calculation Result**: Complete pricing breakdown including all components, final price, and recommended range

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pricing calculation completes within 100ms for any valid input combination
- **SC-002**: System supports 1,000 concurrent users performing real-time pricing calculations without performance degradation
- **SC-003**: 100% of calculations are accurate based on specified formula when tested against manually verified cases
- **SC-004**: Users can explore 5+ different pricing scenarios per minute due to sub-100ms real-time preview
- **SC-005**: Validation prevents 100% of invalid inputs from producing calculations
- **SC-006**: 99% of users understand and can interpret the complete calculation breakdown displayed

## Assumptions

- Base rates and geography multipliers are pre-configured in the system
- Hourly rates are always in USD currency
- All experience ratings are whole numbers on 1-10 scale
- Users have selected at least one service before calculation
- The system has access to country data with multipliers for ~200 countries
- Price preview updates immediately when users change inputs
- System provides secure validation of all pricing parameters
