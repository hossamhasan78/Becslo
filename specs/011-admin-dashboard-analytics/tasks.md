# Tasks: Admin Dashboard & Analytics

**Input**: Design documents from `/specs/011-admin-dashboard-analytics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing requirements are specified in Constitution (Phase 7 requirement: "Authentication flow end-to-end tests required per Constitution"). However, since Constitution requires ALL deployments to go through Vercel preview before production, and Phase 7 (Testing & Deployment) is after this feature, tests will be written and executed in Phase 7. This tasks.md focuses on implementation tasks only, with tests deferred to Phase 7.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create admin directory structure in src/app/admin/ with layout.tsx and page.tsx for admin dashboard home
- [X] T002 Create admin API routes directory structure in src/app/api/admin/
- [X] T003 Create admin components directory structure in src/components/admin/
- [X] T004 [P] Create TypeScript types for admin operations in src/types/admin.ts (Service, Configuration, Calculation, AnalyticsMetrics types)
- [X] T005 [P] Create database indexes migration for analytics performance in supabase/migrations/ (idx_calculations_created_at, idx_calculation_services_service_id, idx_calculations_client_country, etc.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement role-based access control (RBAC) middleware in src/middleware.ts to protect /admin/* routes and redirect non-admin users to wizard
- [X] T007 [P] Create Supabase server client helper in src/lib/supabase/server.ts
- [X] T008 [P] Create Supabase browser client helper in src/lib/supabase/client.ts
- [X] T009 [P] Create analytics aggregation utility functions in src/lib/analytics.ts (average calculations, most used services, top countries)
- [X] T009A [P] Create admin dashboard home page in src/app/admin/page.tsx with summary widgets and links to all sections

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Services Management (Priority: P1) 🎯 MVP

**Goal**: Admin users can view all available services in a paginated list, activate or deactivate services, edit service details (name, category, hours), and add new services to the system.

**Independent Test**: Admin can log in, navigate to Services page, view the complete list of services, deactivate one service (verify it no longer appears for users), edit another service's details, and add a new service. All CRUD operations can be tested independently without needing analytics or configuration features.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create Sidebar navigation component in src/components/admin/Sidebar.tsx with links to all admin pages
- [X] T011 [P] [US1] Create ServicesTable component in src/components/admin/ServicesTable.tsx with pagination and activate/deactivate buttons
- [X] T012 [US1] Create ServiceForm component in src/components/admin/ServiceForm.tsx with inline validation for service fields
- [X] T013 [P] [US1] Create admin layout in src/app/admin/layout.tsx with Sidebar and admin user info header
- [X] T014 [US1] Create Services list page in src/app/admin/services/page.tsx (server component fetching services via Supabase)
- [X] T015 [US1] Create Service edit page in src/app/admin/services/[id]/page.tsx with ServiceForm for editing
- [X] T016 [US1] Create GET /api/admin/services route in src/app/api/admin/services/route.ts with pagination and filtering
- [X] T017 [US1] Create POST /api/admin/services route in src/app/api/admin/services/route.ts for creating new services
- [X] T018 [US1] Create GET /api/admin/services/[id] route in src/app/api/admin/services/[id]/route.ts for retrieving single service
- [X] T019 [US1] Create PUT /api/admin/services/[id] route in src/app/api/admin/services/[id]/route.ts for updating services
- [X] T020 [US1] Create DELETE /api/admin/services/[id] route in src/app/api/admin/services/[id]/route.ts for deactivating services (blocks deletion if used in calculations)
- [X] T021 [US1] Add loading state for Services list page in src/app/admin/services/loading.tsx
- [X] T022 [US1] Add empty state handling for Services list when no services exist or filters return no results
- [X] T022A [US1] Add pagination logic for Services list to handle hundreds of services efficiently (edge case L101)
- [X] T022B [US1] Add empty state message for Services list when filters return no results (edge case L102)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Configuration Editor (Priority: P2)

**Goal**: Admin users can adjust pricing configuration parameters including multipliers (experience, geography), base rates, risk buffer range (min/max), and profit margin range (min/max).

**Independent Test**: Admin can navigate to Config page, modify experience multiplier values, update base rate, adjust risk buffer range from 0-50% to a different range, adjust profit margin range from 10-50% to a different range, and save all changes. These settings can be tested independently by running a calculation before and after to verify changes take effect.

### Implementation for User Story 2

- [X] T023 [P] [US2] Create ConfigEditor component in src/components/admin/ConfigEditor.tsx with inline validation and debounced API checks
- [X] T024 [P] [US2] Create debounce utility function in src/lib/debounce.ts for inline validation (300ms delay)
- [X] T025 [US2] Create Configuration page in src/app/admin/config/page.tsx with ConfigEditor component
- [X] T026 [US2] Create GET /api/admin/config route in src/app/api/admin/config/route.ts for retrieving current configuration
- [X] T027 [US2] Create PUT /api/admin/config route in src/app/api/admin/config/route.ts with optimistic locking using version column
- [X] T028 [US2] Add loading state for Configuration page in src/app/admin/config/loading.tsx
- [X] T029 [US2] Add error handling for concurrent configuration updates (409 Conflict) in ConfigEditor component with refresh prompt
- [X] T029A [P] [US2] Add configuration integration with wizard to apply admin config changes to wizard slider ranges


**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Analytics Dashboard (Priority: P3)

**Goal**: Admin users can view key metrics displayed in numeric tables including average price, average hours, most used services, top client countries, and total calculation count, all filterable by date range.

**Independent Test**: Admin can navigate to Analytics page, view all metrics tables, apply date range filters, and see updated metrics. This can be tested independently after services and configuration are set up, without needing calculations viewer.

### Implementation for User Story 3

- [X] T030 [P] [US3] Create AnalyticsTables component in src/components/admin/AnalyticsTables.tsx with numeric tables for all metrics
- [X] T031 [P] [US3] Create DateRangeFilter component in src/components/admin/DateRangeFilter.tsx for date range selection
- [X] T032 [US3] Create Analytics page in src/app/admin/analytics/page.tsx with AnalyticsTables and DateRangeFilter
- [X] T033 [US3] Create GET /api/admin/analytics route in src/app/api/admin/analytics/route.ts using analytics aggregation functions
- [X] T034 [US3] Add loading state for Analytics page in src/app/admin/analytics/loading.tsx
- [X] T035 [US3] Add empty state handling for Analytics when no calculations exist in date range (show zero values)

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: User Story 4 - Calculations Viewer (Priority: P4)

**Goal**: Admin users can view a list of all calculations with user data (name, email), filter by date range, and view detailed breakdown of individual calculations including services, hours, costs, multipliers, and final price.

**Independent Test**: Admin can navigate to Calculations page, view list of calculations with user names and emails, filter by date range, click on a calculation to see full details. This can be tested independently after other features are implemented.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Create CalculationsList component in src/components/admin/CalculationsList.tsx with pagination and date filtering
- [ ] T037 [P] [US4] Create CalculationDetails component in src/components/admin/CalculationDetails.tsx showing full breakdown (services, costs, multipliers, pricing)
- [ ] T038 [US4] Create Calculations list page in src/app/admin/calculations/page.tsx with CalculationsList
- [ ] T039 [US4] Create Calculation details page in src/app/admin/calculations/[id]/page.tsx with CalculationDetails component
- [ ] T040 [US4] Create GET /api/admin/calculations route in src/app/api/admin/calculations/route.ts with pagination and date filtering
- [ ] T041 [US4] Create GET /api/admin/calculations/[id] route in src/app/api/admin/calculations/[id]/route.ts returning detailed breakdown with services, costs, multipliers
- [ ] T042 [US4] Add loading state for Calculations list page in src/app/admin/calculations/loading.tsx
- [ ] T043 [US4] Add empty state handling for Calculations list when no calculations exist or match filters
- [ ] T043A [US4] Add input sanitization for user name and email display in CalculationDetails to handle special characters (edge case L103)
- [ ] T044 [US4] Add loading state for Calculation details page in src/app/admin/calculations/[id]/loading.tsx

**Checkpoint**: At this point, User Story 4 should be fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Update admin dashboard home page in src/app/admin/page.tsx with summary widgets and quick links to all sections
- [ ] T046 [P] Implement responsive design for all admin pages to work on screens as small as 768px width (SC-008)
- [ ] T047 [P] Add error boundary components for graceful error handling across admin dashboard
- [ ] T048 [P] Optimize performance: verify analytics queries meet <3 second target (SC-003) using database indexes
- [ ] T049 [P] Optimize performance: verify pagination loads in <2 seconds per page (SC-004)
- [ ] T049A [P] Add database query result caching for analytics API to meet <3 second target (SC-003)
- [ ] T049B [P] Add response compression and pagination optimization for calculations list to meet <2 second target (SC-004)
- [ ] T050 [P] Add navigation state management (current page, filters) using React Context API in src/context/AdminContext.tsx
- [ ] T051 [P] Add keyboard navigation support for admin dashboard accessibility
- [ ] T052 [P] Add ARIA labels for all interactive components for screen reader support
- [ ] T053 [P] Run linting and fix any issues: npm run lint
- [ ] T054 [P] Verify admin can navigate to any admin page from sidebar in under 2 clicks (SC-006)
- [ ] T055 [P] Verify all date range filters work correctly across Analytics and Calculations pages (SC-010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T006 needs directory structure from T001-T003) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion (T006-T009 must complete first)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (US1 - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (US2 - P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories, uses shared Sidebar from US1
- **User Story 3 (US3 - P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories, uses shared Sidebar and DateRangeFilter (reusable)
- **User Story 4 (US4 - P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories, uses shared Sidebar and DateRangeFilter from US3

### Within Each User Story

- Components before pages
- Pages before API routes (for client-side integration)
- Core implementation before loading states
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T005)
- All Foundational tasks marked [P] can run in parallel (T006-T009)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows):
  - US1 tasks T010-T012 can run in parallel (Sidebar, ServicesTable, ServiceForm)
  - US2 tasks T023-T024 can run in parallel (ConfigEditor, debounce utility)
  - US3 tasks T030-T031 can run in parallel (AnalyticsTables, DateRangeFilter)
  - US4 tasks T036-T037 can run in parallel (CalculationsList, CalculationDetails)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create Sidebar navigation component in src/components/admin/Sidebar.tsx"
Task: "Create ServicesTable component in src/components/admin/ServicesTable.tsx"
Task: "Create ServiceForm component in src/components/admin/ServiceForm.tsx"

# Launch pages and API routes after components:
Task: "Create admin layout in src/app/admin/layout.tsx"
Task: "Create Services list page in src/app/admin/services/page.tsx"
Task: "Create GET /api/admin/services route in src/app/api/admin/services/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005) ✅
2. Complete Phase 2: Foundational (T006-T009) - CRITICAL - blocks all stories ✅
3. Complete Phase 3: User Story 1 (T010-T022) ✅
4. **STOP and VALIDATE**: Test User Story 1 independently:
   - Admin can login and access dashboard ✅
   - Admin can view, add, edit, activate, deactivate services ✅
   - Admin cannot delete services used in calculations ✅
   - Performance targets met (<30 seconds per operation)
5. Deploy to Vercel preview environment
6. Demo to stakeholders

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready ✅
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) ✅
3. Add User Story 2 → Test independently → Deploy/Demo ⬜
4. Add User Story 3 → Test independently → Deploy/Demo ⬜
5. Add User Story 4 → Test independently → Deploy/Demo ⬜
6. Add Polish (Phase 7) → Final polish → Deploy to production ⬜
7. Each story adds value without breaking previous stories ⬜

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009) ✅
2. Once Foundational is done:
   - Developer A: User Story 1 (T010-T022) ✅
   - Developer B: User Story 2 (T023-T029) ⬜
   - Developer C: User Story 3 (T030-T035) ⬜
   - Developer D: User Story 4 (T036-T044) ⬜
3. Stories complete and integrate independently (each story uses shared components)
4. Team converges on Polish phase (T045-T055) when all stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Testing tasks deferred to Phase 7 (per Constitution requirement: all testing happens in Phase 7)
- Database schema already exists from Phase 1 - no migrations needed, only indexes (T005)
- All tables exist from Phase 1 - no new entities to create
- Admin users already seeded from Phase 1 - no need to seed new data
- Performance targets must be met: analytics <3s, pagination <2s, service CRUD <30s
- Constitution compliance: All pages require admin role, user name/email visible in calculations (FR-022)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

- **Total Tasks**: 61
- **Tasks Completed**: 40
- **Tasks Remaining**: 21
- **Tasks per User Story**:
  - User Story 1 (Services Management): 15 tasks (T010-T022) ✅
  - User Story 2 (Configuration Editor): 8 tasks (T023-T029) ✅
  - User Story 3 (Analytics Dashboard): 6 tasks (T030-T035) ✅
  - User Story 4 (Calculations Viewer): 10 tasks (T036-T044) ⬜
- **Setup Tasks**: 5 (T001-T005) ✅
- **Foundational Tasks**: 5 (T006-T009A) ✅
- **Polish Tasks**: 12 (T045-T055) ⬜
- **Parallel Opportunities**: 44 tasks marked [P] for parallel execution
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 26 tasks ✅

---

## Success Criteria Validation

Each user story must meet its independent test criteria:

- **User Story 1**: Admin can view, add, edit, activate/deactivate services independently (SC-001, SC-005, SC-006) ✅
- **User Story 2**: Admin can modify configuration with validation and optimistic locking (SC-002, SC-009) ✅
- **User Story 3**: Admin can view analytics with date filtering (SC-003, SC-010) ✅
- **User Story 4**: Admin can view calculations with details and user data (SC-004, SC-007, SC-008) ⬜
Cross-cutting success criteria validated in Polish phase:
- SC-005: Admin access restricted (middleware T006) ✅
- SC-007: User name/email visible (CalculationDetails T037) ⬜
- SC-008: Responsive design (T046) ⬜
- SC-010: Date range filtering (DateRangeFilter T031, T055) ⬜
