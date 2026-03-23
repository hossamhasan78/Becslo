# Becslo API Documentation

**Purpose**: Complete API reference for Becslo endpoints  
**Last Updated**: 2026-03-24  
**Feature**: Phase 5 - User Story 3

---

## Overview

Becslo provides RESTful APIs for:
- User authentication
- Pricing calculations
- PDF generation
- Admin dashboard operations

**Base URL**: `https://becslo.vercel.app`

**Content-Type**: `application/json`

---

## Authentication

### Authentication Methods

Becslo uses Supabase Auth for authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/` | Landing page |

### Protected Endpoints (Auth Required)

All other endpoints require a valid JWT token.

---

## Authentication API

### Sign Up

Create a new user account.

```http
POST /auth/v1/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "full_name": "John Doe"
  }
}
```

**Response (201):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "email_confirmed": false
}
```

---

### Sign In

Authenticate a user and get JWT token.

```http
POST /auth/v1/token?grant_type=password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

---

## Health Check API

### Internal Health Check

Check server and database health status.

```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-24T10:30:00Z",
  "checks": {
    "server": "ok",
    "database": "ok"
  }
}
```

**Response (503):**
```json
{
  "status": "degraded",
  "checks": {
    "server": "ok",
    "database": "error"
  }
}
```

---

## Calculation API

### Calculate & Save

Calculate pricing and persist the calculation to the database.

```http
POST /api/v1/calculate-and-save
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pricingModel": "hourly",
  "services": [
    { "serviceId": "1", "hours": 10 },
    { "serviceId": "2", "hours": 5 }
  ],
  "designerExperience": 5,
  "freelanceExperience": 7,
  "designerCountryCode": "US",
  "clientCountryCode": "UK",
  "selectedCosts": ["1", "2"],
  "riskBufferPercent": 15,
  "profitMarginPercent": 20
}
```

**Response (200):**
```json
{
  "calculationId": "uuid-of-saved-calculation",
  "pricingModel": "hourly",
  "baseCost": 12500,
  "overheadCosts": 150,
  "subtotal": 12650,
  "riskBufferAmount": 1897.5,
  "profitMarginAmount": 2909.55,
  "finalPrice": 17457.05,
  "recommendedMin": 15711.35,
  "recommendedMax": 19202.75,
  "experienceMultiplier": 2.5,
  "geographyMultiplier": 1.5,
  "breakdown": [
    {
      "serviceId": "1",
      "serviceName": "UI Design",
      "hours": 10,
      "baseRate": 100,
      "experienceMultiplier": 2.5,
      "geographyMultiplier": 1.5,
      "adjustedRate": 375,
      "cost": 3750
    }
  ]
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "pricingModel": "Invalid enum value"
    }
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized. Please log in."
}
```

---

## PDF Export API

### Generate PDF

Generate and download a PDF quote for a saved calculation.

```http
GET /api/v1/export-pdf?id=<CALCULATION_ID>
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Becslo_Quote_[id].pdf"`

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (404):**
```json
{
  "error": "Failed to fetch calculation or not found"
}
```

---

## Admin API

All admin endpoints require the user to have the `admin` role in the `user_roles` table.

### List All Calculations

Get all calculations with optional filtering.

```http
GET /api/v1/admin/calculations
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | integer | Page number | 1 |
| limit | integer | Items per page | 20 |
| start_date | string | Filter by start date (ISO) | - |
| end_date | string | Filter by end date (ISO) | - |
| user_id | string | Filter by user ID | - |

**Response (200):**
```json
{
  "calculations": [
    {
      "id": "calc-uuid",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "pricing_model": "hourly",
      "final_price": 17457.05,
      "created_at": "2026-03-24T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### Get Calculation Details

Get detailed information about a specific calculation.

```http
GET /api/v1/admin/calculations/[id]
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "id": "calc-uuid",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "pricing_model": "hourly",
  "experience_designer": 5,
  "experience_freelance": 7,
  "designer_country": "United States",
  "client_country": "United Kingdom",
  "total_hours": 15,
  "subtotal": 12650,
  "risk_buffer": 1897.5,
  "profit_margin": 2909.55,
  "final_price": 17457.05,
  "recommended_min": 15711.35,
  "recommended_max": 19202.75,
  "created_at": "2026-03-24T10:30:00Z",
  "services": [
    {
      "name": "UI Design",
      "hours": 10,
      "adjusted_rate": 375,
      "cost": 3750
    }
  ]
}
```

---

### Get Analytics

Get aggregated analytics data.

```http
GET /api/v1/admin/analytics
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| start_date | string | Start date (ISO) | 30 days ago |
| end_date | string | End date (ISO) | today |

**Response (200):**
```json
{
  "summary": {
    "total_calculations": 150,
    "total_users": 45,
    "total_revenue": 250000,
    "average_price": 1666.67
  },
  "by_service": [
    { "service": "UI Design", "count": 50 },
    { "service": "Development", "count": 40 }
  ],
  "by_country": [
    { "country": "US", "count": 60 },
    { "country": "UK", "count": 30 }
  ],
  "revenue_by_month": [
    { "month": "2026-01", "revenue": 80000 },
    { "month": "2026-02", "revenue": 90000 }
  ]
}
```

---

### Get Configuration

Get current application configuration.

```http
GET /api/v1/admin/config
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "base_rate": 100,
  "risk_buffer_min": 0,
  "risk_buffer_max": 50,
  "profit_margin_min": 10,
  "profit_margin_max": 50
}
```

---

### Update Configuration

Update application configuration.

```http
PUT /api/v1/admin/config
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "base_rate": 120,
  "risk_buffer_min": 5,
  "risk_buffer_max": 40
}
```

**Response (200):**
```json
{
  "base_rate": 120,
  "risk_buffer_min": 5,
  "risk_buffer_max": 40,
  "profit_margin_min": 10,
  "profit_margin_max": 50
}
```

---

### List Services

Get all services.

```http
GET /api/v1/admin/services
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "services": [
    {
      "id": 1,
      "name": "UI Design",
      "category_id": 1,
      "category_name": "Design",
      "default_hours": 10,
      "min_hours": 1,
      "max_hours": 100,
      "base_rate": 100,
      "is_active": true
    }
  ]
}
```

---

### Create Service

Create a new service.

```http
POST /api/v1/admin/services
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Brand Design",
  "category_id": 1,
  "default_hours": 20,
  "min_hours": 5,
  "max_hours": 50,
  "base_rate": 150
}
```

**Response (201):**
```json
{
  "id": 5,
  "name": "Brand Design",
  "category_id": 1,
  "default_hours": 20,
  "min_hours": 5,
  "max_hours": 50,
  "base_rate": 150,
  "is_active": true
}
```

---

### Update Service

Update an existing service.

```http
PUT /api/v1/admin/services/[id]
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Brand Design (Updated)",
  "base_rate": 175
}
```

**Response (200):**
```json
{
  "id": 5,
  "name": "Brand Design (Updated)",
  "base_rate": 175
}
```

---

### Delete Service

Delete a service.

```http
DELETE /api/v1/admin/services/[id]
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true
}
```

---

## Wizard API (Frontend)

The wizard uses the following frontend-only steps:

### Step 1: Pricing Model
- `POST` to `/api/v1/calculate-and-save` (no save)
- Validates pricing model selection

### Step 2: Services Selection
- Multi-select services with hours
- Updates live preview

### Step 3: Experience Level
- Designer experience (1-10)
- Freelance experience (1-10)

### Step 4: Geography
- Designer country selection
- Client country selection

### Step 5: Overhead Costs
- Multi-select overhead costs
- Optional items

### Step 6: Risk & Profit
- Risk buffer slider (0-50%)
- Profit margin slider (10-50%)

### Step 7: Review & Save
- View final calculation
- Save calculation to database
- Download PDF

---

## Error Responses

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTH_ERROR | 401 | Authentication required or failed |
| VALIDATION_ERROR | 400 | Invalid input data |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_ERROR | 500 | Server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "Specific error"
    }
  }
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced. For production, consider implementing:
- Supabase Pro plan rate limiting
- Vercel Edge Functions with rate limits
- Custom middleware

---

## Versioning

This API documentation is for version 1.0.

**Changelog:**
- 2026-03-24: Initial documentation

---

## Related Documentation

- `admin-guide.md` - Admin user setup guide
- `deployment-checklist.md` - Production deployment guide
- `quickstart.md` - User quick start guide