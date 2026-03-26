# API Response Contract: Database Service Cleanup

**Branch**: `016-db-service-cleanup`
**Date**: 2026-03-26

---

## Overview

This feature performs no API contract changes. The shape, status codes, and field names of all existing API responses remain identical. Only the **data returned** changes — the service and category lists will be smaller after the migration runs.

---

## Affected Endpoints (data reduced, contract unchanged)

### GET /api/v1/categories

Returns all category rows from `public.categories`.

**Before migration**: Returns 4 categories.
**After migration**: Returns 2 categories.

**Response shape** (unchanged):
```json
[
  { "id": 1, "name": "Strategy & Research", "display_order": 1 },
  { "id": 2, "name": "Design & UI/UX", "display_order": 2 }
]
```

---

### GET /api/v1/services

Returns all active services from `public.services` (filtered by `is_active = true` via RLS).

**Before migration**: Returns ~120+ services across 4 categories.
**After migration**: Returns 34 services across 2 categories.

**Response shape** (unchanged):
```json
[
  {
    "id": 1,
    "category_id": 1,
    "name": "Brand Strategy",
    "default_hours": 8,
    "min_hours": 2,
    "max_hours": 40,
    "base_rate": 50,
    "is_active": true
  }
]
```

---

### GET /api/admin/services

Admin-only endpoint. Returns all services regardless of `is_active` status.

**After migration**: Returns 34 services. The deleted services are absent entirely — they are hard-deleted, not deactivated. There are no `is_active = false` rows for deleted services.

---

## No Contract Changes Required In

| Endpoint | Reason |
|----------|--------|
| POST /api/v1/calculate-and-save | Accepts any valid `service_id` — if a client sends a deleted service ID, a DB FK lookup will find no matching row; existing validation handles unknown IDs |
| GET /api/admin/calculations | Reads `calculations` table; rows are unaffected |
| GET /api/admin/calculations/:id | Reads `calculation_services` by `calculation_id`; orphaned junction rows (if any) are removed by migration |

---

## Validation Note

No API-level validation changes are needed to enforce the removed services. Deleted rows simply do not exist in the database; any lookup by ID returns empty. Existing "service not found" error handling is sufficient.
