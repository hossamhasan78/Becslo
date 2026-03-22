# Admin API Contracts

**Feature**: Admin Dashboard & Analytics
**Version**: 1.0.0
**Date**: 2026-03-22

## Overview

This document defines the API contracts for admin dashboard operations. All endpoints require authentication with admin role and follow RESTful conventions. Base URL: `/api/admin`.

## Authentication

All API endpoints require:
- Valid Supabase JWT token in `Authorization: Bearer <token>` header
- User must have admin role (verified via `admin_users` table)
- Middleware checks role before allowing access

## Common Response Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful request with no response body
- `400 Bad Request` - Invalid request parameters or validation errors
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Authenticated but insufficient permissions (non-admin user)
- `404 Not Found` - Resource not found
- `409 Conflict` - Concurrent update conflict (optimistic locking)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Common Response Format

### Success Response
```json
{
  "data": <response data>,
  "error": null
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "message": "<error description>",
    "code": "<error code>",
    "details": <additional error details>
  }
}
```

---

## Endpoints

### GET /api/admin/analytics

**Description**: Retrieve analytics metrics with optional date range filtering.

**Authentication**: Required (admin role)

**Query Parameters**:
- `start_date` (optional, ISO 8601 date) - Start date for analytics period (inclusive)
- `end_date` (optional, ISO 8601 date) - End date for analytics period (inclusive)
- If neither provided, returns all-time metrics

**Request Example**:
```http
GET /api/admin/analytics?start_date=2026-01-01&end_date=2026-03-31
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "data": {
    "average_price": 5423,
    "average_hours": 45.5,
    "total_calculations": 127,
    "most_used_services": [
      { "service_id": "uuid-1", "service_name": "UI Design", "count": 45 },
      { "service_id": "uuid-2", "service_name": "User Research", "count": 38 },
      { "service_id": "uuid-3", "service_name": "Prototyping", "count": 32 }
    ],
    "top_client_countries": [
      { "country_id": "uuid-1", "country_name": "United States", "count": 58 },
      { "country_id": "uuid-2", "country_name": "United Kingdom", "count": 35 },
      { "country_id": "uuid-3", "country_name": "Canada", "count": 34 }
    ]
  },
  "error": null
}
```

**Validation Rules**:
- `start_date` and `end_date` must be valid ISO 8601 dates if provided
- `start_date` must be <= `end_date` if both provided
- If no calculations exist in date range, returns zero values and empty arrays

**Performance Target**: <3 seconds for up to 10,000 calculations (SC-003)

---

### GET /api/admin/services

**Description**: Retrieve paginated list of services with filtering options.

**Authentication**: Required (admin role)

**Query Parameters**:
- `page` (optional, integer, default: 1) - Page number (1-indexed)
- `page_size` (optional, integer, default: 25) - Items per page (max: 100)
- `is_active` (optional, boolean) - Filter by active status
- `category` (optional, string) - Filter by category name

**Request Example**:
```http
GET /api/admin/services?page=1&page_size=25&is_active=true
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "data": {
    "services": [
      {
        "id": "uuid-1",
        "name": "UI Design",
        "category": "Design & UI",
        "default_hours": 40,
        "min_hours": 20,
        "max_hours": 60,
        "is_active": true,
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-02-20T14:45:00Z"
      },
      {
        "id": "uuid-2",
        "name": "User Research",
        "category": "Strategy & Research",
        "default_hours": 20,
        "min_hours": 10,
        "max_hours": 40,
        "is_active": true,
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 25,
      "total_count": 156,
      "total_pages": 7
    }
  },
  "error": null
}
```

**Validation Rules**:
- `page` must be >= 1
- `page_size` must be between 1 and 100
- `is_active` must be boolean if provided
- `category` must match existing category name if provided

**Performance Target**: <2 seconds per page (SC-004)

---

### POST /api/admin/services

**Description**: Create a new service.

**Authentication**: Required (admin role)

**Request Body**:
```json
{
  "name": "Service Discovery",
  "category": "Strategy & Research",
  "default_hours": 15,
  "min_hours": 10,
  "max_hours": 25
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "uuid-new",
    "name": "Service Discovery",
    "category": "Strategy & Research",
    "default_hours": 15,
    "min_hours": 10,
    "max_hours": 25,
    "is_active": true,
    "created_at": "2026-03-22T15:00:00Z",
    "updated_at": null
  },
  "error": null
}
```

**Validation Rules**:
- `name` must not be empty, max 255 characters
- `category` must not be empty, must match existing category name
- `default_hours` must be between `min_hours` and `max_hours`
- `min_hours` must be >= 0
- `max_hours` must be >= `min_hours`
- `is_active` defaults to true

**Performance Target**: <30 seconds per operation (SC-001)

---

### GET /api/admin/services/{id}

**Description**: Retrieve a single service by ID.

**Authentication**: Required (admin role)

**Path Parameters**:
- `id` (UUID) - Service ID

**Request Example**:
```http
GET /api/admin/services/uuid-1
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "uuid-1",
    "name": "UI Design",
    "category": "Design & UI",
    "default_hours": 40,
    "min_hours": 20,
    "max_hours": 60,
    "is_active": true,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-20T14:45:00Z"
  },
  "error": null
}
```

**Validation Rules**:
- `id` must be valid UUID
- Service must exist

---

### PUT /api/admin/services/{id}

**Description**: Update an existing service.

**Authentication**: Required (admin role)

**Path Parameters**:
- `id` (UUID) - Service ID

**Request Body**:
```json
{
  "name": "UI Design & Systems",
  "category": "Design & UI",
  "default_hours": 45,
  "min_hours": 25,
  "max_hours": 65,
  "is_active": true
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "uuid-1",
    "name": "UI Design & Systems",
    "category": "Design & UI",
    "default_hours": 45,
    "min_hours": 25,
    "max_hours": 65,
    "is_active": true,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-03-22T15:30:00Z"
  },
  "error": null
}
```

**Validation Rules**:
- `id` must be valid UUID and service must exist
- `name` must not be empty, max 255 characters
- `category` must not be empty, must match existing category name
- `default_hours` must be between `min_hours` and `max_hours`
- `min_hours` must be >= 0
- `max_hours` must be >= `min_hours`
- `is_active` must be boolean

**Performance Target**: <30 seconds per operation (SC-001)

---

### DELETE /api/admin/services/{id}

**Description**: Deactivate (soft-delete) a service.

**Note**: Actual deletion is blocked if service is used in existing calculations (FR-007A). This endpoint sets `is_active = false`.

**Authentication**: Required (admin role)

**Path Parameters**:
- `id` (UUID) - Service ID

**Request Example**:
```http
DELETE /api/admin/services/uuid-1
Authorization: Bearer <token>
```

**Response (204 No Content)**: (No response body)

**Error Response (409 Conflict)** - Service used in calculations:
```json
{
  "data": null,
  "error": {
    "message": "Cannot delete service that has been used in existing calculations. Deactivate instead.",
    "code": "SERVICE_IN_USE",
    "details": {
      "service_id": "uuid-1",
      "calculation_count": 15
    }
  }
}
```

**Validation Rules**:
- `id` must be valid UUID and service must exist
- Service must not be used in any existing calculations

---

### GET /api/admin/config

**Description**: Retrieve current pricing configuration.

**Authentication**: Required (admin role)

**Query Parameters**: None

**Request Example**:
```http
GET /api/admin/config
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "uuid-config",
    "base_rate": 100,
    "risk_buffer_min": 5,
    "risk_buffer_max": 20,
    "profit_margin_min": 15,
    "profit_margin_max": 30,
    "version": 3,
    "updated_at": "2026-03-22T10:00:00Z",
    "updated_by": "uuid-admin-user"
  },
  "error": null
}
```

**Validation Rules**: None (single record always exists)

---

### PUT /api/admin/config

**Description**: Update pricing configuration (optimistic locking).

**Authentication**: Required (admin role)

**Request Body**:
```json
{
  "base_rate": 105,
  "risk_buffer_min": 10,
  "risk_buffer_max": 25,
  "profit_margin_min": 20,
  "profit_margin_max": 40,
  "version": 3
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "uuid-config",
    "base_rate": 105,
    "risk_buffer_min": 10,
    "risk_buffer_max": 25,
    "profit_margin_min": 20,
    "profit_margin_max": 40,
    "version": 4,
    "updated_at": "2026-03-22T15:00:00Z",
    "updated_by": "uuid-admin-user"
  },
  "error": null
}
```

**Error Response (409 Conflict)** - Concurrent update:
```json
{
  "data": null,
  "error": {
    "message": "Configuration was modified by another admin. Please refresh and try again.",
    "code": "CONCURRENT_UPDATE",
    "details": {
      "expected_version": 3,
      "current_version": 4
    }
  }
}
```

**Validation Rules**:
- `base_rate` must be > 0
- `risk_buffer_min` must be >= 0 and <= 50
- `risk_buffer_max` must be >= `risk_buffer_min` and <= 50
- `profit_margin_min` must be >= 10 and <= 50
- `profit_margin_max` must be >= `profit_margin_min` and <= 50
- `version` must match current version (optimistic locking)

**Performance Target**: <5 seconds to apply to new calculations (SC-002)

---

### GET /api/admin/calculations

**Description**: Retrieve paginated list of calculations with filtering.

**Authentication**: Required (admin role)

**Query Parameters**:
- `page` (optional, integer, default: 1) - Page number (1-indexed)
- `page_size` (optional, integer, default: 25) - Items per page (max: 100)
- `start_date` (optional, ISO 8601 date) - Filter by start date
- `end_date` (optional, ISO 8601 date) - Filter by end date

**Request Example**:
```http
GET /api/admin/calculations?page=1&page_size=25&start_date=2026-01-01&end_date=2026-03-31
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "data": {
    "calculations": [
      {
        "id": "uuid-calc-1",
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "total_price": 5423,
        "final_price": 5423,
        "created_at": "2026-03-20T10:30:00Z"
      },
      {
        "id": "uuid-calc-2",
        "user_name": "Jane Smith",
        "user_email": "jane@example.com",
        "total_price": 3210,
        "final_price": 3210,
        "created_at": "2026-03-19T14:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 25,
      "total_count": 127,
      "total_pages": 6
    }
  },
  "error": null
}
```

**Validation Rules**:
- `page` must be >= 1
- `page_size` must be between 1 and 100
- `start_date` and `end_date` must be valid ISO 8601 dates if provided
- `start_date` must be <= `end_date` if both provided
- If no calculations match filters, returns empty array with total_count: 0

**Performance Target**: <2 seconds per page (SC-004)

---

### GET /api/admin/calculations/{id}

**Description**: Retrieve detailed breakdown of a single calculation.

**Authentication**: Required (admin role)

**Path Parameters**:
- `id` (UUID) - Calculation ID

**Request Example**:
```http
GET /api/admin/calculations/uuid-calc-1
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "uuid-calc-1",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "pricing_model": "project-based",
    "experience_designer": 7,
    "experience_freelance": 6,
    "designer_country": "United States",
    "client_country": "United Kingdom",
    "total_hours": 45.5,
    "subtotal": 4200,
    "risk_buffer": 450,
    "profit_margin": 773,
    "final_price": 5423,
    "recommended_min": 4338,
    "recommended_max": 6508,
    "created_at": "2026-03-20T10:30:00Z",
    "services": [
      {
        "service_name": "UI Design",
        "hours": 20,
        "adjusted_rate": 105,
        "cost": 2100
      },
      {
        "service_name": "User Research",
        "hours": 15,
        "adjusted_rate": 105,
        "cost": 1575
      },
      {
        "service_name": "Prototyping",
        "hours": 10.5,
        "adjusted_rate": 105,
        "cost": 1102
      }
    ],
    "costs": [
      {
        "cost_name": "Software Licenses",
        "amount": 500
      }
    ],
    "multipliers": {
      "experience_multiplier": 42, // 7 * 6
      "geography_multiplier": 1.05, // designer US, client UK
      "base_rate": 100
    }
  },
  "error": null
}
```

**Validation Rules**:
- `id` must be valid UUID and calculation must exist
- All monetary values rounded to nearest dollar (Constitution requirement)

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_DATE_RANGE` | 400 | Start date must be <= end date |
| `INVALID_PAGE` | 400 | Page number must be >= 1 |
| `INVALID_PAGE_SIZE` | 400 | Page size must be between 1 and 100 |
| `INVALID_SERVICE_HOURS` | 422 | Min hours must be <= default hours <= max hours |
| `SERVICE_IN_USE` | 409 | Cannot delete service used in calculations |
| `CONCURRENT_UPDATE` | 409 | Configuration was modified by another admin |
| `INVALID_CONFIG_RANGE` | 422 | Min must be <= max for risk buffer and profit margin |
| `INVALID_CONFIG_VALUE` | 422 | Invalid configuration value (e.g., negative base rate) |

## Performance Targets Summary

- Analytics queries: <3 seconds for up to 10,000 calculations
- Pagination: <2 seconds per page for 25 items
- Configuration updates: <5 seconds to apply to new calculations
- Service CRUD: <30 seconds per operation
- Calculation details: <2 seconds

## Security Considerations

### Authentication
- All endpoints require valid Supabase JWT token
- Token must have admin role claim
- Middleware validates token and role before processing request

### Input Validation
- All inputs validated on server side
- SQL injection prevented by Supabase query builder
- XSS prevention via proper encoding

### Rate Limiting
- Consider rate limiting for analytics endpoints to prevent abuse
- Implement reasonable limits (e.g., 100 requests/minute per admin)

### Audit Logging
- Log all admin configuration changes with admin user ID and timestamp
- Track service activations/deactivations
- Monitor for suspicious activity patterns

## Versioning

API version 1.0.0. Breaking changes will increment major version, additions will increment minor version, bug fixes will increment patch version.
