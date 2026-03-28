<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.0 → 1.2.0
Modified Principles: Development Workflow §Code Organization (amended)
Added Sections: None
Removed Sections: None
Amendment Reference: Implementation Plan Addendum v1.1, Changes 5 & 6 — Results Step Redesign / Right-Panel Removal
Approved By: CEO / Business Director (2026-03-25)
Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md (Constitution Check section validated)
  ✅ .specify/templates/spec-template.md (Requirements structure validated)
  ✅ .specify/templates/tasks-template.md (Task categorization validated)
Follow-up TODOs: None

Previous change (1.0.0 → 1.1.0):
  Modified Principles: IV. Admin-Configured Pricing (amended)
  Amendment Reference: Implementation Plan Addendum v1.1, Change 3 — Overhead Costs: User-Editable Amounts
-->

# Becslo Constitution

## Core Principles

### I. Authentication-First

User authentication MUST be fully functional before any wizard features are implemented. Email/password authentication is the ONLY authentication method permitted for MVP. Rationale: The entire application flow depends on authenticated access; without functional login, no other features can be validated or tested.

### II. Data Privacy & Analytics

User calculations MUST be stored for admin analytics purposes only. Personal save functionality is explicitly excluded from MVP. Rationale: Analytics are required for admin insights, but personal save complexity is deferred to post-MVP to maintain focus on core fee calculation functionality.

### III. Monolithic Architecture

The application MUST be deployed as a NextJS 14.x monolith using Supabase for backend services and serverless functions. Rationale: Simplifies deployment via Vercel, reduces operational complexity, and aligns with MVP scope constraints while maintaining scalability.

### IV. Admin-Configured Pricing

All pricing logic, service definitions, and fee calculations MUST be fully configurable through the admin dashboard. Rationale: Enables rapid pricing adjustments without code changes, supports diverse geography and experience factors, and separates business logic from implementation.

**Amendment v1.1** (approved 2026-03-25, ref: Implementation Plan Addendum v1.1 Change 3): Overhead cost *amounts* are an exception to this principle — they are entered by the user at calculation time, not pre-configured by the admin. Admins continue to configure what cost *categories* exist. This exception applies only to the `costs.default_cost` field, which is permanently removed. All other pricing parameters (base rate, risk buffer, profit margin, service rates, geography multipliers) remain admin-configurable.

### V. MVP Incremental Development

Implementation MUST follow a strict priority order: (1) Authentication flow, (2) Basic wizard placeholder, (3) Service selection, (4) Fee calculation, (5) PDF export, (6) Admin analytics. Rationale: Validates core user journey early, ensures authentication works before investing in dependent features, and provides incremental value delivery.

## Technology Stack

- **Frontend**: NextJS 14.x monolith
- **Backend**: Supabase (auth, database, storage) + serverless functions
- **Hosting**: Vercel
- **Authentication**: Email/password only (Supabase Auth)
- **Database**: Supabase PostgreSQL
- **Currency**: USD only
- **Calculation Precision**: Nearest dollar

**Constraints**: All services MUST be accessible through the NextJS monolith; no separate backend services or microservices permitted. All user-facing features MUST work with email/password authentication.

## Development Workflow

### Code Organization

Frontend structure follows NextJS 14.x conventions with app router:
- Wizard UI: full-width single-panel layout (see Amendment v1.2 below)
- Service hours: manual input only (no templates in MVP)
- Real-time accumulation: fee calculation updates MUST be computed in real time and displayed to the user; as of Amendment v1.2, output is presented on Step 6 rather than a persistent sidebar panel

**Amendment v1.2** (approved 2026-03-25, ref: Implementation Plan Addendum v1.1 Changes 5 & 6): The right-hand live preview sidebar is permanently removed from the wizard layout. The wizard now occupies full available width on all steps. Real-time calculation output (useMemo in WizardContext) is preserved and displayed in full on Step 6 (Results), satisfying the spirit of the real-time accumulation requirement. No separate live preview panel renders on Steps 1–5.

### Testing Requirements

- Authentication flow MUST be tested end-to-end before any other features are developed
- Wizard state transitions MUST be validated for each step
- Fee calculations MUST be tested with edge cases (zero hours, max hours, invalid inputs)
- Admin configuration changes MUST be validated against calculation results

### Deployment Process

- All deployments MUST go through Vercel preview environments before production
- Database schema changes MUST use Supabase migrations
- Environment variables MUST be configured via Vercel environment settings
- Email/password auth secrets MUST NOT be committed to repository

## Governance

### Amendment Procedure

Amendments to this constitution require:
1. Documentation of proposed change with rationale
2. Team approval via pull request review
3. Version increment according to semantic versioning (MAJOR/MINOR/PATCH)
4. Consistency check across all dependent templates and documentation

### Versioning Policy

- **MAJOR**: Backward incompatible principle removals or redefinitions (e.g., removing Authentication-First requirement)
- **MINOR**: New principle or section added (e.g., adding new performance standards)
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

All pull requests MUST verify compliance with:
- Core principles relevant to the changed code
- Technology stack constraints (no unauthorized dependencies)
- Testing requirements for affected features
- Deployment process guidelines

Violations of non-negotiable principles (e.g., adding alternative authentication methods) require explicit team approval with documented rationale.

**Version**: 1.2.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-28
