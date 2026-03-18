# Tasks: Database & Configuration Setup

**Branch**: `007-db-schema-setup` | **Date**: 2026-03-18
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Overview

This task breakdown implements Database & Configuration Setup for Becslo, organized by user story priority to enable independent implementation and testing.

**Total Tasks**: 27
**User Stories**: 4 (P1, P1, P2, P2)
**Parallel Opportunities**: 10 tasks marked with [P] can be executed in parallel

---

## Phase 1: Setup (Project Initialization)

### Goal

Verify existing project structure and Supabase connection.

### Tasks

- [ ] T001 Verify NextJS project structure exists from Phase 0
- [ ] T002 Verify Supabase configuration in .env.local
- [ ] T003 Verify Supabase CLI is installed and authenticated

---

## Phase 2: Database Migrations

### Goal

Create all database tables and run migrations.

### Tasks

- [ ] T004 [P] Create migration 003_create_tables.sql with categories, services, countries, calculations, calculation_services, costs, config tables in supabase/migrations/003_create_tables.sql
- [ ] T005 [P] Create tables: categories, services, countries, calculations, calculation_services, costs, config
- [ ] T006 [P] Add foreign key constraints between tables in supabase/migrations/003_create_tables.sql
- [ ] T007 Run migration 003_create_tables.sql in Supabase database

---

## Phase 3: User Story 1 - Seed Data Available (Priority: P1)

### Goal

Seed initial data so wizard dropdowns are populated.

**Independent Test**: Can be fully tested by querying each table and verifying data exists.

### Tasks

- [ ] T008 [P] [US1] Create seed data migration 004_seed_data.sql in supabase/migrations/004_seed_data.sql
- [ ] T009 [US1] Seed categories table (3-5 categories) in supabase/migrations/004_seed_data.sql
- [ ] T010 [US1] Seed services table (120+ services) in supabase/migrations/004_seed_data.sql
- [ ] T011 [US1] Seed countries table (~200 countries) in supabase/migrations/004_seed_data.sql
- [ ] T012 [US1] Seed costs table in supabase/migrations/004_seed_data.sql
- [ ] T013 [US1] Seed config table in supabase/migrations/004_seed_data.sql
- [ ] T014 Run migration 004_seed_data.sql in Supabase database
- [ ] T015 Verify seed data counts match requirements (120+ services, 200 countries)

---

## Phase 4: User Story 2 - Protected User Data (Priority: P1)

### Goal

Implement Row-Level Security policies to isolate user data.

**Independent Test**: Can be tested by creating two users, having each create a calculation, and verifying User A cannot see User B's data.

### Tasks

- [ ] T016 [P] [US2] Enable RLS on all tables in supabase/migrations/005_enable_rls.sql
- [ ] T017 [US2] Create RLS policy: users can read their own calculations in supabase/migrations/005_enable_rls.sql
- [ ] T018 [US2] Create RLS policy: users can insert calculations in supabase/migrations/005_enable_rls.sql
- [ ] T019 [US2] Create RLS policy: admin users have full access in supabase/migrations/005_enable_rls.sql
- [ ] T020 [US2] Run migration 005_enable_rls.sql in Supabase database

---

## Phase 6: User Story 4 - Admin User Ready (Priority: P2)

### Goal

Verify admin user exists and can access admin features.

**Independent Test**: Can be tested by logging in as admin and verifying access.

### Tasks

- [ ] T026 [P] [US4] Verify admin user exists in admin_users table in database
- [ ] T027 [P] [US4] Verify admin can access all data via RLS policies

### Performance Verification

Note: Performance criteria (SC-001: 2s load time, SC-003: 500ms API response) are verified during acceptance testing - no separate performance test tasks required for this phase.

---

## Phase 5: User Story 3 - API Data Access (Priority: P2)

### Goal

Implement API endpoints for wizard data fetching.

**Independent Test**: Can be tested by calling each endpoint and verifying correct data is returned.

### Tasks

- [ ] T021 [P] [US3] Create GET /api/v1/services route in src/app/api/v1/services/route.ts
- [ ] T022 [P] [US3] Create GET /api/v1/categories route in src/app/api/v1/categories/route.ts
- [ ] T023 [P] [US3] Create GET /api/v1/countries route in src/app/api/v1/countries/route.ts
- [ ] T024 [P] [US3] Create GET /api/v1/costs route in src/app/api/v1/costs/route.ts
- [ ] T025 [P] [US3] Create GET /api/v1/config route in src/app/api/v1/config/route.ts

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Migrations) → Phase 3 (Seed Data) → Phase 4 (RLS) → Phase 5 (API) → Phase 6 (Admin)
```

- Phase 2 must complete before Phase 3 (tables must exist)
- Phase 3 must complete before Phase 4 (seed data must exist for RLS testing)
- Phase 4 must complete before Phase 5 (RLS ensures API security)

### Parallel Execution

- Phase 2: T004, T005, T006 can run in parallel (migration file creation)
- Phase 3: T008, T009, T010, T011, T012, T013 can run in parallel (seed data sections)
- Phase 5: T021, T022, T023, T024, T025 can run in parallel (API routes)

---

## Implementation Strategy

### MVP Scope

**Recommended MVP Scope**: Phase 1 + Phase 2 + Phase 3 (Seed Data)

**Rationale**:
- Seed data is foundational - wizard cannot function without it
- Enables immediate validation of database schema
- Independent and testable without API endpoints

**Incremental Delivery**:

1. **Sprint 1** (Day 1): Complete Setup + Migrations (T001-T007)
   - Project verified, tables created
   - Deployable foundation

2. **Sprint 2** (Day 1-2): Complete Seed Data (T008-T015)
   - Categories, services, countries, costs, config populated
   - Wizard dropdowns work

3. **Sprint 3** (Day 2-3): Complete RLS Policies (T016-T020)
   - User data isolation enforced
   - Admin access verified

4. **Sprint 4** (Day 3): Complete API Endpoints (T021-T025)
   - All 5 endpoints functional
   - Ready for wizard integration

---

## Test Criteria by User Story

### User Story 1 (US1): Seed Data Available

**Test Criteria**:
1. Query categories table - should return 3-5 categories
2. Query services table - should return 120+ active services
3. Query countries table - should return ~200 countries
4. Query costs table - should return active costs
5. Query config table - should return single config record

**Success Indicators**:
- All seed data queries return expected counts
- Data displays correctly in wizard dropdowns

### User Story 2 (US2): Protected User Data

**Test Criteria**:
1. User A creates calculation - should succeed
2. User B queries calculations - should only see User B's data
3. Admin queries calculations - should see all data

**Success Indicators**:
- RLS policies enforced
- User isolation confirmed
- Admin access confirmed

### User Story 3 (US3): API Data Access

**Test Criteria**:
1. Call /api/v1/services - returns active services
2. Call /api/v1/services?category=1 - returns filtered services
3. Call /api/v1/categories - returns all categories
4. Call /api/v1/countries - returns all countries
5. Call /api/v1/costs - returns active costs
6. Call /api/v1/config - returns config values

**Success Indicators**:
- All endpoints return valid JSON
- Response times < 500ms
- Authentication required

### User Story 4 (US4): Admin User Ready

**Test Criteria**:
1. Admin user exists in admin_users table
2. Admin can access protected routes

**Success Indicators**:
- Admin role assigned
- Dashboard accessible

---

## Source Code - Database

- `supabase/migrations/003_create_tables.sql` - Table creation
- `supabase/migrations/004_seed_data.sql` - Seed data
- `supabase/migrations/005_enable_rls.sql` - RLS policies

## Source Code - API

- `src/app/api/v1/services/route.ts` - Services endpoint
- `src/app/api/v1/categories/route.ts` - Categories endpoint
- `src/app/api/v1/countries/route.ts` - Countries endpoint
- `src/app/api/v1/costs/route.ts` - Costs endpoint
- `src/app/api/v1/config/route.ts` - Config endpoint
