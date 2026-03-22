# Quickstart Guide: Admin Dashboard & Analytics

**Feature**: Admin Dashboard & Analytics
**Date**: 2026-03-22
**Status**: Ready for Development

## Overview

This guide provides step-by-step instructions for setting up and running the admin dashboard and analytics feature locally. This feature requires the existing infrastructure from Phases 0-4 (authentication, database, pricing engine, wizard, PDF export).

## Prerequisites

### Required Tools
- Node.js 18.x or higher
- npm or yarn
- Git
- Supabase CLI (optional, for local database management)

### Completed Phases
- Phase 0: MVP Authentication & Wizard Skeleton
- Phase 1: Database & Configuration Setup
- Phase 2: Core Pricing Engine
- Phase 3: Wizard Flow & Frontend Integration
- Phase 4: PDF Export

### Environment Variables
Ensure the following environment variables are configured (from Phase 0-4):
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd E:\Projects\Digital Products\Becslo\Ver02\Becslo

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 2. Verify Database Schema

Ensure the following tables exist (from Phase 1):
- `users`
- `admin_users`
- `services`
- `categories`
- `countries`
- `calculations`
- `calculation_services`
- `costs`
- `config`

Check via Supabase dashboard or CLI:
```bash
# Using Supabase CLI
supabase db remote commit

# Or check in Supabase dashboard:
# Database > Tables
```

### 3. Seed Initial Data

Ensure initial data is seeded (from Phase 1):
- Admin user(s) in `admin_users` table
- 120+ services in `services` table
- 3-5 categories in `categories` table
- ~200 countries in `countries` table
- Default configuration in `config` table
- Overhead costs in `costs` table

Run seed script if needed:
```bash
# From project root
npm run db:seed
```

### 4. Verify Admin User

Check that you have admin access:
```bash
# Connect to Supabase database
# Run query:
SELECT au.user_id, u.email, au.role
FROM admin_users au
JOIN users u ON au.user_id = u.id;

# You should see at least one admin user
# Note the email for login
```

### 5. Start Development Server

```bash
# From project root
npm run dev

# Server starts on http://localhost:3000
```

## Accessing Admin Dashboard

### 1. Login as Admin

1. Navigate to http://localhost:3000/login
2. Enter admin credentials (email from step 4 above)
3. Password as set during Phase 0 setup

### 2. Navigate to Admin Dashboard

After login, you can access:
- Admin Dashboard: http://localhost:3000/admin
- Services: http://localhost:3000/admin/services
- Configuration: http://localhost:3000/admin/config
- Analytics: http://localhost:3000/admin/analytics
- Calculations: http://localhost:3000/admin/calculations

**Note**: If you see a redirect to the wizard page, your user doesn't have admin role. Check `admin_users` table.

## Testing the Feature

### Test 1: Services Management

1. Go to http://localhost:3000/admin/services
2. Verify you see paginated list of services
3. Click "Add Service" and create a new service:
   - Name: "Test Service"
   - Category: "Design & UI"
   - Default hours: 30
   - Min hours: 20
   - Max hours: 40
4. Click save and verify service appears in list
5. Click on the new service, edit name to "Updated Test Service", save
6. Click deactivate on an existing service (not used in calculations)
7. Verify it no longer appears with `is_active = true` filter

### Test 2: Configuration Editor

1. Go to http://localhost:3000/admin/config
2. Verify all configuration parameters display current values
3. Modify `base_rate` from 100 to 105
4. Modify `risk_buffer_min` from 5 to 10
5. Click save
6. Verify changes persist and version increments
7. Create a new calculation in wizard to verify new config is applied

### Test 3: Analytics Dashboard

1. Go to http://localhost:3000/admin/analytics
2. Verify all metrics tables display
3. Apply date range filter (last 30 days)
4. Verify metrics update to show data within range
5. Verify "most used services" are ordered by count (highest first)
6. Verify "top client countries" are ordered by count (highest first)

### Test 4: Calculations Viewer

1. Go to http://localhost:3000/admin/calculations
2. Verify you see list of calculations with user names and emails
3. Apply date range filter
4. Click on a calculation to see detailed breakdown
5. Verify all services, hours, costs, multipliers display
6. Verify user name and email are visible (Constitution II compliance)

## Development Workflow

### File Structure

Create files according to project structure:

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── services/page.tsx
│   │   ├── config/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── calculations/page.tsx
│   └── api/
│       └── admin/
│           ├── analytics/route.ts
│           ├── services/route.ts
│           ├── config/route.ts
│           └── calculations/route.ts
├── components/admin/
└── lib/analytics.ts
```

### Create Admin Layout

```typescript
// src/app/admin/layout.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check admin role
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    redirect('/wizard');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Create Services Page

```typescript
// src/app/admin/services/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function ServicesPage() {
  const supabase = createServerClient();
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name');

  return (
    <div>
      <h1>Services Management</h1>
      <ServicesTable services={services} />
    </div>
  );
}
```

### Create API Route

```typescript
// src/app/api/admin/services/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient();

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const pageSize = 25;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data: services, count } = await supabase
    .from('services')
    .select('*', { count: 'exact' })
    .range(start, end)
    .order('name');

  return NextResponse.json({
    data: { services, pagination: { page, pageSize, count } },
    error: null
  });
}
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage
```

### Test Coverage Focus Areas

1. **API Endpoints**:
   - Services CRUD operations
   - Configuration updates with optimistic locking
   - Analytics aggregation queries
   - Calculations filtering and pagination

2. **RBAC**:
   - Admin access to all pages
   - Non-admin users redirected to wizard
   - Unauthenticated users redirected to login

3. **Edge Cases**:
   - Service deletion when used in calculations
   - Concurrent configuration updates
   - Empty date range filters
   - Large datasets (pagination performance)

### Manual Testing Checklist

- [ ] Admin can login and access dashboard
- [ ] Admin can create, edit, activate/deactivate services
- [ ] Admin can modify configuration with validation
- [ ] Analytics metrics display correctly with date filters
- [ ] Calculations viewer shows detailed breakdowns
- [ ] Non-admin users cannot access admin pages
- [ ] Performance targets met (analytics <3s, pagination <2s)
- [ ] Configuration changes apply to new calculations

## Common Issues & Troubleshooting

### Issue: "Redirected to wizard instead of admin dashboard"

**Cause**: User doesn't have admin role

**Solution**:
```sql
-- Add admin role to user
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-id', 'admin');
```

### Issue: "Analytics queries are slow"

**Cause**: Missing database indexes

**Solution**: Run migration to add indexes (see data-model.md for index definitions)

### Issue: "Configuration update conflict"

**Cause**: Concurrent update detected by optimistic locking

**Solution**: Refresh the page to get latest configuration, then retry update

### Issue: "Service deletion blocked"

**Cause**: Service is used in existing calculations

**Solution**: Use deactivate instead of delete (sets `is_active = false`)

## Performance Optimization

### Database Indexes

Ensure critical indexes are created (from data-model.md):
```sql
CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX idx_calculation_services_service_id ON calculation_services(service_id);
CREATE INDEX idx_calculations_client_country ON calculations(client_country_id);
CREATE INDEX idx_services_active ON services(id) WHERE is_active = true;
```

### Query Optimization

- Use Supabase `select()` with specific columns
- Limit result sets with pagination
- Use partial indexes for active status filtering
- Implement response caching for analytics

### Frontend Optimization

- Use React Server Components for data fetching
- Implement loading states with `loading.tsx`
- Lazy load large tables if needed
- Optimize images and assets

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Environment Variables

Ensure Vercel environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Production Checklist

- [ ] All tests passing
- [ ] Database indexes created
- [ ] Environment variables configured
- [ ] Admin users seeded
- [ ] Performance targets met
- [ ] Security headers configured
- [ ] Rate limiting implemented (optional)
- [ ] Audit logging enabled (optional)

## Next Steps

1. Review research.md for technical decisions
2. Review data-model.md for entity definitions
3. Review contracts/admin-api.md for API specifications
4. Create database migration for indexes
5. Implement admin layout and pages
6. Implement API routes
7. Create admin components
8. Write tests
9. Run manual testing checklist
10. Deploy to preview environment

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 14.x Documentation](https://nextjs.org/docs)
- [Project Constitution](../../../.specify/memory/constitution.md)
- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
