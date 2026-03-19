# API Contracts: Wizard Flow & Frontend Integration

**Feature**: 009-frontend-wizard-flow
**Date**: 2026-03-19
**Status**: Phase 1 Design

## Overview

This document defines the API contracts specific to the Wizard Flow feature. Most data-retrieval endpoints are inherited from 008-core-pricing-engine. This feature adds one new endpoint for the "Calculate & Save" action.

> **Note**: Existing endpoints from 008 (`GET /api/v1/services`, `GET /api/v1/categories`, `GET /api/v1/countries`, `GET /api/v1/costs`, `GET /api/v1/config`) are consumed as-is. See [008 API Contracts](../../specs/008-core-pricing-engine/contracts/api-contracts.md) for their full definitions.

---

## New Endpoints

### 1. Calculate & Save

**Endpoint**: `POST /api/v1/calculate-and-save`

**Purpose**: Perform final server-side calculation, validate inputs, persist the result to the database, and return the calculation breakdown to the client. This is the endpoint triggered by the "Calculate & Save" button on Step 7.

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <supabase_jwt_token>
```

**Request Body**:
```json
{
  "pricingModel": "hourly",
  "services": [
    { "serviceId": "550e8400-e29b-41d4-a716-446655440000", "hours": 5 },
    { "serviceId": "660e8400-e29b-41d4-a716-446655440001", "hours": 8 }
  ],
  "designerExperience": 5,
  "freelanceExperience": 7,
  "designerCountryCode": "US",
  "clientCountryCode": "DE",
  "selectedCosts": ["770e8400-e29b-41d4-a716-446655440002"],
  "riskBufferPercent": 15,
  "profitMarginPercent": 25
}
```

**Request Schema (Zod)**:
```typescript
const CalculateAndSaveInputSchema = z.object({
  pricingModel: z.enum(['hourly', 'project']),
  services: z.array(z.object({
    serviceId: z.string().uuid(),
    hours: z.number().int().min(1, "Hours must be at least 1")
  })).min(1, "At least one service must be selected"),
  designerExperience: z.number().int().min(1).max(10),
  freelanceExperience: z.number().int().min(1).max(10),
  designerCountryCode: z.string().length(2),
  clientCountryCode: z.string().length(2),
  selectedCosts: z.array(z.string().uuid()),
  riskBufferPercent: z.number().min(0).max(50),
  profitMarginPercent: z.number().min(10).max(50)
})
```

**Key differences from `POST /api/v1/calculate`**:
- Adds `pricingModel` field (required)
- Enforces `hours >= 1` (not `>= 0` like the preview calculator)
- Persists result to `calculations` and `calculation_services` tables
- Returns a `calculationId` in the response

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "calculationId": "880e8400-e29b-41d4-a716-446655440099",
    "pricingModel": "hourly",
    "baseCost": 12500,
    "overheadCosts": 500,
    "subtotal": 13000,
    "riskBufferAmount": 1950,
    "profitMarginAmount": 3738,
    "finalPrice": 18688,
    "recommendedMin": 14950,
    "recommendedMax": 22426,
    "breakdown": [
      {
        "serviceId": "550e8400-e29b-41d4-a716-446655440000",
        "serviceName": "UI Design",
        "hours": 5,
        "baseRate": 100,
        "experienceMultiplier": 35,
        "geographyMultiplier": 1.2,
        "adjustedRate": 4200,
        "cost": 21000
      }
    ],
    "createdAt": "2026-03-19T05:30:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request** (Validation):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      { "field": "services[0].hours", "message": "Hours must be at least 1" }
    ]
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to save calculation"
  }
}
```

---

## Modified Endpoints

### POST /api/v1/calculate (Preview Only)

No changes to the existing calculation endpoint. It continues to be used for client-side preview validation when needed (e.g., optional server-side verification). The primary real-time preview remains client-side via `calculatePrice()`.

---

## Existing Endpoints Consumed (No Changes)

| Endpoint | Used In | Purpose |
|----------|---------|---------|
| `GET /api/v1/services` | Step 2 | Populate service accordion |
| `GET /api/v1/categories` | Step 2 | Group services by category |
| `GET /api/v1/countries` | Step 4 | Populate country dropdowns |
| `GET /api/v1/costs` | Step 5 | Populate cost checkboxes |
| `GET /api/v1/config` | Steps 3, 6 | Get slider range limits |

---

## Client-Side Contracts

### WizardContext Interface

```typescript
interface WizardContextType {
  // State
  state: WizardState
  result: PricingOutput | null
  validationErrors: StepValidationError[]
  referenceData: {
    services: Service[]
    categories: Category[]
    countries: Country[]
    costs: Cost[]
    config: Config | null
  }
  isLoading: boolean
  isSaving: boolean

  // Actions
  setCurrentStep: (step: number) => void
  updateState: (updates: Partial<WizardState>) => void
  validateStep: (stepId: number) => StepValidationResult
  goToNextStep: () => boolean  // returns false if validation fails
  goToPreviousStep: () => void
  calculateAndSave: () => Promise<SaveResult>
  resetWizard: () => void
}

interface SaveResult {
  success: boolean
  calculationId?: string
  error?: string
}
```

### SessionStorage Contract

```typescript
// Key
const STORAGE_KEY = 'becslo_wizard_state'

// Read
const stored = sessionStorage.getItem(STORAGE_KEY)
const state: WizardState | null = stored ? JSON.parse(stored) : null

// Write (debounced 200ms)
sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))

// Clear (after successful save)
sessionStorage.removeItem(STORAGE_KEY)
```
