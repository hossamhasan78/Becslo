# Becslo — Implementation Plan Addendum

**Document Type:** Implementation Plan Addendum
**Version:** 1.1 (amends v1.0.0)
**Effective Date:** 2026-03-25
**Approved By:** CEO / Business Director
**Phases Modified:** Phase 0, Phase 1, Phase 3, Phase 4, Phase 5
**New Work Added:** Phase 8 — PDF Monetization Layer
**Amends:** `docs/IMPLEMENTATION_PLAN.md` v1.0.0
**Constitution Reference:** Constitution Addendum v1.1

---

## Purpose

This addendum documents all implementation changes required following the post-build product refinements and strategic decisions captured in Constitution Addendum v1.1. It provides task-level instructions for the AI coder to execute each change. All items are actionable. Each section identifies the phase it modifies, what to do, and what done looks like.

---

## Corrections Applied to This Document

> The following discrepancies in the source addendum were resolved before writing:
>
> - **Step count:** Confirmed as **6 steps total** after removing the Pricing Model step. All references to "Step 7 (Results)" in the original draft have been corrected to **Step 6 (Results)** and "Step 6 (Risk & Profit)" corrected to **Step 5 (Risk & Profit)**.
> - **Paddle KYC:** Flagged as a **human prerequisite task**. The AI coder does not perform account creation or KYC. Implementation is blocked until credentials are provided.
> - **Costs DB:** Confirmed as **hard column removal** — the `default_cost` column is dropped via migration, not nulled.

---

## Wizard Step Reference (Post-Addendum)

| # | Step Name | Notes |
|---|-----------|-------|
| 1 | Service Selection | No Back button |
| 2 | Experience | |
| 3 | Geography | |
| 4 | Costs | User-editable amounts |
| 5 | Risk & Profit | Button labelled 'Calculate' |
| 6 | Results | Full breakdown + Generate PDF |

---

## Change 1 — Remove Pricing Model Step

**Modifies Phase:** Phase 3 — Wizard Flow
**Priority:** High — affects all wizard step numbering
**Constitution Ref:** Amendment to Principle V

### What to Do

1. In `WizardContext`, remove the `pricing_model` field from wizard state. Set the pricing model to `'project'` as a hardcoded constant — not a state variable.
2. Delete the `PricingModelStep` component (original Step 1) entirely from the wizard.
3. Renumber all remaining steps:
   - Original Step 2 → Step 1 (Service Selection)
   - Original Step 3 → Step 2 (Experience)
   - Original Step 4 → Step 3 (Geography)
   - Original Step 5 → Step 4 (Costs)
   - Original Step 6 → Step 5 (Risk & Profit)
   - Original Step 7 → Step 6 (Results)
4. Remove the Back button from Step 1 (Service Selection). No backward navigation from the first step.
5. Update all step-count references, progress indicators, and validation logic to reflect **6 steps total**.
6. Ensure the pricing engine continues to use project-based logic — no conditional on `pricing_model` needed.

### Done When

- Wizard opens directly to Service Selection as Step 1.
- No pricing model selection UI exists anywhere in the app.
- No Back button on Step 1.
- All step numbers and labels are correct across 6 steps.

---

## Change 2 — Database Service Cleanup

**Modifies Phase:** Phase 1 — Database & Configuration
**Priority:** High — affects service selection step
**Constitution Ref:** Amendment to Principle IV + Permanent Removals section

### What to Do

1. Write and run a Supabase migration named `remove_non_design_services` (or equivalent descriptive name) that permanently **DELETEs** (not deactivates) all services and categories listed below.
2. **Delete entire categories (CASCADE to all services within):**
   - Development
   - Marketing
3. **Delete individual services by name from remaining categories:**
   - Banner & Ad Design
   - Brand Identity Design
   - Color Palette Creation
   - E-Commerce Design
   - Empty State Design
   - Error State Design
   - Landing Page Design
   - Loading State Design
   - Logo Design
   - Motion Graphics
   - Packaging Design
   - Print Design
   - Social Media Graphics
   - Typography Selection
   - Video Editing
   - Industry Trend Analysis
   - Messaging Framework
   - Pricing Strategy
   - Product Positioning
4. Verify referential integrity — no orphaned `calculation_services` records pointing to deleted service IDs.
5. Update seed scripts to remove all deleted services and categories so they cannot be re-seeded accidentally.

### Done When

- Deleted services and categories do not appear in the database, API responses, or wizard UI.
- Migration file exists in `/supabase/migrations/` with a clear descriptive name.
- Seed scripts no longer reference deleted items.

---

## Change 3 — Overhead Costs: User-Editable Amounts

**Modifies Phase:** Phase 1 (DB schema) + Phase 3 (Wizard UI)
**Priority:** Medium
**Constitution Ref:** Amendment to Principle IV

### What to Do

1. **Database:** Write a migration that **drops the `default_cost` column** from the `costs` table entirely. Admin defines cost categories only — not amounts.
2. **Wizard — Costs step (Step 4):** Replace the checkbox list with a list of cost categories, each with an editable numeric input field for the user to enter their own amount in USD.
   - No pre-filled values. The input field starts empty or at 0.
   - Include/exclude logic: if the user enters 0 or leaves the field blank, the cost is excluded from the calculation. A cost is included only when the user has entered a positive value.
3. **Pricing engine:** Update to sum user-entered cost amounts directly — do not reference any default from the database.
4. **Admin Config Editor:** Remove the 'default cost amount' field from the UI. Admin can still add/remove cost categories but cannot set amounts.

### Done When

- Cost step shows editable input fields per cost category with no pre-populated defaults.
- Calculation uses only user-entered values.
- Admin dashboard has no 'default cost' field.
- `default_cost` column is absent from the `costs` table.

---

## Change 4 — Step 5 Button Relabelled to 'Calculate'

**Modifies Phase:** Phase 3 — Wizard Flow
**Priority:** Low — cosmetic

### What to Do

1. On the Risk & Profit step (Step 5), change the Next button label to **'Calculate'**.
2. Button behaviour is unchanged — it advances to Step 6 (Results). Only the label changes.

### Done When

- Step 5 shows a 'Calculate' button instead of 'Next'.
- Clicking it advances to Step 6 (Results) as before.

---

## Change 5 — Results Step Redesign (Step 6)

**Modifies Phase:** Phase 3 — Wizard Flow + Phase 4 — PDF Export
**Priority:** High — affects core user output
**Constitution Ref:** Amendment to Principle V

### What to Do

1. Remove the 'Project Preview' label and summary-only display from Step 6.
2. Replace it with the **full calculation result** — identical in content to what was previously displayed in the right-column live preview panel.
3. Under the Project Summary section within Step 6, list every selected service individually (name + hours + cost per service), not a count.
4. The full breakdown must include:
   - Service line items (name, hours, cost each)
   - Cost items (name, amount)
   - Subtotal
   - Risk buffer amount
   - Profit margin amount
   - Final price (USD)
   - Recommended range (±20%)
5. The 'Generate PDF' / export action button lives on this step.
6. Remove the right-column live preview panel entirely (see Change 6).

### Done When

- Step 6 displays complete calculation output with all selected services listed individually.
- No summary-only or count-based service display remains.
- Right column no longer exists anywhere in the wizard layout.

---

## Change 6 — Remove Right-Column Live Preview

**Modifies Phase:** Phase 3 — Wizard Flow
**Priority:** High — layout change
**Constitution Ref:** Amendment to Principle V

### What to Do

1. Remove the 1/4-width right-column live preview panel from the wizard layout entirely.
2. The wizard now occupies the **full available width** — no split layout.
3. The `useMemo` real-time calculation in `WizardContext` can remain for internal state purposes but must not render any visible output until Step 6.
4. Update the layout container, CSS, and any responsive breakpoint logic that referenced the two-column layout.

### Done When

- Wizard is single-column, full width.
- No live preview panel renders at any step.
- Layout is clean across desktop and mobile.

---

## Change 7 — Disable Session Persistence on Reload

**Modifies Phase:** Phase 3 — Wizard Flow
**Priority:** Medium
**Constitution Ref:** Amendment to Principle II

### What to Do

1. In `WizardContext`, remove the `useSessionStorage` hook for wizard state persistence.
2. Replace with standard `useState` (or equivalent in-memory state).
3. On page load/reload, wizard state **must initialise to its empty default** — Step 1, all fields blank.
4. Completed calculations already written to the database are unaffected — this change applies only to in-progress wizard state, not persisted calculation records.

### Done When

- Refreshing the page at any wizard step resets to Step 1 with blank state.
- `useSessionStorage` is removed from the wizard context.

---

## Change 8 — Interactive In-Wizard Step Navigation

**Modifies Phase:** Phase 3 — Wizard Flow + Phase 6 — Polish
**Priority:** Medium

### What to Do

1. The step list displayed within the wizard body (sidebar or inline list) must be made **fully interactive** — clicking a step navigates to that step, identical to the behaviour of the top progress bar.
2. Navigation rules:
   - A user can click any previously completed step to return to it.
   - A user cannot skip ahead to a step they have not yet reached.
3. Visual states:
   - Completed steps: clickable, visually marked as done.
   - Current step: highlighted.
   - Future steps: visible but non-interactive (greyed out or locked indicator).

### Done When

- Clicking a completed step in the in-wizard list navigates to that step.
- Future steps are non-clickable.
- Behaviour is consistent with any other navigation element in the wizard.

---

## Change 9 — Remove Top Step Progress Indicator

**Modifies Phase:** Phase 3 — Wizard Flow + Phase 6 — Polish
**Priority:** Low

### What to Do

1. Remove the step progress bar / indicator component that appears at the **top** of the wizard page.
2. The in-wizard step list (Change 8) is the only step navigation element that remains.
3. Clean up any CSS, layout spacing, or component imports associated with the removed top indicator.

### Done When

- No top step indicator renders at any point in the wizard flow.
- No visual gap or layout artifact where it used to appear.

---

## Change 10 — Add Persistent Application Header

**Modifies Phase:** Phase 3 — Wizard Flow + Phase 6 — Polish
**Priority:** Medium

### What to Do

1. Add a **persistent top header bar** to the authenticated application layout (wizard and admin routes).
2. Left side: implement as an `<img>` or `next/image` component with a placeholder `src`. Display 'Becslo' text as the alt/fallback. The component must be ready to swap to a real logo asset without layout changes.
3. Right side: logged-in user's display name or email, and a **Logout** button that calls `supabase.auth.signOut()` and redirects to `/login`.
4. Header must be **fixed/sticky** — it does not scroll with page content.
5. Header applies to wizard routes and all admin routes. It does **not** appear on `/login` or `/signup`.

### Done When

- Header is visible and fixed on all authenticated pages.
- Logo area is a swappable `<img>` / `next/image` element (currently showing placeholder).
- Logged-in user identifier is visible.
- Logout button works correctly.

---

## Change 11 — Wizard Scroll Containment

**Modifies Phase:** Phase 3 — Wizard Flow + Phase 6 — Polish
**Priority:** Medium

### What to Do

1. Restructure the wizard container so it occupies the **full viewport height minus the header** and manages its own scroll — the page body must not scroll.
2. Implement three fixed zones within the wizard container:
   - **Top zone (fixed):** Step label / step heading for the current step.
   - **Middle zone (scrollable):** Step content area. This is the only part that scrolls.
   - **Bottom zone (fixed):** Navigation buttons (Back / Next / Calculate).
3. On mobile: same structure — vertical stack with fixed top and bottom zones, scrollable middle.
4. Overflow behaviour: middle zone uses `overflow-y: auto`. `body` and `html` elements must **not** have `overflow: scroll`.

### Done When

- Page body does not scroll at any viewport size.
- Step heading and nav buttons remain fixed when step content is long.
- Step content scrolls independently within its container.

---

## Change 12 — Implement Forgot Password Flow

**Modifies Phase:** Phase 0 — Authentication
**Priority:** High — blocking launch requirement
**Constitution Ref:** Amendment to Principle V

### What to Do

1. Implement the forgot-password flow using Supabase Auth's built-in password reset (`supabase.auth.resetPasswordForEmail`).
2. Create `/forgot-password` page:
   - Accepts user's email address.
   - Calls `resetPasswordForEmail`.
   - Shows confirmation message: 'Check your email for a reset link.'
3. Create `/reset-password` page:
   - Reads the Supabase password reset token from the URL.
   - Presents a new password + confirm password form.
   - Calls `supabase.auth.updateUser` on submit.
   - Redirects to `/login` on success.
4. Add 'Forgot password?' link on the `/login` page pointing to `/forgot-password`.
5. Configure the Supabase Auth email template and redirect URL in the Supabase dashboard to point to `/reset-password` for each environment (dev, staging, production).

### Done When

- User can complete full password reset flow end-to-end.
- `/forgot-password` sends a real email via Supabase.
- `/reset-password` sets a new password and redirects to login.
- No stub UI remains.

---

## Phase 8 — PDF Monetization Layer (New Phase)

> **This is an entirely new implementation phase not present in Plan v1.0.0.**
> It is a **blocking launch requirement** per Constitution Addendum v1.1, Principle VI.
> PDF export is a paid feature. The free product ships without PDF access. Payment must be active before launch.

**Phase Number:** 8 (follows Phase 7 — Testing & Deployment)
**Blocking:** Yes — launch cannot proceed without this phase complete
**Constitution Ref:** Principle VI — PDF Export as Paid Feature
**Depends On:** Phase 4 (PDF Export), Phase 7 (Polish), Paddle account setup

---

### Phase 8.1 — Database Changes for Payment State

#### pdf_unlocks table

```sql
CREATE TABLE pdf_unlocks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) UNIQUE, -- one unlock per user
  paddle_transaction_id TEXT,
  unlocked_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  tier                  TEXT NOT NULL DEFAULT 'standard' -- reserved for future 'branded' tier
);
```

**RLS policy:** Users can `SELECT` their own record only. No user `INSERT` — inserts happen server-side via webhook only.

#### pdf_exports table (analytics)

```sql
CREATE TABLE pdf_exports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id),
  calculation_id UUID REFERENCES calculations(id),
  exported_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  tier           TEXT NOT NULL DEFAULT 'standard'
);
```

---

### Phase 8.2 — Paddle Integration

> **⚠ Human Prerequisite — Blocks All Phase 8 Code Work**
>
> The following steps require manual action by the product owner and **cannot be performed by the AI coder**. Phase 8 implementation is blocked until these are complete and credentials are provided:
>
> 1. Create a Paddle account. Complete individual KYC: passport + proof of address (Egyptian seller). Select bank wire as payout method — do not use PayPal.
> 2. Create a product in Paddle: **'Becslo PDF Export Unlock'**, price **$12 USD**, one-time payment.
> 3. Note down: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRODUCT_ID`, `PADDLE_PRICE_ID`.
> 4. Provide credentials to AI coder to proceed with steps below.

#### AI Coder Tasks (after credentials provided)

1. Add Paddle environment variables to Vercel: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRODUCT_ID`, `PADDLE_PRICE_ID`.
2. Implement `POST /api/webhooks/paddle`:
   - Verifies Paddle webhook signature using `PADDLE_WEBHOOK_SECRET`.
   - On `transaction.completed` event: inserts a record into `pdf_unlocks` for the `user_id` stored in Paddle `custom_data`.
   - Idempotent — duplicate webhooks must not create duplicate unlock records (use `ON CONFLICT DO NOTHING` or equivalent).
3. Implement `GET /api/user/pdf-unlock-status`:
   - Returns `{ unlocked: true | false, tier: 'standard' | null }` for the authenticated user.
   - Called on wizard load and before PDF export attempt.

---

### Phase 8.3 — Wizard PDF Export Gate

1. On Step 6 (Results), the 'Generate PDF' button is **always visible**.
2. On click: check `pdf_unlock_status` for the user.
   - **If unlocked:** generate and download PDF immediately (existing behaviour).
   - **If locked:** open the unlock modal.
3. **Unlock modal content:**

   ```
   Unlock PDF Export · $12 one-time
   Export this quote and every future quote — forever.
   No subscription. No expiry.

   [Unlock for $12]    [Maybe later]
   ```

4. **[Unlock for $12]** button: opens the Paddle checkout overlay (Paddle.js client-side checkout) with the correct price ID, passing the user's `user_id` as Paddle `custom_data`.
5. After Paddle checkout completes:
   - Poll `GET /api/user/pdf-unlock-status` — up to 5 attempts at 1-second intervals — until `unlocked: true`.
   - Trigger PDF download automatically once confirmed.
   - Do not rely on Paddle's client-side callback alone — the webhook is the source of truth.

---

### Phase 8.4 — Admin Dashboard Analytics Updates

Add the following metrics to the admin Analytics page:

| Metric | Source |
|--------|--------|
| PDF Unlocks (total) | `COUNT` from `pdf_unlocks` |
| PDF Exports (total) | `COUNT` from `pdf_exports` |
| Conversion Rate | `pdf_unlocks / calculations × 100` — shown as percentage |
| Revenue (estimated) | `pdf_unlocks × $12` — gross estimate, labelled as 'estimate' |

Add a **placeholder section** to the admin dashboard sidebar: **'PDF Templates'** — visible, labelled 'Coming Soon', not linked to any page. This reserves the navigation slot for the future branded PDF tier without requiring implementation now.

---

### Phase 8.5 — PDF Architecture for Future Branded Tier

> No branded PDF features are built now. Architecture is prepared only.

1. Refactor the React-PDF document component to accept a `brandingConfig` object as a prop:

   | Field | Default (MVP) |
   |-------|--------------|
   | `logoUrl` | `null` (renders Becslo default header) |
   | `primaryColor` | `'#1E3A5F'` (Becslo brand color) |
   | `companyName` | `null` (renders 'Generated by Becslo') |

2. When `brandingConfig` is `null` or fields are `null`, render the standard Becslo-branded PDF. When fields are populated (future tier), render user branding instead.
3. Provision a Supabase Storage bucket: **`becslo-user-assets`**. Empty in MVP. Used in future for user logo uploads.
4. The `tier` field in `pdf_unlocks` (`'standard'` | `'branded'`) is the flag that determines which PDF template is rendered. MVP always uses `'standard'`.

---

## Launch Blockers

The following are non-negotiable requirements. No public launch, Product Hunt announcement, or sharing of the tool URL proceeds until all items are complete.

| # | Item | Phase | Status |
|---|------|-------|--------|
| 1 | Pricing model step removed; wizard is 6 steps | Change 1 | Required |
| 2 | Non-design services deleted from database | Change 2 | Required |
| 3 | Overhead costs are user-editable, no defaults | Change 3 | Required |
| 4 | Right column removed; full results in Step 6 | Changes 5 & 6 | Required |
| 5 | Wizard resets on page reload | Change 7 | Required |
| 6 | Forgot password fully implemented | Change 12 | Required |
| 7 | Paddle account set up and KYC complete (human task) | Phase 8.2 | Required |
| 8 | PDF paywall active and tested end-to-end | Phase 8.3 | Required |
| 9 | Paddle webhook verified and tested | Phase 8.2 | Required |
| 10 | Admin analytics shows PDF conversion metrics | Phase 8.4 | Required |

---

## Revised Milestone Timeline

| Work Item | Duration (est.) | Blocking Launch? |
|-----------|----------------|-----------------|
| Changes 1–9 — Wizard & UX Modifications | 3–5 days | Yes |
| Changes 10–11 — Header + Scroll Containment | 1–2 days | No |
| Change 12 — Forgot Password | 1 day | Yes |
| Phase 8.1 — DB Payment Tables | 1 day | Yes |
| Phase 8.2 — Paddle Integration + Webhook | 2–3 days | Yes |
| Phase 8.3 — Wizard PDF Gate + Modal | 1–2 days | Yes |
| Phase 8.4 — Admin Analytics Updates | 1 day | No |
| Phase 8.5 — PDF Branding Architecture | 1 day | No |
| QA + Deploy — End-to-end testing + production deploy | 2 days | Yes |

---

## Compliance

| Check | Status |
|-------|--------|
| All changes align with Constitution Addendum v1.1 | Compliant |
| Monolithic architecture maintained (no new services) | Compliant |
| Email/password auth unchanged | Compliant |
| Supabase + Vercel stack unchanged | Compliant |
| USD only, nearest dollar rounding | Compliant |
| PDF paywall architecture supports future branded tier | Compliant |
| Admin analytics extended for PDF metrics | Compliant |

---

**Plan Version:** 1.1
**Amends:** `docs/IMPLEMENTATION_PLAN.md` v1.0.0
**Last Updated:** 2026-03-25
**Constitution Version:** 1.1
