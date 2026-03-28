# Implementation Plan: Persistent Application Header

**Branch**: `022-persistent-app-header` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-persistent-app-header/spec.md`

---

## Summary

Add a fixed top header bar to all authenticated pages (wizard and admin routes). The header shows a swappable brand mark on the left and the logged-in user's identity plus a Logout button on the right. It is absent from login/signup pages. The existing `WizardLogoutButton` (wizard) and the admin layout's inline header are replaced — the new `AppHeader` component becomes the sole header and logout mechanism across all authenticated routes.

---

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, Next.js 14.x (App Router), Supabase JS client (auth session)
**Storage**: N/A — no new data stored
**Testing**: Vitest / React Testing Library (existing setup)
**Target Platform**: Web (desktop + mobile, 375px minimum viewport)
**Project Type**: Web application — Next.js 14.x monolith
**Performance Goals**: Instant render — header uses data already in memory via AuthContext
**Constraints**: No new dependencies; no new API endpoints; monolithic architecture maintained
**Scale/Scope**: 2 authenticated route groups (wizard, admin); 1 shared component

---

## Constitution Check

| Principle | Check | Result |
|-----------|-------|--------|
| I — Authentication-First | Header is post-auth UI; auth already functional | ✅ Pass |
| II — Data Privacy & Analytics | No new data stored; user identity read-only from session | ✅ Pass |
| III — Monolithic Architecture | Single component, no new services or dependencies | ✅ Pass |
| IV — Admin-Configured Pricing | No pricing logic touched | ✅ Pass |
| V — MVP Incremental Development | UI polish — fits Change 10 in addendum roadmap | ✅ Pass |
| Amendment v1.2 — Single-column wizard | Header sits above wizard; does not affect wizard column layout | ✅ Pass |

**No violations.**

---

## Project Structure

### Documentation (this feature)

```text
specs/022-persistent-app-header/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
└── tasks.md             ← /speckit.tasks output
```

### Source Code (affected files)

```text
src/
├── components/
│   ├── AppHeader.tsx                          ← NEW — shared header component
│   ├── wizard/
│   │   └── WizardLogoutButton.tsx             ← DELETE
│   └── admin/
│       └── LogoutButton.tsx                   ← DELETE (superseded by AppHeader)
└── app/
    ├── (wizard)/
    │   ├── layout.tsx                         ← NEW — injects AppHeader into wizard routes
    │   └── wizard/
    │       └── page.tsx                       ← MODIFY — remove WizardLogoutButton
    └── admin/
        └── layout.tsx                         ← MODIFY — replace inline header with AppHeader
```

**Structure Decision**: Single project (Next.js monolith). All changes are within existing `src/` tree. No new directories needed.

---

## Phase 0: Research — Complete

See [`research.md`](./research.md). All unknowns resolved. Key decisions:

- `AppHeader` is a new client component using `useAuth()` for identity — no server-side props needed.
- Wizard routing: a new `(wizard)/layout.tsx` injects AppHeader without touching the wizard page itself.
- Admin routing: the existing `admin/layout.tsx` inline `<header>` is replaced with `<AppHeader />`.
- Logout: reuses existing `POST /api/auth/logout` endpoint; adds visible error state (FR-014).
- Content offset: `pt-14` applied to content wrappers to compensate for the fixed `h-14` header.

---

## Phase 1: Design

### Component: `AppHeader` (`src/components/AppHeader.tsx`)

**Type**: Client component (`'use client'`)

**Identity display priority**: `user.user_metadata?.full_name` → `user.email` → `'Account'`

**Layout structure**:
```
<header> fixed top-0, full-width, z-50, h-14, bg-white, border-bottom
  Left:  <img src="" alt="Becslo" />  ← placeholder src; swappable by changing src only
  Right:
    <span> displayName (truncated, max-w to prevent overflow) </span>
    <button> Logout (disabled + spinner during request) </button>
    {logoutError && <span className="text-red-600"> error message </span>}
```

**Logout logic**:
1. `setIsLoggingOut(true)`, `setLogoutError(null)`
2. `POST /api/auth/logout`
3. If `response.ok`: `router.push('/login')` + `router.refresh()`
4. If `!response.ok` OR network exception: `setLogoutError('Logout failed. Please try again.')`, `setIsLoggingOut(false)`

Satisfies FR-009 (session ends + redirect), FR-014 (inline error on failure).

---

### New file: `src/app/(wizard)/layout.tsx`

Server component (no auth data needed — AppHeader reads its own data client-side).

```tsx
import { AppHeader } from '@/components/AppHeader'

export default function WizardRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="pt-14">{children}</div>
    </>
  )
}
```

`pt-14` (56px) compensates for the fixed `h-14` header so wizard content is not obscured beneath it.

---

### Modification: `src/app/admin/layout.tsx`

Replace the existing `<header>` block with `<AppHeader />`. Remove `getAdminUser()` server function, its Supabase call, and the `LogoutButton` import. Auth protection redirects (unauthenticated → `/login`, non-admin → `/wizard`) remain in place.

Add `pt-14` to the main content `<div className="flex-1 flex flex-col">` wrapper to compensate for the fixed header.

---

### Modification: `src/app/(wizard)/wizard/page.tsx`

- Remove `import WizardLogoutButton` (line 12)
- Remove `<WizardLogoutButton />` from the rendered JSX (inside the `flex justify-between items-center` wrapper alongside `<StepNavigation />`)

---

### Deletions

- `src/components/wizard/WizardLogoutButton.tsx` — deleted (FR-013)
- `src/components/admin/LogoutButton.tsx` — deleted (no longer imported after admin layout update)

---

## Data Model

No new entities. See [`data-model.md`](./data-model.md).

---

## Contracts

None. `POST /api/auth/logout` is an existing endpoint — its contract is unchanged.

---

## Testing Plan

### Unit / component tests

1. AppHeader renders `<img alt="Becslo">` in brand area.
2. AppHeader shows `full_name` when available; falls back to `email`; falls back to `'Account'`.
3. AppHeader logout success: `fetch` returns `{ ok: true }` → `router.push('/login')` called, no error shown.
4. AppHeader logout failure (non-ok): `fetch` returns `{ ok: false }` → inline error shown, no redirect.
5. AppHeader logout failure (network): `fetch` throws → inline error shown, no redirect.

### Acceptance test (manual)

Walk through spec User Stories 1, 2, 3:
- **US1**: Log in → navigate wizard and admin → confirm header fixed on all authenticated pages → confirm absent on `/login`
- **US2**: Logout from wizard step → redirect to login; repeat from admin page
- **US3**: Confirm `alt="Becslo"` fallback visible with placeholder src; swap src to real image → layout unchanged
