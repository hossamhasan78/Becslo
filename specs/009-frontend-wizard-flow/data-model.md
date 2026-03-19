# Data Model: Wizard Flow & Frontend Integration

**Feature**: 009-frontend-wizard-flow
**Date**: 2026-03-19
**Status**: Phase 1 Design

## Overview

This document defines the data model additions and extensions for the Wizard Flow feature. It builds upon the existing data model from 008-core-pricing-engine and introduces client-side state entities for wizard flow management.

> **Note**: No new database tables are created by this feature. All new entities are client-side (browser) state models. The database write happens via the existing `calculations` and `calculation_services` tables from Phase 1/Phase 2.

---

## New Client-Side Entities

### 1. WizardState (Extended)

**Purpose**: Central state object tracking the entire wizard journey, persisted in `sessionStorage`.

**Fields** (extends existing `src/types/wizard.ts`):
- `currentStep`: number (1-7)
- `highestCompletedStep`: number (0-7) — tracks the furthest step the user has successfully validated, enabling free navigation to completed steps
- `pricingModel`: `'hourly' | 'project' | null`
- `services`: Array<SelectedService>
- `experienceDesigner`: number (1-10, default: 5)
- `experienceFreelance`: number (1-10, default: 5)
- `designerCountryId`: number | null
- `clientCountryId`: number | null
- `designerCountryCode`: string
- `clientCountryCode`: string
- `costs`: number[] (selected cost IDs)
- `riskBuffer`: number (0-50, default: 15)
- `profitMargin`: number (10-50, default: 20)
- `isSaved`: boolean — true after "Calculate & Save" succeeds
- `savedCalculationId`: string | null — the UUID of the saved calculation record

**Validation Rules**:
- `currentStep` must be between 1 and 7
- `highestCompletedStep` must be >= 0 and <= 7
- `currentStep` must be <= `highestCompletedStep + 1` (cannot skip ahead)
- `pricingModel` required before proceeding past Step 1
- At least one service required before proceeding past Step 2
- Service- All hours must be >= 1 (per spec clarification)1 (enforced at input level)
- Experience values between 1-10
- Country selections required before proceeding past Step 4
- Risk buffer 0-50%, Profit margin 10-50%

**State Transitions**:
- Initial → Step 1 Active (on wizard entry)
- Step N Active → Step N+1 Active (on "Next" with valid inputs)
- Step N Active → Step M Active (where M <= highestCompletedStep, via step indicator click)
- Step 7 Active → Saved (on "Calculate & Save" button click)
- Saved → cleared from sessionStorage

---

### 2. StepValidationResult

**Purpose**: Captures the validation state for a single wizard step.

**Fields**:
- `stepId`: number (1-7)
- `isValid`: boolean
- `errors`: Array<StepValidationError>

**StepValidationError** (nested):
- `field`: string (e.g., "pricingModel", "services", "experienceDesigner")
- `message`: string (user-facing error message)

**Validation Rules per Step**:

| Step | Required Fields | Validation |
|------|----------------|------------|
| 1    | pricingModel | Must be 'hourly' or 'project' |
| 2    | services | At least 1 service selected; all hours >= 1 |
| 3    | experienceDesigner, experienceFreelance | Both between 1-10 |
| 4    | designerCountryCode, clientCountryCode | Both must be valid ISO codes |
| 5    | (none required) | Costs selection is optional |
| 6    | riskBuffer, profitMargin | Risk 0-50%, Profit 10-50% |
| 7    | (none required) | Review step; "Calculate & Save" triggers server validation |

---

### 3. LivePreviewData

**Purpose**: Computed data displayed in the 1/4-width live preview panel, derived from WizardState + pricing engine output.

**Fields**:
- `pricingModel`: 'hourly' | 'project' | null
- `selectedServiceCount`: number
- `totalHours`: number
- `experienceMultiplier`: number (designer × freelance)
- `geographyMultiplier`: number (designer country × client country)
- `baseCost`: number (USD, rounded)
- `overheadCosts`: number (USD, rounded)
- `subtotal`: number (USD, rounded)
- `riskBufferAmount`: number (USD, rounded)
- `profitMarginAmount`: number (USD, rounded)
- `finalPrice`: number (USD, rounded)
- `recommendedMin`: number (USD, rounded)
- `recommendedMax`: number (USD, rounded)
- `breakdown`: Array<ServiceBreakdown> (from PricingOutput)
- `isComplete`: boolean (all required fields filled)

**Derivation**: Computed from `calculatePrice()` in `lib/pricing-engine.ts` on every WizardState change. No database reads; uses cached reference data (services, countries, costs) loaded once on wizard mount.

---

## Existing Entities Used (No Changes)

These entities from 008-core-pricing-engine are consumed but not modified:

| Entity | Usage |
|--------|-------|
| Service | Fetched via `GET /api/v1/services` for Step 2 accordion |
| Category | Fetched via `GET /api/v1/categories` for grouping services |  
| Country | Fetched via `GET /api/v1/countries` for Step 4 dropdowns |
| Cost | Fetched via `GET /api/v1/costs` for Step 5 checkboxes |
| Config | Fetched via `GET /api/v1/config` for slider range limits |
| PricingInput | Constructed from WizardState for calculation |
| PricingOutput | Result from `calculatePrice()` for live preview |
| Calculation | Written to DB on "Calculate & Save" |
| CalculationService | Written to DB on "Calculate & Save" |

---

## Entity Relationships

```
┌─────────────────┐         ┌──────────────────┐
│   WizardState   │────────>│  LivePreviewData │
│  (sessionStorage)│ derives │  (computed)      │
└────────┬────────┘         └──────────────────┘
         │
         │ on "Calculate & Save"
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│   Calculation   │────1:N──│ CalculationService│
│   (database)     │         │   (database)      │
└─────────────────┘         └──────────────────┘
```

---

## SessionStorage Schema

**Key**: `becslo_wizard_state`

**Value** (JSON serialized WizardState):
```json
{
  "currentStep": 3,
  "highestCompletedStep": 2,
  "pricingModel": "hourly",
  "services": [
    { "id": 1, "hours": 5, "adjustedRate": 0, "cost": 0 }
  ],
  "experienceDesigner": 7,
  "experienceFreelance": 5,
  "designerCountryId": null,
  "clientCountryId": null,
  "designerCountryCode": "",
  "clientCountryCode": "",
  "costs": [],
  "riskBuffer": 15,
  "profitMargin": 20,
  "isSaved": false,
  "savedCalculationId": null
}
```

**Lifecycle**:
1. Created on wizard page mount (if not already in sessionStorage)
2. Updated on every state change (debounced write, ~200ms)
3. Read on page refresh/remount
4. Deleted after successful "Calculate & Save"
