# Tasks: Frontend - Admin

**Feature**: Frontend - Admin  
**Branch**: `004-frontend-admin`  
**Generated**: 2026-03-16

---

## Phase 1: Setup & Foundation

### Project Structure

- [ ] T001 Create admin layout component in src/app/admin/layout.tsx
- [ ] T002 [P] Create admin navigation component in src/components/admin/Navigation.tsx

---

## Phase 2: Admin Dashboard Pages

### Dashboard Landing (US1)

- [ ] T003 [US1] Create /admin page in src/app/admin/page.tsx with navigation links

### Analytics (US2)

- [ ] T004 [US2] Create /admin/analytics page in src/app/admin/analytics/page.tsx
- [ ] T005 [US2] Fetch and display total calculations count
- [ ] T006 [US2] Fetch and display average project price
- [ ] T007 [US2] Fetch and display average total hours
- [ ] T008 [US2] Fetch and display top used services
- [ ] T009 [US2] Fetch and display top client countries

---

## Phase 3: Service Management (US3)

- [ ] T010 [US3] Create /admin/services page in src/app/admin/services/page.tsx
- [ ] T011 [US3] Fetch and display all services in a list
- [ ] T012 [US3] Implement service create form
- [ ] T013 [US3] Implement service edit form
- [ ] T014 [US3] Implement service active/inactive toggle

---

## Phase 4: Configuration Editor (US4)

- [ ] T015 [US4] Create /admin/config page in src/app/admin/config/page.tsx
- [ ] T016 [US4] Fetch and display current configuration values
- [ ] T017 [US4] Implement base hourly rate editor
- [ ] T018 [US4] Implement experience multipliers editor
- [ ] T019 [US4] Implement risk buffer and profit margin editors

---

## Phase 5: Calculations Viewer (US5)

- [ ] T020 [US5] Create /admin/calculations page in src/app/admin/calculations/page.tsx
- [ ] T021 [US5] Fetch and display calculations in a table
- [ ] T022 [US5] Implement expandable calculation details

---

## Phase 6: Security & Polish

- [ ] T023 Enforce admin-only access on all /admin routes
- [ ] T024 Add loading states for all pages
- [ ] T025 Add error handling for failed API calls
- [ ] T026 Add form validation feedback

---

## Dependencies

```
T001-T002 (Phase 1) → T003-T009 (Phase 2)
T003-T009 → T010-T014 (Phase 3)
T010-T014 → T015-T019 (Phase 4)
T015-T019 → T020-T022 (Phase 5)
T020-T022 → T023-T026 (Phase 6)
```

---

## Parallel Execution Opportunities

- T001-T002 can run in parallel
- T004-T009 (analytics) can run in parallel
- T011-T014 (services) can run in parallel
- T016-T019 (config) can run in parallel

---

## Independent Test Criteria

### US1 - Access Admin Dashboard
- /admin loads with navigation

### US2 - View Analytics
- All 5 stats display correctly

### US3 - Manage Services
- CRUD operations work
- Toggle hides services

### US4 - Edit Configuration
- All config fields editable

### US5 - View Calculations
- Table displays calculations
- Details expand correctly

---

## Implementation Strategy

MVP Scope: All tasks in Phases 1-5 required. Phase 6 polish can be deferred if needed.
