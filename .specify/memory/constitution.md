<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Change Type: MINOR

Modified Principles:
  - Principle II (Data Privacy & Analytics): v1.1 session-state amendment added — wizard MUST NOT persist across page reloads; sessionStorage MUST NOT be used to restore wizard progress
  - Principle IV (Admin-Configured Pricing): v1.1 amendment clarifying overhead cost amounts are user-entered (not admin-set defaults); service dataset declared authoritative
  - Principle V (MVP Incremental Development): v1.1 amendment — items 7 (forgot-password) and 8 (PDF payment gate) added as blocking launch requirements

Added Sections:
  - Principle VI: PDF Export as Paid Feature (VI.1 Payment Gate, VI.2 No Watermarked Free Version, VI.3 Future Branded PDF Tier, VI.4 Admin Dashboard Impact)
  - Section 4: Permanent Service Removals (Development + Marketing categories; ~50 individual services)
  - Version History table in Governance

Removed Sections: None

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md (Constitution Check section validated — no structural changes required)
  ✅ .specify/templates/spec-template.md (Requirements structure validated — no changes required)
  ✅ .specify/templates/tasks-template.md (Task categorization validated — no changes required)
  ✅ .specify/templates/commands/ (directory does not exist — skipped)

Follow-up TODOs: None — all sections fully populated.
-->

# Becslo Constitution

**Version**: 1.1.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-25
**Amended By**: CEO / Business Director
**Supersedes**: Constitution v1.0.0 + Constitution Addendum v1.1
**Domain**: tools.hsd-designs.com/becslo
**Tech Stack**: Next.js 14.x · Supabase · Vercel

This is the single, consolidated governing document for the Becslo project. It incorporates
the original Constitution v1.0.0 (ratified 2026-03-17) and all amendments from Constitution
Addendum v1.1 (effective 2026-03-25) into one authoritative file. The two source documents
are superseded and MUST NOT be referenced independently.

---

## 1. Core Principles

### I. Authentication-First

User authentication MUST be fully functional before any wizard features are implemented.
Email/password authentication is the ONLY authentication method permitted for MVP.

**Rationale**: The entire application flow depends on authenticated access; without functional
login, no other features can be validated or tested.

**Non-negotiable**: No alternative authentication methods (Google OAuth, magic link, SSO) may
be added without explicit team approval, documented rationale, and a MAJOR version increment
to this constitution.

Forgot-password MUST be fully implemented — not a stub — before launch. This is a blocking
requirement per Principle V.

### II. Data Privacy & Analytics

*⚑ Amended in v1.1 — session persistence clarification added*

User calculations MUST be stored for admin analytics purposes only. Personal save
functionality is explicitly excluded from MVP.

**Rationale**: Analytics are required for admin insights, but personal save complexity is
deferred to post-MVP to maintain focus on core fee calculation functionality.

**v1.1 Amendment — Session State**:
Wizard state MUST NOT persist across page reloads. `sessionStorage` or equivalent persistence
mechanisms MUST NOT be used to restore wizard progress after a page refresh. Each session
begins with a clean, empty state.

This does not affect the storage of completed calculations in the database for admin analytics
— that requirement is unchanged.

### III. Monolithic Architecture

The application MUST be deployed as a NextJS 14.x monolith using Supabase for backend
services and serverless functions.

**Rationale**: Simplifies deployment via Vercel, reduces operational complexity, and aligns
with MVP scope constraints while maintaining scalability.

All services MUST be accessible through the NextJS monolith. No separate backend services or
microservices are permitted at any phase.

### IV. Admin-Configured Pricing

*⚑ Amended in v1.1 — overhead cost amounts and service dataset clarified*

All pricing logic, service definitions, and fee calculations MUST be fully configurable
through the admin dashboard.

**Rationale**: Enables rapid pricing adjustments without code changes, supports diverse
geography and experience factors, and separates business logic from implementation.

**v1.1 Amendment — Refined scope**:

1. Overhead cost categories remain admin-defined and admin-managed.
2. Overhead cost amounts are NOT admin-set defaults. Users enter their own cost values per
   calculation. Admin does not prescribe default amounts for overhead line items.
3. The services dataset is authoritative. Services removed per this constitution are
   permanently deleted and MUST NOT be re-added without CEO approval and a constitution
   amendment.

### V. MVP Incremental Development

*⚑ Amended in v1.1 — forgot-password and PDF paywall added as blocking launch requirements*

Implementation MUST follow a strict priority order:

| # | Priority Item | Status |
|---|---------------|--------|
| 1 | Authentication flow (email/password only) | Original |
| 2 | Basic wizard placeholder | Original |
| 3 | Service selection | Original |
| 4 | Fee calculation engine | Original |
| 5 | PDF export (component only — gated) | Original |
| 6 | Admin analytics | Original |
| 7 | Forgot-password — fully implemented, not a stub | Added v1.1 — Blocking |
| 8 | PDF export payment gate — Paddle integration active | Added v1.1 — Blocking |

**Rationale**: Validates core user journey early, ensures authentication works before
investing in dependent features, and provides incremental value delivery.

**Items 7 and 8 are blocking launch requirements.** No Product Hunt launch, public
announcement, or sharing of the tool URL may proceed until both are complete.

### VI. PDF Export as Paid Feature

*★ Added in v1.1*

PDF export is a paid feature. It is not free. It is not gated for analytics or quality
reasons — it is the primary revenue mechanism of the product. This principle governs all
architectural and UX decisions related to PDF export.

#### VI.1 — Payment Gate

PDF export MUST be gated behind a one-time Paddle payment of $12 (subject to A/B testing
post-launch). The export button MUST be visible to all authenticated users but non-functional
until unlocked. Unlock is tied to the user's authenticated account and persists permanently.

#### VI.2 — No Watermarked Free Version

There is no free-tier PDF with a watermark. The PDF either exists (paid) or does not (free).
This is non-negotiable. A watermarked free PDF is not an acceptable middle ground under any
circumstances.

#### VI.3 — Future Branded PDF Tier

The PDF export feature MUST be architecturally designed to support a future branded tier where
users upload their own logo and customise the PDF header. This is NOT an MVP feature — but the
architecture MUST NOT prevent it.

| Requirement | Detail |
|-------------|--------|
| PDF component structure | MUST accept a `brandingConfig` object as a prop (`logoUrl`, `primaryColor`, `companyName`). MVP passes `null` — renders Becslo default. Future tier passes user config. |
| Admin dashboard | MUST include a future-ready 'PDF Templates' section — visible, labelled Coming Soon, not linked to any page in MVP. |
| Storage | Supabase Storage bucket `becslo-user-assets` MUST be provisioned — empty in MVP, ready for future logo uploads. |
| Tier architecture | MUST support three states: (a) Locked — no payment, (b) Standard — paid, Becslo-branded, (c) Branded — future tier, user-branded. |

#### VI.4 — Admin Dashboard Impact

The admin dashboard MUST surface PDF export as a revenue metric. Required additions to the
Analytics page:

- **PDF Unlocks (total)** — count from `pdf_unlocks` table
- **PDF Exports Generated** — count from `pdf_exports` table
- **Conversion Rate** — `pdf_unlocks / calculations × 100`, displayed as a percentage
- **Revenue (estimated)** — `pdf_unlocks × $12`, labelled clearly as an estimate

A placeholder navigation item 'PDF Templates' MUST appear in the admin sidebar — visible,
inactive, labelled Coming Soon.

---

## 2. Technology Stack

| Field | Detail |
|-------|--------|
| Frontend | NextJS 14.x monolith |
| Backend | Supabase (auth, database, storage) + serverless functions |
| Hosting | Vercel |
| Authentication | Email/password only (Supabase Auth) |
| Database | Supabase PostgreSQL |
| Currency | USD only |
| Calculation Precision | Nearest dollar |
| PDF Generation | @react-pdf/renderer — server-side only |
| Payments | Paddle (Merchant of Record) — bank wire settlement |

**Constraints**:
- All services MUST be accessible through the NextJS monolith — no separate backend services
  or microservices permitted.
- All user-facing features MUST work with email/password authentication.
- No alternative payment processors may be added without a constitution amendment.

---

## 3. Development Workflow

### Code Organisation

Frontend structure follows NextJS 14.x conventions with App Router:

- **Wizard UI**: Full-width single-column layout. No split live-preview column.
- **Wizard scroll**: Page body MUST NOT scroll. Scroll is contained within the wizard
  container. Step heading and navigation buttons are fixed; step content scrolls independently.
- **Service hours**: Manual input only — no templates in MVP.
- **Real-time calculation**: Fee updates reflected in Step 7 (Results) only, not in a
  persistent side panel.

### Testing Requirements

- Authentication flow MUST be tested end-to-end before any other features are developed.
- Wizard state transitions MUST be validated for each step.
- Fee calculations MUST be tested with edge cases (zero hours, max hours, invalid inputs).
- Admin configuration changes MUST be validated against calculation results.
- Paddle webhook MUST be tested with a live $1 transaction to confirm bank wire settlement
  to the Egyptian account before the full $12 price is activated.

### Deployment Process

- All deployments MUST go through Vercel preview environments before production.
- Database schema changes MUST use Supabase migrations.
- Environment variables MUST be configured via Vercel environment settings.
- Email/password auth secrets MUST NOT be committed to the repository.
- Paddle API key and webhook secret MUST NOT be committed to the repository.

---

## 4. Permanent Service Removals

*★ Added in v1.1*

The following service categories and individual services are permanently removed from the
Becslo database. They are not hidden — they are deleted. Re-adding any of these requires
explicit CEO approval and a constitution amendment.

### Categories Deleted Entirely (with all services)

- Development — all services under this category
- Marketing — all services under this category

### Individual Services Deleted from Remaining Categories

| Service Name | Service Name |
|--------------|--------------|
| Industry Trend Analysis | Messaging Framework |
| Pricing Strategy | Product Positioning |
| Banner & Ad Design | Brand Identity Design |
| Color Palette Creation | E-Commerce Design |
| Empty State Design | Error State Design |
| Landing Page Design | Loading State Design |
| Logo Design | Motion Graphics |
| Packaging Design | Print Design |
| Social Media Graphics | Typography Selection |
| Video Editing | Content Marketing |
| Content Writing — Blog Posts | Content Writing — Press Releases |
| Email Marketing Campaign | Email Newsletter Setup |
| Event Marketing | Go-to-Market Strategy |
| Influencer Marketing | Launch Plan Development |
| Lead Generation | Marketing Strategy |
| Podcast Production | PPC Advertising — Facebook Ads |
| PPC Advertising — Google Ads | PPC Advertising — LinkedIn Ads |
| PPC Advertising — Twitter Ads | PR & Media Relations |
| SEO — Off-page Optimization | SEO — On-page Optimization |
| SEO — Technical SEO | Social Media Management |
| Social Media Marketing | Trade Show Support |
| Video Marketing | Video Production |

---

## 5. Governance

### Amendment Procedure

Amendments to this constitution require:

1. Documentation of the proposed change with rationale
2. CEO / Business Director approval
3. Version increment according to semantic versioning (MAJOR / MINOR / PATCH)
4. Consistency check across all dependent documents (implementation plan, templates)

### Versioning Policy

| Change Type | Definition | Example |
|-------------|------------|---------|
| MAJOR | Backward-incompatible principle removal or redefinition | Removing Authentication-First requirement |
| MINOR | New principle or section added; existing principle amended | Adding Principle VI; amending Principle II |
| PATCH | Clarifications, wording, typo fixes, non-semantic refinements | Rewriting rationale text |

### Compliance Review

All pull requests MUST verify compliance with:

- Core principles relevant to the changed code
- Technology stack constraints — no unauthorised dependencies
- Testing requirements for affected features
- Deployment process guidelines

Violations of non-negotiable principles (e.g., adding alternative authentication methods,
adding a watermarked free PDF tier, re-adding deleted services) require explicit CEO approval
with documented rationale before any work proceeds.

### Version History

| Version | Date | Change Type | Summary |
|---------|------|-------------|---------|
| 1.0.0 | 2026-03-17 | Initial | Original constitution ratified. Principles I–V established. |
| 1.1.0 | 2026-03-25 | MINOR | Added Principle VI (PDF as paid feature). Amended Principles II, IV, V. Added permanent service removals. Incorporated addendum into single document. |
