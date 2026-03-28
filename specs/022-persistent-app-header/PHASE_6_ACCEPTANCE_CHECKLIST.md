# Phase 6: Manual Acceptance Test Checklist

## T011: User Story 1 — Identity and Navigation Anchor (Logged-In Navigation)

**Setup**: Log in with test account → Navigate through wizard and admin pages

### Checklist:
- [ ] Header visible at top of wizard page
- [ ] Header remains fixed when scrolling wizard content
- [ ] Header displays user name (or email fallback)
- [ ] Brand area shows "Becslo" text (placeholder logo)
- [ ] Header visible on all wizard steps (1-6)
- [ ] Header visible on admin dashboard page
- [ ] Header visible on admin services page
- [ ] Header visible on admin analytics page
- [ ] Header visible on admin calculations page
- [ ] NO logout button visible elsewhere on wizard page (only in header)
- [ ] Navigate to `/login` → header NOT visible
- [ ] Navigate to `/signup` → header NOT visible

---

## T012: User Story 2 — Logout from Any Page

**Setup**: Log in with test account

### Checklist from Wizard:
- [ ] On wizard step 3, click "Logout" button in header
- [ ] Redirected to `/login` page
- [ ] Session terminated (no longer authenticated)
- [ ] Attempt to navigate back to wizard → redirected to `/login`

### Checklist from Admin:
- [ ] On admin dashboard, click "Logout" button in header
- [ ] Redirected to `/login` page
- [ ] Session terminated (no longer authenticated)
- [ ] Attempt to navigate back to admin → redirected to `/login`

### Logout Failure Scenario:
- [ ] Simulate network error (DevTools > Network > offline)
- [ ] Click "Logout" in header
- [ ] Error message appears: "Logout failed. Please try again."
- [ ] User remains on current page
- [ ] Logout button re-enabled (no longer shows spinner)

---

## T013: User Story 3 — Logo Area Swappable

**Setup**: Log in → Navigate to any authenticated page

### Checklist:
- [ ] Header visible with "Becslo" text in brand area (placeholder state)
- [ ] No broken image icon visible
- [ ] Header layout intact (no layout shifts from empty src)
- [ ] User name/email visible on right
- [ ] Logout button visible and functional

### (If testing real logo):
- [ ] Update AppHeader.tsx: `src=""` → `src="<real-logo-url>"`
- [ ] Logo image renders at same size as placeholder
- [ ] No layout shift in header
- [ ] "Becslo" fallback text hidden (image visible instead)

---

## T015: Viewport Check (Mobile 375px)

**Setup**: Resize browser to 375px width (mobile viewport)

### Checklist:
- [ ] Header visible at 375px width
- [ ] Brand area (logo + "Becslo") visible at left
- [ ] User name/email visible at right
- [ ] Logout button visible at right
- [ ] No element overlap
- [ ] No horizontal scrolling required
- [ ] All elements remain clickable
- [ ] Header remains fixed during scroll

---

## Summary

- **T011**: ✅ / ❌ Header visible on all auth pages, absent on login/signup
- **T012**: ✅ / ❌ Logout works from all pages, error handling shows inline error
- **T013**: ✅ / ❌ Brand area swappable with no layout shift
- **T015**: ✅ / ❌ Mobile viewport (375px) fully usable
- **T014**: ✅ VERIFIED CODE — No duplicate logout controls exist

Mark tests complete when all checklist items pass.
