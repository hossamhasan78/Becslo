# Phase 0: Research - Admin Dashboard & Analytics

**Feature**: Admin Dashboard & Analytics
**Date**: 2026-03-22
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing the admin dashboard and analytics feature. All technical unknowns from the implementation plan have been resolved through investigation of best practices for NextJS 14.x, Supabase, and analytics patterns.

## Research Topics

### Topic 1: NextJS 14.x Admin Dashboard Best Practices

**Decision**: Use NextJS 14.x App Router with server components for data fetching, React Server Actions for mutations, and shared layout for consistent navigation

**Rationale**:
- Server components enable efficient data fetching on the server, reducing client-side JavaScript bundle size
- React Server Actions simplify form handling and mutations without needing separate API routes
- Shared layout under `/admin` route group provides consistent sidebar navigation and authentication checks
- Server-side rendering (SSR) improves SEO and initial page load performance
- Client components only used where interactivity is required (forms, date pickers, interactive tables)

**Alternatives Considered**:
- Traditional client-side routing with React Router: Rejected because NextJS 14.x App Router provides better performance and developer experience
- Separate Next.js admin frontend: Rejected because monolithic architecture is required by Constitution III
- Server Components only for all pages: Rejected because some interactive elements (forms, filters) need client components

**Key Patterns**:
- Use `async` server components for data fetching
- Use `'use client'` directive only for interactive components
- Implement loading states with Next.js `loading.tsx` files
- Use React Server Actions for form submissions and mutations
- Shared layout in `/admin/layout.tsx` for authentication and navigation

### Topic 2: Database Indexing Strategies for Analytics Queries

**Decision**: Use composite indexes on frequently queried columns (created_at, user_id, service_id, country_id) with PostgreSQL partial indexes for active status filtering

**Rationale**:
- Analytics queries filter by date ranges heavily (FR-016, FR-020), requiring index on `created_at`
- "Most used services" query aggregates by service_id, needing index on `calculation_services.service_id`
- "Top client countries" query aggregates by country_id, needing index on `calculations.client_country_id`
- Filtering active services benefits from partial index on `services.is_active = true`
- Composite indexes optimize multi-column filtering (created_at + status, service_id + created_at)
- PostgreSQL partial indexes reduce index size and improve write performance

**Alternatives Considered**:
- Single-column indexes only: Rejected because queries often filter/join on multiple columns
- No indexes for MVP: Rejected because performance target of <3 seconds for analytics requires optimized queries
- Full-text search indexes: Rejected because text search is not required for MVP (clarification Q5)
- Materialized views: Rejected because complexity not needed for 10,000 calculations scale

**Indexing Strategy**:
```sql
-- Calculations table
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX idx_calculations_client_country ON calculations(client_country_id);

-- Calculation services table
CREATE INDEX idx_calculation_services_service_id ON calculation_services(service_id);
CREATE INDEX idx_calculation_services_calculation_id ON calculation_services(calculation_id);

-- Services table (partial index for active services)
CREATE INDEX idx_services_active ON services(id) WHERE is_active = true;
```

### Topic 3: Session-Based Locking for Concurrent Configuration Edits

**Decision**: Use optimistic locking with version column in config table, combined with Supabase RLS to prevent concurrent overwrites

**Rationale**:
- Optimistic locking is sufficient for single-admin system with rare concurrent access
- Version column (or updated_at timestamp) enables conflict detection without blocking reads
- Supabase RLS policies automatically enforce isolation between admin users
- Simpler to implement than pessimistic locking (no need for lock management or timeouts)
- Last-write-wins is acceptable per clarification Q2
- Session-based locking during edit prevents accidental overwrites within same session

**Alternatives Considered**:
- Pessimistic locking with row-level locks: Rejected because complexity not justified for low-concurrency admin use case
- Distributed locks with Redis: Rejected because adds infrastructure complexity not required by Constitution III
- No locking mechanism: Rejected because edge case Q2 explicitly asks for conflict resolution
- Version-free approach (just overwrite): Rejected because can't detect conflicts for audit purposes

**Implementation Pattern**:
```typescript
// Update configuration with optimistic locking
const { data, error } = await supabase
  .from('config')
  .update({ ...newConfig, version: currentVersion + 1 })
  .eq('id', configId)
  .eq('version', currentVersion)  // Ensure no concurrent update
  .select();

if (error || !data) {
  throw new Error('Configuration was modified by another admin. Please refresh and try again.');
}
```

### Topic 4: Role-Based Access Control (RBAC) in NextJS Middleware

**Decision**: Implement RBAC using Supabase RLS policies combined with Next.js middleware for route protection, checking user role from JWT claims

**Rationale**:
- Supabase RLS enforces data-level security at database layer (admin sees all, users see own)
- Next.js middleware provides route-level protection before page rendering
- Check admin role from Supabase JWT user metadata (role: 'admin')
- Redirect non-admin users to wizard page per FR-003
- Middleware runs on every request, ensuring consistent protection

**Alternatives Considered**:
- Page-level checks only: Rejected because middleware provides earlier interception and better security
- Custom auth middleware: Rejected because Supabase provides built-in auth with JWT validation
- API route checks only: Rejected because middleware protects pages and API routes consistently
- No RBAC (only email/password check): Rejected because edge case Q2 mentions admin users specifically

**Implementation Pattern**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request });
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin role from user metadata
    if (user.user_metadata.role !== 'admin') {
      return NextResponse.redirect(new URL('/wizard', request.url));
    }
  }

  return NextResponse.next();
}
```

### Topic 5: Real-Time Inline Validation for Configuration Forms

**Decision**: Use client-side validation with debounced API checks, showing errors immediately as user types or blur fields

**Rationale**:
- Inline validation provides immediate feedback per clarification Q4
- Client-side validation catches obvious errors (negative numbers, min > max) instantly
- Debounced API calls validate business rules without overwhelming server
- Real-time feedback improves UX compared to save-time validation
- Block save button until all fields are valid

**Alternatives Considered**:
- Save-time validation only: Rejected because clarification Q4 explicitly requires inline validation with real-time feedback
- Server-side validation only: Rejected because adds unnecessary round-trips for obvious client-side errors
- No debouncing: Rejected because would cause excessive API calls on every keystroke
- Formik/React Hook Form: Rejected because standard React controlled components sufficient for MVP

**Implementation Pattern**:
```typescript
// Debounce utility (300ms delay)
const useDebouncedValidation = (value: any, validator: Function) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsValidating(true);
      const result = await validator(value);
      setError(result);
      setIsValidating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, validator]);

  return { error, isValidating };
};

// Usage in config form
const { error: minError } = useDebouncedValidation(minRisk, validateMinRisk);
```

### Topic 6: Pagination Strategy for Large Datasets

**Decision**: Use cursor-based pagination with Supabase `range()` method, defaulting to 25 items per page

**Rationale**:
- Cursor-based pagination performs better than offset-based for large datasets
- Supabase `range(start, end)` provides efficient pagination
- 25 items per page balances UI usability with query performance
- Page state stored in URL for shareability and back-button support
- Supports edge case Q6 (hundreds of services) efficiently

**Alternatives Considered**:
- Offset-based pagination (LIMIT/OFFSET): Rejected because performance degrades at high offsets
- Infinite scroll: Rejected because less intuitive for admin interfaces
- Load all data at once: Rejected because doesn't scale to 10,000+ records
- Custom pagination library: Rejected because Supabase built-in pagination is sufficient

**Implementation Pattern**:
```typescript
// Get paginated services
const page = parseInt(searchParams.get('page') || '1');
const pageSize = 25;
const start = (page - 1) * pageSize;
const end = start + pageSize - 1;

const { data: services, count } = await supabase
  .from('services')
  .select('*', { count: 'exact' })
  .order('name')
  .range(start, end);
```

## Technology Stack Decisions

### Frontend Framework
**Decision**: NextJS 14.x (App Router)
**Rationale**: Required by Constitution III, provides server components, optimized performance, and seamless Vercel deployment

### State Management
**Decision**: React Context API (admin dashboard state)
**Rationale**: Built into React, sufficient for admin dashboard state (current page, filters, form data), simpler than Zustand for this scope

### Styling
**Decision**: Tailwind CSS
**Rationale**: Already in use per AGENTS.md, provides utility-first styling, responsive design out of the box

### Database
**Decision**: Supabase PostgreSQL with RLS
**Rationale**: Required by Constitution III, provides built-in auth, row-level security, and managed database

### Deployment
**Decision**: Vercel
**Rationale**: Required by Constitution III, native NextJS hosting, preview environments, zero-config deployment

## Performance Optimization Strategies

### Database Query Optimization
- Use composite indexes on frequently filtered columns (created_at, service_id, country_id)
- Use partial indexes for active status filtering
- Limit result sets with pagination (25 items per page)
- Use Supabase `select()` with specific columns to avoid over-fetching
- Implement query result caching where appropriate

### Frontend Performance
- Use React Server Components to reduce client-side JavaScript
- Implement loading states with Next.js `loading.tsx` files
- Lazy load large tables with virtualization if needed
- Optimize images and assets
- Use Next.js Image component for images

### API Response Optimization
- Server-side pagination to limit data transfer
- Compress responses (handled automatically by Supabase)
- Implement response caching for analytics data with short TTL
- Use Supabase realtime for updates if needed (not required for MVP)

## Security Considerations

### Authentication & Authorization
- All admin routes require authenticated user with admin role
- Supabase RLS policies enforce data access at database layer
- Middleware protects routes before page rendering
- API routes validate user role on every request

### Input Validation
- Client-side validation for immediate feedback
- Server-side validation for security and data integrity
- Sanitize user inputs to prevent SQL injection (Supabase handles this automatically)
- Validate configuration ranges (min <= max, positive values)

### Session Management
- Use Supabase session management
- Implement session timeout if needed
- Protect against CSRF attacks (Supabase handles this automatically)
- Use HTTPS for all communication (enforced by Vercel)

## Testing Strategy

### Unit Tests
- Analytics aggregation logic
- Validation functions
- Utility functions

### Integration Tests
- Admin API endpoints (services CRUD, config, analytics, calculations)
- Role-based access control
- Database queries and indexing

### End-to-End Tests
- Admin login and dashboard navigation
- Services management workflow
- Configuration editing workflow
- Analytics filtering
- Calculations viewing

## Unresolved Issues

**None** - All technical unknowns from the implementation plan have been resolved.

## Next Steps

Proceed to Phase 1: Design & Contracts
- Generate data-model.md with entity definitions
- Define API contracts in contracts/admin-api.md
- Generate quickstart.md for local development setup
- Update agent context with new technologies
