# Tasks: Setup & Database

**Feature**: Setup & Database  
**Branch**: `001-setup-database`  
**Generated**: 2026-03-16

---

## Phase 1: Setup

- [X] T001 Initialize NextJS 14.x project with TypeScript and Tailwind CSS
- [X] T002 Install Supabase dependencies (@supabase/supabase-js, @supabase/ssr)
- [X] T003 Configure environment variables (.env.local with Supabase credentials)
- [X] T004 Create supabase/ directory structure with migrations/ and seed/ subdirectories

---

## Phase 2: Foundational

### Database Tables

- [ ] T005 [P] Create users table migration in supabase/migrations/001_create_users.sql
- [ ] T006 [P] Create admin_users table migration in supabase/migrations/002_create_admin_users.sql
- [ ] T007 [P] Create services table migration in supabase/migrations/003_create_services.sql
- [ ] T008 [P] Create calculations table migration in supabase/migrations/004_create_calculations.sql
  - Include CHECK constraint for: experience_years IN ('0-2','3-5','6-9','10+'), freelance_years IN ('0-1','2-3','4-6','7+'), pricing_model IN ('hourly','fixed'), risk_level IN ('low','medium','high')
- [ ] T009 [P] Create calculation_services junction table migration in supabase/migrations/005_create_calculation_services.sql
- [ ] T010 [P] Create costs table migration in supabase/migrations/006_create_costs.sql
  - Include CHECK constraint for: type IN ('monthly','project')
- [ ] T011 [P] Create config table migration in supabase/migrations/007_create_config.sql

### Row Level Security

- [ ] T012 Enable RLS on users table
- [ ] T013 Enable RLS on admin_users table
- [ ] T014 Enable RLS on services table
- [ ] T015 Enable RLS on calculations table
- [ ] T016 Enable RLS on calculation_services table
- [ ] T017 Enable RLS on costs table
- [ ] T018 Enable RLS on config table

### RLS Policies

- [ ] T019 [P] Create users policy: users can read own profile
- [ ] T020 [P] Create admin_users policy: admins can read all
- [ ] T021 [P] Create services policy: authenticated users can read active services
- [ ] T022 [P] Create services policy: admins can manage services
- [ ] T023 [P] Create calculations policy: authenticated users can insert own calculations
- [ ] T024 [P] Create calculations policy: users can read own calculations
- [ ] T025 [P] Create calculations policy: admins can read all calculations
- [ ] T026 [P] Create calculation_services policy: same as parent calculation
- [ ] T027 [P] Create costs policy: same as parent calculation
- [ ] T028 [P] Create config policy: authenticated users can read
- [ ] T029 [P] Create config policy: admins can update

### Seed Data

- [ ] T030 Create seed script for services table in supabase/seed/001_seed_services.sql
- [ ] T031 Create seed script for config table in supabase/seed/002_seed_config.sql
- [ ] T032 Run seed scripts to populate initial data

---

## Phase 3: Verification

- [ ] T033 Verify all seven tables exist with correct schemas
- [ ] T034 Verify RLS policies prevent unauthorized access
- [ ] T035 Verify default services are queryable by category
- [ ] T036 Verify config values are at default values

---

## Dependencies

```
T001 → T002 → T003 → T004
T004 → T005, T006, T007, T008, T009, T010, T011 (parallel)
T005-T011 → T012-T018 (parallel)
T012-T018 → T019-T029 (parallel)
T005-T029 → T030-T032 (parallel)
T030-T032 → T033-T036 (sequential verification)
```

---

## Parallel Execution Opportunities

- Database table creation tasks (T005-T011) can run in parallel
- RLS enablement tasks (T012-T018) can run in parallel
- RLS policy creation tasks (T019-T029) can run in parallel
- Seed script creation tasks (T030-T031) can run in parallel

---

## Independent Test Criteria

### User Story 1 - Initialize Development Environment
- `npm run dev` starts without errors
- `npm run build` completes successfully

### User Story 2 - Configure Database Infrastructure
- All seven tables exist in Supabase
- RLS policies block unauthorized queries

### User Story 3 - Define Data Models
- Sample data can be inserted into each table
- Relationships are maintained correctly across tables

---

## Implementation Strategy

MVP Scope: All tasks in Phases 1-3 are required for the MVP. This is the foundational setup phase - no incremental delivery possible as all tasks are prerequisites for subsequent features.

The tasks should be executed in order, with parallel opportunities utilized where indicated.
