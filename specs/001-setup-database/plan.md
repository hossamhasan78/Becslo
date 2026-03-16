# Implementation Plan: Setup & Database

**Branch**: `001-setup-database` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-setup-database/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Initialize the Becslo freelance pricing calculator project by setting up the NextJS development environment, configuring Supabase database infrastructure with all required tables, and implementing Row Level Security policies for data protection.

## Technical Context

**Language/Version**: TypeScript (NextJS 14.x)  
**Primary Dependencies**: NextJS 14.x, Tailwind CSS, Supabase client, @supabase/supabase-js  
**Storage**: Supabase PostgreSQL  
**Testing**: Jest + React Testing Library (standard NextJS stack)  
**Target Platform**: Vercel (web browser)  
**Project Type**: web-service  
**Performance Goals**: N/A for setup phase  
**Constraints**: Must align with constitution (Google OAuth, USD-only, no paid plans)  
**Scale/Scope**: Single project, MVP scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Google OAuth Authentication | PASS | Setup phase - auth will use Google OAuth per constitution |
| Real-Time Calculator Preview | PASS | Frontend phase - not in scope for database setup |
| Privacy-First Analytics | PASS | RLS policies will enforce anonymous analytics |
| Admin Pricing Control | PASS | Config table supports admin-editable pricing |
| MVP Simplicity | PASS | USD-only, rounded calculations per constitution |

## Project Structure

### Documentation (this feature)

```
specs/001-setup-database/
├── plan.md              # This file (/speckit.plan command output)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── tasks.md            # Phase 2 output (/speckit.tasks command)
└── checklists/         # Quality validation checklists
```

### Source Code (repository root)

```text
# Web application structure (monolith NextJS)
src/
├── app/                # NextJS App Router pages
├── components/         # React components
├── lib/                # Utilities and helpers
├── services/           # Business logic
└── types/              # TypeScript definitions

supabase/
├── migrations/          # Database migrations
└── seed/               # Seed data

tests/
├── unit/
└── integration/
```

**Structure Decision**: Single NextJS project with Supabase migrations in dedicated directory. No external API contracts needed - this is Phase 1 setup.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
