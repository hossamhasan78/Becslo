# API Contracts: Overhead Costs — User-Editable Amounts

**Feature Branch**: `017-user-editable-costs`
**Date**: 2026-03-26

---

## Changed Endpoint: `GET /api/v1/costs`

**Purpose**: Returns active cost categories for the wizard Costs step.

### Response — Before
```json
[
  {
    "id": 1,
    "name": "Software Subscriptions",
    "is_fixed_amount": true,
    "default_cost": 150.00,
    "is_active": true
  }
]
```

### Response — After
```json
[
  {
    "id": 1,
    "name": "Software Subscriptions",
    "is_fixed_amount": true,
    "is_active": true
  }
]
```

**Breaking change**: `default_cost` field removed from response. Any consumer reading `default_cost` must be updated.

---

## Changed Endpoint: `POST /api/v1/calculate-and-save`

**Purpose**: Validates, calculates, and persists a wizard calculation.

### Request Body — Before
```json
{
  "pricingModel": "project",
  "services": [{ "serviceId": "12", "hours": 8 }],
  "designerExperience": 7,
  "freelanceExperience": 5,
  "designerCountryCode": "EG",
  "clientCountryCode": "US",
  "selectedCosts": ["1", "3"],
  "riskBufferPercent": 15,
  "profitMarginPercent": 20
}
```

### Request Body — After
```json
{
  "pricingModel": "project",
  "services": [{ "serviceId": "12", "hours": 8 }],
  "designerExperience": 7,
  "freelanceExperience": 5,
  "designerCountryCode": "EG",
  "clientCountryCode": "US",
  "selectedCosts": [
    { "costId": "1", "costName": "Software Subscriptions", "amount": 200 },
    { "costId": "3", "costName": "Office Rent", "amount": 500 }
  ],
  "riskBufferPercent": 15,
  "profitMarginPercent": 20
}
```

**Validation rules for `selectedCosts` items**:
- `costId`: string, required
- `costName`: string, required, non-empty
- `amount`: number, min 1, max 999999 (zero-amount entries must be filtered out before sending)

### Response — After (addition to existing response)
```json
{
  "success": true,
  "calculationId": "uuid-here",
  "data": {
    "baseCost": 1200,
    "overheadCosts": 700,
    "costBreakdown": [
      { "costId": "1", "costName": "Software Subscriptions", "amount": 200 },
      { "costId": "3", "costName": "Office Rent", "amount": 500 }
    ],
    "subtotal": 1900,
    "riskBufferAmount": 285,
    "profitMarginAmount": 437,
    "finalPrice": 2622,
    "recommendedMin": 2098,
    "recommendedMax": 3146,
    "experienceMultiplier": 1.4,
    "geographyMultiplier": 0.75,
    "breakdown": [...]
  }
}
```

**New field**: `costBreakdown` array in `data` — individual cost line items.

---

## Changed Endpoint: `GET /api/admin/calculations/[id]`

**Purpose**: Returns full calculation detail for admin view.

### Response addition — After
```json
{
  "data": {
    "id": "...",
    "services": [...],
    "costs": [
      { "id": "uuid", "cost_id": 1, "cost_name": "Software Subscriptions", "amount": 200 },
      { "id": "uuid", "cost_id": 3, "cost_name": "Office Rent", "amount": 500 }
    ],
    "subtotal": 1900,
    "...": "..."
  }
}
```

**Change**: `costs` array now returns individual entries from `calculation_costs` table (name + amount per line), instead of an empty array or IDs.
