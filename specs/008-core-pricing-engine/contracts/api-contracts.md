# API Contracts: Core Pricing Engine

**Feature**: 008-core-pricing-engine
**Date**: 2026-03-18
**Status**: Phase 1 Design

## Overview

This document defines the API contracts exposed by the Core Pricing Engine feature. All APIs are RESTful and follow NextJS 14.x App Router conventions.

---

## Base URL

```
https://[domain]/api
```

All endpoints are relative to the base URL.

---

## Authentication

All API endpoints require authentication via Supabase Auth.

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

**Unauthenticated Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## Endpoints

### 1. Calculate Price

**Endpoint**: `POST /calculate`

**Purpose**: Calculate project price based on user inputs

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <supabase_jwt_token>
```

**Request Body**:
```json
{
  "services": [
    {
      "serviceId": "550e8400-e29b-41d4-a716-446655440000",
      "hours": 5
    },
    {
      "serviceId": "660e8400-e29b-41d4-a716-446655440001",
      "hours": 8
    }
  ],
  "designerExperience": 5,
  "freelanceExperience": 7,
  "designerCountryCode": "US",
  "clientCountryCode": "DE",
  "selectedCosts": [
    "770e8400-e29b-41d4-a716-446655440002"
  ],
  "riskBufferPercent": 15,
  "profitMarginPercent": 25
}
```

**Request Schema (Zod)**:
```typescript
const PricingInputSchema = z.object({
  services: z.array(z.object({
    serviceId: z.string().uuid(),
    hours: z.number().min(0)
  })).min(1, "At least one service must be selected"),
  designerExperience: z.number().min(1).max(10),
  freelanceExperience: z.number().min(1).max(10),
  designerCountryCode: z.string().length(2),
  clientCountryCode: z.string().length(2),
  selectedCosts: z.array(z.string().uuid()),
  riskBufferPercent: z.number().min(0).max(50),
  profitMarginPercent: z.number().min(10).max(50)
})
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
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
      },
      {
        "serviceId": "660e8400-e29b-41d4-a716-446655440001",
        "serviceName": "User Testing",
        "hours": 8,
        "baseRate": 80,
        "experienceMultiplier": 35,
        "geographyMultiplier": 1.2,
        "adjustedRate": 3360,
        "cost": 26880
      }
    ]
  }
}
```

**Response Schema (Zod)**:
```typescript
const PricingOutputSchema = z.object({
  baseCost: z.number(),
  overheadCosts: z.number(),
  subtotal: z.number(),
  riskBufferAmount: z.number(),
  profitMarginAmount: z.number(),
  finalPrice: z.number(),
  recommendedMin: z.number(),
  recommendedMax: z.number(),
  breakdown: z.array(z.object({
    serviceId: z.string().uuid(),
    serviceName: z.string(),
    hours: z.number(),
    baseRate: z.number(),
    experienceMultiplier: z.number(),
    geographyMultiplier: z.number(),
    adjustedRate: z.number(),
    cost: z.number()
  }))
})
```

**Error Responses**:

**400 Bad Request** (Validation Error):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "designerExperience",
        "message": "Value must be between 1 and 10"
      }
    ]
  }
}
```

**404 Not Found** (Service/Country Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Service with ID 'xxx' not found"
  }
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

**429 Too Many Requests** (Rate Limiting):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

**Rate Limiting**: 10 requests per minute per user

---

### 2. Get Services

**Endpoint**: `GET /services`

**Purpose**: Retrieve all active services for service selection UI

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Query Parameters**:
- `category` (optional): Filter by category ID
- `search` (optional): Search in service name

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "UI Design",
      "category": {
        "id": "440e8400-e29b-41d4-a716-446655440000",
        "name": "Design & UI"
      },
      "defaultHours": 40,
      "minHours": 10,
      "maxHours": 100
    }
  ]
}
```

**Response Schema (Zod)**:
```typescript
const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string()
  }),
  defaultHours: z.number(),
  minHours: z.number(),
  maxHours: z.number()
})
```

---

### 3. Get Categories

**Endpoint**: `GET /categories`

**Purpose**: Retrieve all categories for organizing services

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "440e8400-e29b-41d4-a716-446655440000",
      "name": "Strategy & Research",
      "displayOrder": 1
    },
    {
      "id": "450e8400-e29b-41d4-a716-446655440001",
      "name": "Design & UI",
      "displayOrder": 2
    }
  ]
}
```

**Response Schema (Zod)**:
```typescript
const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayOrder: z.number()
})
```

---

### 4. Get Countries

**Endpoint**: `GET /countries`

**Purpose**: Retrieve all active countries for geography selection

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Query Parameters**:
- `search` (optional): Search in country name or code

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "330e8400-e29b-41d4-a716-446655440000",
      "name": "United States",
      "code": "US",
      "multiplier": 1.0
    },
    {
      "id": "340e8400-e29b-41d4-a716-446655440001",
      "name": "Germany",
      "code": "DE",
      "multiplier": 1.2
    }
  ]
}
```

**Response Schema (Zod)**:
```typescript
const CountrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string().length(2),
  multiplier: z.number()
})
```

---

### 5. Get Costs

**Endpoint**: `GET /costs`

**Purpose**: Retrieve all active overhead costs for optional inclusion

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Project Management",
      "isFixedAmount": true,
      "defaultCost": 500
    },
    {
      "id": "780e8400-e29b-41d4-a716-446655440003",
      "name": "Client Communication",
      "isFixedAmount": false,
      "defaultCost": 5
    }
  ]
}
```

**Response Schema (Zod)**:
```typescript
const CostSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isFixedAmount: z.boolean(),
  defaultCost: z.number()
})
```

---

### 6. Get Config

**Endpoint**: `GET /config`

**Purpose**: Retrieve global pricing configuration

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "baseRate": 100,
    "riskBufferMin": 0,
    "riskBufferMax": 50,
    "profitMarginMin": 10,
    "profitMarginMax": 50
  }
}
```

**Response Schema (Zod)**:
```typescript
const ConfigSchema = z.object({
  baseRate: z.number(),
  riskBufferMin: z.number(),
  riskBufferMax: z.number(),
  profitMarginMin: z.number(),
  profitMarginMax: z.number()
})
```

---

## Error Response Schema (Standard)

All error responses follow this structure:

```typescript
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      "UNAUTHORIZED",
      "VALIDATION_ERROR",
      "NOT_FOUND",
      "INTERNAL_ERROR",
      "RATE_LIMIT_EXCEEDED"
    ]),
    message: z.string(),
    details: z.any().optional()
  })
})
```

---

## Versioning

API versioning via URL path (current: v1):
```
/api/v1/calculate
```

Breaking changes require new version (v2, v3, etc.)

---

## Browser Access

All endpoints support CORS for direct browser access from frontend.

**CORS Headers**:
```
Access-Control-Allow-Origin: https://[frontend-domain]
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

---

## WebSocket

No WebSocket connections required for this feature. Real-time updates achieved via client-side calculation and state management.

---

## Webhooks

No webhooks required for this feature. All state changes initiated by user actions.

---

## SDK / Client Library

For future consideration, provide TypeScript client library with type-safe API calls:

```typescript
import { PricingClient } from '@becslo/pricing-client'

const client = new PricingClient({
  apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

const result = await client.calculate({
  services: [...],
  designerExperience: 5,
  // ...
})
```

**Decision Deferred**: SDK development prioritized for post-MVP integration with third-party tools.
