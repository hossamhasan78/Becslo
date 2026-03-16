# API Contracts: Backend API

This document defines the interface contracts for all API endpoints.

---

## User Endpoints

### GET /api/services

Fetch all active services grouped by category.

**Authentication**: Not required

**Response**:
```json
{
  "UX Research": [
    { "id": "uuid", "name": "User Interviews", "default_hours": 8, "min_hours": 2, "max_hours": 20 }
  ],
  "UI Design": [
    { "id": "uuid", "name": "Wireframing", "default_hours": 8, "min_hours": 2, "max_hours": 24 }
  ]
}
```

---

### GET /api/config

Fetch all pricing configuration values.

**Authentication**: Not required

**Response**:
```json
{
  "base_hourly_rate": 75,
  "experience_multipliers": {
    "designer": { "0-2": 0.7, "3-5": 1.0, "6-9": 1.3, "10+": 1.6 },
    "freelance": { "0-1": 0.8, "2-3": 1.0, "4-6": 1.2, "7+": 1.4 }
  },
  "geo_multipliers": {},
  "risk_buffer": 10,
  "profit_margin": 20
}
```

---

### GET /api/countries

Fetch ISO 3166 country list.

**Authentication**: Not required

**Response**:
```json
[
  { "code": "US", "name": "United States" },
  { "code": "GB", "name": "United Kingdom" }
]
```

---

### POST /api/calculation

Store a pricing calculation.

**Authentication**: Required (Supabase session)

**Request Body**:
```json
{
  "experience_years": "3-5",
  "freelance_years": "2-3",
  "designer_country": "US",
  "client_country": "GB",
  "pricing_model": "hourly",
  "risk_level": "normal",
  "profit_margin": 20,
  "total_hours": 40,
  "final_price": 3500,
  "services": [
    { "service_id": "uuid", "hours": 16 },
    { "service_id": "uuid", "hours": 24 }
  ],
  "costs": [
    { "name": "Figma Subscription", "amount": 15, "type": "monthly" }
  ]
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "message": "Calculation stored successfully"
}
```

---

### POST /api/export-pdf

Generate PDF export of a calculation.

**Authentication**: Required (Supabase session)

**Request Body**:
```json
{
  "experience_years": "3-5",
  "freelance_years": "2-3",
  "designer_country": "US",
  "client_country": "GB",
  "pricing_model": "hourly",
  "risk_level": "normal",
  "profit_margin": 20,
  "total_hours": 40,
  "final_price": 3500,
  "services": [
    { "name": "Wireframing", "hours": 16, "rate": 87.5, "subtotal": 1400 }
  ],
  "costs": [
    { "name": "Figma Subscription", "amount": 15, "type": "monthly" }
  ]
}
```

**Response** (200 OK):
```json
{
  "download_url": "https://..."
}
```

---

## Admin Endpoints

### GET /api/admin/calculations

List all stored calculations with details.

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "calculations": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "experience_years": "3-5",
      "freelance_years": "2-3",
      "designer_country": "US",
      "client_country": "GB",
      "pricing_model": "hourly",
      "risk_level": "normal",
      "profit_margin": 20,
      "total_hours": 40,
      "final_price": 3500,
      "created_at": "2026-03-16T10:00:00Z",
      "services": [...],
      "costs": [...]
    }
  ]
}
```

---

### GET /api/admin/analytics

Get aggregate statistics.

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "total_calculations": 150,
  "total_users": 45,
  "average_price": 2800,
  "average_hours": 35,
  "top_services": [
    { "name": "High-Fidelity Mockups", "count": 45 },
    { "name": "Wireframing", "count": 38 }
  ],
  "top_countries": [
    { "country": "US", "count": 60 },
    { "country": "GB", "count": 35 }
  ]
}
```

---

### GET /api/admin/services

List all services (including inactive).

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "services": [
    { "id": "uuid", "name": "Wireframing", "category": "UI Design", "default_hours": 8, "min_hours": 2, "max_hours": 24, "is_active": true }
  ]
}
```

---

### POST /api/admin/services

Create a new service.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "New Service",
  "category": "UI Design",
  "default_hours": 8,
  "min_hours": 2,
  "max_hours": 24,
  "is_active": true
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "message": "Service created successfully"
}
```

---

### PATCH /api/admin/services/:id

Update a service.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

**Response** (200 OK):
```json
{
  "message": "Service updated successfully"
}
```

---

### PATCH /api/admin/config

Update configuration values.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "base_hourly_rate": 85,
  "profit_margin": 25
}
```

**Response** (200 OK):
```json
{
  "message": "Configuration updated successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Not authorized |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
