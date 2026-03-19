# Research: Wizard Flow & Frontend Integration

**Feature**: 009-frontend-wizard-flow
**Date**: 2026-03-19
**Status**: Phase 0 Research Complete

## Overview

Research findings for implementing the 7-step wizard flow with live preview panel, building upon the existing pricing engine (008) and authentication/wizard skeleton (006).

---

## Research Findings

### 1. Browser-Local State Persistence for Wizard

**Decision**: Use `sessionStorage` for wizard state persistence across page refreshes.

**Rationale**: 
- `sessionStorage` scopes data to the browser tab, which naturally clears when the tab is closed — matching the spec requirement of "ephemeral but survives refreshes".
- `localStorage` would persist across tabs and browser restarts, which is undesirable (no server-side drafts).
- Integration with existing `WizardContext` via a custom hook that syncs state on every update.

**Alternatives Considered**:
- `localStorage`: Rejected — persists beyond session scope, would require explicit cleanup logic.
- IndexedDB: Rejected — overkill for structured JSON state; adds complexity for no benefit.
- Service Worker cache: Rejected — wrong abstraction for UI state.

---

### 2. Pricing Model Impact on Calculation Logic

**Decision**: Extend existing `pricing-engine.ts` to accept a `pricingModel` parameter ("hourly" | "project") that changes output format and formula adjustments.

**Rationale**:
- The existing `calculatePrice()` function produces a single unified result. It needs a branching path:
  - **Hourly mode**: Output breaks down per-service adjusted hourly rate + hours.
- **Project mode**: Uses the same mathematical formula as Hourly mode, but aggregates the output into a single lump-sum project fee in the UI (no per-service breakdown shown). This avoids formula duplication while fulfilling the presentation requirement.
- The `PricingInput` type already lacks a `pricingModel` field — it must be added.
- The `PricingOutput` type needs an optional `hourlyRate` field for hourly mode and a `projectFee` wrapper for project mode.

**Alternatives Considered**:
- Separate engines for each model: Rejected — too much duplication; the core math is identical, only the output shape differs.
- Post-processing formatter: Considered viable, but integrating into the engine is cleaner for live preview consistency.

---

### 3. Step Validation Strategy

**Decision**: Per-step validation functions that gate the "Next" button. Validation runs on every input change (real-time feedback) and on explicit "Next" click (blocking).

**Rationale**:
- Each step has distinct required fields and ranges (e.g., Step 3: experience 1-10, Step 6: risk 0-50%).
- Existing `validatePricingInput()` in `lib/utils/validation.ts` validates the entire input at once — needs refactoring into step-aware validators.
- Real-time error display reduces user frustration vs. only showing errors on submit.

**Alternatives Considered**:
- Full-form validation on final step only: Rejected — poor UX; users would need to go back to fix errors.
- Schema-based validation (Zod per step): Viable and recommended; aligns with existing API contract schemas.

---

### 4. Service Selection UI Pattern (Accordion by Category)

**Decision**: Use grouped accordion UI with categories as collapsible headers. Services listed within each category with checkbox + hours input.

**Rationale**:
- 120+ services across 5 categories would overwhelm a flat list.
- Accordion pattern allows users to focus on one category at a time.
- Hours input appears inline (next to each selected service) — enforces min=1 at input level.
- Existing API `GET /api/v1/services` already returns services grouped by category.

**Alternatives Considered**:
- Flat searchable list: Rejected — doesn't leverage category structure from the data model.
- Multi-select dropdown: Rejected — poor for 120+ items with per-item hours input.
- Tab-based categories: Viable but accordion is more space-efficient in the 3/4 panel layout.

---

### 5. Live Preview Performance (<100ms)

**Decision**: Client-side-only calculation for live preview using the existing `calculatePrice()` function. Server-side API used only for the final "Calculate & Save" action.

**Rationale**:
- The existing `PricingContext` already performs client-side calculation via `useMemo` — this pattern is proven.
- Network round-trip for each keystroke would violate the <100ms requirement.
- Debounce in `PricingContext` is currently 100ms — should be reduced or removed since calculation is purely client-side and fast.

**Alternatives Considered**:
- Server-side calculation with WebSocket push: Rejected — adds latency, complexity, and WebSocket infrastructure.
- Web Worker for calculation: Not needed for current data scale (120 services, simple math). Can revisit if performance degrades.

---

### 6. Mobile Responsive Layout

**Decision**: Stack wizard panel (top) and preview panel (below) on screens narrower than 768px. Preview panel can be toggled via a sticky button.

**Rationale**:
- The 3/4 + 1/4 layout won't work below tablet widths.
- Stacking with a toggle keeps the preview accessible without dominating screen space.
- Tailwind CSS breakpoints (`md:`) already used in existing components (e.g., `StepNavigation.tsx`).

**Alternatives Considered**:
- Bottom sheet for preview: Too complex for MVP; reserved for post-MVP enhancement.
- Hidden preview on mobile: Rejected — contradicts the core value proposition of real-time feedback.

---

### 7. "Calculate & Save" and PDF Flow

**Decision**: The final step (Step 7) has two states — pre-save (shows a "Calculate & Save" button) and post-save (shows the results breakdown and an optional "Download PDF" button).

**Rationale**:
- Per spec clarification, "Calculate & Save" both displays the final result AND persists to the database.
- The server-side `POST /api/calculate` endpoint already exists — extend it to also save to the `calculations` table.
- PDF download calls `POST /api/export-pdf` (from Phase 4) — this is a separate optional action.
- After saving, clear the `sessionStorage` wizard state since the calculation is complete.

**Alternatives Considered**:
- Separate save endpoint: Unnecessary — calculation + save is a single atomic action.
- Auto-save on step 7 entry: Rejected — user must explicitly trigger via button click per spec.
