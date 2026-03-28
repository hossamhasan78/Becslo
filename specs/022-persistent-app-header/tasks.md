# Tasks: Persistent Application Header

**Branch**: `022-persistent-app-header` | **Date**: 2026-03-28 | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

No new dependencies or infrastructure required. Shared context (`AuthContext`, `/api/auth/logout`) and routing structure already exist.

- [x] T001 [P] Verify `src/lib/context/AuthContext.tsx` exposes `user.email` and `user.user_metadata?.full_name` via `useAuth()` — confirm fields are available before consuming in AppHeader
- [x] T002 [P] Verify `src/app/layout.tsx` wraps the app in `<AuthProvider>` so `useAuth()` is globally available to client components

---

## Phase 2: Foundational

These tasks must complete before any user story phase begins. They establish the shared component used by all authenticated routes.

- [x] T003 Create `src/components/AppHeader.tsx` — client component using `useAuth()` for identity; fixed `h-14` header with brand area (left) and user identity + logout button (right); logout calls `POST /api/auth/logout`, handles both `!response.ok` and network exceptions; `isLoggingOut` and `logoutError` state per data model

---

## Phase 3: User Story 1 — Identity and Navigation Anchor on Every Authenticated Page (P1)

**Story goal**: The header is visible and fixed on 100% of authenticated pages (wizard and admin), and absent on login/signup.

**Independent test**: Log in → navigate to wizard step → confirm fixed header present at top → navigate to admin page → confirm same fixed header present → navigate to `/login` → confirm no header.

- [x] T004 [P] [US1] Create `src/app/(wizard)/layout.tsx` — server component; renders `<AppHeader />` above a `pt-14` content wrapper; no auth logic (AppHeader reads its own data client-side)
- [x] T005 [P] [US1] Modify `src/app/admin/layout.tsx` — replace the existing `<header>` block (title + `LogoutButton`) with `<AppHeader />`; add `pt-14` to the main content wrapper; remove `getAdminUser()` call and `LogoutButton` import

---

## Phase 4: User Story 2 — Log Out from Any Authenticated Page (P2)

**Story goal**: Clicking Logout in the header ends the session and redirects to `/login` from any authenticated page; failures show an inline error.

**Independent test**: Log in → click Logout in header → confirm redirect to `/login` and session terminated → attempt to navigate back to a protected route → confirm redirect to login (not granted access). Repeat from both wizard and admin pages.

- [x] T006 [US2] Verify `AppHeader` logout logic: `POST /api/auth/logout` → `response.ok` → `router.push('/login')` + `router.refresh()`; `!response.ok` OR network exception → `logoutError` shown inline, no redirect, `isLoggingOut` reset to false
- [x] T007 [US2] Remove `import WizardLogoutButton` and its JSX usage from `src/app/(wizard)/wizard/page.tsx` — wizard page must have zero logout controls after AppHeader provides the sole logout mechanism (FR-013)
- [x] T008 [US2] Delete `src/components/wizard/WizardLogoutButton.tsx` — component fully superseded by AppHeader (FR-013)
- [x] T009 [US2] Delete `src/components/admin/LogoutButton.tsx` — no longer imported after admin layout modification in T005

---

## Phase 5: User Story 3 — Logo Area Ready for Real Asset (P3)

**Story goal**: The brand area renders a swappable `<img alt="Becslo">` element; swapping the real logo requires only a src change with no layout impact.

**Independent test**: Confirm `<img alt="Becslo">` is present in the rendered header; set src to a placeholder → confirm "Becslo" fallback text is visible and header layout is intact; set src to a real image URL → confirm image renders at the same size with no layout shift.

- [x] T010 [US3] Verify `AppHeader` brand area contains `<img src="" alt="Becslo" />` with a fixed container size so swapping `src` causes no layout shift; confirm `alt="Becslo"` renders as visible text when image is broken or empty

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T011 [P] Manual acceptance test US1 — logged-in user navigates wizard steps and admin pages; header fixed on all, absent on `/login` and signup
- [ ] T012 [P] Manual acceptance test US2 — logout from wizard step redirects to `/login`; logout from admin page redirects to `/login`; session is terminated in both cases
- [ ] T013 [P] Manual acceptance test US3 — placeholder src shows "Becslo" fallback with no broken layout; swap to real image src with no layout changes required
- [x] T014 Confirm zero duplicate logout controls: search codebase for any remaining `WizardLogoutButton` or standalone `LogoutButton` imports outside of test files — none should exist (SC-006)
- [ ] T015 Viewport check: confirm header elements (brand area and user/logout area) remain non-overlapping and visible at 375px wide (FR-012, SC-005)

---

## Dependencies

```
T001, T002 (Setup — parallelizable)
  └─> T003 (AppHeader component — foundational)
        ├─> T004 (wizard layout — US1)
        ├─> T005 (admin layout — US1)
        │     └─> T009 (delete LogoutButton.tsx — MUST follow T005)
        ├─> T006 (logout logic verification — US2)
        ├─> T007, T008 (remove WizardLogoutButton — US2, parallelizable)
        └─> T010 (logo area verification — US3)

T004, T005, T006, T007, T008 complete
  ├─> T011 (acceptance US1)
  ├─> T012 (acceptance US2)
  └─> T014 (no duplicate logout controls)

T009, T010 complete
  ├─> T013 (acceptance US3)
  └─> T015 (viewport check)
```

T001 and T002 are parallelizable (different files). T004 and T005 are parallelizable after T003. T007 and T008 are parallelizable with each other and with T004/T005, but **T009 must follow T005** — it deletes `LogoutButton.tsx` which is still imported by `admin/layout.tsx` until T005 removes that import. T011, T012, T013, T014 are parallelizable in the final phase once their respective prerequisites complete.

---

## Parallel Execution Examples

**After T003 completes** (AppHeader built):
```
Parallel batch A: T004 + T005 + T007 + T008       (layouts + remove WizardLogoutButton)
Sequential:       T006                             (verify AppHeader logout logic)
Sequential:       T009                             (delete LogoutButton.tsx — after T005 only)
Sequential:       T010                             (verify logo area)
```

**Final phase** (once T004/T005/T006/T007/T008 complete):
```
Parallel: T011 + T012 + T014                      (US1/US2 acceptance + duplicate check)
```

**After T009 + T010 complete**:
```
Parallel: T013 + T015                             (US3 acceptance + viewport check)
```

---

## Implementation Strategy

**MVP scope (US1 + US2)**: T001–T009. This ships a working header with identity display and functional logout on all authenticated pages with no duplicate controls.

**Full scope (+ US3)**: T010. The logo area is already part of AppHeader from T003; T010 is a verification task only — no additional code required.

**Delivery order**: Build and verify AppHeader (T003) first — it is the single dependency for all downstream tasks. Then inject into wizard and admin routes in parallel (T004 + T005). Then remove old logout controls (T007–T009). Then run acceptance and polish.

---

## Format Validation

- All 15 tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- Story labels present on all user story phase tasks (T004–T010)
- [P] markers applied to all parallelizable tasks: T001/T002 (setup), T004/T005 (US1 layouts), T011/T012/T013/T014 (polish)
- T009 dependency on T005 explicitly documented — must not run in parallel with T004/T005
- File paths specified in every implementation task
- Task IDs sequential: T001–T015
