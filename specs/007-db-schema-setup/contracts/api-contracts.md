# API Contracts: Database & Configuration Setup

**Feature**: Database & Configuration Setup
**Date**: 2026-03-18
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the API contracts for fetching wizard configuration data from the database.

---

## Interface: Services API

### GET /api/v1/services

Fetch active services, optionally filtered by category.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | integer | No | Filter by category ID |

**Response** (200 OK):

```json
{
  "services": [
    {
      "id": 1,
      "category_id": 1,
      "name": "Logo Design",
      "default_hours": 8,
      "min_hours": 4,
      "max_hours": 24,
      "is_active": true
    }
  ]
}
```

**Error Responses**:
- 500: Internal server error

---

## Interface: Categories API

### GET /api/v1/categories

Fetch all service categories ordered by display_order.

**Response** (200 OK):

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Strategy & Research",
      "display_order": 1
    }
  ]
}
```

---

## Interface: Countries API

### GET /api/v1/countries

Fetch all countries with geography multipliers.

**Response** (200 OK):

```json
{
  "countries": [
    {
      "id": 1,
      "name": "United States",
      "code": "US",
      "multiplier": 1.0
    }
  ]
}
```

---

## Interface: Costs API

### GET /api/v1/costs

Fetch active overhead costs.

**Response** (200 OK):

```json
{
  "costs": [
    {
      "id": 1,
      "name": "Software Licenses",
      "default_cost": 50.00,
      "is_active": true
    }
  ]
}
```

---

## Interface: Config API

### GET /api/v1/config

Fetch system configuration.

**Response** (200 OK):

```json
{
  "config": {
    "base_rate": 50.00,
    "risk_buffer_min": 0,
    "risk_buffer_max": 50,
    "profit_margin_min": 10,
    "profit_margin_max": 50
  }
}
```

---

## Authentication

All endpoints require authentication (valid session token). Unauthorized requests return 401.

---

## Performance Targets

| Endpoint | Target Response Time |
|----------|---------------------|
| /services | < 500ms |
| /categories | < 500ms |
| /countries | < 500ms |
| /costs | < 500ms |
| /config | < 500ms |
