# Tasks: MVP Authentication & Wizard Skeleton

**Branch**: `006-mvp-auth-wizard` | **Date**: 2026-03-17
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Overview

This task breakdown implements MVP Authentication & Wizard Skeleton for Becslo, organized by user story priority to enable independent implementation and testing.

**Total Tasks**: 50
**User Stories**: 3 (P1, P2, P3)
**Parallel Opportunities**: 20 tasks marked with [P] can be executed in parallel

---

## Phase 1: Setup (Project Initialization)

### Goal

Initialize NextJS 14.x project with required dependencies and configuration files.

### Tasks

- [X] T001 Initialize NextJS 14.x project with TypeScript and Tailwind CSS in project root
- [X] T002 Install Supabase client libraries: @supabase/supabase-js, @supabase/auth-helpers-nextjs
- [X] T003 Install additional dependencies: clsx, tailwind-merge
- [X] T004 [P] Create .env.local file with environment variable placeholders in project root
- [X] T005 [P] Create directory structure: src/app, src/components, src/lib, src/types, tests in project root
- [X] T006 [P] Create subdirectories: src/app/(auth)/login, src/app/(auth)/signup, src/app/(wizard)/wizard in src/app
- [X] T007 [P] Create subdirectories: src/components/auth, src/components/wizard, src/components/ui in src/components
- [X] T008 [P] Create subdirectories: src/lib/supabase, src/lib/context, src/lib/utils in src/lib
- [X] T009 [P] Create subdirectories: tests/unit/auth, tests/integration/auth, tests/e2e in tests
- [X] T010 [P] Create subdirectory: supabase/migrations in project root

---

## Phase 2: Foundational (Blocking Prerequisites)

### Goal

Configure Supabase clients and database schema before implementing user stories.

### Tasks

- [X] T011 Configure Supabase project in Supabase dashboard (email/password auth, environment variables)
- [X] T012 Create Supabase client-side configuration in src/lib/supabase/client.ts
- [X] T013 [P] Create Supabase server-side configuration in src/lib/supabase/server.ts
- [X] T014 Create database migration 001_init_schema.sql in supabase/migrations/001_init_schema.sql
- [X] T015 Run migration 001_init_schema.sql in Supabase database
- [X] T016 Create database trigger function handle_new_user() in Supabase SQL Editor
- [X] T018 [P] [US1] Create TypeScript types for authentication in src/types/auth.ts
- [X] T019 [P] [US1] Create React Context for authentication state in src/lib/context/AuthContext.tsx
- [X] T020 [US1] Create AuthForm component (signup/login) in src/components/auth/AuthForm.tsx
- [X] T021 [US1] Create Signup page with email/password in src/app/(auth)/signup/page.tsx
- [X] T022 [US1] Create Login page with email/password in src/app/(auth)/login/page.tsx
- [N/A] T022a [US1] Create auth API route for signup/login - Using client-side Supabase
- [N/A] T022b [US1] Create auth API route for login - Using client-side Supabase
- [X] T023 [US1] Create route protection middleware in src/middleware.ts
- [X] T024 [US1] Update root layout with AuthProvider in src/app/layout.tsx

---

## Phase 3: User Story 1 - Email/Password Authentication (Priority: P1)

### Goal

A user can sign up with name, email, and password, then log in to access the wizard.

**Independent Test**: Can be fully tested by visiting the signup page, creating an account, logging in, and verifying redirection to the wizard page.

### Tasks

(No additional tasks - completed in Phase 2 above: T018-T024)

---

## Phase 4: User Story 2 - Wizard Layout Skeleton (Priority: P2)

- [X] T025 [P] [US2] Create TypeScript types for wizard in src/types/wizard.ts
- [X] T026 [P] [US2] Create React Context for wizard state in src/lib/context/WizardContext.tsx
- [X] T027 [US2] Create Wizard Layout component with 75% left panel + 25% right panel split in src/components/wizard/WizardLayout.tsx
- [X] T028 [US2] Create Step Navigation component in src/components/wizard/StepNavigation.tsx
- [X] T029 [US2] Create Wizard page with layout and placeholder content in src/app/(wizard)/wizard/page.tsx
- [X] T030 [US2] Update root layout with WizardProvider in src/app/layout.tsx

---

## Phase 5: User Story 3 - Admin User Initialization (Priority: P3)

### Goal

An initial admin user is automatically created during deployment and can access protected routes and functionality.

**Independent Test**: Can be fully tested by deploying the application, verifying the admin user exists in the database, and confirming the admin can access protected routes. Delivers the foundation for administrative control and system configuration.

### Tasks

- [X] T031 [P] [US3] Create database migration 002_seed_admin.sql in supabase/migrations/002_seed_admin.sql
- [X] T032 [US3] Run migration 002_seed_admin.sql in Supabase database
- [X] T033 [US3] Sign in with admin email to create user record in database (MANUAL: Visit /signup with admin@yourdomain.com)
- [X] T034 [US3] Verify admin role assigned in Supabase database dashboard

---

## Phase 6: Polish & Cross-Cutting Concerns

### Goal

Finalize implementation with error handling, responsive design, performance verification, and deployment preparation.

### Tasks

- [X] T035 Add error boundary for authentication errors in src/app/(auth)/login/page.tsx (handles FR-018, FR-019, FR-024, FR-025 edge cases)
- [X] T036 Add loading states for authentication in src/lib/context/AuthContext.tsx
- [X] T037 [P] Add responsive CSS classes for mobile layout in src/components/wizard/WizardLayout.tsx
- [X] T038 [P] Add responsive CSS classes for mobile layout in src/components/wizard/StepNavigation.tsx
- [X] T039 [P] Update environment variables with actual Supabase credentials in .env.local
- [X] T041 Test email/password signup and login flow end-to-end (signup → login → redirect to wizard)
- [X] T046 [P] Measure email/password auth flow completion time (from login page load to wizard redirect) to verify 30-second target (SC-001)
- [X] T048 [P] Document email/password auth success rate across multiple test attempts to verify 95%+ target (SC-006)
- [X] T049 Create git commit with initial implementation
- [X] T050 Push to GitHub branch 006-mvp-auth-wizard

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1: Auth) → Phase 4 (US2: Layout) → Phase 5 (US3: Admin) → Phase 6 (Polish)
```

### Critical Path

1. **Setup (T001-T010)**: All setup tasks must complete before any implementation
2. **Foundational (T011-T017)**: Supabase configuration required before authentication
3. **US1 Authentication (T018-T024)**: Must complete before wizard story (requires auth)
4. **US2 Wizard Layout (T025-T030)**: Can proceed after US1 is complete
5. **US3 Admin User (T031-T034)**: Can proceed in parallel with US2 (separate concern)
6. **Polish (T035-T050)**: Final verification after all user stories complete

### Dependency Details

- US2 (Wizard Layout) depends on US1 (Authentication) because wizard route requires authentication
- US3 (Admin User) is independent of US2 - can be done in parallel after US1
- All user stories depend on Setup and Foundational phases

---

## Parallel Execution Opportunities

### Phase 1 (Setup)

Tasks T004-T010 can be executed in parallel after T001-T003 complete:
- T004: Create .env.local
- T005-T010: Create directory structures (independent of each other)

### Phase 2 (Foundational)

T013 can be executed in parallel with T012 (separate client configurations)

### Phase 3 (US1: Authentication)

T018 and T020 can be executed in parallel (types and component)
T022 and T023 can be executed in parallel (callback handler and middleware)

### Phase 4 (US2: Wizard Layout)

T025 and T027 can be executed in parallel (types and layout component)

### Phase 5 (US3: Admin User)

T031 and T033 can be executed in parallel (migration and sign-in process)

### Phase 6 (Polish)

T037, T038, T039, T040 can be executed in parallel (CSS and environment setup)
T041-T048 can be executed in parallel (testing different aspects and performance measurement)

---

## Implementation Strategy

### MVP First Approach

**Recommended MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1: Email/Password Signup & Login)

**Rationale**:
- User Story 1 delivers core authentication foundation
- Enables testing of email/password authentication end-to-end
- Provides measurable value (users can access protected wizard route)
- Complies with constitutional "Authentication-First" principle
- Independent and testable without wizard implementation

**Incremental Delivery**:

1. **Sprint 1** (Day 1): Complete Setup + Foundational (T001-T017)
   - Project initialized, Supabase configured, database schema ready
   - Deployable foundation

2. **Sprint 2** (Day 1-2): Complete User Story 1 (T018-T024)
   - Email/password signup and login working, users can log in and access wizard placeholder
   - MVP deliverable for authentication testing

3. **Sprint 3** (Day 2-3): Complete User Story 2 (T025-T030)
   - Wizard layout with 3/4 + 1/4 split
   - UI framework established for future wizard steps

4. **Sprint 4** (Day 3): Complete User Story 3 (T031-T034)
   - Admin user seeded and verified
   - Foundation for admin configuration

5. **Sprint 5** (Day 3-4): Complete Polish (T035-T050)
    - Error handling, responsive design, performance verification, testing, deployment
    - Production-ready feature

### Testing Strategy

**Unit Tests**: Not included in tasks (not explicitly requested in spec)

**Integration Tests**: Manual verification during Phase 6 (T041-T045):
- OAuth flow testing
- Route protection testing
- Layout testing

**End-to-End Testing**: Manual verification during Phase 6 (T041):
- Complete user journey: Login → Auth → Wizard
- Admin user verification
- Performance metrics verification (T046-T048)

### Deployment Strategy

1. **Development**: Run locally with `npm run dev`
2. **Testing**: Deploy to Vercel preview environment
3. **Production**: Deploy to Vercel production after Phase 6 completion

---

## Task Count Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 10 | Project initialization and directory structure |
| Phase 2: Foundational | 7 | Supabase configuration and database schema |
| Phase 3: US1 - Auth | 7 | Email/password authentication flow |
| Phase 4: US2 - Layout | 6 | Wizard two-panel layout |
| Phase 5: US3 - Admin | 4 | Admin user seeding and verification |
| Phase 6: Polish | 16 | Error handling, responsive design, performance verification, testing, deployment |
| **Total** | **50** | **All tasks for MVP Authentication & Wizard Skeleton** |

---

## Independent Test Criteria by User Story

### User Story 1 (US1): Email/Password Signup & Login

**Test Criteria**:
1. Visit `/signup` page
2. Fill in name, email, and password (min 6 characters)
3. Submit signup form
4. Verify redirect to `/login` page
5. Fill in email and password on login page
6. Submit login form
7. Verify redirect to `/wizard` page
8. Verify authentication state established (can access protected routes)

**Success Indicators**:
- User redirected to login page after signup
- User can enter credentials and log in
- Redirect back to application wizard page
- User account created in database
- Session maintained across page navigation

### User Story 2 (US2): Wizard Layout Skeleton

**Test Criteria**:
1. Log in with email/password (requires US1 complete)
2. Navigate to `/wizard` page
3. Verify two-panel layout displays
4. Verify left panel is 3/4 width, right panel is 1/4 width
5. Verify step navigation shows 7 steps
6. Verify right panel shows live preview placeholder
7. Resize browser to mobile and verify panels stack

**Success Indicators**:
- Layout uses CSS grid with proper proportions
- Step navigation component renders correctly
- Live preview placeholder displayed
- Responsive design adapts to screen size

### User Story 3 (US3): Admin User Initialization

**Test Criteria**:
1. Run database migration 002_seed_admin.sql
2. Sign in with admin email via email/password
3. Check Supabase database dashboard for user record
4. Check Supabase database dashboard for admin_users record
5. Verify admin role is 'admin'

**Success Indicators**:
- User record created in `public.users` table
- Admin record created in `public.admin_users` table
- Admin role is 'admin'
- No duplicate admin records (idempotent)

---

## File Paths Reference

### Configuration Files

- `.env.local` - Environment variables (project root)
- `src/middleware.ts` - Route protection middleware (project root)

### Source Code - Authentication

- `src/types/auth.ts` - Authentication types
- `src/lib/supabase/client.ts` - Supabase client configuration
- `src/lib/supabase/server.ts` - Supabase server configuration
- `src/lib/context/AuthContext.tsx` - Authentication state context
- `src/components/auth/SignupForm.tsx` - Signup form component
- `src/components/auth/LoginForm.tsx` - Login form component
- `src/app/(auth)/signup/page.tsx` - Signup page
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/api/auth/signup/route.ts` - Signup API route
- `src/app/api/auth/login/route.ts` - Login API route

### Source Code - Wizard

- `src/types/wizard.ts` - Wizard types
- `src/lib/context/WizardContext.tsx` - Wizard state context
- `src/components/wizard/WizardLayout.tsx` - Wizard layout component
- `src/components/wizard/StepNavigation.tsx` - Step navigation component
- `src/app/(wizard)/wizard/page.tsx` - Wizard page

### Database

- `supabase/migrations/001_init_schema.sql` - Database schema migration
- `supabase/migrations/002_seed_admin.sql` - Admin user seed migration

### Root Configuration

- `src/app/layout.tsx` - Root layout with providers

---

## Format Validation

All tasks follow strict checklist format:
✅ All tasks start with `- [ ]` checkbox
✅ All tasks have sequential Task ID (T001-T047)
✅ Parallel tasks marked with `[P]` (17 parallel opportunities identified)
✅ User story tasks marked with `[US1]`, `[US2]`, `[US3]` (17 tasks)
✅ All tasks include clear description with file path
✅ Tasks organized by user story priority (P1 → P2 → P3)

---

**Ready for execution!** Follow task order or parallel execution opportunities as described above.
