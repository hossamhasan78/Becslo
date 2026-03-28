# Research: Persistent Application Header

**Branch**: `022-persistent-app-header`
**Date**: 2026-03-28

---

## Finding 1 — Route structure: no shared authenticated layout exists

**Decision**: Create `src/app/(wizard)/layout.tsx` to wrap wizard routes; replace the header section in `src/app/admin/layout.tsx`.

**Rationale**: There is currently no shared layout file covering both wizard and admin routes. The `(wizard)` route group has no `layout.tsx` at all. The wizard page renders its own `WizardLayout` client component. The admin routes have a `src/app/admin/layout.tsx` server component with its own inline header. Adding a `(wizard)/layout.tsx` is the standard Next.js App Router pattern for injecting shared UI into a route group without modifying every page.

**Alternatives considered**:
- Creating a new `(authenticated)` route group wrapping both wizard and admin — rejected; requires restructuring the entire route tree, high blast radius.
- Adding AppHeader directly inside `WizardLayout` — rejected; WizardLayout is a generic layout wrapper that doesn't know about auth, and it would couple the wizard layout to header concerns.

---

## Finding 2 — User identity source: `useAuth()` from existing `AuthContext`

**Decision**: The `AppHeader` client component reads user identity via `useAuth()` → `user.email` and `user.user_metadata?.full_name`.

**Rationale**: `AuthContext` is already provided globally in the root layout (`src/app/layout.tsx`) via `<AuthProvider>`. It exposes `user: User | null` from the Supabase session, available to any client component in the tree. The admin layout currently uses server-side `getAdminUser()` to get identity, but a shared client component cannot call server utilities — `useAuth()` is the correct client-side approach.

**Identity display priority**: `user.user_metadata?.full_name` → `user.email` → `'Account'` (fallback per FR-007).

**Alternatives considered**:
- Passing user identity as props from a server layout — rejected; requires the wizard route layout to be a server component that fetches user data, adding unnecessary server round-trip for a feature already handled by AuthContext.

---

## Finding 3 — Logout mechanism: existing `/api/auth/logout` endpoint

**Decision**: `AppHeader` calls `POST /api/auth/logout` (same endpoint as both existing logout buttons). On success: `router.push('/login')` + `router.refresh()`. On failure: display inline error near the logout button (FR-014), no redirect.

**Rationale**: The `/api/auth/logout` endpoint already exists and is used by both `WizardLogoutButton` and the admin `LogoutButton`. Reusing it avoids duplication. The current implementations silently swallow errors (only `console.error`); the new `AppHeader` adds visible error state to satisfy FR-014.

**Current gap in both existing components**: Neither `WizardLogoutButton` nor admin `LogoutButton` handles non-OK HTTP responses visually — both only catch exceptions, not failed responses. The new component must handle both: `catch` for network errors AND `!response.ok` for server-side failures.

**Alternatives considered**:
- Calling Supabase `signOut()` directly on the client — rejected; the existing server-side logout via `/api/auth/logout` ensures cookie/session cleanup is handled server-side, which is more reliable for SSR cookie-based auth.

---

## Finding 4 — WizardLogoutButton: to be deleted

**Decision**: `src/components/wizard/WizardLogoutButton.tsx` is deleted. Its import and usage are removed from `src/app/(wizard)/wizard/page.tsx`.

**Rationale**: FR-013 requires the header logout to be the sole logout mechanism. The `WizardLogoutButton` is imported and rendered on line 12 and ~139 of `page.tsx`. It will be fully superseded by the `AppHeader` logout.

---

## Finding 5 — Admin layout header: replace inline header with AppHeader

**Decision**: In `src/app/admin/layout.tsx`, the existing `<header>` element (showing "Admin Dashboard" title + `LogoutButton`) is replaced with `<AppHeader />`.

**Rationale**: FR-011 requires a single consistent header across all authenticated routes. The admin layout's current header is route-specific and uses a different visual pattern. The "Admin Dashboard" page title that currently lives in the header can be removed — it is implied by context and the admin sidebar already labels the section.

**Admin `LogoutButton` component** (`src/components/admin/LogoutButton.tsx`): this component is no longer needed after the admin header is replaced. It can be deleted or retained for reference — deleting is cleaner.

---

## Finding 6 — Content offset for fixed header

**Decision**: Add `pt-14` (56px) top padding to the content wrapper in both the wizard layout and the admin layout main content area, matching the header's `h-14` height.

**Rationale**: A `position: fixed` header removes itself from the document flow. Without a matching top padding on the content beneath it, the first content element is obscured. The header height is `h-14` (3.5rem / 56px) — a standard Tailwind header height.

- Wizard: The new `(wizard)/layout.tsx` wraps children in a `pt-14` div.
- Admin: The existing `flex-1 flex flex-col` wrapper in `admin/layout.tsx` already accounts for the header height; add `pt-14` to the main content container.

---

## Summary: Files affected

| Action | File |
|--------|------|
| **Create** | `src/components/AppHeader.tsx` |
| **Create** | `src/app/(wizard)/layout.tsx` |
| **Modify** | `src/app/admin/layout.tsx` |
| **Modify** | `src/app/(wizard)/wizard/page.tsx` |
| **Delete** | `src/components/wizard/WizardLogoutButton.tsx` |
| **Delete** (optional) | `src/components/admin/LogoutButton.tsx` |
