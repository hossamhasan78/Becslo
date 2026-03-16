# Becslo Constitution

## Core Principles

### I. Google OAuth Authentication (NON-NEGOTIABLE)
All user authentication MUST use Google OAuth exclusively. No email/password or alternative OAuth providers in MVP. Rationale: Simplifies auth implementation and aligns with modern freelance designer workflows.

### II. Real-Time Calculator Preview
The wizard UI MUST provide live fee calculation updates as users input data. The interface MUST display a 3/4 wizard panel on the left and 1/4 live preview panel on the right. Rationale: Immediate feedback improves user experience and trust in calculations.

### III. Privacy-First Analytics
Calculations MUST be stored anonymously for admin analytics only. User data persistence for personal saving is explicitly NOT a requirement. Rationale: Protects user privacy while enabling business insights; aligns with MVP scope.

### IV. Admin Pricing Control
The pricing engine MUST be fully configurable via the admin dashboard. All rate factors (services, experience levels, geography multipliers, project costs) MUST be admin-editable. Rationale: Enables dynamic pricing without code changes.

### V. MVP Simplicity
The MVP MUST be free, use USD currency only, and round all calculations to the nearest dollar. No templates, manual hours only for services. Rationale: Reduces complexity for faster time-to-market; aligns with "free tool" positioning.

## Technology Stack

**Frontend**: NextJS 14.x, monolith architecture  
**Backend**: Supabase + serverless functions as needed  
**Database**: Supabase (PostgreSQL)  
**Hosting**: Vercel  
**Authentication**: Google OAuth only

## MVP Constraints

- Free tier only (no paid plans in MVP)
- Single currency: USD
- Calculation precision: rounded to nearest dollar
- Manual hours input for services (no time tracking integrations)
- No template system in MVP
- Admin dashboard: numeric analytics only, no PDF export

## Admin Dashboard

The admin dashboard MUST provide:
- Full pricing engine configuration
- Numeric analytics (calculation trends, aggregate fees)
- No user-specific data access (privacy-first)
- No PDF export capability

## User Flows

The system MUST support these primary flows:
1. Google OAuth sign-in → Calculator wizard → Real-time preview → PDF export
2. Admin login → Configure pricing → View analytics
3. Anonymous calculation (optional, if session-based)

## Governance

**Amendment Procedure**: Constitution changes require:
1. Documentation of the proposed change
2. Rationale explaining the need
3. Migration plan if breaking changes involved
4. Version bump following semantic versioning rules

**Versioning Policy**:
- MAJOR: Backward incompatible governance changes or principle removals
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording fixes, non-semantic refinements

**Compliance Review**: All feature implementations MUST verify alignment with core principles before implementation. Complexity MUST be justified against these principles.

**Version**: 1.0.0 | **Ratified**: 2026-03-16 | **Last Amended**: 2026-03-16
