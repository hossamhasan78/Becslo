# Tasks: Backend API

**Feature**: Backend API  
**Branch**: `002-backend-api`  
**Generated**: 2026-03-16

---

## Phase 1: Setup (Verification)

- [ ] T001 [P] Verify GET /api/services endpoint in src/app/api/services/route.ts returns active services grouped by category
- [ ] T002 [P] Verify GET /api/config endpoint in src/app/api/config/route.ts returns pricing configuration
- [ ] T003 [P] Verify GET /api/countries endpoint in src/app/api/countries/route.ts returns ISO 3166 country list

---

## Phase 2: Foundational (User Endpoints)

### Calculation Storage (US2)

- [X] T004 [US2] Verify POST /api/calculation endpoint in src/app/api/calculation/route.ts stores calculation with services and costs

### PDF Export (US3)

- [X] T005 [US3] Verify POST /api/export-pdf endpoint in src/app/api/export-pdf/route.ts generates PDF and returns download URL

---

## Phase 3: Admin Endpoints

### Admin Analytics (US4)

- [ ] T006 [US4] Verify GET /api/admin/analytics endpoint in src/app/api/admin/analytics/route.ts returns aggregate statistics
- [ ] T006b [US4] Verify GET /api/admin/calculations endpoint in src/app/api/admin/calculations/route.ts returns all stored calculations with details

### Admin Service Management (US5)

- [ ] T007 [US5] Verify GET /api/admin/services endpoint in src/app/api/admin/services/route.ts returns all services
- [ ] T008 [US5] Verify POST /api/admin/services endpoint creates new service
- [ ] T009 [US5] Verify PATCH /api/admin/services/:id endpoint updates service and toggles active status
- [ ] T010 [US5] Confirm DELETE endpoint is NOT implemented (soft-delete only per clarification)

### Admin Configuration (US6)

- [ ] T011 [US6] Verify PATCH /api/admin/config endpoint in src/app/api/admin/config/route.ts updates configuration

---

## Phase 4: Security & Validation

### Authentication & Authorization

- [ ] T012 Verify calculation endpoints require authentication (unauthenticated requests rejected)
- [ ] T013 Verify admin endpoints require admin role in admin_users table
- [ ] T014 Verify non-admin users cannot access admin endpoints

### Error Handling

- [ ] T015 Verify all endpoints return appropriate HTTP status codes (200, 201, 400, 401, 403, 500)
- [ ] T016 Verify invalid requests return helpful error messages
- [ ] T017 Verify pricing formula calculates correctly (experience multipliers, geography multipliers, risk buffer, profit margin applied in correct order)

---

## Phase 5: Integration

- [ ] T018 [P] End-to-end test: Submit calculation via POST /api/calculation, verify appears in admin view
- [ ] T019 [P] End-to-end test: Create service via admin endpoint, verify appears in user services list

---

## Dependencies

```
T001-T003 (Phase 1) → T004-T005 (Phase 2)
T004-T005 → T006-T011 (Phase 3)
T006-T011 → T012-T017 (Phase 4)
T012-T017 → T018-T019 (Phase 5)
```

---

## Parallel Execution Opportunities

- Phase 1 verification tasks (T001-T003) can run in parallel
- Phase 4 security tasks (T012-T014) can run in parallel
- Phase 5 integration tasks (T017-T018) can run in parallel

---

## Independent Test Criteria

### US1 - Fetch Pricing Configuration
- All three config endpoints return expected data format
- Services grouped by category
- Countries follow ISO 3166

### US2 - Store Calculations
- Calculation persists with all input parameters
- Related services and costs linked correctly

### US3 - PDF Export
- PDF generates successfully
- Download URL returned

### US4 - Admin Analytics
- Aggregate statistics calculated correctly
- Top services and countries included

### US5 - Admin Service Management
- CRUD operations work correctly
- Active/inactive toggle functions

### US6 - Admin Configuration
- Config updates persist
- Changes take effect immediately

---

## Implementation Strategy

API endpoints already exist in src/app/api/. This task list focuses on verification and validation of the existing implementation.

MVP Scope: All verification tasks in Phases 1-5 are required to ensure the backend API functions correctly.
