# Research: Core Pricing Engine

**Feature**: 008-core-pricing-engine
**Date**: 2026-03-18
**Status**: Complete

## Research Summary

This document consolidates research findings for technical decisions required to implement the Core Pricing Engine. All unknowns from Technical Context have been resolved.

---

## Decision 1: State Management Solution

**Decision**: Use React Context for global pricing state management

**Rationale**:
- Simpler setup with no additional dependencies
- Built into React, no learning curve for team
- Adequate for pricing state (single source of truth, moderate complexity)
- NextJS 14.x includes native support for Context in Server Components
- Sufficient for the wizard's state needs (7 steps, pricing calculation)
- Reduces bundle size compared to Zustand (~2.8KB)

**Alternatives Considered**:
- Zustand: More performant for complex state, but adds external dependency and increases complexity unnecessarily for this use case
- Redux: Overkill for pricing state; boilerplate-heavy
- Local component state: Insufficient; pricing data needed across wizard steps and preview panel

**Implementation Notes**:
- Create `PricingContext` with provider wrapping wizard page
- Store all pricing parameters (services, hours, experience, geography, costs, risk, profit)
- Export custom hooks (`usePricing`) for component access
- Use `useMemo` for calculated values to optimize re-renders

---

## Decision 2: E2E Testing Framework

**Decision**: Use Playwright for end-to-end testing

**Rationale**:
- Better TypeScript support than Cypress
- Faster test execution with parallel run capability
- Supports multiple browsers out-of-box (Chrome, Firefox, Safari, Edge)
- Next.js official documentation recommends Playwright for E2E tests
- Better debugging experience with Trace Viewer
- Active development and strong community support

**Alternatives Considered**:
- Cypress: Popular but slower TypeScript integration, requires more configuration for Next.js App Router
- Selenium: Too complex setup, maintenance overhead high for MVP scope
- Testing Library only: Insufficient for end-to-end calculation flow validation

**Implementation Notes**:
- Test critical flows: complete calculation workflow, validation scenarios, real-time preview updates
- Mock external dependencies (Supabase API calls) to ensure test reliability
- Use fixtures for test data (services, countries, costs)
- Run E2E tests in CI/CD pipeline before deployment

---

## Decision 3: Achieving Sub-100ms Real-Time Preview

**Decision**: Client-side calculation with optimized algorithms

**Rationale**:
- Server-side calculation adds network latency (50-200ms round trip)
- Client-side calculation eliminates network delay entirely
- Pricing formula is deterministic (no external dependencies)
- JavaScript/TypeScript is fast enough for calculation complexity (~10-20 operations)
- Reduces server load and API costs
- Enables instant feedback as users adjust inputs

**Alternatives Considered**:
- Server-side API calls: Would exceed 100ms target due to network latency
- Hybrid approach (debounced server validation): Unnecessary complexity for MVP
- Web Workers: Overkill for this calculation complexity; main thread sufficient

**Implementation Notes**:
- Implement `calculatePrice()` function in `lib/pricing-engine.ts`
- Use pure mathematical operations (no async operations)
- Cache intermediate results (experience multiplier, adjusted rates)
- Debounce rapid input changes (50-100ms) to prevent excessive recalculations
- Validate inputs client-side before calculation
- Server-side endpoint exists for final validation and storage (security)

---

## Decision 4: Validation Approach

**Decision**: Dual-layer validation (client-side + server-side)

**Rationale**:
- Client-side validation: Immediate user feedback, prevents invalid API calls, improves UX
- Server-side validation: Security layer, prevents manipulation, ensures data integrity
- Both layers enforce same validation rules for consistency
- Required by security best practices (never trust client input)
- Enables real-time error messages without page reloads

**Alternatives Considered**:
- Client-side only: Security risk; users can bypass and submit invalid data
- Server-side only: Poor UX; network latency delays error feedback, slower response time
- Validation library only: Insufficient; custom business rules (e.g., experience 1-10) need custom logic

**Implementation Notes**:
- Client-side: Use Zod schema for type-safe validation, inline error messages
- Server-side: Reuse Zod schemas in API route, return 400 errors with clear messages
- Validation rules:
  - Services: At least one selected, hours >= 0
  - Experience: 1-10 range for both designer and freelance
  - Countries: Must be valid country codes from database
  - Costs: Optional, must be valid cost IDs
  - Risk buffer: 0-50% range
  - Profit margin: 10-50% range
- Disables "Calculate/Export" button until all inputs valid

---

## Decision 5: Pricing Engine Architecture

**Decision**: Pure functional calculation engine with TypeScript types

**Rationale**:
- Predictable: Same inputs always produce same outputs
- Testable: Easy to unit test with mock inputs
- Maintainable: Clear separation of concerns (calculation vs. presentation)
- Type-safe: TypeScript catches type errors at compile time
- Portable: Can run on client and server (no browser-specific APIs)
- Performance: Pure functions are fast and can be optimized by V8 engine

**Alternatives Considered**:
- Class-based engine: Unnecessary complexity; adds boilerplate without benefit
- Stateful engine: Harder to test, unpredictable behavior
- Third-party calculation library: Overkill; custom formula is straightforward

**Implementation Notes**:
- Create `lib/pricing-engine.ts` with pure function `calculatePrice(input: PricingInput): PricingOutput`
- Define interfaces:
  ```typescript
  interface PricingInput {
    services: Array<{ serviceId: string, hours: number }>
    designerExperience: number
    freelanceExperience: number
    designerCountryCode: string
    clientCountryCode: string
    selectedCosts: string[]
    riskBufferPercent: number
    profitMarginPercent: number
  }

  interface PricingOutput {
    baseCost: number
    overheadCosts: number
    subtotal: number
    riskBufferAmount: number
    profitMarginAmount: number
    finalPrice: number
    recommendedMin: number
    recommendedMax: number
    breakdown: ServiceBreakdown[]
  }
  ```
- Calculation steps (documented in code):
  1. Calculate experience multiplier (Ed × Ef)
  2. Look up geography multipliers for both countries
  3. Calculate adjusted rate per service (base_rate × exp_mult × geo_mult)
  4. Sum service costs (hours × adjusted_rate)
  5. Add overhead costs
  6. Calculate risk buffer (subtotal × risk_percent)
  7. Calculate profit margin ((subtotal + risk_buffer) × profit_percent)
  8. Sum all components for final price
  9. Round to nearest dollar
  10. Calculate recommended range (±20%)
- Unit tests for:
  - Formula accuracy (test against manual calculations)
  - Edge cases (zero hours, min/max values, same country)
  - Type safety (invalid inputs return errors)
  - Performance (should complete in <1ms)

---

## Decision 6: Real-Time Preview Optimization

**Decision**: Optimized React rendering with memoization

**Rationale**:
- Prevents unnecessary re-renders when unrelated state changes
- Improves perceived performance (users see instant updates)
- Reduces CPU usage, important for battery life on mobile devices
- Simple to implement with React hooks (`useMemo`, `useCallback`)

**Alternatives Considered**:
- Virtual scrolling: Unnecessary for pricing preview (limited number of items)
- Web Workers: Overkill; main thread performance sufficient
- Debouncing only: Reduces frequency but doesn't optimize re-renders

**Implementation Notes**:
- Wrap preview panel in `React.memo` to prevent re-renders when parent state changes
- Use `useMemo` to cache calculation results (price, breakdown, multipliers)
- Use `useCallback` for event handlers passed to child components
- Split preview into sub-components:
  - `PriceDisplay` (final price, recommended range)
  - `ServiceBreakdown` (list of services with adjusted rates)
  - `CostBreakdown` (overhead costs)
  - `MultiplierSummary` (experience, geography multipliers applied)
- Each sub-component memoizes its props
- Debounce input handlers (50-100ms) to batch rapid changes

---

## Decision 7: Server-Side API Design

**Decision**: RESTful POST endpoint with request/response validation

**Rationale**:
- Simple and widely understood (REST best practices)
- HTTP status codes provide clear error semantics
- POST method appropriate for calculation (creates a result)
- Request validation ensures data quality
- Response validation ensures client receives correct format
- Easy to test with tools like curl, Postman

**Alternatives Considered**:
- GraphQL: Overkill for single calculation endpoint
- WebSocket: Unnecessary (no persistent connection needed)
- gRPC: Too complex for web frontend integration

**Implementation Notes**:
- Endpoint: `POST /api/calculate`
- Request body:
  ```typescript
  {
    services: Array<{ serviceId: string, hours: number }>,
    designerExperience: number,
    freelanceExperience: number,
    designerCountryCode: string,
    clientCountryCode: string,
    selectedCosts: string[],
    riskBufferPercent: number,
    profitMarginPercent: number
  }
  ```
- Response body:
  ```typescript
  {
    success: true,
    data: PricingOutput
  }
  ```
- Error responses:
  ```typescript
  {
    success: false,
    error: {
      code: "VALIDATION_ERROR" | "INTERNAL_ERROR",
      message: "Human-readable error",
      details: { /* field-specific errors */ }
    }
  }
  ```
- Validation: Reuse Zod schemas from client-side
- Rate limiting: 10 requests per minute per user (prevent abuse)
- Logging: Log all calculations for admin analytics (anonymous usage metrics)

---

## Implementation Priority Order

Based on research findings, implementation should proceed in this order:

1. **Core Pricing Engine** (`lib/pricing-engine.ts`): Pure calculation function with unit tests
2. **Type Definitions** (`lib/types/pricing.ts`, `lib/types/validation.ts`): TypeScript interfaces and Zod schemas
3. **Validation Logic** (`lib/utils/validation.ts`): Reusable validation functions
4. **Server-Side API** (`app/api/calculate/route.ts`): POST endpoint with validation
5. **Pricing Context** (`components/context/PricingContext.tsx`): Global state management
6. **Client-Side Integration**: Wire pricing engine to wizard inputs
7. **Real-Time Preview** (`components/ui/live-preview.tsx`): Optimized preview panel
8. **E2E Tests** (`tests/integration/calculation-flow.test.tsx`): End-to-end validation

---

## Technical Debt & Future Considerations

Items deferred for future iterations:

- Caching: Consider Redis cache for calculation results if performance degrades
- Web Workers: Move calculation to worker thread if main thread becomes bottleneck
- Advanced validation: Consider custom validation rules per service/category
- Analytics: Enhanced calculation analytics (common parameters, price distributions)
- Internationalization: Support for multiple currencies (currently USD only per constitution)
