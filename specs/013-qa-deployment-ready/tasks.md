# Tasks: Testing & Deployment Readiness

**Input**: Design documents from `/specs/013-qa-deployment-ready/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: This phase is EXCLUSIVELY about testing and deployment. All tasks are oriented towards validation and launch readiness.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize testing directory structure in `frontend/tests/`
- [ ] T002 Configure `frontend/playwright.config.ts` for multi-environment (Staging/Prod) testing
- [ ] T003 [P] Map production environment variables in Vercel and Supabase dashboards

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement deployment health check utility in `frontend/src/utils/health.ts`
- [ ] T005 [P] Create migration verification script in `database/verify-migrations.sql`
- [ ] T006 Setup `TestResult` logging interface for CI/CD tracing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Full System End-to-End Validation (Priority: P1) 🎯 MVP

**Goal**: Verify the entire application journey (Auth -> Wizard -> PDF -> Admin)

**Independent Test**: Run `npm run test:e2e` and verify all critical paths PASS.

### Implementation for User Story 1

- [ ] T007 [US1] Write E2E smoke tests for Authentication sequence in `frontend/tests/e2e/auth.spec.ts`
- [ ] T008 [US1] Write E2E smoke tests for Wizard calculation journey in `frontend/tests/e2e/wizard.spec.ts`
- [ ] T009 [US1] Write E2E smoke tests for Admin Dashboard configuration in `frontend/tests/e2e/admin.spec.ts`
- [ ] T010 [US1] Write E2E smoke tests for PDF generation and download in `frontend/tests/e2e/pdf.spec.ts`
- [ ] T011 [US1] Integrate E2E tests into the CI/CD pipeline per `contracts/ci_pipeline.md`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Staging & Production Deployment (Priority: P1)

**Goal**: Seamless staged deployment from Preview to Production

**Independent Test**: Trigger a deployment from a PR and verify it reaches the production domain after merge.

### Implementation for User Story 2

- [ ] T012 [US2] Configure Vercel Preview/Production environment isolation for Supabase API keys
- [ ] T013 [US2] Implement pre-deployment database migration check in the CI pipeline
- [ ] T014 [US2] Create production promotion logic (Auto-merge or manual approval) in CI/CD configuration
- [ ] T015 [US2] Verify custom domain resolution and SSL configuration for `becslo.app` (or equivalent)
- [ ] T022 [US2] [P] Configure native observability drains and alerts in Vercel/Supabase dashboards (FR-007)

**Checkpoint**: User Stories 1 AND 2 are complete - the system can be deployed to production safely.

---

## Phase 5: User Story 3 - Administrative Handover & Documentation (Priority: P3)

**Goal**: Clear instructions for system administration and maintenance

**Independent Test**: Review the `docs/admin/setup.md` file for completeness.

### Implementation for User Story 3

- [ ] T016 [US3] Create Admin Setup Guide in `docs/admin/setup.md`
- [ ] T017 [US3] Create Production Deployment Checklist in `docs/admin/deployment-checklist.md`
- [ ] T018 [US3] [P] Document password rotation and secret management procedures in `docs/admin/security.md`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [ ] T019 [P] Update root `docs/README.md` with launch status and link to admin guides
- [ ] T020 Run `quickstart.md` validation on the production environment
- [ ] T021 Final cleanup of any staging/debug data from the production database
- [ ] T023 [P] Execute a security smoke test against the production URL targeting OWASP Top 10 vulnerabilities (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (US1)**: Depends on Foundational phase completion
- **User Story 2 (US2)**: Depends on US1 completion (E2E tests must be ready to run in pipeline)
- **User Story 3 (US3)**: Can run in parallel with US1/US2 implementation
- **Polish (Phase 6)**: Depends on all user stories being complete

### Parallel Opportunities

- All tasks marked [P] can run in parallel within their respective phases.
- Documentation (US3) can be worked on concurrently with E2E test development (US1).

---

## Parallel Example: Setup & Foundation

```bash
# Map secrets and setup health utilities together:
Task: "Map production environment variables in Vercel and Supabase dashboards"
Task: "Implement deployment health check utility in frontend/src/utils/health.ts"
Task: "Create migration verification script in database/verify-migrations.sql"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1 & 2 (Setup & Foundational).
2. Complete Phase 3 (US1 - Full System Validation).
3. Complete Phase 4 (US2 - Staging & Production Deployment).
4. **STOP and VALIDATE**: Verify the production deployment is accessible.

### Incremental Delivery

1. Foundation ready.
2. E2E Validation ready (US1).
3. Production Deployment flows ready (US2).
4. Handover Documentation ready (US3).
