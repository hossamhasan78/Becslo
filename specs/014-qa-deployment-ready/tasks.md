# Tasks: Testing & Deployment Readiness (Phase 7)

**Input**: Design documents from `specs/014-qa-deployment-ready/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Configure Playwright for E2E testing in `playwright.config.ts`
- [X] T002 [P] Verify Vitest configuration for unit testing in `vitest.config.ts`
- [X] T003 [P] Create Internal Health Check API endpoint in `src/app/api/health/route.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Perform manual database backup and run production migrations using `supabase db push` against the production instance
- [ ] T005 [P] Set Vercel production environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- [X] T006 [P] Create production deployment checklist in `docs/deployment-checklist.md`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - End-to-End Core Flow Validation (Priority: P1) 🎯 MVP

**Goal**: Verify the complete user journey from authentication through the 7-step wizard to the final PDF download.

**Independent Test**: Complete a mock calculation on the live site and confirm a downloadable PDF matches the result.

### Implementation for User Story 1

- [X] T007 [US1] Implement E2E tests for the authentication flow in `tests/e2e/auth.spec.ts`
- [X] T008 [US1] Implement E2E tests for wizard step transitions (1 through 7) in `tests/e2e/wizard-flow.spec.ts`
- [X] T009 [US1] Implement unit tests for pricing engine edge cases (zero/max hours) in `tests/unit/pricing-engine.test.ts`
- [X] T010 [US1] Implement E2E tests for successful PDF generation in `tests/e2e/pdf-export.spec.ts`
- [X] T011 [US1] Add "Retry" button UI for PDF generation failures in `src/components/wizard/FinalResultStep.tsx`
- [X] T012 [US1] Integrate retry logic and error state handling in `src/context/WizardContext.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Production Deployment and Environment Setup (Priority: P2)

**Goal**: Securely deploy the application to production with automated health checks.

**Independent Test**: Trigger a production deployment and observe successful smoke test results in CI.

### Implementation for User Story 2

- [X] T013 [US2] Implement External Smoke Test script in `scripts/smoke-test.sh`
- [X] T014 [US2] Configure GitHub Action for post-deployment smoke tests in `.github/workflows/smoke-tests.yml`
- [ ] T015 [US2] Perform manual production verification of the live site at `becslo.vercel.app`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - System Maintenance Documentation (Priority: P3)

**Goal**: Provide clear guides for long-term system maintenance.

**Independent Test**: Successfully onboard a new admin user following the guide.

### Implementation for User Story 3

- [X] T016 [P] [US3] Create Admin User Setup Guide in `docs/admin-guide.md`
- [X] T017 [P] [US3] Finalize documentation for Wizard and Admin dashboard endpoints in `docs/api-documentation.md`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T018 Code audit and performance optimization for real-time updates in `src/context/WizardContext.tsx`
- [X] T019 [P] Final security audit of environment variables and RLS policies
- [X] T020 Run full test suite and generate production readiness report in `specs/014-qa-deployment-ready/readiness-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Phase 2.
- **User Story 2 (P2)**: Independent after Phase 2; verifies US1 outcomes in production.
- **User Story 3 (P3)**: Independent after Phase 2.

### Parallel Opportunities

- T001, T002, T003 can run in parallel.
- T005 and T006 can run in parallel.
- T016 and T017 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify all E2E tests pass locally.

### Incremental Delivery

1. Foundation ready (Phase 1 + 2).
2. User Story 1 (P1) → Full local verification.
3. User Story 2 (P2) → Production deployment and smoke tests.
4. User Story 3 (P3) → Documentation complete.
